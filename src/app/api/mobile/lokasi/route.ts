import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileTokenPayload } from "@/lib/mobileAuth";

export async function GET(req: NextRequest) {
  const payload = getMobileTokenPayload(req);
  if (!payload) {
    return NextResponse.json({ message: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const lokasi = await prisma.lokasiDonor.findMany({
      where: search
        ? {
            OR: [
              { nama_lokasi: { contains: search } },
              { alamat: { contains: search } },
              { kota: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { nama_lokasi: "asc" },
    });

    // "Open Donor Darah" -> ada jadwal aktif yang belum lewat di lokasi itu
    const hasil = await Promise.all(
      lokasi.map(async (l) => {
        const adaJadwalAktif = await prisma.jadwalDonor.findFirst({
          where: {
            id_lokasi: l.id_lokasi,
            status_jadwal: "aktif",
            tanggal_pelaksanaan: { gte: new Date() },
          },
        });

        return {
          id_lokasi: l.id_lokasi,
          nama_lokasi: l.nama_lokasi,
          alamat: l.alamat,
          kota: l.kota,
          latitude: l.latitude,
          longitude: l.longitude,
          status_donor: adaJadwalAktif ? "Open Donor Darah" : "Belum Ada Jadwal",
        };
      })
    );

    return NextResponse.json(hasil);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data lokasi" }, { status: 500 });
  }
}