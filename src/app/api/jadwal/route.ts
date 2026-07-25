import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const jadwal = await prisma.jadwalDonor.findMany({
      orderBy: { id_jadwal: "asc" },
      include: { lokasi: true },
    });
    return NextResponse.json(jadwal);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const jadwal = await prisma.jadwalDonor.create({
      data: {
        id_admin: body.id_admin,
        id_lokasi: body.id_lokasi,
        status_jadwal: "aktif",
        kuota: Number(body.total_pendaftar_online) || 0,
        tanggal_pelaksanaan: body.hari_tanggal ? new Date(body.hari_tanggal) : null,
        jam_mulai: new Date(`1970-01-01T${body.waktu_mulai}:00Z`),
        jam_selesai: new Date(`1970-01-01T${body.waktu_selesai}:00Z`),
        nomor_antrian: 0,
        nama_penanggung_jawab: body.nama_penanggung_jawab,
        kontak_penanggung_jawab: body.kontak_penanggung_jawab,
        total_pendonor_offline: body.total_pendonor_offline ? Number(body.total_pendonor_offline) : null,
        pendonor_hadir: body.pendonor_hadir ? Number(body.pendonor_hadir) : null,
        darah_terkumpul: body.darah_terkumpul ? Number(body.darah_terkumpul) : null,
        foto_lokasi: JSON.stringify(body.foto_lokasi ?? []),
      },
    });
    return NextResponse.json(jadwal, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal menambah data" }, { status: 500 });
  }
}