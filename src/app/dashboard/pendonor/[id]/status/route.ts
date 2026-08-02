import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { status } = body as { status: "diterima" | "ditolak" };

    if (!["diterima", "ditolak"].includes(status)) {
      return NextResponse.json({ message: "Status tidak valid" }, { status: 400 });
    }

    const pendaftaranTerakhir = await prisma.pendaftaran.findFirst({
      where: { id_pendonor: Number(id) },
      orderBy: { tanggal_daftar: "desc" },
      include: {
        jadwal: { include: { lokasi: true } },
      },
    });

    if (!pendaftaranTerakhir) {
      return NextResponse.json({ message: "Pendaftaran tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.pendaftaran.update({
      where: { id_pendaftaran: pendaftaranTerakhir.id_pendaftaran },
      data: { status_pendaftaran: status },
    });

    // Kalau diterima, langsung buat entry riwayat_donor (default: ditunda)
    if (status === "diterima") {
      const jadwal = pendaftaranTerakhir.jadwal;
      const tanggalDonor = jadwal?.tanggal_pelaksanaan ?? new Date();
      const lokasiNama = jadwal?.lokasi?.nama_lokasi ?? "-";

      // Cegah duplikat kalau sudah ada riwayat untuk pendonor + tanggal + lokasi yang sama
      const sudahAda = await prisma.riwayatDonor.findFirst({
        where: {
          id_pendonor: Number(id),
          tanggal_donor: tanggalDonor,
          lokasi_donor: lokasiNama,
        },
      });

      if (!sudahAda) {
        await prisma.riwayatDonor.create({
          data: {
            id_admin: pendaftaranTerakhir.id_admin,
            id_pendonor: Number(id),
            tanggal_donor: tanggalDonor,
            status_donor: "ditunda",
            lokasi_donor: lokasiNama,
          },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengubah status" }, { status: 500 });
  }
}