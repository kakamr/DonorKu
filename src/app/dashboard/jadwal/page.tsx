"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ConfirmModal from "@/components/ConfirmModal";
import DatePickerFilter from "@/components/DatePickerFilter";
import UserMenu from "@/components/UserMenu";
import Pagination from "@/components/Pagination";
import Image from "next/image";

type Jadwal = {
  id_jadwal: number;
  jam_mulai: string;
  jam_selesai: string;
  kuota: number;
  lokasi: { nama_lokasi: string; alamat: string };
  tanggal_pelaksanaan: string | null;
  nama_penanggung_jawab: string | null;
};

export default function JadwalDonorPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dataJadwal, setDataJadwal] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchJadwal();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDate]);

  const fetchJadwal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/web/jadwal");
      const data = await res.json();
      setDataJadwal(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/web/jadwal/${deleteTarget}`, { method: "DELETE" });
      setDataJadwal((prev) => prev.filter((j) => j.id_jadwal !== deleteTarget));
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const formatJam = (jam: string) => {
    const d = new Date(jam);
    return `${d.getUTCHours().toString().padStart(2, "0")}.${d
      .getUTCMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const formatTanggalPelaksanaan = (tanggal: string | null) => {
    if (!tanggal) return "-";
    const d = new Date(tanggal);
    return `${d.getUTCDate().toString().padStart(2, "0")}/${(d.getUTCMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getUTCFullYear()}`;
  };

  const isSameTanggal = (tanggal: string | null, target: Date) => {
    if (!tanggal) return false;
    const d = new Date(tanggal);
    return (
      d.getUTCDate() === target.getDate() &&
      d.getUTCMonth() === target.getMonth() &&
      d.getUTCFullYear() === target.getFullYear()
    );
  };

  const filtered = dataJadwal.filter((j) => {
    const matchSearch =
      j.lokasi.nama_lokasi.toLowerCase().includes(search.toLowerCase()) ||
      j.lokasi.alamat.toLowerCase().includes(search.toLowerCase());
    const matchTanggal = !selectedDate || isSameTanggal(j.tanggal_pelaksanaan, selectedDate);
    return matchSearch && matchTanggal;
  });

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice(
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
            <h1 className="text-5xl font-extrabold text-black">Jadwal Donor</h1>

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

              <DatePickerFilter value={selectedDate} onChange={setSelectedDate} />

              <button
                type="button"
                onClick={() => router.push("/dashboard/jadwal/tambah")}
                className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-medium text-white shadow-sm hover:brightness-105"
              >
                Tambah Rencana <Image src="/button/plus.png" alt="keluar" width={16} height={16}/>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full min-w-[1100px] table-fixed text-left">
              <colgroup>
                <col className="w-[60px]" />
                <col className="w-[110px]" />
                <col className="w-[130px]" />
                <col className="w-[100px]" />
                <col className="w-[100px]" />
                <col className="w-[140px]" />
                <col className="w-[220px]" />
                <col className="w-[140px]" />
                <col className="w-[170px]" />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-200 text-black">
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Tanggal</th>
                  <th className="px-6 py-4 font-semibold">Total Pendonor (Online)</th>
                  <th className="px-6 py-4 font-semibold">Waktu Mulai</th>
                  <th className="px-6 py-4 font-semibold">Waktu Selesai</th>
                  <th className="px-6 py-4 font-semibold">Lokasi Donor</th>
                  <th className="px-6 py-4 font-semibold">Alamat Lokasi</th>
                  <th className="px-6 py-4 font-semibold">Penyelenggara</th>
                  <th className="px-6 py-4 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={9} className="px-6 py-6 text-center text-gray-400">
                      Memuat data...
                    </td>
                  </tr>
                )}

                {!loading && paginated.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-6 text-center text-gray-400">
                      Tidak ada data
                    </td>
                  </tr>
                )}

                {!loading &&
                  paginated.map((j) => (
                    <tr key={j.id_jadwal} className="border-b border-gray-100 text-black">
                      <td className="truncate px-6 py-4">{j.id_jadwal}</td>
                      <td className="truncate px-6 py-4">{formatTanggalPelaksanaan(j.tanggal_pelaksanaan)}</td>
                      <td className="truncate px-6 py-4">{j.kuota}</td>
                      <td className="truncate px-6 py-4">{formatJam(j.jam_mulai)}</td>
                      <td className="truncate px-6 py-4">{formatJam(j.jam_selesai)}</td>
                      <td className="truncate px-6 py-4">{j.lokasi.nama_lokasi}</td>
                      <td className="truncate px-6 py-4">{j.lokasi.alamat}</td>
                      <td className="truncate px-6 py-4">{j.nama_penanggung_jawab ?? "-"}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/jadwal/${j.id_jadwal}`)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-100"
                          >
                            <Image src="/button/view.png" alt="detail data" width={20} height={20}/>
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/jadwal/${j.id_jadwal}/edit`)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-100"
                          >
                            <Image src="/button/edit.png" alt="edit data" width={20} height={20} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(j.id_jadwal)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600"
                          >
                            <Image src="/button/delete.png" alt="hapus data" width={20} height={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
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
