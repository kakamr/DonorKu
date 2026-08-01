"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ConfirmModal from "@/components/ConfirmModal";
import JadwalForm, { JadwalFormData, FotoItem } from "@/components/JadwalForm";
import UserMenu from "@/components/UserMenu";
import Image from "next/image";

const emptyForm: JadwalFormData = {
  hari_tanggal: "",
  waktu_mulai: "",
  waktu_selesai: "",
  id_lokasi: "",
  nama_penanggung_jawab: "",
  kontak_penanggung_jawab: "",
  total_pendaftar_online: "",
  total_pendonor_offline: "",
  pendonor_hadir: "",
  darah_terkumpul: "",
};

export default function TambahJadwalPage() {
  const router = useRouter();
  const [form, setForm] = useState<JadwalFormData>(emptyForm);
  const [foto, setFoto] = useState<FotoItem[]>([]);
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  const handleChange = (field: keyof JadwalFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddFoto = (items: FotoItem[]) => {
    setFoto((prev) => {
      const existingIds = prev.map((f) => f.id);
      const updated = prev.map((f) => {
        const match = items.find((i) => i.id === f.id);
        return match ? match : f;
      });
      const newOnes = items.filter((i) => !existingIds.includes(i.id));
      return [...updated, ...newOnes];
    });
  };

  const handleRemoveFoto = (id: string) => {
    setFoto((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSave = async () => {
    if (!form.id_lokasi) {
      alert("Silakan pilih lokasi terlebih dahulu");
      return;
    }

    try {
      const res = await fetch("/api/web/jadwal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id_lokasi: Number(form.id_lokasi),
          id_admin: 1, 
          foto_lokasi: foto.map((f) => f.url),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message ?? "Gagal menambah jadwal");
        return;
      }

      setShowAddConfirm(false);
      router.push("/dashboard/jadwal");
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
            <h1 className="text-5xl font-extrabold text-black">Tambah Jadwal</h1>
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

          <JadwalForm
            form={form}
            onChange={handleChange}
            foto={foto}
            onAddFoto={handleAddFoto}
            onRemoveFoto={handleRemoveFoto}
          />
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
        onConfirm={() => router.push("/dashboard/jadwal")}
        onCancel={() => setShowBackConfirm(false)}
      />
    </div>
  );
}
