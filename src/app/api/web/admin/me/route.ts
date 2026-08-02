import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { unlink } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id_admin: number };
    const admin = await prisma.admin.findUnique({
      where: { id_admin: decoded.id_admin },
      select: {
        id_admin: true,
        nama_admin: true,
        email: true,
        no_hp: true,
        alamat: true,
        foto_profil: true,
      },
    });
    if (!admin) {
      return NextResponse.json({ message: "Admin tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(admin);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Token tidak valid" }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id_admin: number };
    const body = await req.json();

    // Ambil data admin sebelumnya untuk cek foto lama
    const adminLama = await prisma.admin.findUnique({
      where: { id_admin: decoded.id_admin },
      select: { foto_profil: true },
    });

    // Kalau foto berubah (beda dari sebelumnya) dan foto lama ada, hapus file lama
    if (
      adminLama?.foto_profil &&
      body.foto_profil &&
      adminLama.foto_profil !== body.foto_profil
    ) {
      try {
        const fotoLamaPath = path.join(process.cwd(), "public", adminLama.foto_profil);
        await unlink(fotoLamaPath);
      } catch (err) {
        // Kalau file gak ketemu / gagal dihapus, jangan gagalkan update, cukup log
        console.error("Gagal menghapus foto lama:", err);
      }
    }

    const admin = await prisma.admin.update({
      where: { id_admin: decoded.id_admin },
      data: {
        nama_admin: body.nama_admin,
        email: body.email,
        no_hp: body.no_hp,
        alamat: body.alamat,
        foto_profil: body.foto_profil,
      },
    });
    return NextResponse.json(admin);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengubah profil" }, { status: 500 });
  }
}