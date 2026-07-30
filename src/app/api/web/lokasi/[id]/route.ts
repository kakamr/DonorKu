import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const lokasi = await prisma.lokasiDonor.findUnique({
      where: { id_lokasi: Number(id) },
    });
    if (!lokasi) {
      return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(lokasi);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const lokasi = await prisma.lokasiDonor.update({
      where: { id_lokasi: Number(id) },
      data: {
        nama_lokasi: body.nama_lokasi,
        alamat: body.alamat,
        kota: body.kota,
        no_hp: body.no_hp,
        longitude: parseFloat(body.longitude),
        latitude: parseFloat(body.latitude),
      },
    });
    return NextResponse.json(lokasi);
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
    await prisma.lokasiDonor.delete({ where: { id_lokasi: Number(id) } });
    return NextResponse.json({ message: "Berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal menghapus data" }, { status: 500 });
  }
}