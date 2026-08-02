"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import Sidebar from "@/components/Sidebar";
import ConfirmModal from "@/components/ConfirmModal";
import DatePickerFilter from "@/components/DatePickerFilter";
import UserMenu from "@/components/UserMenu";
import Pagination from "@/components/Pagination";
import Image from "next/image";

type Riwayat = {
  id_riwayat: number;
  nama_lengkap: string;
  nik: string;
  email: string;
  no_hp: string;
  golongan_darah: string;
  jenis_kelamin: string;
  umur: number;
  alamat_pendonor: string;
  tanggal_donor: string;
  lokasi_donor: string;
  alamat_lokasi: string | null;
  status_donor: string;
  darah_terkumpul: number | null;
  keterangan: string | null;
};

const statusLabel: Record<string, string> = {
  berhasil: "Berhasil",
  gagal: "Gagal",
  ditunda: "Ditunda",
};

const statusStyle: Record<string, string> = {
  berhasil: "bg-green-500 text-white",
  gagal: "bg-red-500 text-white",
  ditunda: "bg-amber-400 text-white",
};

export default function RiwayatDonorPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dataRiwayat, setDataRiwayat] = useState<Riwayat[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchRiwayat();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDate]);

  const fetchRiwayat = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/web/riwayat");
      const data = await res.json();
      setDataRiwayat(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/web/riwayat/${deleteTarget}`, { method: "DELETE" });
      setDataRiwayat((prev) => prev.filter((r) => r.id_riwayat !== deleteTarget));
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const isSameDate = (dateStr: string, target: Date) => {
    const d = new Date(dateStr);
    return (
      d.getDate() === target.getDate() &&
      d.getMonth() === target.getMonth() &&
      d.getFullYear() === target.getFullYear()
    );
  };

  const filtered = dataRiwayat.filter((r) => {
    const matchSearch =
      r.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());
    const matchTanggal = !selectedDate || isSameDate(r.tanggal_donor, selectedDate);
    return matchSearch && matchTanggal;
  });

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatTanggal = (tanggal: string) => {
    const d = new Date(tanggal);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  const handleExportExcel = () => {
    const exportData = filtered.map((r) => ({
      ID: r.id_riwayat,
      NIK: r.nik,
      "Nama Lengkap": r.nama_lengkap,
      Email: r.email,
      "No. HP": r.no_hp,
      "Golongan Darah": r.golongan_darah,
      "Jenis Kelamin": r.jenis_kelamin,
      Umur: r.umur,
      "Alamat Pendonor": r.alamat_pendonor,
      "Tanggal Pendonoran": formatTanggal(r.tanggal_donor),
      "Lokasi Donor": r.lokasi_donor,
      "Alamat Lokasi": r.alamat_lokasi ?? "-",
      "Status Donor": r.status_donor,
      "Darah Terkumpul (ml)": r.darah_terkumpul ?? "-",
      Keterangan: r.keterangan ?? "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Donor");
    XLSX.writeFile(workbook, "riwayat-donor.xlsx");
  };

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <div className="ml-72 flex min-h-screen flex-col">
        <header className="fixed top-0 left-72 right-0 z-50 flex h-20 items-center justify-end border-b-2 border-black bg-white px-10">
          <UserMenu />
        </header>

        <main className="flex-1 px-10 pt-28 pb-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-5xl font-extrabold text-black">Riwayat Donor</h1>

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
                onClick={handleExportExcel}
                className="flex items-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-black shadow-sm"
              >
                <Image src="/ekspor/excel.png" alt="edit data" width={15} height={15}/> Ekspor ke Excel
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full min-w-[1000px] table-fixed text-left">
              <colgroup>
                  <col className="w-[60px]" />
                  <col className="w-[160px]" />
                  <col className="w-[200px]" />
                  <col className="w-[100px]" />
                  <col className="w-[110px]" />
                  <col className="w-[70px]" />
                  <col className="w-[110px]" />
                  <col className="w-[130px]" />
                  <col className="w-[100px]" />
                  <col className="w-[90px]" />
                </colgroup>
              <thead>
                  <tr className="border-b border-gray-200 text-black">
                    <th className="px-6 py-4 font-semibold">ID</th>
                    <th className="px-6 py-4 font-semibold">Nama Lengkap</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Golongan darah</th>
                    <th className="px-6 py-4 font-semibold">Jenis Kelamin</th>
                    <th className="px-6 py-4 font-semibold">Umur</th>
                    <th className="px-6 py-4 font-semibold">Tanggal Pendonoran</th>
                    <th className="px-6 py-4 font-semibold">Lokasi Donor</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={10} className="px-6 py-6 text-center text-gray-400">
                      Memuat data...
                    </td>
                  </tr>
                )}
                
                {!loading && paginated.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-6 py-6 text-center text-gray-400">
                      Tidak ada data
                    </td>
                  </tr>
                )}

                {!loading &&
                  paginated.map((r) => (
                    <tr key={r.id_riwayat} className="border-b border-gray-100 text-black">
                      <td className="truncate px-6 py-4">{r.id_riwayat}</td>
                      <td className="truncate px-6 py-4">{r.nama_lengkap}</td>
                      <td className="truncate px-6 py-4">{r.email}</td>
                      <td className="truncate px-6 py-4">{r.golongan_darah}</td>
                      <td className="truncate px-6 py-4">{r.jenis_kelamin}</td>
                      <td className="truncate px-6 py-4">{r.umur}</td>
                      <td className="truncate px-6 py-4">{formatTanggal(r.tanggal_donor)}</td>
                      <td className="truncate px-6 py-4">{r.lokasi_donor}</td>
                      <td className="truncate px-6 py-4">
                          <span
                            className={`inline-block rounded-full px-4 py-1 text-xs font-semibold ${
                              statusStyle[r.status_donor] ?? "bg-gray-300 text-black"
                            }`}
                          >
                            {statusLabel[r.status_donor] ?? r.status_donor}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => router.push(`/dashboard/riwayat/${r.id_riwayat}`)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-100"
                          >
                            <Image src="/button/view.png" alt="detail data" width={20} height={20}/>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(r.id_riwayat)}
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
