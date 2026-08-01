import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileTokenPayload } from "@/lib/mobileAuth";

export async function DELETE(req: NextRequest) {
  const payload = getMobileTokenPayload(req);
  if (!payload) {
    return NextResponse.json({ message: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const pendonor = await prisma.pendonor.findUnique({ where: { id_pendonor: payload.id_pendonor } });
    if (!pendonor || pendonor.is_deleted) {
      return NextResponse.json({ message: "Akun tidak ditemukan" }, { status: 404 });
    }

    // Soft delete + anonymize — data riwayat_donor/pendaftaran TETAP ada
    // (dibutuhkan admin untuk laporan/statistik), tapi data pribadi disamarkan
    // dan akun tidak bisa lagi dipakai login.
    await prisma.pendonor.update({
      where: { id_pendonor: payload.id_pendonor },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
        nama_lengkap: "Pengguna Terhapus",
        email: `deleted-${pendonor.id_pendonor}-${Date.now()}@donorku.local`,
        no_hp: null,
        alamat: null,
        foto_profil: null,
        foto_ktp: null,
        fcm_token: null,
        password: "", // pastikan tidak ada hash valid yang tersisa
      },
    });

    return NextResponse.json({ message: "Akun berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal menghapus akun" }, { status: 500 });
  }
}