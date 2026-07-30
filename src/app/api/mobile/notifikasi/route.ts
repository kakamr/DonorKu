import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileTokenPayload } from "@/lib/mobileAuth";

export async function GET(req: NextRequest) {
  const payload = getMobileTokenPayload(req);
  if (!payload) {
    return NextResponse.json({ message: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const notifikasi = await prisma.notifikasi.findMany({
      where: { id_pendonor: payload.id_pendonor },
      orderBy: { created_at: "desc" },
      take: 50,
    });

    return NextResponse.json(notifikasi);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data notifikasi" }, { status: 500 });
  }
}