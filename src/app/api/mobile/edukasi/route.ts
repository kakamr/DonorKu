import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileTokenPayload } from "@/lib/mobileAuth";

export async function GET(req: NextRequest) {
  const payload = getMobileTokenPayload(req);
  if (!payload) {
    return NextResponse.json({ message: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const semua = await prisma.edukasiDonor.findMany({
      orderBy: [{ kategori: "asc" }, { urutan: "asc" }],
    });

    return NextResponse.json({
      edukasi: semua.filter((e) => e.kategori === "edukasi"),
      manfaat: semua.filter((e) => e.kategori === "manfaat"),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data edukasi" }, { status: 500 });
  }
}