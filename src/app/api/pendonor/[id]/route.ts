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
        riwayat_donor: {
          orderBy: { tanggal_donor: "desc" },
          take: 1,
        },
      },
    });

    if (!pendonor) {
      return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(pendonor);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}