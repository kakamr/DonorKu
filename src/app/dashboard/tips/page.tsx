"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ConfirmModal from "@/components/ConfirmModal";
import SuccessModal from "@/components/SuccessModal";
import UserMenu from "@/components/UserMenu";
import Image from "next/image";

type AturanTips = {
  id_tips: number;
  judul: string;
  kategori: string;
  status: string;
  tanggal_dibuat: string;
  tanggal_diubah: string | null;
};

export default function AturanTipsPage() {
  const router = useRouter();
  const [dataTips, setDataTips] = useState<AturanTips[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/aturan-tips");
      const data = await res.json();
      setDataTips(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/aturan-tips/${deleteTarget}`, { method: "DELETE" });
      setDataTips((prev) => prev.filter((t) => t.id_tips !== deleteTarget));
      setDeleteTarget(null);
      setShowSuccess(true);
    } catch (error) {
      console.error(error);
    }
  };

  const formatTanggal = (tanggal: string | null) => {
    if (!tanggal) return "-";
    const d = new Date(tanggal);
    return `${d.getFullYear()} - ${(d.getMonth() + 1).toString().padStart(2, "0")} - ${d
      .getDate()
      .toString()
      .padStart(2, "0")}`;
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
            <h1 className="text-5xl font-extrabold text-black">Aturan & Tips</h1>
            <button
              type="button"
              onClick={() => router.push("/dashboard/tips/tambah")}
              className="rounded-full bg-red-600 px-6 py-3 font-medium text-white shadow-sm hover:brightness-105"
            >
              Tambah Aturan / Tips Baru
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full min-w-[900px] table-fixed text-left">
              <colgroup>
                <col className="w-[320px]" />
                <col className="w-[130px]" />
                <col className="w-[110px]" />
                <col className="w-[140px]" />
                <col className="w-[140px]" />
                <col className="w-[150px]" />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-200 text-black">
                  <th className="px-6 py-4 font-semibold">Judul</th>
                  <th className="px-6 py-4 font-semibold">Kategori</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Tgl Dibuat</th>
                  <th className="px-6 py-4 font-semibold">Tgl Modifikasi</th>
                  <th className="px-6 py-4 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-6 text-center text-gray-400">
                      Memuat data...
                    </td>
                  </tr>
                )}

                {!loading && dataTips.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-6 text-center text-gray-400">
                      Tidak ada data
                    </td>
                  </tr>
                )}

                {!loading &&
                  dataTips.map((t) => (
                    <tr key={t.id_tips} className="border-b border-gray-100 text-black">
                      <td className="px-6 py-4">{t.judul}</td>
                      <td className="px-6 py-4">{t.kategori}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-4 py-1 text-sm font-medium ${
                            t.status === "publish"
                              ? "bg-green-500 text-white"
                              : "bg-gray-300 text-black"
                          }`}
                        >
                          {t.status === "publish" ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-6 py-4">{formatTanggal(t.tanggal_dibuat)}</td>
                      <td className="px-6 py-4">{formatTanggal(t.tanggal_diubah)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/tips/${t.id_tips}/edit`)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-100"
                          >
                            <Image src="/button/edit.png" alt="edit data" width={20} height={20}/>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(t.id_tips)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600"
                          >
                            <Image src="/button/delete.png" alt="hapus data" width={20} height={20}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        variant="delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <SuccessModal
        isOpen={showSuccess}
        title="Aturan/Tips Berhasil Dihapus"
        description="Data aturan/tips telah berhasil dihapus dari sistem."
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
}
