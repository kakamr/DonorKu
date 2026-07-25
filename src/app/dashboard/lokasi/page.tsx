"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ConfirmModal from "@/components/ConfirmModal";
import UserMenu from "@/components/UserMenu";
import Image from "next/image";

type Lokasi = {
  id_lokasi: number;
  nama_lokasi: string;
  alamat: string;
  kota: string;
  no_hp: string | null;
  longitude: number | null;
  latitude: number | null;
};

export default function DaftarLokasiPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [dataLokasi, setDataLokasi] = useState<Lokasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchLokasi();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const fetchLokasi = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/lokasi");
      const data = await res.json();
      setDataLokasi(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/lokasi/${deleteTarget}`, { method: "DELETE" });
      setDataLokasi((prev) => prev.filter((l) => l.id_lokasi !== deleteTarget));
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredLokasi = dataLokasi.filter(
    (lokasi) =>
      lokasi.nama_lokasi.toLowerCase().includes(search.toLowerCase()) ||
      lokasi.kota.toLowerCase().includes(search.toLowerCase())
  );

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredLokasi.length / itemsPerPage));
  const paginatedLokasi = filteredLokasi.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <div className="ml-72 flex min-h-screen flex-col">
        <header className="fixed top-0 left-72 right-0 z-50 flex h-20 items-center justify-end border-b-2 border-black bg-white px-10">
          <UserMenu />
        </header>

        <main className="flex-1 px-10 pt-28 pb-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-5xl font-extrabold text-black">Daftar Lokasi</h1>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Image src="/button/search.png" alt="cari" width={18} height={18} className="absolute left-4 top-1/2 -translate-y-1/2"/>
                <input
                  type="text"
                  placeholder="Cari Disini"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-72 rounded-full border border-gray-200 py-3 pl-11 pr-10 text-black shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Image src="/button/close.png" alt="keluar" width={16} height={16}/>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => router.push("/dashboard/lokasi/tambah")}
                className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-medium text-white shadow-sm hover:brightness-105"
              >
                Tambah Lokasi <Image src="/button/plus.png" alt="keluar" width={16} height={16}/>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full min-w-[900px] table-fixed text-left">
              <colgroup>
                <col className="w-[70px]" />
                <col className="w-[180px]" />
                <col className="w-[220px]" />
                <col className="w-[110px]" />
                <col className="w-[130px]" />
                <col className="w-[120px]" />
                <col className="w-[120px]" />
                <col className="w-[150px]" />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-200 text-black">
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Lokasi Donor</th>
                  <th className="px-6 py-4 font-semibold">Alamat Lokasi</th>
                  <th className="px-6 py-4 font-semibold">Kota</th>
                  <th className="px-6 py-4 font-semibold">No Petugas</th>
                  <th className="px-6 py-4 font-semibold">Longitude</th>
                  <th className="px-6 py-4 font-semibold">Latitude</th>
                  <th className="px-6 py-4 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="px-6 py-6 text-center text-gray-400">
                      Memuat data...
                    </td>
                  </tr>
                )}

                {!loading && filteredLokasi.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-6 text-center text-gray-400">
                      Tidak ada data
                    </td>
                  </tr>
                )}

                {!loading &&
                  paginatedLokasi.map((lokasi) => (
                    <tr key={lokasi.id_lokasi} className="border-b border-gray-100 text-black">
                      <td className="px-6 py-4">{lokasi.id_lokasi}</td>
                      <td className="px-6 py-4">{lokasi.nama_lokasi}</td>
                      <td className="px-6 py-4">{lokasi.alamat}</td>
                      <td className="px-6 py-4">{lokasi.kota}</td>
                      <td className="px-6 py-4">{lokasi.no_hp}</td>
                      <td className="px-6 py-4">{lokasi.longitude}</td>
                      <td className="px-6 py-4">{lokasi.latitude}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => router.push(`/dashboard/lokasi/${lokasi.id_lokasi}`)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-100"
                          >
                            <Image src="/button/view.png" alt="detail data" width={20} height={20}/>
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push(`/dashboard/lokasi/${lokasi.id_lokasi}/edit`)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-100"
                          >
                            <Image src="/button/edit.png" alt="edit data" width={20} height={20}/>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(lokasi.id_lokasi)}
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

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${
                  currentPage === page
                    ? "bg-red-600 text-white"
                    : "border border-gray-200 text-black"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </main>
      </div>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        variant="delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}