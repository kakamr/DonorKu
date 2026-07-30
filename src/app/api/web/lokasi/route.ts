import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GOLONGAN_DARAH = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export async function GET() {
  try {
    const lokasi = await prisma.lokasiDonor.findMany({
      orderBy: { id_lokasi: "asc" },
    });
    return NextResponse.json(lokasi);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const lokasi = await prisma.$transaction(async (tx) => {
      const lokasiBaru = await tx.lokasiDonor.create({
        data: {
          id_admin: body.id_admin,
          nama_lokasi: body.nama_lokasi,
          alamat: body.alamat,
          kota: body.kota,
          no_hp: body.no_hp,
          longitude: parseFloat(body.longitude),
          latitude: parseFloat(body.latitude),
        },
      });

      await tx.stokDarah.createMany({
        data: GOLONGAN_DARAH.map((golongan) => ({
          id_admin: body.id_admin,
          id_lokasi: lokasiBaru.id_lokasi,
          golongan_darah: golongan,
          jumlah_kantong: 0,
        })),
      });

      return lokasiBaru;
    });

    return NextResponse.json(lokasi, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal menambah data" }, { status: 500 });
  }
}