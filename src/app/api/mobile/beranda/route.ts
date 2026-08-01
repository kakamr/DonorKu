import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileTokenPayload } from "@/lib/mobileAuth";
import { cekJarakDonorTerakhir } from "@/lib/donorEligibility";

export async function GET(req: NextRequest) {
  const payload = getMobileTokenPayload(req);
  if (!payload) {
    return NextResponse.json({ message: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const pendonor = await prisma.pendonor.findUnique({ where: { id_pendonor: payload.id_pendonor } });
    if (!pendonor || pendonor.is_deleted) {
      return NextResponse.json({ message: "Akun tidak ditemukan" }, { status: 404 });
    }

    const riwayatBerhasil = await prisma.riwayatDonor.findMany({
      where: { id_pendonor: pendonor.id_pendonor, status_donor: "berhasil" },
    });

    const totalDonasi = riwayatBerhasil.length;
    const totalMlDarah = riwayatBerhasil.reduce((sum, r) => sum + (r.darah_terkumpul ?? 0), 0);

    const kelayakan = await cekJarakDonorTerakhir(pendonor.id_pendonor, pendonor.jenis_kelamin);

    // --- Filter lokasi: cuma yang masih punya jadwal aktif (belum lewat) ---
    //
    // CATATAN PENTING: filter tanggal (>= hari ini) AMAN dilakukan di
    // query Prisma karena tanggal_pelaksanaan itu kolom Date murni.
    // TAPI filter jam (jam_selesai) SENGAJA TIDAK dilakukan di query --
    // pembandingan Time vs DateTime lewat Prisma/driver MySQL terbukti
    // tidak reliable (selalu true meski sudah lewat). Jadi kita ambil
    // dulu semua kandidat yang tanggalnya >= hari ini, lalu filter jam
    // secara manual di JavaScript, yang jauh lebih bisa diandalkan.
    const hariIni = new Date(new Date().toDateString()); // jam 00:00 hari ini
    const sekarang = new Date();
    const menitSekarang = sekarang.getHours() * 60 + sekarang.getMinutes();

    const kandidatLokasi = await prisma.lokasiDonor.findMany({
      where: {
        jadwal_donor: {
          some: {
            status_jadwal: "aktif",
            tanggal_pelaksanaan: { gte: hariIni }, // cuma filter TANGGAL di query
          },
        },
      },
      select: {
        id_lokasi: true,
        nama_lokasi: true,
        alamat: true,
        latitude: true,
        longitude: true,
        jadwal_donor: {
          where: { status_jadwal: "aktif", tanggal_pelaksanaan: { gte: hariIni } },
          select: { tanggal_pelaksanaan: true, jam_selesai: true },
        },
      },
    });

    // Filter manual: lokasi ikut ditampilkan kalau ADA MINIMAL 1 jadwal
    // yang beneran belum lewat (tanggal lebih besar dari hari ini, ATAU
    // tanggal sama dengan hari ini tapi jam_selesai belum lewat jam sekarang).
    const lokasi = kandidatLokasi
      .filter((l) =>
        l.jadwal_donor.some((j) => {
          if (!j.tanggal_pelaksanaan) return false;
          const tglJadwal = new Date(j.tanggal_pelaksanaan.toDateString());

          if (tglJadwal.getTime() > hariIni.getTime()) return true; // hari berikutnya, pasti masih berlaku

          // Tanggalnya persis hari ini -> cek jam_selesai
          // .getUTCHours()/.getUTCMinutes() dipakai (bukan getHours() biasa)
          // supaya tidak kepengaruh timezone server, ambil jam mentah
          // apa adanya dari kolom Time.
          const menitSelesai = j.jam_selesai.getUTCHours() * 60 + j.jam_selesai.getUTCMinutes();
          return menitSelesai > menitSekarang;
        })
      )
      .slice(0, 5)
      .map(({ id_lokasi, nama_lokasi, alamat, latitude, longitude }) => ({
        id_lokasi,
        nama_lokasi,
        alamat,
        latitude,
        longitude,
      }));

    return NextResponse.json({
      nama_lengkap: pendonor.nama_lengkap,
      total_donasi: totalDonasi,
      total_ml_darah: totalMlDarah,
      boleh_donor_sekarang: kelayakan.layak,
      tanggal_boleh_donor: kelayakan.layak ? null : kelayakan.tanggal_boleh_donor,
      lokasi_tersedia: lokasi,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data beranda" }, { status: 500 });
  }
}