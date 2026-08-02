import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendonor = await prisma.pendonor.findMany({
      where: {
        pendaftaran: { some: {} },
      },
      orderBy: { id_pendonor: "asc" },
      include: {
        pendaftaran: {
          orderBy: { tanggal_daftar: "desc" },
          take: 1,
          include: {
            jadwal: {
              include: { lokasi: true },
            },
          },
        },
        riwayat_donor: {
          select: { tanggal_donor: true },
        },
      },
    });

    const result = pendonor
      .filter((p) => {
        const pendaftaranTerakhir = p.pendaftaran[0];
        const tanggalPelaksanaan = pendaftaranTerakhir?.jadwal?.tanggal_pelaksanaan;
        if (!tanggalPelaksanaan) return false;

        const tanggalDonor = new Date(tanggalPelaksanaan);
        tanggalDonor.setHours(0, 0, 0, 0);

        // Belum lewat tanggalnya
        if (tanggalDonor < today) return false;

        // Kalau sudah ada riwayat_donor untuk tanggal ini, berarti sudah selesai donor -> jangan tampilkan lagi
        const sudahAdaRiwayat = p.riwayat_donor.some((r) => {
          const tglRiwayat = new Date(r.tanggal_donor);
          tglRiwayat.setHours(0, 0, 0, 0);
          return tglRiwayat.getTime() === tanggalDonor.getTime();
        });
        if (sudahAdaRiwayat) return false;

        return true;
      })
      .map((p) => {
        const pendaftaranTerakhir = p.pendaftaran[0];
        const jadwal = pendaftaranTerakhir?.jadwal;
        const umur = hitungUmur(p.tanggal_lahir);

        return {
          id_pendonor: p.id_pendonor,
          nama_lengkap: p.nama_lengkap,
          email: p.email,
          golongan_darah: p.golongan_darah,
          jenis_kelamin: p.jenis_kelamin,
          umur,
          tanggal_donor: jadwal?.tanggal_pelaksanaan ?? null,
          lokasi_donor: jadwal?.lokasi?.nama_lokasi ?? "-",
          status_pendaftaran: pendaftaranTerakhir?.status_pendaftaran ?? null,
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