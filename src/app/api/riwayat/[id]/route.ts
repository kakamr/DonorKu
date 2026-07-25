import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const riwayat = await prisma.riwayatDonor.findUnique({
      where: { id_riwayat: Number(id) },
      include: { pendonor: true },
    });

    if (!riwayat) {
      return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tanggalDonor = new Date(riwayat.tanggal_donor);
    tanggalDonor.setHours(0, 0, 0, 0);

    if (tanggalDonor >= today) {
      return NextResponse.json(
        { message: "Data ini termasuk jadwal pendonoran, bukan riwayat" },
        { status: 400 }
      );
    }

    const lokasi = await prisma.lokasiDonor.findFirst({
      where: { nama_lokasi: riwayat.lokasi_donor },
      select: { alamat: true },
    });

    return NextResponse.json({
      ...riwayat,
      alamat_lokasi: lokasi?.alamat ?? null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.riwayatDonor.delete({ where: { id_riwayat: Number(id) } });
    return NextResponse.json({ message: "Berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal menghapus data" }, { status: 500 });
  }
}