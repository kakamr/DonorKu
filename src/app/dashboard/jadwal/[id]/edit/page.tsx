"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function EditJadwalPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState<JadwalFormData>(emptyForm);
  const [foto, setFoto] = useState<FotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/web/jadwal/${params.id}`);
        if (!res.ok) return;
        const data = await res.json();

        const jamStr = (t: string) => new Date(t).toISOString().substring(11, 16);

        setForm({
          hari_tanggal: data.tanggal_pelaksanaan
            ? new Date(data.tanggal_pelaksanaan).toISOString().substring(0, 10)
            : "",
          waktu_mulai: jamStr(data.jam_mulai),
          waktu_selesai: jamStr(data.jam_selesai),
          id_lokasi: String(data.id_lokasi ?? ""),
          nama_penanggung_jawab: data.nama_penanggung_jawab ?? "",
          kontak_penanggung_jawab: data.kontak_penanggung_jawab ?? "",
          total_pendaftar_online: data.kuota?.toString() ?? "",
          total_pendonor_offline: data.total_pendonor_offline?.toString() ?? "",
          pendonor_hadir: data.pendonor_hadir?.toString() ?? "",
          darah_terkumpul: data.darah_terkumpul?.toString() ?? "",
        });

        const fotoList: string[] = data.foto_lokasi ? JSON.parse(data.foto_lokasi) : [];
        setFoto(fotoList.map((url, idx) => ({ id: `${idx}-${url}`, url })));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [params.id]);

  

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
      const res = await fetch(`/api/web/jadwal/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id_lokasi: Number(form.id_lokasi),
          foto_lokasi: foto.map((f) => f.url),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message ?? "Gagal menyimpan perubahan");
        return;
      }

      setShowEditConfirm(false);
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
            <h1 className="text-5xl font-extrabold text-black">Edit Jadwal ID {params.id}</h1>
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

          {loading ? (
            <p className="text-gray-400">Memuat data...</p>
          ) : (
            <JadwalForm
              form={form}
              onChange={handleChange}
              foto={foto}
              onAddFoto={handleAddFoto}
              onRemoveFoto={handleRemoveFoto}
            />
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
        onConfirm={() => router.push("/dashboard/jadwal")}
        onCancel={() => setShowBackConfirm(false)}
      />
    </div>
  );
}