import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileTokenPayload } from "@/lib/mobileAuth";

export async function GET(req: NextRequest) {
  const payload = getMobileTokenPayload(req);
  if (!payload) {
    return NextResponse.json({ message: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const pendonor = await prisma.pendonor.findUnique({ where: { id_pendonor: payload.id_pendonor } });
    if (!pendonor || pendonor.is_deleted) {
      return NextResponse.json({ message: "Akun tidak ditemukan" }, { status: 404 });
    }

    const riwayatBerhasil = await prisma.riwayatDonor.findMany({
      where: { id_pendonor: pendonor.id_pendonor, status_donor: "berhasil" },
    });

    return NextResponse.json({
      nama_lengkap: pendonor.nama_lengkap,
      no_hp: pendonor.no_hp,
      tanggal_lahir: pendonor.tanggal_lahir,
      alamat: pendonor.alamat,
      email: pendonor.email,
      golongan_darah: pendonor.golongan_darah,
      foto_profil: pendonor.foto_profil,
      total_donasi: riwayatBerhasil.length,
      total_ml_darah: riwayatBerhasil.reduce((sum, r) => sum + (r.darah_terkumpul ?? 0), 0),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data profil" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const payload = getMobileTokenPayload(req);
  if (!payload) {
    return NextResponse.json({ message: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Sengaja cuma field ini yang boleh diubah sendiri lewat profil.
    // nama_lengkap, tanggal_lahir, nik, golongan_darah TIDAK diizinkan diubah
    // bebas di sini karena itu data identitas yang sudah diverifikasi lewat KTP
    // saat registrasi — perubahan data itu seharusnya lewat proses lain yang lebih ketat.
    const dataBolehDiubah: Record<string, unknown> = {};
    if (typeof body.no_hp === "string") dataBolehDiubah.no_hp = body.no_hp;
    if (typeof body.alamat === "string") dataBolehDiubah.alamat = body.alamat;
    if (typeof body.foto_profil === "string") dataBolehDiubah.foto_profil = body.foto_profil;

    const pendonor = await prisma.pendonor.update({
      where: { id_pendonor: payload.id_pendonor },
      data: dataBolehDiubah,
    });

    return NextResponse.json({
      message: "Profil berhasil diperbarui",
      no_hp: pendonor.no_hp,
      alamat: pendonor.alamat,
      foto_profil: pendonor.foto_profil,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal memperbarui profil" }, { status: 500 });
  }
}