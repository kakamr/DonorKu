import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const pendonor = await prisma.pendonor.findUnique({
      where: { id_pendonor: Number(id) },
      include: {
        pendaftaran: {
          orderBy: { tanggal_daftar: "desc" },
          take: 1,
          include: {
            jadwal: {
              include: { lokasi: true },
            },
            kuesioner: true,
          },
        },
      },
    });

    if (!pendonor) {
      return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
    }

    const pendaftaranTerakhir = pendonor.pendaftaran[0];
    const jadwal = pendaftaranTerakhir?.jadwal;

    return NextResponse.json({
      id_pendonor: pendonor.id_pendonor,
      nama_lengkap: pendonor.nama_lengkap,
      email: pendonor.email,
      golongan_darah: pendonor.golongan_darah,
      jenis_kelamin: pendonor.jenis_kelamin,
      tanggal_lahir: pendonor.tanggal_lahir,
      alamat: pendonor.alamat,
      foto_profil: pendonor.foto_profil,
      id_pendaftaran: pendaftaranTerakhir?.id_pendaftaran ?? null,
      status_pendaftaran: pendaftaranTerakhir?.status_pendaftaran ?? null,
      nomor_antrian: pendaftaranTerakhir?.nomor_antrian ?? null,
      tanggal_donor: jadwal?.tanggal_pelaksanaan ?? null,
      lokasi_donor: jadwal?.lokasi?.nama_lokasi ?? "-",
      alamat_lokasi: jadwal?.lokasi?.alamat ?? null,
      kuesioner: pendaftaranTerakhir?.kuesioner ?? null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}