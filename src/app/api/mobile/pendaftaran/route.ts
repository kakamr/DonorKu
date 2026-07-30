import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileTokenPayload } from "@/lib/mobileAuth";
import { cekJarakDonorTerakhir, nilaiKelayakanKuesioner, JawabanKuesioner } from "@/lib/donorEligibility";
import { buatNotifikasi } from "@/lib/notifikasi";

export async function POST(req: NextRequest) {
  const payload = getMobileTokenPayload(req);
  if (!payload) {
    return NextResponse.json({ message: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id_jadwal, jawaban } = body as { id_jadwal: number; jawaban: JawabanKuesioner };

    if (!id_jadwal || !jawaban) {
      return NextResponse.json({ message: "Data pendaftaran tidak lengkap" }, { status: 400 });
    }

    const pendonor = await prisma.pendonor.findUnique({ where: { id_pendonor: payload.id_pendonor } });
    if (!pendonor || pendonor.is_deleted) {
      return NextResponse.json({ message: "Akun tidak ditemukan" }, { status: 404 });
    }

    const jadwal = await prisma.jadwalDonor.findUnique({
      where: { id_jadwal },
      include: { lokasi: true },
    });
    if (!jadwal || jadwal.status_jadwal !== "aktif") {
      return NextResponse.json({ message: "Jadwal tidak tersedia" }, { status: 404 });
    }

    if (!jadwal.tanggal_pelaksanaan) {
      // Seharusnya tidak pernah terjadi untuk jadwal berstatus aktif —
      // kalau muncul, berarti ada data jadwal yang belum lengkap di sisi admin.
      console.error(`Jadwal #${jadwal.id_jadwal} aktif tapi tanggal_pelaksanaan kosong`);
      return NextResponse.json({ message: "Data jadwal tidak lengkap, hubungi admin" }, { status: 500 });
    }

    // 1. Cek kuota masih ada
    const jumlahTerdaftar = await prisma.pendaftaran.count({
      where: { id_jadwal, status_pendaftaran: { in: ["diterima", "menunggu"] } },
    });
    if (jumlahTerdaftar >= jadwal.kuota) {
      return NextResponse.json({ message: "Kuota jadwal ini sudah penuh" }, { status: 409 });
    }

    // 2. Cek jarak minimal dari donor terakhir
    const kelayakanJarak = await cekJarakDonorTerakhir(pendonor.id_pendonor, pendonor.jenis_kelamin);
    if (!kelayakanJarak.layak) {
      return NextResponse.json(
        {
          message: "Anda belum bisa donor lagi berdasarkan jarak minimal donor terakhir",
          tanggal_boleh_donor: kelayakanJarak.tanggal_boleh_donor,
        },
        { status: 400 }
      );
    }

    // 3. Nilai kuesioner kesehatan
    const kelayakanKuesioner = nilaiKelayakanKuesioner(jawaban);
    if (!kelayakanKuesioner.layak) {
      return NextResponse.json(
        {
          message: "Anda belum memenuhi syarat kesehatan untuk donor saat ini",
          alasan: kelayakanKuesioner.alasan,
        },
        { status: 400 }
      );
    }

    // 4. Cek belum pernah daftar di jadwal yang sama
    const sudahDaftar = await prisma.pendaftaran.findFirst({
      where: { id_pendonor: pendonor.id_pendonor, id_jadwal },
    });
    if (sudahDaftar) {
      return NextResponse.json({ message: "Anda sudah terdaftar di jadwal ini" }, { status: 409 });
    }

    // 5. Simpan pendaftaran + kuesioner sekaligus (atomik)
    const nomorAntrian = jumlahTerdaftar + 1;

    const hasil = await prisma.$transaction(async (tx) => {
      const pendaftaran = await tx.pendaftaran.create({
        data: {
          id_admin: jadwal.id_admin,
          id_pendonor: pendonor.id_pendonor,
          id_jadwal,
          nomor_antrian: nomorAntrian,
          status_pendaftaran: "menunggu",
        },
      });

      await tx.kuesionerKesehatan.create({
        data: {
          id_pendaftaran: pendaftaran.id_pendaftaran,
          ...jawaban,
          layak_donor: true,
        },
      });

      return pendaftaran;
    });

    await buatNotifikasi(
      pendonor.id_pendonor,
      "success",
      `Pendaftaran donor - jadwal #${hasil.id_jadwal}`,
      `Anda telah daftar donor di Lokasi ${jadwal.lokasi.nama_lokasi} untuk tanggal ${jadwal.tanggal_pelaksanaan.toLocaleDateString("id-ID")}`
    );

    return NextResponse.json(
      {
        message: "Berhasil melakukan pendaftaran",
        id_pendaftaran: hasil.id_pendaftaran,
        nomor_antrian: hasil.nomor_antrian,
        lokasi: jadwal.lokasi.nama_lokasi,
        tanggal: jadwal.tanggal_pelaksanaan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal melakukan pendaftaran" }, { status: 500 });
  }
}