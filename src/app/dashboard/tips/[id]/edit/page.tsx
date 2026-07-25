"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
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

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      console.log("Fetching ID:", params.id);
      try {
        const res = await fetch(`/api/aturan-tips/${params.id}`);
        console.log("Response status:", res.status);

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          console.error("GET gagal:", res.status, errData);
          alert(`Gagal memuat data (${res.status}): ${errData?.message ?? "tidak diketahui"}`);
          return;
        }

        const data = await res.json();
        console.log("Data diterima:", data); 

        setForm({
          judul: data.judul ?? "",
          kategori: data.kategori === "Tips" ? "Tips" : "Aturan",
          status: data.status === "publish" ? "publish" : "draft",
          isi: data.isi ?? "",
        });
      } catch (error) {
        console.error("Error fetchDetail:", error);
        alert("Terjadi kesalahan jaringan saat memuat data");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [params.id]);

  

  const handleChange = (field: keyof AturanTipsFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/aturan-tips/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message ?? "Gagal menyimpan perubahan");
        return;
      }

      router.push("/dashboard/tips");
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
          <h1 className="mb-8 text-5xl font-extrabold text-black">Edit Aturan &amp; Tips Baru</h1>

          {loading ? (
            <p className="text-gray-400">Memuat data...</p>
          ) : (
            <>
              <AturanTipsForm form={form} onChange={handleChange} />

              <div className="mt-8 flex gap-4">
                <button
                  type="button"
                  onClick={handleSave}
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}
