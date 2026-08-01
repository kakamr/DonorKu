import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileTokenPayload } from "@/lib/mobileAuth";
import { cekJarakDonorTerakhir } from "@/lib/donorEligibility";

/**
 * Bikin objek Date jam "sekarang", tapi pakai tanggal referensi 1970-01-01
 * (sama seperti cara Prisma menyimpan kolom bertipe Time), supaya bisa
 * dibandingkan langsung dengan kolom jam_selesai.
 *
 * PENTING: kalau setelah dites ternyata perbandingan jam_selesai masih
 * tidak akurat, kemungkinan besar penyebabnya di sini -- coba log
 * `jamSekarang` dan bandingkan manual sama nilai jam_selesai di database
 * buat mastiin formatnya cocok.
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
    const hariIni = new Date(new Date().toDateString()); // jam 00:00 hari ini
    const jamSekarang = jamSekarangUntukKolomTime();

    const lokasi = await prisma.lokasiDonor.findMany({
      where: {
        jadwal_donor: {
          some: {
            status_jadwal: "aktif",
            OR: [
              // Jadwal di hari SETELAH hari ini -> otomatis masih berlaku
              { tanggal_pelaksanaan: { gt: hariIni } },
              // Jadwal HARI INI -> jam_selesai-nya belum lewat jam sekarang
              {
                tanggal_pelaksanaan: hariIni,
                jam_selesai: { gt: jamSekarang },
              },
            ],
          },
        },
      },
      take: 5,
      select: {
        id_lokasi: true,
        nama_lokasi: true,
        alamat: true,
        latitude: true,
        longitude: true,
      },
    });

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