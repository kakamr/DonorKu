import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileTokenPayload } from "@/lib/mobileAuth";

/**
 * Sama seperti di beranda/route.ts -- bikin objek Date jam "sekarang" tapi
 * pakai tanggal referensi 1970-01-01, biar bisa dibandingkan langsung
 * dengan kolom jam_selesai (tipe Time).
 */
function jamSekarangUntukKolomTime(): Date {
  const now = new Date();
  return new Date(Date.UTC(1970, 0, 1, now.getHours(), now.getMinutes(), now.getSeconds()));
}

export async function GET(req: NextRequest) {
  const payload = getMobileTokenPayload(req);
  if (!payload) {
    return NextResponse.json({ message: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const hariIni = new Date(new Date().toDateString());
    const jamSekarang = jamSekarangUntukKolomTime();

    // Filter jadwal aktif: tanggal belum lewat, ATAU tanggal hari ini
    // tapi jam_selesai belum lewat jam sekarang (presisi sampai ke menit).
    const filterJadwalAktif = {
      status_jadwal: "aktif" as const,
      OR: [
        { tanggal_pelaksanaan: { gt: hariIni } },
        { tanggal_pelaksanaan: hariIni, jam_selesai: { gt: jamSekarang } },
      ],
    };

    const lokasi = await prisma.lokasiDonor.findMany({
      where: {
        // HANYA tampilkan lokasi yang punya jadwal aktif -- yang sudah
        // lewat semua jadwalnya otomatis TIDAK ikut kekirim ke app.
        jadwal_donor: { some: filterJadwalAktif },
        ...(search
          ? {
              OR: [
                { nama_lokasi: { contains: search } },
                { alamat: { contains: search } },
                { kota: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { nama_lokasi: "asc" },
      select: {
        id_lokasi: true,
        nama_lokasi: true,
        alamat: true,
        kota: true,
        latitude: true,
        longitude: true,
        foto_lokasi: true, // fallback, kalau jadwalnya tidak punya foto sendiri
        jadwal_donor: {
          where: filterJadwalAktif,
          select: { foto_lokasi: true },
          take: 1,
        },
      },
    });

    const hasil = lokasi.map((l: (typeof lokasi)[number]) => ({
      id_lokasi: l.id_lokasi,
      nama_lokasi: l.nama_lokasi,
      alamat: l.alamat,
      kota: l.kota,
      latitude: l.latitude,
      longitude: l.longitude,
      // Prioritas foto dari jadwal aktifnya, fallback ke foto Lokasi sendiri
      foto_lokasi: l.jadwal_donor[0]?.foto_lokasi ?? l.foto_lokasi ?? null,
      status_donor: "Open Donor Darah", // selalu ini, karena yang tanpa jadwal aktif sudah difilter di atas
    }));

    return NextResponse.json(hasil);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data lokasi" }, { status: 500 });
  }
}