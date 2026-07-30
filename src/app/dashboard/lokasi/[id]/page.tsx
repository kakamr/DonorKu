"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import UserMenu from "@/components/UserMenu";
import Image from "next/image";

type Lokasi = {
  id_lokasi: number;
  nama_lokasi: string;
  alamat: string;
  kota: string;
  no_hp: string | null;
  longitude: number | null;
  latitude: number | null;
};

export default function DetailLokasiPage() {
  const router = useRouter();
  const params = useParams();
  const [lokasi, setLokasi] = useState<Lokasi | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/web/lokasi/${params.id}`);
        if (!res.ok) {
          setLokasi(null);
          return;
        }
        const data = await res.json();
        setLokasi(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [params.id]);

  

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <div className="ml-72 flex min-h-screen flex-col">
        <header className="fixed top-0 left-72 right-0 z-50 flex h-20 items-center justify-end border-b-2 border-black bg-white px-10">
          <UserMenu />
        </header>

        <main className="flex-1 px-10 pt-28 pb-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-5xl font-extrabold text-black">Lihat Detail Lokasi</h1>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard/lokasi")}
                className="flex items-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-black shadow-sm"
              >
                <Image src="/button/back.png" alt="kembali" className="rounded" width={20} height={20}/> Kembali
              </button>
              <button
                type="button"
                onClick={() => router.push(`/dashboard/lokasi/${params.id}/edit`)}
                className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-medium text-white shadow-sm hover:brightness-105"
              >
                <Image src="/button/edit_wh.png" alt="edit data" className="rounded" width={20} height={20}/> Edit
              </button>
            </div>
          </div>

          {loading && <p className="text-gray-400">Memuat data...</p>}

          {!loading && !lokasi && (
            <p className="text-gray-400">Data tidak ditemukan</p>
          )}

          {!loading && lokasi && (
            <>
              <p className="mb-6 text-2xl font-semibold text-black">{lokasi.id_lokasi}</p>

              <h2 className="mb-4 text-xl font-bold text-black">Detail Lokasi</h2>

              <div className="rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                  <div>
                    <p className="mb-2 text-black">Lokasi Donor</p>
                    <div className="rounded-xl bg-gray-100 px-5 py-3 text-black">
                      {lokasi.nama_lokasi}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-black">Kota</p>
                    <div className="rounded-xl bg-gray-100 px-5 py-3 text-black">
                      {lokasi.kota}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-black">No Petugas</p>
                    <div className="rounded-xl bg-gray-100 px-5 py-3 text-black">
                      {lokasi.no_hp}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-black">
                      Alamat Lokasi<span className="text-red-500">*</span>
                    </p>
                    <div className="min-h-[110px] rounded-xl bg-gray-100 px-5 py-3 text-black">
                      {lokasi.alamat}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-black">Longitude</p>
                    <div className="rounded-xl bg-gray-100 px-5 py-3 text-black">
                      {lokasi.longitude}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-black">Latitude</p>
                    <div className="rounded-xl bg-gray-100 px-5 py-3 text-black">
                      {lokasi.latitude}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
