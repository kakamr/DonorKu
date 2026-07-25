"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import UserMenu from "@/components/UserMenu";
import SuccessModal from "@/components/SuccessModal";
import Image from "next/image";

type ProfileForm = {
  nama_admin: string;
  email: string;
  no_hp: string;
  alamat: string;
};

const emptyForm: ProfileForm = {
  nama_admin: "",
  email: "",
  no_hp: "",
  alamat: "",
};

export default function EditProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [fotoProfil, setFotoProfil] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAdmin();
  }, []);

  const fetchAdmin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/me");
      if (!res.ok) return;
      const data = await res.json();
      setForm({
        nama_admin: data.nama_admin ?? "",
        email: data.email ?? "",
        no_hp: data.no_hp ?? "",
        alamat: data.alamat ?? "",
      });
      setFotoProfil(data.foto_profil ?? null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUbahFoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setFotoProfil(previewUrl);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "profile");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message ?? "Gagal mengupload foto");
        return;
      }

      setFotoProfil(data.url);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengupload foto");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/admin/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          foto_profil: fotoProfil,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message ?? "Gagal menyimpan perubahan");
        return;
      }

      setShowSuccess(true);
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
          <h1 className="mb-6 text-5xl font-extrabold text-black">Edit Profile</h1>

          {loading ? (
            <p className="text-gray-400">Memuat data...</p>
          ) : (
            <>
              <p className="mb-2 text-xl font-bold text-black">Foto Profile</p>
              <div className="mb-8 flex items-center gap-6">
                <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-300">
                  <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-300">
                    {fotoProfil ? (
                      <Image src={fotoProfil} alt="Foto profil" className="object-cover" fill/>
                    ) : null}
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-white">
                        Mengupload...
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h2 className="mb-3 text-2xl font-extrabold text-black">{form.nama_admin}</h2>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <button
                    type="button"
                    onClick={handleUbahFoto}
                    disabled={uploading}
                    className="rounded-xl border border-red-600 px-6 py-2 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {uploading ? "Mengupload..." : "Ubah Foto"}
                  </button>
                </div>
              </div>

              <div className="max-w rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="mb-6">
                  <label className="mb-2 block text-xl font-bold text-black">Nama Lengkap</label>
                  <input
                    value={form.nama_admin}
                    onChange={(e) => handleChange("nama_admin", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div className="mb-6">
                  <label className="mb-2 block text-xl font-bold text-black">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div className="mb-6">
                  <label className="mb-2 block text-xl font-bold text-black">No. Telepon</label>
                  <input
                    value={form.no_hp}
                    onChange={(e) => handleChange("no_hp", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div className="mb-2">
                  <label className="mb-2 block text-xl font-bold text-black">Alamat</label>
                  <input
                    value={form.alamat}
                    onChange={(e) => handleChange("alamat", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/profile")}
                    className="rounded-xl border border-red-600 px-8 py-3 font-semibold text-red-600 hover:bg-red-50"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-xl bg-red-600 px-8 py-3 font-semibold text-white shadow-sm hover:brightness-105"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      <SuccessModal
        isOpen={showSuccess}
        variant="success"
        title="Data Profile Berhasil Diganti"
        description="Anda telah berhasil mengganti data profile baru. Silahkan coba buka kembali"
        buttonLabel="Kembali"
        onClose={() => {
          setShowSuccess(false);
          router.push("/dashboard/profile");
        }}
      />
    </div>
  );
}