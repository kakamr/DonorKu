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
  const [foto, setFoto] = useState<{ url: string; uploading?: boolean } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setError(null);
    setFoto({ url: URL.createObjectURL(file), uploading: true });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "lokasi");

    try {
      const res = await fetch("/api/web/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Gagal upload gambar");
        setFoto(null);
        return;
      }

      setFoto({ url: data.url, uploading: false });
    } catch (error) {
      console.error(error);
      setError("Terjadi kesalahan saat upload gambar");
      setFoto(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowAddConfirm(true);
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/web/lokasi", {
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
          foto_lokasi: foto?.url ?? null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? "Gagal menambah lokasi");
        setShowAddConfirm(false);
        return;
      }

      setShowAddConfirm(false);
      router.push("/dashboard/lokasi");
    } catch (error) {
      console.error(error);
      setError("Terjadi kesalahan saat menyimpan data");
      setShowAddConfirm(false);
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
          <form onSubmit={handleSubmit}>
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
                  type="submit"
                  className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-medium text-white shadow-sm hover:brightness-105"
                >
                  <Image src="/button/save.png" alt="simpan perubahan" className="rounded" width={20} height={20}/> Simpan
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-600">
                {error}
              </div>
            )}

            <h2 className="mb-4 text-xl font-bold text-black">Detail Lokasi</h2>

            <div className="mb-8 rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-black">
                    Lokasi Donor<span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="Masukkan lokasi tempat donor"
                    value={form.nama}
                    onChange={(e) => handleChange("nama", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-black">
                    Kota<span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="Masukkan kota tempat donor"
                    value={form.kota}
                    onChange={(e) => handleChange("kota", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-black">
                    No Petugas<span className="text-red-500">*</span>
                  </label>
                  <input
                    required
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
                    required
                    placeholder="Masukkan alamat lokasi"
                    value={form.alamat}
                    onChange={(e) => handleChange("alamat", e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-gray-200 px-5 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-black">
                    Longitude<span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="Masukkan longitude"
                    value={form.longitude}
                    onChange={(e) => handleChange("longitude", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-black">
                    Latitude<span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="Masukkan latitude"
                    value={form.latitude}
                    onChange={(e) => handleChange("latitude", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>
            </div>

            <h2 className="mb-4 text-xl font-bold text-black">Foto Lokasi</h2>
            <div className="rounded-2xl border border-gray-200 p-8 shadow-sm">
              <label className="mb-2 block text-black">
                Foto Lokasi<span className="text-red-500">*</span>
              </label>
              <div className="mb-6 flex max-w-xl overflow-hidden rounded-xl border border-gray-200">
                <input
                  required
                  readOnly
                  placeholder="Pilih Gambar"
                  value={foto ? "1 file dipilih" : ""}
                  className="flex-1 px-5 py-3 text-gray-400 placeholder:text-gray-400 focus:outline-none"
                />
                <label className="flex cursor-pointer items-center bg-gray-100 px-6 py-3 font-medium text-black hover:bg-gray-200">
                  Browse
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                </label>
              </div>

              {foto && (
                <>
                  <p className="mb-3 text-black">Preview</p>
                  <div
                    key={foto.url}
                    className="relative h-40 w-56 overflow-hidden rounded-xl bg-gray-100"
                  >
                    <Image src={foto.url} alt="Foto lokasi" className="object-cover" fill />

                    {foto.uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-white">
                        Mengupload...
                      </div>
                    )}

                    <div className="absolute right-2 top-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewImage(foto.url)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90"
                      >
                        <Image src="/button/view.png" alt="lihat gambar" width={20} height={20}/>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFoto(null)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600"
                      >
                        <Image src="/button/delete.png" alt="hapus gambar" width={20} height={20}/>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </form>
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