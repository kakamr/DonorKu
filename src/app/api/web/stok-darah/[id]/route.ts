import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const stok = await prisma.stokDarah.findUnique({
      where: { id_stok: Number(id) },
      include: { lokasi: true },
    });
    if (!stok) {
      return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(stok);
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
    const stok = await prisma.stokDarah.update({
      where: { id_stok: Number(id) },
      data: {
        jumlah_kantong: Number(body.jumlah_kantong),
        golongan_darah: body.golongan_darah,
        tanggal_update: new Date(),
      },
    });
    return NextResponse.json(stok);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengubah data" }, { status: 500 });
  }
}