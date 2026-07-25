"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import UserMenu from "@/components/UserMenu";
import Pagination from "@/components/Pagination";
import Image from "next/image";

type StokDarah = {
  id_stok: number;
  golongan_darah: string;
  jumlah_kantong: number;
  tanggal_update: string;
  lokasi: { nama_lokasi: string } | null;
};

const golonganList = ["Semua", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const statusList = ["Semua", "Aman", "Menipis", "Kritis"];

function getStatus(jumlah: number): "Aman" | "Menipis" | "Kritis" {
  if (jumlah < 50) return "Kritis";
  if (jumlah <= 150) return "Menipis";
  return "Aman";
}

const statusStyle: Record<string, string> = {
  Aman: "bg-green-500 text-white",
  Menipis: "bg-yellow-400 text-black",
  Kritis: "bg-red-600 text-white",
};

export default function StokDarahPage() {
  const router = useRouter();
  const [golongan, setGolongan] = useState("Semua");
  const [status, setStatus] = useState("Semua");
  const [showGolonganMenu, setShowGolonganMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [dataStok, setDataStok] = useState<StokDarah[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const golonganRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStok();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [golongan, status]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (golonganRef.current && !golonganRef.current.contains(event.target as Node)) {
        setShowGolonganMenu(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchStok = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stok-darah");
      const data = await res.json();
      setDataStok(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatTanggal = (tanggal: string) => {
    const bulanIndo = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    const d = new Date(tanggal);
    const jam = d.getHours().toString().padStart(2, "0");
    const menit = d.getMinutes().toString().padStart(2, "0");
    return `${d.getDate()} ${bulanIndo[d.getMonth()]} ${d.getFullYear()}, ${jam}:${menit}`;
  };

  const filtered = dataStok.filter((s) => {
    const matchGolongan = golongan === "Semua" || s.golongan_darah === golongan;
    const matchStatus = status === "Semua" || getStatus(s.jumlah_kantong) === status;
    return matchGolongan && matchStatus;
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
            <h1 className="text-5xl font-extrabold text-black">Stok Darah</h1>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative" ref={golonganRef}>
                <button
                  onClick={() => setShowGolonganMenu((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-black shadow-sm"
                >
                  {golongan === "Semua" ? "Golongan Darah" : golongan}
                  <ChevronDown size={16} className={`transition-transform ${showGolonganMenu ? "rotate-180" : ""}`} />
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

              <div className="relative" ref={statusRef}>
                <button
                  onClick={() => setShowStatusMenu((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-black shadow-sm"
                >
                  {status === "Semua" ? "Status" : status}
                  <ChevronDown size={16} className={`transition-transform ${showStatusMenu ? "rotate-180" : ""}`} />
                </button>
                {showStatusMenu && (
                  <div className="absolute right-0 z-10 mt-2 w-40 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                    {statusList.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setStatus(s);
                          setShowStatusMenu(false);
                        }}
                        className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                          status === s ? "bg-red-50 text-red-600" : "text-black hover:bg-gray-50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full min-w-[900px] table-fixed text-left">
              <colgroup>
                <col className="w-[70px]" />
                <col className="w-[150px]" />
                <col className="w-[180px]" />
                <col className="w-[130px]" />
                <col className="w-[120px]" />
                <col className="w-[180px]" />
                <col className="w-[150px]" />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-200 text-black">
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Golongan Darah</th>
                  <th className="px-6 py-4 font-semibold">Lokasi</th>
                  <th className="px-6 py-4 font-semibold">Jumlah Stok</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Terakhir Diperbarui</th>
                  <th className="px-6 py-4 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-6 text-center text-gray-400">
                      Memuat data...
                    </td>
                  </tr>
                )}

                {!loading && paginated.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-6 text-center text-gray-400">
                      Tidak ada data
                    </td>
                  </tr>
                )}

                {!loading &&
                  paginated.map((s) => {
                    const stat = getStatus(s.jumlah_kantong);
                    return (
                      <tr key={s.id_stok} className="border-b border-gray-100 text-black">
                        <td className="truncate px-6 py-4">{s.id_stok}</td>
                        <td className="truncate px-6 py-4">{s.golongan_darah}</td>
                        <td className="truncate px-6 py-4">{s.lokasi?.nama_lokasi ?? "-"}</td>
                        <td className="truncate px-6 py-4">{s.jumlah_kantong}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block rounded-full px-4 py-1 text-sm font-medium ${statusStyle[stat]}`}
                          >
                            {stat}
                          </span>
                        </td>
                        <td className="truncate px-6 py-4">{formatTanggal(s.tanggal_update)}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end">
                            <button
                              onClick={() => router.push(`/dashboard/stok-darah/${s.id_stok}/edit`)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-100"
                            >
                              <Image src="/button/edit.png" alt="edit data" width={20} height={20}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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