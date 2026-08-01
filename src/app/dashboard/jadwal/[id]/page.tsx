"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import UserMenu from "@/components/UserMenu";
import Image from "next/image";

type JadwalDetail = {
  id_jadwal: number;
  tanggal_pelaksanaan: string | null;
  jam_mulai: string;
  jam_selesai: string;
  kuota: number;
  total_pendonor_offline: number | null;
  pendonor_hadir: number | null;
  darah_terkumpul: number | null;
  nama_penanggung_jawab: string | null;
  kontak_penanggung_jawab: string | null;
  foto_lokasi: string | null;
  lokasi: { nama_lokasi: string; alamat: string };
};

export default function DetailJadwalPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<JadwalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fotoIndex, setFotoIndex] = useState(0);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/web/jadwal/${params.id}`);
        if (!res.ok) {
          setData(null);
          return;
        }
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [params.id]);

  

  const formatJam = (jam: string) => {
    const d = new Date(jam);
    return `${d.getUTCHours().toString().padStart(2, "0")}.${d
      .getUTCMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const formatTanggal = (tanggal: string | null) => {
    if (!tanggal) return "-";
    const d = new Date(tanggal);
    return `${d.getUTCDate().toString().padStart(2, "0")}/${(d.getUTCMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getUTCFullYear()}`;
  };

  const fotoList: string[] = data?.foto_lokasi ? JSON.parse(data.foto_lokasi) : [];

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <div className="ml-72 flex min-h-screen flex-col">
        <header className="fixed top-0 left-72 right-0 z-50 flex h-20 items-center justify-end border-b-2 border-black bg-white px-10">
          <UserMenu />
        </header>

        <main className="flex-1 px-10 pt-28 pb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-extrabold text-black">Jadwal Donor</h1>
              <p className="mt-2 text-3xl font-extrabold text-black">ID {params.id}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard/jadwal")}
                className="flex items-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-black shadow-sm"
              >
                <Image src="/button/back.png" alt="kembali" className="rounded" width={20} height={20}/> Kembali
              </button>
              <button
                type="button"
                onClick={() => router.push(`/dashboard/jadwal/${params.id}/edit`)}
                className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-medium text-white shadow-sm hover:brightness-105"
              >
                <Image src="/button/edit_wh.png" alt="edit data" className="rounded" width={20} height={20}/> Edit
              </button>
            </div>
          </div>

          {loading && <p className="text-gray-400">Memuat data...</p>}
          {!loading && !data && <p className="text-gray-400">Data tidak ditemukan</p>}

          {!loading && data && (
            <>
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="relative h-72 w-96 flex-shrink-0 overflow-hidden rounded-xl bg-gray-300">
                  {fotoList.length > 0 ? (
                    <Image
                      src={fotoList[fotoIndex]}
                      alt="Foto lokasi"
                      className="object-cover"
                      fill
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      Tidak ada foto
                    </div>
                  )}
                  
                  {fotoList.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setFotoIndex((prev) => (prev === 0 ? fotoList.length - 1 : prev - 1))
                        }
                        className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() =>
                          setFotoIndex((prev) => (prev === fotoList.length - 1 ? 0 : prev + 1))
                        }
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black"
                      >
                        ›
                      </button>
                      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                        {fotoList.map((_, idx) => (
                          <span
                            key={idx}
                            className={`h-2 w-2 rounded-full ${
                              idx === fotoIndex ? "bg-white" : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="mb-4 text-xl font-bold text-black">Detail Jadwal</h2>
                  <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-3">
                    <div>
                      <p className="text-black">Tanggal</p>
                      <p className="text-lg font-semibold text-black">{formatTanggal(data.tanggal_pelaksanaan)}</p>
                    </div>
                    <div>
                      <p className="text-black">Waktu Mulai</p>
                      <p className="text-lg font-semibold text-black">{formatJam(data.jam_mulai)}</p>
                    </div>
                    <div>
                      <p className="text-black">Waktu Selesai</p>
                      <p className="text-lg font-semibold text-black">{formatJam(data.jam_selesai)}</p>
                    </div>

                    <div>
                      <p className="text-black">Penyelenggara</p>
                      <p className="text-lg font-semibold text-black">
                        {data.nama_penanggung_jawab ?? "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-black">Lokasi</p>
                      <p className="text-lg font-semibold text-black">{data.lokasi.nama_lokasi}</p>
                    </div>
                    <div>
                      <p className="text-black">Hari</p>
                      <p className="text-lg font-semibold text-black">-</p>
                    </div>

                    <div className="sm:col-span-3">
                      <p className="text-black">Alamat Lokasi</p>
                      <p className="text-lg font-semibold text-black">{data.lokasi.alamat}</p>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="my-8 border-gray-300" />

              <h2 className="mb-4 text-xl font-bold text-black">Detail Donor</h2>
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                <div>
                  <p className="text-black">Total Pendaftar (Online)</p>
                  <p className="text-lg font-semibold text-black">{data.kuota}</p>
                </div>
                <div>
                  <p className="text-black">Total Pendonor (Offline)</p>
                  <p className="text-lg font-semibold text-black">
                    {data.total_pendonor_offline ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-black">Pendonor Hadir</p>
                  <p className="text-lg font-semibold text-black">{data.pendonor_hadir ?? "-"}</p>
                </div>
                <div>
                  <p className="text-black">Darah Terkumpul</p>
                  <p className="text-lg font-semibold text-black">{data.darah_terkumpul ?? "-"}</p>
                </div>
              </div>

              <hr className="my-8 border-gray-300" />

              <h2 className="mb-4 text-xl font-bold text-black">Penanggung Jawab</h2>
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                <div>
                  <p className="text-black">Nama</p>
                  <p className="text-lg font-semibold text-black">
                    {data.nama_penanggung_jawab ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-black">Kontak</p>
                  <p className="text-lg font-semibold text-black">
                    {data.kontak_penanggung_jawab ?? "-"}
                  </p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
