"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ConfirmModal from "@/components/ConfirmModal";
import AturanTipsForm, { AturanTipsFormData } from "@/components/AturanTipsForm";
import UserMenu from "@/components/UserMenu";

const emptyForm: AturanTipsFormData = {
  judul: "",
  kategori: "Aturan",
  status: "publish",
  isi: "",
};

export default function EditAturanTipsPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState<AturanTipsFormData>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/web/aturan-tips/${params.id}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          setError(errData?.message ?? "Gagal memuat data");
          return;
        }
        const data = await res.json();
        setForm({
          judul: data.judul ?? "",
          kategori: data.kategori === "Tips" ? "Tips" : "Aturan",
          status: data.status === "publish" ? "publish" : "draft",
          isi: data.isi ?? "",
        });
      } catch (error) {
        console.error(error);
        setError("Terjadi kesalahan jaringan saat memuat data");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [params.id]);

  const handleChange = (field: keyof AturanTipsFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowEditConfirm(true);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/web/aturan-tips/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? "Gagal menyimpan perubahan");
        setShowEditConfirm(false);
        return;
      }

      setShowEditConfirm(false);
      router.push("/dashboard/tips");
    } catch (error) {
      console.error(error);
      setError("Terjadi kesalahan saat menyimpan data");
      setShowEditConfirm(false);
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
          <h1 className="mb-8 text-5xl font-extrabold text-black">Edit Aturan &amp; Tips Baru</h1>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-gray-400">Memuat data...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <AturanTipsForm form={form} onChange={handleChange} />
              <div className="mt-8 flex gap-4">
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-8 py-3 font-semibold text-white shadow-sm hover:brightness-105"
                >
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/tips")}
                  className="rounded-xl bg-gray-400 px-8 py-3 font-semibold text-white shadow-sm hover:brightness-95"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </main>
      </div>

      <ConfirmModal
        isOpen={showEditConfirm}
        variant="edit"
        title="Konfirmasi Ubah"
        description="Apakah anda yakin ingin mengubah Aturan/Tips saat ini?"
        onConfirm={handleSave}
        onCancel={() => setShowEditConfirm(false)}
      />
    </div>
  );
}