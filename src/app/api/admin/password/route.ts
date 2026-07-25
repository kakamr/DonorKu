import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id_admin: number };
    const { password_lama, password_baru } = await req.json();

    const admin = await prisma.admin.findUnique({ where: { id_admin: decoded.id_admin } });
    if (!admin) {
      return NextResponse.json({ message: "Admin tidak ditemukan" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password_lama, admin.password);
    if (!isValid) {
      return NextResponse.json({ message: "Password lama salah" }, { status: 401 });
    }

    const hashed = await bcrypt.hash(password_baru, 10);
    await prisma.admin.update({
      where: { id_admin: decoded.id_admin },
      data: { password: hashed },
    });

    return NextResponse.json({ message: "Password berhasil diubah" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengubah password" }, { status: 500 });
  }
}