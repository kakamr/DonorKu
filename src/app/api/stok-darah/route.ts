import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const stok = await prisma.stokDarah.findMany({
      orderBy: { id_stok: "asc" },
      include: { lokasi: true },
    });
    return NextResponse.json(stok);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}