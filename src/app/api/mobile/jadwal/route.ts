import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function jamSekarangUntukKolomTime(): Date {
  const now = new Date();
  return new Date(Date.UTC(1970, 0, 1, now.getHours(), now.getMinutes(), now.getSeconds()));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tanggal = searchParams.get("tanggal");
    const id_lokasi = searchParams.get("id_lokasi");

    const where: Record<string, unknown> = { status_jadwal: "aktif" };

    if (tanggal) {
      const start = new Date(tanggal);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      where.tanggal_pelaksanaan = { gte: start, lt: end };

      const hariIni = new Date();
      hariIni.setHours(0, 0, 0, 0);
      if (start.getTime() === hariIni.getTime()) {
        where.jam_selesai = { gt: jamSekarangUntukKolomTime() };
      }
    }

    if (id_lokasi) {
      where.id_lokasi = Number(id_lokasi);
    }

    const jadwal = await prisma.jadwalDonor.findMany({
      where,
      include: { lokasi: true },
      orderBy: { tanggal_pelaksanaan: "asc" },
    });

    const hasilDenganSisaKuota = await Promise.all(
      jadwal.map(async (j: (typeof jadwal)[number]) => {
        const jumlahTerdaftar = await prisma.pendaftaran.count({
          where: { id_jadwal: j.id_jadwal, status_pendaftaran: { in: ["diterima", "menunggu"] } },
        });
        return {
          id_jadwal: j.id_jadwal,
          tanggal_pelaksanaan: j.tanggal_pelaksanaan,
          jam_mulai: j.jam_mulai,
          jam_selesai: j.jam_selesai,
          kuota: j.kuota,
          sisa_kuota: Math.max(0, j.kuota - jumlahTerdaftar),
          lokasi: {
            id_lokasi: j.lokasi.id_lokasi,
            nama_lokasi: j.lokasi.nama_lokasi,
            alamat: j.lokasi.alamat,
            latitude: j.lokasi.latitude,
            longitude: j.lokasi.longitude,
            foto_lokasi: j.lokasi.foto_lokasi,
          },
        };
      })
    );

    return NextResponse.json(
      hasilDenganSisaKuota.filter((j: (typeof hasilDenganSisaKuota)[number]) => j.sisa_kuota > 0)
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data jadwal" }, { status: 500 });
  }
}