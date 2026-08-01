import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const allowedFolders = ["lokasi", "profile"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "lokasi";

    if (!file) {
      return NextResponse.json({ message: "Tidak ada file yang diupload" }, { status: 400 });
    }

    if (!allowedFolders.includes(folder)) {
      return NextResponse.json({ message: "Folder tujuan tidak valid" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Format file tidak didukung. Gunakan JPG, PNG, atau WEBP" },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; 
    if (file.size > maxSize) {
      return NextResponse.json({ message: "Ukuran file maksimal 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const publicPath = `/uploads/${folder}/${fileName}`;

    return NextResponse.json({ url: publicPath });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengupload file" }, { status: 500 });
  }
}