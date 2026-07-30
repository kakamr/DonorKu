"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import UserMenu from "@/components/UserMenu";
import SuccessModal from "@/components/SuccessModal";

type AdminData = {
  nama_admin: string;
  foto_profil: string | null;
};

export default function EditPasswordPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [showLama, setShowLama] = useState(false);
  const [showBaru, setShowBaru] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch("/api/web/admin/me");
        if (!res.ok) return;
        const data = await res.json();
        setAdmin(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAdmin();
  }, []);

  const handleSave = async () => {
    if (passwordBaru !== konfirmasiPassword) {
      setShowError(true);
      return;
    }

    try {
      const res = await fetch("/api/web/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password_lama: passwordLama,
          password_baru: passwordBaru,
        }),
      });

      if (!res.ok) {
        setShowError(true);
        return;
      }

      setShowSuccess(true);
    } catch (error) {
      console.error(error);
      setShowError(true);
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
          <h1 className="mb-6 text-5xl font-extrabold text-black">Profil Administrator</h1>

          <div className="mb-8 flex items-center gap-6">
            <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-300">
              {admin?.foto_profil && (
                <Image src={admin.foto_profil} alt="Foto profil" className="object-cover" fill />
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-black">
              {admin?.nama_admin ?? "..."}
            </h2>
          </div>

          <div className="max-w rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="mb-8">
              <label className="mb-2 block text-2xl font-bold text-black">Password Lama</label>
              <div className="relative">
                <input
                  type={showLama ? "text" : "password"}
                  placeholder="Masukan Password Lama mu"
                  value={passwordLama}
                  onChange={(e) => setPasswordLama(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-5 py-4 pr-12 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <button
                  type="button"
                  onClick={() => setShowLama((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showLama ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            <div className="mb-8">
              <label className="mb-2 block text-2xl font-bold text-black">Password Baru</label>
              <div className="relative">
                <input
                  type={showBaru ? "text" : "password"}
                  placeholder="Masukan Password Baru"
                  value={passwordBaru}
                  onChange={(e) => setPasswordBaru(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-5 py-4 pr-12 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <button
                  type="button"
                  onClick={() => setShowBaru((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showBaru ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            <div className="mb-2">
              <label className="mb-2 block text-2xl font-bold text-black">Konfirmasi Password</label>
              <div className="relative">
                <input
                  type={showKonfirmasi ? "text" : "password"}
                  placeholder="Masukan Kembali Password Baru"
                  value={konfirmasiPassword}
                  onChange={(e) => setKonfirmasiPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-5 py-4 pr-12 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <button
                  type="button"
                  onClick={() => setShowKonfirmasi((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showKonfirmasi ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
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
        </main>
      </div>
      <SuccessModal
        isOpen={showError}
        variant="error"
        title="Password Salah"
        description="Anda salah memasukan password lama atau konfirmasi password"
        buttonLabel="Coba Lagi"
        onClose={() => setShowError(false)}
      />
      <SuccessModal
        isOpen={showSuccess}
        variant="success"
        title="Password Berhasil Diganti"
        description="Anda telah berhasil mengganti password baru. Silahkan coba login kembali"
        buttonLabel="Kembali"
        onClose={() => {
          setShowSuccess(false);
          router.push("/dashboard/profile");
        }}
      />
    </div>
  );
}