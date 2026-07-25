"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import UserMenu from "@/components/UserMenu";
import Image from "next/image";

type AdminProfile = {
  nama_admin: string;
  email: string;
  no_hp: string | null;
  alamat: string | null;
  foto_profil: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmin();
  }, []);

  const fetchAdmin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/me");
      if (!res.ok) return;
      const data = await res.json();
      setAdmin(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
          <h1 className="mb-8 text-5xl font-extrabold text-black">Profile Administrator</h1>

          {loading && <p className="text-gray-400">Memuat data...</p>}

          {!loading && admin && (
            <>
              <div className="mb-8 flex items-center gap-6">
                <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-300">
                  <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-300">
                    {admin.foto_profil ? (
                      <Image src={admin.foto_profil} alt="Foto profil" className="object-cover" fill />
                    ) : null}
                  </div>
                </div>
                <h2 className="text-2xl font-extrabold text-black">{admin.nama_admin}</h2>
              </div>

              <div className="max-w rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="mb-6">
                  <p className="mb-1 text-xl font-bold text-black">Nama Lengkap</p>
                  <p className="text-lg text-black">{admin.nama_admin}</p>
                </div>
                <div className="mb-6">
                  <p className="mb-1 text-xl font-bold text-black">Email</p>
                  <p className="text-lg text-black underline">{admin.email}</p>
                </div>
                <div className="mb-6">
                  <p className="mb-1 text-xl font-bold text-black">No. Telepon</p>
                  <p className="text-lg text-black">{admin.no_hp ?? "-"}</p>
                </div>
                <div className="mb-8">
                  <p className="mb-1 text-xl font-bold text-black">Alamat</p>
                  <p className="text-lg text-black">{admin.alamat ?? "-"}</p>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/profile/edit-password")}
                    className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white shadow-sm hover:brightness-105"
                  >
                    Edit Password
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/profile/edit")}
                    className="rounded-xl border border-red-600 px-6 py-3 font-semibold text-red-600 hover:bg-red-50"
                  >
                    Edit Profil
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}