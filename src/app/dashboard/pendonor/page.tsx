"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import DatePickerFilter from "@/components/DatePickerFilter";
import UserMenu from "@/components/UserMenu";
import Pagination from "@/components/Pagination";
import Image from "next/image";

type Pendonor = {
  id_pendonor: number;
  nama_lengkap: string;
  email: string;
  golongan_darah: string;
  jenis_kelamin: string;
  umur: number;
  tanggal_donor: string | null;
  lokasi_donor: string;
  status_pendaftaran: "menunggu" | "diterima" | "ditolak" | "dibatalkan" | null;
};

const golonganList = ["Semua", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const statusLabel: Record<string, string> = {
  menunggu: "Menunggu",
  diterima: "Diterima",
  ditolak: "Ditolak",
  dibatalkan: "Dibatalkan",
};

const statusColor: Record<string, string> = {
  menunggu: "text-yellow-600",
  diterima: "text-green-600",
  ditolak: "text-red-600",
  dibatalkan: "text-gray-400",
};

export default function DaftarPendonorPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [golongan, setGolongan] = useState("Semua");
  const [showGolonganMenu, setShowGolonganMenu] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dataPendonor, setDataPendonor] = useState<Pendonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const golonganRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPendonor();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, golongan, selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (golonganRef.current && !golonganRef.current.contains(event.target as Node)) {
        setShowGolonganMenu(false);
      }
    };
    if (showGolonganMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showGolonganMenu]);

  const fetchPendonor = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/web/pendonor");
      const data = await res.json();
      setDataPendonor(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isSameDate = (dateStr: string | null, target: Date) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return (
      d.getDate() === target.getDate() &&
      d.getMonth() === target.getMonth() &&
      d.getFullYear() === target.getFullYear()
    );
  };

  const filtered = dataPendonor.filter((p) => {
    const matchSearch =
      p.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase());
    const matchGolongan = golongan === "Semua" || p.golongan_darah === golongan;
    const matchTanggal = !selectedDate || isSameDate(p.tanggal_donor, selectedDate);
    return matchSearch && matchGolongan && matchTanggal;
  });

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatTanggal = (tanggal: string | null) => {
    if (!tanggal) return "-";
    const d = new Date(tanggal);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
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
            <h1 className="text-5xl font-extrabold text-black">Daftar Pendonor</h1>

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

              <div className="relative" ref={golonganRef}>
                <button
                  onClick={() => setShowGolonganMenu((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-black shadow-sm"
                >
                  {golongan === "Semua" ? "Golongan Darah" : golongan}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${showGolonganMenu ? "rotate-180" : ""}`}
                  />
                </button>
                {showGolonganMenu && (
                  <div className="absolute right-0 z-10 mt-2 w-40 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                    {golonganList.map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          setGolongan(g);
                          setShowGolonganMenu(false);
                        }}
                        className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                          golongan === g ? "bg-red-50 text-red-600" : "text-black hover:bg-gray-50"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full min-w-[1100px] table-fixed text-left">
              <colgroup>
                <col className="w-[60px]" />
                <col className="w-[160px]" />
                <col className="w-[200px]" />
                <col className="w-[100px]" />
                <col className="w-[120px]" />
                <col className="w-[70px]" />
                <col className="w-[140px]" />
                <col className="w-[130px]" />
                <col className="w-[110px]" />
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
                  paginated.map((p) => (
                    <tr key={p.id_pendonor} className="border-b border-gray-100 text-black">
                      <td className="truncate px-6 py-4">{p.id_pendonor}</td>
                      <td className="truncate px-6 py-4">{p.nama_lengkap}</td>
                      <td className="truncate px-6 py-4">{p.email}</td>
                      <td className="truncate px-6 py-4">{p.golongan_darah}</td>
                      <td className="truncate px-6 py-4">{p.jenis_kelamin}</td>
                      <td className="truncate px-6 py-4">{p.umur}</td>
                      <td className="truncate px-6 py-4">{formatTanggal(p.tanggal_donor)}</td>
                      <td className="truncate px-6 py-4">{p.lokasi_donor}</td>
                      <td className="truncate px-6 py-4">
                        <span className={`font-semibold ${statusColor[p.status_pendaftaran ?? ""] ?? "text-black"}`}>
                          {statusLabel[p.status_pendaftaran ?? ""] ?? "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => router.push(`/dashboard/pendonor/${p.id_pendonor}`)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-100"
                          >
                            <Image src="/button/view.png" alt="detail data" width={20} height={20}/>
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
    </div>
  );
}