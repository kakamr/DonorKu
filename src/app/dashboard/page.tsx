"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import UserMenu from "@/components/UserMenu";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Image from "next/image";

type StatistikItem = { bulan: string; donor: number };
type StokDarahItem = {
  golongan: string;
  jumlah: number;
  status: string;
  kritis: boolean;
};
type DonorHariIniItem = { nama: string; alamat: string; jam: string };
type UsiaPendonorItem = { label: string; value: number; color: string };

type DashboardData = {
  statistikData: StatistikItem[];
  stokDarah: StokDarahItem[];
  donorHariIni: DonorHariIniItem[];
  totalPendonorHariIni: number;
  totalPendonorBulanIni: number;
  usiaPendonor: UsiaPendonorItem[];
};

// Mapping gambar tipe darah, karena API tidak menyimpan path gambar
const golonganImages: Record<string, { black: string; white: string }> = {
  "A+": { black: "/tipe-darah/blood_a+.png", white: "/tipe-darah/blood_a+_wh.png" },
  "A-": { black: "/tipe-darah/blood_a-.png", white: "/tipe-darah/blood_a-_wh.png" },
  "B+": { black: "/tipe-darah/blood_b+.png", white: "/tipe-darah/blood_b+_wh.png" },
  "B-": { black: "/tipe-darah/blood_b-.png", white: "/tipe-darah/blood_b-_wh.png" },
  "AB+": { black: "/tipe-darah/blood_ab+.png", white: "/tipe-darah/blood_ab+_wh.png" },
  "AB-": { black: "/tipe-darah/blood_ab-.png", white: "/tipe-darah/blood_ab-_wh.png" },
  "O+": { black: "/tipe-darah/blood_o+.png", white: "/tipe-darah/blood_o+_wh.png" },
  "O-": { black: "/tipe-darah/blood_o-.png", white: "/tipe-darah/blood_o-_wh.png" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNama, setAdminNama] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    fetchAdminNama();
  }, []);

  const fetchAdminNama = async () => {
    try {
      const res = await fetch("/api/admin/me");
      if (!res.ok) return;
      const data = await res.json();
      setAdminNama(data.nama_admin ?? "");
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      const result = await res.json();
      setData(result);
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
        {/* Header */}
        <header className="fixed top-0 left-72 right-0 z-50 flex h-20 items-center justify-end border-b-2 border-black bg-white px-10">
          <UserMenu />
        </header>

        <main className="flex-1 px-10 pt-28 pb-8">
          <h1 className="mb-2 text-5xl font-extrabold text-black">Beranda</h1>
          <p className="mb-6 text-xl text-black">Welcome, {adminNama}</p>

          {loading && <p className="text-gray-400">Memuat data...</p>}

          {!loading && data && (
            <>
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
                {/* Statistik chart */}
                <div className="rounded-2xl border border-gray-200 p-6 shadow-sm xl:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg text-black">Statistik</h2>
                    <span className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="h-2 w-2 rounded-full bg-red-500" /> Donor
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={data.statistikData}>
                      <CartesianGrid stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="bulan" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                      />
                      <Tooltip />
                      <Line type="monotone" dataKey="donor" stroke="#EF4444" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Total stok darah */}
                <div className="rounded-2xl border border-gray-200 p-6 shadow-sm xl:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg text-black">Total Stok Darah Dari Semua Cabang</h2>
                    <button
                      className="flex items-center gap-1 rounded-full bg-red-600 px-4 py-2 text-sm text-white"
                      onClick={() => router.push("/dashboard/stok-darah")}
                    >
                      Lihat Semua 
                      <Image src="/button/seeall.png" alt="lihat semua" width={12} height={12}/>
                    </button>
                  </div>
                  <div className="max-h-[270px] overflow-y-auto pr-1">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-3">
                      {data.stokDarah.map((stok) => {
                        const img = golonganImages[stok.golongan];
                        const isKritis = stok.status === "Stok Kritis";
                        const isMenipis = stok.status === "Stok Menipis";

                        return (
                          <div
                            key={stok.golongan}
                            className={`rounded-xl border p-4 ${
                              isKritis
                                ? "border-red-600 bg-red-600 text-white"
                                : isMenipis
                                ? "text-white"
                                : "border-gray-200 text-black"
                            }`}
                            style={isMenipis ? { backgroundColor: "#E94545", borderColor: "#E94545" } : undefined}
                          >
                            <div className="flex items-center gap-4">
                              {img && (
                                <Image
                                  src={isKritis || isMenipis ? img.white : img.black}
                                  alt={stok.golongan}
                                  width={50}
                                  height={50}
                                  className="shrink-0 object-contain"
                                />
                              )}

                              <div className="flex-1">
                                <p className="text-2xl font-bold">
                                  {stok.jumlah}{" "}
                                  <span className="text-xs font-normal">kantong</span>
                                </p>

                                <div className="mt-2 flex items-center gap-1 text-xs">
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      isKritis || isMenipis ? "bg-white" : "bg-black"
                                    }`}
                                  />
                                  {stok.status}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-4">
                {/* Donor hari ini */}
                <div className="rounded-2xl border border-gray-200 p-6 shadow-sm xl:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg text-black">Donor Hari Ini</h2>
                    <button
                      className="flex items-center gap-1 rounded-full bg-red-600 px-4 py-2 text-sm text-white"
                      onClick={() => router.push("/dashboard/jadwal")}
                    >
                      Lihat Semua 
                      <Image src="/button/seeall.png" alt="lihat semua" width={12} height={12}/>
                    </button>
                  </div>
                  {data.donorHariIni.length === 0 ? (
                    <p className="text-gray-400">Tidak ada jadwal donor hari ini</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {data.donorHariIni.map((donor, idx) => (
                        <div
                          key={idx}
                          className="flex items-stretch justify-between rounded-xl border border-gray-200 p-4"
                        >
                          <div>
                            <p className="text-lg font-semibold text-black">{donor.nama}</p>
                            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                              <LocationDot /> {donor.alamat}
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                              <ClockDot /> {donor.jam}
                            </p>
                          </div>
                          <div className="ml-4 w-13 rounded-r-xl bg-red-600" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total pendonor */}
                <div className="flex h-full flex-col gap-6">
                  <div
                    className="flex flex-1 flex-col rounded-2xl border border-gray-200 p-6 pt-7 shadow-sm"
                    onClick={() => router.push("/dashboard/pendonor")}
                  >
                    <p className="mb-2 text-black">Total Pendonor Hari ini</p>
                    <p className="text-7xl font-extrabold text-red-600">{data.totalPendonorHariIni}</p>
                    <p className="text-black">Orang</p>
                  </div>

                  <div
                    className="flex flex-1 flex-col rounded-2xl border border-gray-200 p-6 pt-7 shadow-sm"
                    onClick={() => router.push("/dashboard/pendonor")}
                  >
                    <p className="mb-2 text-black">Total Pendonor 1 Bulan Terakhir</p>
                    <p className="text-7xl font-extrabold text-red-600">{data.totalPendonorBulanIni}</p>
                    <p className="text-black">Orang</p>
                  </div>
                </div>

                {/* Usia pendonor */}
                <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="mb-4 text-lg text-black">Usia Pendonor</h2>
                  <div className="flex flex-col items-center gap-6">
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie
                          data={data.usiaPendonor}
                          dataKey="value"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={2}
                        >
                          {data.usiaPendonor.map((entry) => (
                            <Cell key={entry.label} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-2 self-start">
                      {data.usiaPendonor.map((item) => (
                        <div key={item.label} className="flex items-center gap-2 text-sm text-black">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.label} ({item.value})
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function LocationDot() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ClockDot() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}