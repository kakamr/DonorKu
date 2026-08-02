import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setUTCMonth(oneMonthAgo.getUTCMonth() - 1);
    const startOfYear = new Date(Date.UTC(now.getFullYear(), 0, 1));

    const riwayatTahunIni = await prisma.riwayatDonor.findMany({
      where: { tanggal_donor: { gte: startOfYear } },
      select: { tanggal_donor: true },
    });

    const namaBulan = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    const statistikMap = new Array(12).fill(0);
    riwayatTahunIni.forEach((r) => {
      const bulan = new Date(r.tanggal_donor).getMonth();
      statistikMap[bulan]++;
    });
    const statistikData = namaBulan.map((bulan, i) => ({ bulan, donor: statistikMap[i] }));

    const stokRaw = await prisma.stokDarah.groupBy({
      by: ["golongan_darah"],
      _sum: { jumlah_kantong: true },
    });

    const golonganUrut = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const stokDarah = golonganUrut.map((g) => {
      const found = stokRaw.find((s) => s.golongan_darah === g);
      const jumlah = found?._sum.jumlah_kantong ?? 0;
      let status: "Stok aman" | "Stok Menipis" | "Stok Kritis" = "Stok aman";
      let kritis = false;
      if (jumlah < 50) {
        status = "Stok Kritis";
        kritis = true;
      } else if (jumlah <= 150) {
        status = "Stok Menipis";
        kritis = true;
      }
      return { golongan: g, jumlah, status, kritis };
    });

    const jadwalHariIni = await prisma.jadwalDonor.findMany({
      where: {
        tanggal_pelaksanaan: { gte: today, lt: tomorrow },
      },
      include: { lokasi: true },
    });

    const donorHariIni = jadwalHariIni.map((j) => ({
      nama: j.lokasi.nama_lokasi,
      alamat: j.lokasi.alamat,
      jam: `${new Date(j.jam_mulai).getUTCHours()}.00-${new Date(j.jam_selesai).getUTCHours()}.00`,
    }));

    const totalPendonorHariIni = await prisma.riwayatDonor.count({
      where: {
        tanggal_donor: { gte: today, lt: tomorrow },
      },
    });

    const totalPendonorBulanIni = await prisma.riwayatDonor.count({
      where: { tanggal_donor: { gte: oneMonthAgo } },
    });

    const semuaPendonor = await prisma.pendonor.findMany({
      select: { tanggal_lahir: true },
    });

    const kelompokUsia = { "17 - 25": 0, "26 - 35": 0, "36 - 45": 0, "46 +": 0 };
    semuaPendonor.forEach((p) => {
      const umur = hitungUmur(p.tanggal_lahir);
      if (umur >= 17 && umur <= 25) kelompokUsia["17 - 25"]++;
      else if (umur <= 35) kelompokUsia["26 - 35"]++;
      else if (umur <= 45) kelompokUsia["36 - 45"]++;
      else if (umur >= 46) kelompokUsia["46 +"]++;
    });

    const usiaPendonor = [
      { label: "17 - 25", value: kelompokUsia["17 - 25"], color: "#FCA5A5" },
      { label: "26 - 35", value: kelompokUsia["26 - 35"], color: "#F87171" },
      { label: "36 - 45", value: kelompokUsia["36 - 45"], color: "#EF4444" },
      { label: "46 +", value: kelompokUsia["46 +"], color: "#B91C1C" },
    ];

    return NextResponse.json({
      statistikData,
      stokDarah,
      donorHariIni,
      totalPendonorHariIni,
      totalPendonorBulanIni,
      usiaPendonor,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data dashboard" }, { status: 500 });
  }
}

function hitungUmur(tanggalLahir: Date) {
  const today = new Date();
  const lahir = new Date(tanggalLahir);
  let umur = today.getFullYear() - lahir.getFullYear();
  const belumUlangTahun =
    today.getMonth() < lahir.getMonth() ||
    (today.getMonth() === lahir.getMonth() && today.getDate() < lahir.getDate());
  if (belumUlangTahun) umur--;
  return umur;
}