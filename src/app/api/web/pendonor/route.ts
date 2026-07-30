import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendonor = await prisma.pendonor.findMany({
      orderBy: { id_pendonor: "asc" },
      include: {
        riwayat_donor: {
          orderBy: { tanggal_donor: "desc" },
          take: 1,
        },
      },
    });

    const result = pendonor
      .filter((p) => {
        const riwayatTerakhir = p.riwayat_donor[0];
        if (!riwayatTerakhir) return true; 
        const tanggalDonor = new Date(riwayatTerakhir.tanggal_donor);
        tanggalDonor.setHours(0, 0, 0, 0);
        return tanggalDonor >= today; 
      })
      .map((p) => {
        const riwayatTerakhir = p.riwayat_donor[0];
        const umur = hitungUmur(p.tanggal_lahir);

        return {
          id_pendonor: p.id_pendonor,
          nama_lengkap: p.nama_lengkap,
          email: p.email,
          golongan_darah: p.golongan_darah,
          jenis_kelamin: p.jenis_kelamin,
          umur,
          tanggal_donor: riwayatTerakhir?.tanggal_donor ?? null,
          lokasi_donor: riwayatTerakhir?.lokasi_donor ?? "-",
        };
      });

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