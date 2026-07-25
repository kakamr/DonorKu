import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.aturanDanTips.findMany({
      orderBy: { id_tips: "asc" },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await prisma.aturanDanTips.create({
      data: {
        id_admin: body.id_admin,
        judul: body.judul,
        kategori: body.kategori,
        status: body.status,
        isi: body.isi,
      },
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal menambah data" }, { status: 500 });
  }
}