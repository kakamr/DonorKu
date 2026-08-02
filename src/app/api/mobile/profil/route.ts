import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileTokenPayload } from "@/lib/mobileAuth";

export async function GET(req: NextRequest) {
  const payload = getMobileTokenPayload(req);
  if (!payload) {
    return NextResponse.json(
      { message: "Silakan login terlebih dahulu" },
      { status: 401 }
    );
  }

  try {
    const pendonor = await prisma.pendonor.findUnique({
      where: { id_pendonor: payload.id_pendonor },
      select: {
        id_pendonor: true,
        nama_lengkap: true,
        email: true,
        no_hp: true,
        tanggal_lahir: true,
        alamat: true,
        kota: true,
        profesi: true,
        golongan_darah: true,
        foto_profil: true,
        is_deleted: true,
      },
    });

    if (!pendonor || pendonor.is_deleted) {
      return NextResponse.json(
        { message: "Akun tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hitung total donasi & ml darah dari riwayat berhasil
    const riwayatBerhasil = await prisma.riwayatDonor.findMany({
      where: { id_pendonor: payload.id_pendonor, status_donor: "berhasil" },
      select: { darah_terkumpul: true },
    });

    const totalDonasi = riwayatBerhasil.length;
    const totalMlDarah = riwayatBerhasil.reduce(
      (sum: number, r: (typeof riwayatBerhasil)[number]) =>
        sum + (r.darah_terkumpul ?? 0),
      0
    );

    return NextResponse.json({
      nama_lengkap: pendonor.nama_lengkap,
      email: pendonor.email,
      no_hp: pendonor.no_hp ?? null,
      tanggal_lahir: pendonor.tanggal_lahir.toISOString().split("T")[0],
      alamat: pendonor.alamat ?? null,
      kota: pendonor.kota ?? null,
      profesi: pendonor.profesi ?? null,
      golongan_darah: pendonor.golongan_darah,
      foto_profil: pendonor.foto_profil ?? null,
      total_donasi: totalDonasi,
      total_ml_darah: totalMlDarah,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal mengambil data profil" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const payload = getMobileTokenPayload(req);
  if (!payload) {
    return NextResponse.json(
      { message: "Silakan login terlebih dahulu" },
      { status: 401 }
    );
  }

  let body: {
    nama_lengkap?: string;
    no_hp?: string;
    alamat?: string;
    kota?: string;
    profesi?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Body tidak valid" }, { status: 400 });
  }

  // Validasi minimal: kalau nama_lengkap dikirim, tidak boleh kosong
  if (body.nama_lengkap !== undefined && body.nama_lengkap.trim() === "") {
    return NextResponse.json(
      { message: "Nama lengkap tidak boleh kosong" },
      { status: 400 }
    );
  }

  try {
    const pendonor = await prisma.pendonor.findUnique({
      where: { id_pendonor: payload.id_pendonor },
      select: { is_deleted: true },
    });

    if (!pendonor || pendonor.is_deleted) {
      return NextResponse.json(
        { message: "Akun tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hanya update field yang dikirim (partial update)
    const dataUpdate: Record<string, string> = {};
    if (body.nama_lengkap !== undefined) dataUpdate.nama_lengkap = body.nama_lengkap.trim();
    if (body.no_hp !== undefined) dataUpdate.no_hp = body.no_hp.trim();
    if (body.alamat !== undefined) dataUpdate.alamat = body.alamat.trim();
    if (body.kota !== undefined) dataUpdate.kota = body.kota.trim();
    if (body.profesi !== undefined) dataUpdate.profesi = body.profesi.trim();

    if (Object.keys(dataUpdate).length === 0) {
      return NextResponse.json(
        { message: "Tidak ada data yang diubah" },
        { status: 400 }
      );
    }

    await prisma.pendonor.update({
      where: { id_pendonor: payload.id_pendonor },
      data: dataUpdate,
    });

    return NextResponse.json({ message: "Profil berhasil diperbarui" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}