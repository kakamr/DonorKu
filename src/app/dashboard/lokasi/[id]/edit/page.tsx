"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ConfirmModal from "@/components/ConfirmModal";
import UserMenu from "@/components/UserMenu";
import Image from "next/image";

type LokasiForm = {
  nama_lokasi: string;
  alamat: string;
  kota: string;
  no_hp: string;
  longitude: string;
  latitude: string;
};

const emptyForm: LokasiForm = {
  nama_lokasi: "",
  alamat: "",
  kota: "",
  no_hp: "",
  longitude: "",
  latitude: "",
};

export default function EditLokasiPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState<LokasiForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/lokasi/${params.id}`);
        if (!res.ok) return;
        const data = await res.json();
        setForm({
          nama_lokasi: data.nama_lokasi ?? "",
          alamat: data.alamat ?? "",
          kota: data.kota ?? "",
          no_hp: data.no_hp ?? "",
          longitude: data.longitude?.toString() ?? "",
          latitude: data.latitude?.toString() ?? "",
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [params.id]);

  

  const handleChange = (field: keyof LokasiForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/lokasi/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message ?? "Gagal menyimpan perubahan");
        return;
      }

      setShowEditConfirm(false);
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
            <h1 className="text-5xl font-extrabold text-black">Edit Lokasi ID {params.id}</h1>
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

          <h2 className="mb-4 text-xl font-bold text-black">Detail Lokasi</h2>

          {loading ? (
            <p className="text-gray-400">Memuat data...</p>
          ) : (
            <div className="rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-black">Lokasi Donor</label>
                  <input
                    value={form.nama_lokasi}
                    onChange={(e) => handleChange("nama_lokasi", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-black">Kota</label>
                  <input
                    value={form.kota}
                    onChange={(e) => handleChange("kota", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-black">No Petugas</label>
                  <input
                    value={form.no_hp}
                    onChange={(e) => handleChange("no_hp", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-black">
                    Alamat Lokasi<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.alamat}
                    onChange={(e) => handleChange("alamat", e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-gray-200 px-5 py-3 text-black focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-black">Longitude</label>
                  <input
                    value={form.longitude}
                    onChange={(e) => handleChange("longitude", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-black">Latitude</label>
                  <input
                    value={form.latitude}
                    onChange={(e) => handleChange("latitude", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
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
        onConfirm={() => router.push("/dashboard/lokasi")}
        onCancel={() => setShowBackConfirm(false)}
      />
    </div>
  );
}
