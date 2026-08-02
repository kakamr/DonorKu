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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data: { darah_terkumpul?: number; status_donor?: "berhasil" | "gagal" | "ditunda" } = {};

    if (body.darah_terkumpul !== undefined) {
      if (body.darah_terkumpul === null || isNaN(Number(body.darah_terkumpul))) {
        return NextResponse.json({ message: "Darah terkumpul tidak valid" }, { status: 400 });
      }
      data.darah_terkumpul = Number(body.darah_terkumpul);
    }

    if (body.status_donor !== undefined) {
      if (!["berhasil", "gagal", "ditunda"].includes(body.status_donor)) {
        return NextResponse.json({ message: "Status tidak valid" }, { status: 400 });
      }
      data.status_donor = body.status_donor;
    }

    const riwayat = await prisma.riwayatDonor.update({
      where: { id_riwayat: Number(id) },
      data,
    });

    return NextResponse.json(riwayat);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengubah data" }, { status: 500 });
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