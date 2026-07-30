import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileTokenPayload } from "@/lib/mobileAuth";

export async function POST(req: NextRequest) {
  const payload = getMobileTokenPayload(req);
  if (!payload) {
    return NextResponse.json({ message: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const { rating, saran_keluhan, id_pendaftaran } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Rating wajib diisi (1-5)" }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        id_pendonor: payload.id_pendonor,
        id_pendaftaran: id_pendaftaran ?? null,
        rating: Number(rating),
        saran_keluhan: saran_keluhan || null,
      },
    });

    return NextResponse.json(
      { message: "Terima kasih atas feedback Anda", id_feedback: feedback.id_feedback },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengirim feedback" }, { status: 500 });
  }
}