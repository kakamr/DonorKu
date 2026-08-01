import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileTokenPayload } from "@/lib/mobileAuth";
import { buatPdfSertifikat } from "@/lib/generateSertifikatPdf";

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
      include: { sertifikat: true },
      orderBy: { tanggal_donor: "desc" },
    });

    const hasil = [];

    for (const [index, r] of riwayatBerhasil.entries()) {
      let sertifikat = r.sertifikat;

      if (!sertifikat) {
        // Riwayat ke berapa secara kronologis (dari yang paling lama), dipakai
        // untuk penomoran "Donor #8", dst — sama seperti di mockup Galeri Sertifikat
        const urutanKe = riwayatBerhasil.length - index;
        const nomorSertifikat = `PMI-${r.id_riwayat}-${new Date(r.tanggal_donor).getFullYear()}`;

        const filePath = await buatPdfSertifikat({
          nomor_sertifikat: nomorSertifikat,
          nama_lengkap: pendonor.nama_lengkap,
          tanggal_donor: r.tanggal_donor,
          lokasi: r.lokasi_donor,
          volume_ml: r.darah_terkumpul,
          golongan_darah: pendonor.golongan_darah,
        });

        sertifikat = await prisma.sertifikatDonor.create({
          data: {
            id_riwayat: r.id_riwayat,
            nomor_sertifikat: nomorSertifikat,
            file_path: filePath,
          },
        });
      }

      hasil.push({
        id_sertifikat: sertifikat.id_sertifikat,
        nomor_sertifikat: sertifikat.nomor_sertifikat,
        file_path: sertifikat.file_path,
        tanggal_terbit: sertifikat.tanggal_terbit,
        donor_ke: riwayatBerhasil.length - index,
        tanggal_donor: r.tanggal_donor,
        lokasi_donor: r.lokasi_donor,
        volume_ml: r.darah_terkumpul,
      });
    }

    return NextResponse.json(hasil);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data sertifikat" }, { status: 500 });
  }
}