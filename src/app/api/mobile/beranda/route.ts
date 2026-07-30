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

    const lokasi = await prisma.lokasiDonor.findMany({
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