import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileTokenPayload } from "@/lib/mobileAuth";
import { cekJarakDonorTerakhir } from "@/lib/donorEligibility";

function hitungBatasTanggal(filter: string | null): Date | null {
  const now = new Date();
  if (filter === "1bulan") return new Date(now.setMonth(now.getMonth() - 1));
  if (filter === "6bulan") return new Date(now.setMonth(now.getMonth() - 6));
  if (filter === "1tahun") return new Date(now.setFullYear(now.getFullYear() - 1));
  return null; // "all" atau tidak diisi -> tidak difilter
}

export async function GET(req: NextRequest) {
  const payload = getMobileTokenPayload(req);
  if (!payload) {
    return NextResponse.json({ message: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter");

    const pendonor = await prisma.pendonor.findUnique({ where: { id_pendonor: payload.id_pendonor } });
    if (!pendonor || pendonor.is_deleted) {
      return NextResponse.json({ message: "Akun tidak ditemukan" }, { status: 404 });
    }

    // Statistik total selalu sepanjang waktu, tidak ikut filter periode
    const semuaRiwayatBerhasil = await prisma.riwayatDonor.findMany({
      where: { id_pendonor: pendonor.id_pendonor, status_donor: "berhasil" },
      orderBy: { tanggal_donor: "desc" },
    });

    const totalDonasi = semuaRiwayatBerhasil.length;
    const totalMlDarah = semuaRiwayatBerhasil.reduce((sum, r) => sum + (r.darah_terkumpul ?? 0), 0);

    const kelayakan = await cekJarakDonorTerakhir(pendonor.id_pendonor, pendonor.jenis_kelamin);

    const riwayatTerakhir = semuaRiwayatBerhasil[0] ?? null;
    const statusKesehatan = riwayatTerakhir
      ? {
          hemoglobin: riwayatTerakhir.hemoglobin,
          tekanan_darah_sistole: riwayatTerakhir.tekanan_darah_sistole,
          tekanan_darah_diastole: riwayatTerakhir.tekanan_darah_diastole,
          status_skrining: riwayatTerakhir.status_skrining,
        }
      : null;

    // List riwayat, ikut filter periode
    const batasTanggal = hitungBatasTanggal(filter);
    const listRiwayat = await prisma.riwayatDonor.findMany({
      where: {
        id_pendonor: pendonor.id_pendonor,
        ...(batasTanggal ? { tanggal_donor: { gte: batasTanggal } } : {}),
      },
      orderBy: { tanggal_donor: "desc" },
    });

    return NextResponse.json({
      total_donasi: totalDonasi,
      total_ml_darah: totalMlDarah,
      boleh_donor_sekarang: kelayakan.layak,
      tanggal_boleh_donor: kelayakan.layak ? null : kelayakan.tanggal_boleh_donor,
      status_kesehatan: statusKesehatan,
      riwayat: listRiwayat.map((r) => ({
        id_riwayat: r.id_riwayat,
        tanggal_donor: r.tanggal_donor,
        lokasi_donor: r.lokasi_donor,
        darah_terkumpul: r.darah_terkumpul,
        status_donor: r.status_donor,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data riwayat" }, { status: 500 });
  }
}