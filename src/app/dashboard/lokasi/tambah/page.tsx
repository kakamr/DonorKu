"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ConfirmModal from "@/components/ConfirmModal";
import UserMenu from "@/components/UserMenu";
import Image from "next/image";

const emptyForm = {
  nama: "",
  alamat: "",
  kota: "",
  noPetugas: "",
  longitude: "",
  latitude: "",
};

export default function TambahLokasiPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/lokasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_admin: 1, 
          nama_lokasi: form.nama,
          alamat: form.alamat,
          kota: form.kota,
          no_hp: form.noPetugas,
          longitude: form.longitude,
          latitude: form.latitude,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message ?? "Gagal menambah lokasi");
        return;
      }

      setShowAddConfirm(false);
      router.push("/dashboard/lokasi");
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
            <h1 className="text-5xl font-extrabold text-black">Tambah Lokasi</h1>
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
                onClick={() => setShowAddConfirm(true)}
                className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-medium text-white shadow-sm hover:brightness-105"
              >
                <Image src="/button/save.png" alt="simpan perubahan" className="rounded" width={20} height={20}/> Simpan
              </button>
            </div>
          </div>

          <h2 className="mb-4 text-xl font-bold text-black">Detail Lokasi</h2>

          <div className="rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-black">Lokasi Donor</label>
                <input
                  placeholder="Masukkan lokasi tempat donor"
                  value={form.nama}
                  onChange={(e) => handleChange("nama", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div>
                <label className="mb-2 block text-black">Kota</label>
                <input
                  placeholder="Masukkan kota tempat donor"
                  value={form.kota}
                  onChange={(e) => handleChange("kota", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div>
                <label className="mb-2 block text-black">No Petugas</label>
                <input
                  placeholder="Masukkan no telepon petugas"
                  value={form.noPetugas}
                  onChange={(e) => handleChange("noPetugas", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-black">
                  Alamat Lokasi<span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Masukkan alamat lokasi"
                  value={form.alamat}
                  onChange={(e) => handleChange("alamat", e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-200 px-5 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div>
                <label className="mb-2 block text-black">Longitude</label>
                <input
                  placeholder="Masukkan longitude"
                  value={form.longitude}
                  onChange={(e) => handleChange("longitude", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div>
                <label className="mb-2 block text-black">Latitude</label>
                <input
                  placeholder="Masukkan latitude"
                  value={form.latitude}
                  onChange={(e) => handleChange("latitude", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      <ConfirmModal
        isOpen={showAddConfirm}
        variant="add"
        onConfirm={handleSave}
        onCancel={() => setShowAddConfirm(false)}
      />
      <ConfirmModal
        isOpen={showBackConfirm}
        variant="back"
        onConfirm={() => router.push("/dashboard/lokasi")}
        onCancel={() => setShowBackConfirm(false)}
      />
    </div>
  );
}
