import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileTokenPayload } from "@/lib/mobileAuth";

function formatJam(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export async function POST() {

}

export async function GET(req: NextRequest) {
  const payload = getMobileTokenPayload(req);
  if (!payload) {
    return NextResponse.json(
      { message: "Silakan login terlebih dahulu" },
      { status: 401 }
    );
  }

  try {
    const daftarPendaftaran = await prisma.pendaftaran.findMany({
      where: { id_pendonor: payload.id_pendonor },
      orderBy: { tanggal_daftar: "desc" },
      select: {
        id_pendaftaran: true,
        nomor_antrian: true,
        tanggal_daftar: true,
        status_pendaftaran: true,
        jadwal: {
          select: {
            tanggal_pelaksanaan: true,
            jam_mulai: true,
            jam_selesai: true,
            lokasi: { select: { nama_lokasi: true } },
          },
        },
      },
    });

    const semuaRiwayat = await prisma.riwayatDonor.findMany({
      where: { id_pendonor: payload.id_pendonor },
      select: {
        id_riwayat: true,
        tanggal_donor: true,
        lokasi_donor: true,
        status_donor: true,
        darah_terkumpul: true,
      },
    });

    const hasil = daftarPendaftaran.map((p: (typeof daftarPendaftaran)[number]) => {
      const tglJadwal = p.jadwal.tanggal_pelaksanaan
        ?.toISOString()
        .split("T")[0];
      const namaLokasi = p.jadwal.lokasi.nama_lokasi;

      const riwayat =
        semuaRiwayat.find(
          (r: (typeof semuaRiwayat)[number]) =>
            r.tanggal_donor.toISOString().split("T")[0] === tglJadwal &&
            r.lokasi_donor === namaLokasi
        ) ?? null;

      return {
        id_pendaftaran: p.id_pendaftaran,
        nomor_antrian: p.nomor_antrian,
        tanggal_daftar: p.tanggal_daftar.toISOString().split("T")[0],
        status_pendaftaran: p.status_pendaftaran,
        jadwal: {
          tanggal_pelaksanaan: tglJadwal ?? null,
          jam_mulai: formatJam(p.jadwal.jam_mulai),
          jam_selesai: formatJam(p.jadwal.jam_selesai),
          lokasi: namaLokasi,
        },
        riwayat: riwayat
          ? {
              id_riwayat: riwayat.id_riwayat,
              status_donor: riwayat.status_donor,
              darah_terkumpul: riwayat.darah_terkumpul,
            }
          : null,
      };
    });

    return NextResponse.json(hasil);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal mengambil data pendaftaran" },
      { status: 500 }
    );
  }
}