"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ConfirmModal from "@/components/ConfirmModal";
import UserMenu from "@/components/UserMenu";
import Image from "next/image";

type StokForm = {
  jumlah_kantong: string;
  golongan_darah: string;
  lokasi: string;
  alamat_lokasi: string;
};

const emptyForm: StokForm = {
  jumlah_kantong: "",
  golongan_darah: "",
  lokasi: "",
  alamat_lokasi: "",
};

export default function EditStokDarahPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState<StokForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/stok-darah/${params.id}`);
        if (!res.ok) return;
        const data = await res.json();
        setForm({
          jumlah_kantong: data.jumlah_kantong?.toString() ?? "",
          golongan_darah: data.golongan_darah ?? "",
          lokasi: data.lokasi?.nama_lokasi ?? "",
          alamat_lokasi: data.lokasi?.alamat ?? "",
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [params.id]);

  

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/stok-darah/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jumlah_kantong: form.jumlah_kantong,
          golongan_darah: form.golongan_darah,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message ?? "Gagal menyimpan perubahan");
        return;
      }

      setShowEditConfirm(false);
      router.push("/dashboard/stok-darah");
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan data");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <div className="ml-72 flex min-h-screen flex-col">
        <header className="fixed top-0 left-72 right-0 z-50 flex h-20 items-center justify-end border-b-2 border-black bg-white px-10">
          <UserMenu />
        </header>

        <main className="flex-1 px-10 pt-28 pb-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-5xl font-extrabold text-black">Edit Stok Darah</h1>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowBackConfirm(true)}
                className="flex items-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-black shadow-sm"
              >
                <Image src="/button/back.png" alt="kembali" className="rounded" width={20} height={20}/> Kembali
              </button>
              <button
                type="button"
                onClick={() => setShowEditConfirm(true)}
                className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-medium text-white shadow-sm hover:brightness-105"
              >
                <Image src="/button/save.png" alt="simpan perubahan" className="rounded" width={20} height={20}/> Simpan
              </button>
            </div>
          </div>

          <p className="mb-6 text-2xl font-semibold text-black">Id {params.id}</p>

          <h2 className="mb-4 text-xl font-bold text-black">Detail Stok</h2>

          {loading ? (
            <p className="text-gray-400">Memuat data...</p>
          ) : (
            <div className="rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-black">
                    Jumlah Stok<span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.jumlah_kantong}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, jumlah_kantong: e.target.value }))
                    }
                    className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-black">Golongan Darah</label>
                  <div className="rounded-xl bg-gray-100 px-5 py-3 text-black">
                    {form.golongan_darah}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-black">Lokasi</label>
                  <div className="rounded-xl bg-gray-100 px-5 py-3 text-black">
                    {form.lokasi}
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="mb-2 block text-black">
                    Alamat Lokasi<span className="text-red-500">*</span>
                  </label>
                  <div className="min-h-[110px] rounded-xl bg-gray-100 px-5 py-3 text-black">
                    {form.alamat_lokasi || "-"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <ConfirmModal
        isOpen={showEditConfirm}
        variant="edit"
        onConfirm={handleSave}
        onCancel={() => setShowEditConfirm(false)}
      />
      <ConfirmModal
        isOpen={showBackConfirm}
        variant="back"
        onConfirm={() => router.push("/dashboard/stok-darah")}
        onCancel={() => setShowBackConfirm(false)}
      />
    </div>
  );
}
