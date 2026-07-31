"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import UserMenu from "@/components/UserMenu";
import Image from "next/image";

type PendonorDetail = {
  id_pendonor: number;
  nama_lengkap: string;
  email: string;
  golongan_darah: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  alamat: string;
  foto_profil: string | null;
  alamat_lokasi: string | null;
  riwayat_donor: {
    tanggal_donor: string;
    lokasi_donor: string;
  }[];
};

export default function DetailPendonorPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<PendonorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/web/pendonor/${params.id}`);
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

  

  const hitungUmur = (tanggalLahir: string) => {
    const today = new Date();
    const lahir = new Date(tanggalLahir);
    let umur = today.getFullYear() - lahir.getFullYear();
    const belumUlangTahun =
      today.getMonth() < lahir.getMonth() ||
      (today.getMonth() === lahir.getMonth() && today.getDate() < lahir.getDate());
    if (belumUlangTahun) umur--;
    return umur;
  };

  const formatTanggalLahir = (tanggal: string) => {
    const bulanIndo = [
      "januari", "februari", "maret", "april", "mei", "juni",
      "juli", "agustus", "september", "oktober", "november", "desember",
    ];
    const d = new Date(tanggal);
    return `${d.getDate()} ${bulanIndo[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatTanggalDonor = (tanggal: string) => {
    const d = new Date(tanggal);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <div className="ml-72 flex min-h-screen flex-col">
        <header className="fixed top-0 left-72 right-0 z-50 flex h-20 items-center justify-end border-b-2 border-black bg-white px-10">
          <div />
          <UserMenu />
        </header>

        <main className="flex-1 px-10 pt-28 pb-8">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-5xl font-extrabold text-black">Daftar Pendonor</h1>
              <p className="mt-2 text-3xl font-extrabold text-black">ID {params.id}</p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/dashboard/pendonor")}
              className="flex items-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-black shadow-sm"
            >
              <Image src="/button/back.png" alt="kembali" className="rounded" width={20} height={20}/> Kembali
            </button>
          </div>

          {loading && <p className="text-gray-400">Memuat data...</p>}
          {!loading && !data && <p className="text-gray-400">Data tidak ditemukan</p>}

          {!loading && data && (
            <>
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="h-75 w-75 flex-shrink-0 rounded-xl bg-gray-300" />

                <div className="flex-1">
                  <h2 className="mb-4 text-xl font-bold text-black">Detail Pendonor</h2>
                  <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-3">
                    <div>
                      <p className="text-black">Nama</p>
                      <p className="text-lg font-semibold text-black">{data.nama_lengkap}</p>
                    </div>
                    <div>
                      <p className="text-black">Email</p>
                      <p className="text-lg font-semibold text-black">{data.email}</p>
                    </div>
                    <div>
                      <p className="text-black">Golongan Darah</p>
                      <p className="text-lg font-semibold text-black">{data.golongan_darah}</p>
                    </div>

                    <div>
                      <p className="text-black">Jenis Kelamin</p>
                      <p className="text-lg font-semibold text-black">
                        {data.jenis_kelamin === "Laki-laki" ? "Laki - Laki" : data.jenis_kelamin}
                      </p>
                    </div>
                    <div>
                      <p className="text-black">Tanggal Lahir</p>
                      <p className="text-lg font-semibold text-black">
                        {formatTanggalLahir(data.tanggal_lahir)}
                      </p>
                    </div>
                    <div>
                      <p className="text-black">Umur</p>
                      <p className="text-lg font-semibold text-black">
                        {hitungUmur(data.tanggal_lahir)}
                      </p>
                    </div>

                    <div className="sm:col-span-3">
                      <p className="text-black">Alamat</p>
                      <p className="text-lg font-semibold text-black">{data.alamat}</p>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="my-8 border-gray-300" />

              <h2 className="mb-4 text-xl font-bold text-black">Detail Donor</h2>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                <div>
                  <p className="text-black">Tanggal Pendonoran</p>
                  <p className="text-lg font-semibold text-black">
                    {data.riwayat_donor[0]
                      ? formatTanggalDonor(data.riwayat_donor[0].tanggal_donor)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-black">Lokasi</p>
                  <p className="text-lg font-semibold text-black">
                    {data.riwayat_donor[0]?.lokasi_donor ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-black">Alamat Lokasi</p>
                  <p className="text-lg font-semibold text-black">{data.alamat_lokasi ?? "-"}</p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
