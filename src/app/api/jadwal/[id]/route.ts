import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const jadwal = await prisma.jadwalDonor.findUnique({
      where: { id_jadwal: Number(id) },
      include: { lokasi: true },
    });
    if (!jadwal) {
      return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(jadwal);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const jadwal = await prisma.jadwalDonor.update({
      where: { id_jadwal: Number(id) },
      data: {
        id_lokasi: body.id_lokasi,
        kuota: Number(body.total_pendaftar_online) || 0,
        tanggal_pelaksanaan: body.hari_tanggal ? new Date(body.hari_tanggal) : null,
        jam_mulai: new Date(`1970-01-01T${body.waktu_mulai}:00Z`),
        jam_selesai: new Date(`1970-01-01T${body.waktu_selesai}:00Z`),
        nama_penanggung_jawab: body.nama_penanggung_jawab,
        kontak_penanggung_jawab: body.kontak_penanggung_jawab,
        total_pendonor_offline: body.total_pendonor_offline ? Number(body.total_pendonor_offline) : null,
        pendonor_hadir: body.pendonor_hadir ? Number(body.pendonor_hadir) : null,
        darah_terkumpul: body.darah_terkumpul ? Number(body.darah_terkumpul) : null,
        foto_lokasi: JSON.stringify(body.foto_lokasi ?? []),
      },
    });
    return NextResponse.json(jadwal);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengubah data" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.jadwalDonor.delete({ where: { id_jadwal: Number(id) } });
    return NextResponse.json({ message: "Berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal menghapus data" }, { status: 500 });
  }
}