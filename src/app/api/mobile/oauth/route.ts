import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { verifikasiGoogleToken, verifikasiFacebookToken } from "@/lib/oauthVerify";

export async function POST(req: NextRequest) {
  try {
    const { provider, token } = await req.json();

    if (provider !== "google" && provider !== "facebook") {
      return NextResponse.json({ message: "Provider tidak dikenali" }, { status: 400 });
    }

    const profil =
      provider === "google"
        ? await verifikasiGoogleToken(token)
        : await verifikasiFacebookToken(token);

    const kolomProviderId = provider === "google" ? "google_id" : "facebook_id";

    let pendonor = await prisma.pendonor.findFirst({
      where: {
        OR: [{ [kolomProviderId]: profil.provider_id }, { email: profil.email }],
      },
    });

    // Kalau ketemu lewat email tapi belum pernah link provider ini, sambungkan sekalian
    if (pendonor && !pendonor[kolomProviderId as "google_id" | "facebook_id"]) {
      pendonor = await prisma.pendonor.update({
        where: { id_pendonor: pendonor.id_pendonor },
        data: { [kolomProviderId]: profil.provider_id },
      });
    }

    if (pendonor) {
      if (pendonor.is_deleted) {
        return NextResponse.json({ message: "Akun ini sudah dihapus" }, { status: 404 });
      }

      const accessToken = jwt.sign(
        { id_pendonor: pendonor.id_pendonor, email: pendonor.email },
        process.env.JWT_SECRET_MOBILE!,
        { expiresIn: "30d" }
      );

      return NextResponse.json({
        status: "login",
        message: "Login berhasil",
        access_token: accessToken,
        pendonor: {
          id_pendonor: pendonor.id_pendonor,
          nama_lengkap: pendonor.nama_lengkap,
          email: pendonor.email,
          foto_profil: pendonor.foto_profil,
        },
      });
    }

    // Belum terdaftar sama sekali -> kembalikan profil terverifikasi supaya
    // app lanjut ke step KTP + foto diri, lalu panggil /api/mobile/auth/register
    return NextResponse.json({
      status: "perlu_registrasi",
      provider,
      provider_id: profil.provider_id,
      nama_lengkap: profil.nama_lengkap,
      email: profil.email,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal memverifikasi login OAuth" }, { status: 401 });
  }
}