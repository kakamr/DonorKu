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
  foto_lokasi: string | null;
};

export default function DetailLokasiPage() {
  const router = useRouter();
  const params = useParams();
  const [lokasi, setLokasi] = useState<Lokasi | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
            <div>
              <h1 className="text-5xl font-extrabold text-black">Detail Lokasi</h1>
              <p className="mt-2 text-3xl font-extrabold text-black">ID {params.id}</p>
            </div>
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
          {!loading && !lokasi && <p className="text-gray-400">Data tidak ditemukan</p>}

          {!loading && lokasi && (
            <>
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="relative h-56 w-56 flex-shrink-0 overflow-hidden rounded-xl bg-gray-300">
                  {lokasi.foto_lokasi ? (
                    <Image src={lokasi.foto_lokasi} alt={lokasi.nama_lokasi} className="object-cover" fill />
                  ) : null}

                  {lokasi.foto_lokasi && (
                    <button
                      type="button"
                      onClick={() => setPreviewImage(lokasi.foto_lokasi)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90"
                    >
                      <Image src="/button/view.png" alt="lihat gambar" width={20} height={20}/>
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="mb-4 text-xl font-bold text-black">Detail Lokasi</h2>
                  <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-3">
                    <div>
                      <p className="text-black">Lokasi Donor</p>
                      <p className="text-lg font-semibold text-black">{lokasi.nama_lokasi}</p>
                    </div>
                    <div>
                      <p className="text-black">No Petugas</p>
                      <p className="text-lg font-semibold text-black">{lokasi.no_hp ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-black">Kota</p>
                      <p className="text-lg font-semibold text-black">{lokasi.kota}</p>
                    </div>

                    <div className="sm:col-span-3">
                      <p className="text-black">
                        Alamat Lokasi<span className="text-red-500">*</span>
                      </p>
                      <p className="text-lg font-semibold text-black">{lokasi.alamat}</p>
                    </div>

                    <div>
                      <p className="text-black">Longitude</p>
                      <p className="text-lg font-semibold text-black">{lokasi.longitude ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-black">Latitude</p>
                      <p className="text-lg font-semibold text-black">{lokasi.latitude ?? "-"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="mt-8 border-gray-300" />
            </>
          )}
        </main>
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8"
          onClick={() => setPreviewImage(null)}
        >
          <Image src={previewImage} alt="Preview" className="rounded-xl object-contain" fill />
        </div>
      )}
    </div>
  );
}
