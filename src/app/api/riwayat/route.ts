import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const riwayat = await prisma.riwayatDonor.findMany({
      orderBy: { id_riwayat: "asc" },
      include: { pendonor: true },
    });

    const result = riwayat
      .filter((r) => {
        const tanggalDonor = new Date(r.tanggal_donor);
        tanggalDonor.setHours(0, 0, 0, 0);
        return tanggalDonor < today; // hanya yang sudah lewat
      })
      .map((r) => ({
        id_riwayat: r.id_riwayat,
        nama_lengkap: r.pendonor.nama_lengkap,
        email: r.pendonor.email,
        golongan_darah: r.pendonor.golongan_darah,
        jenis_kelamin: r.pendonor.jenis_kelamin,
        umur: hitungUmur(r.pendonor.tanggal_lahir),
        tanggal_donor: r.tanggal_donor,
        lokasi_donor: r.lokasi_donor,
      }));

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}

function hitungUmur(tanggalLahir: Date) {
  const today = new Date();
  const lahir = new Date(tanggalLahir);
  let umur = today.getFullYear() - lahir.getFullYear();
  const belumUlangTahun =
    today.getMonth() < lahir.getMonth() ||
    (today.getMonth() === lahir.getMonth() && today.getDate() < lahir.getDate());
  if (belumUlangTahun) umur--;
  return umur;
}