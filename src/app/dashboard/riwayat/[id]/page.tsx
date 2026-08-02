"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import UserMenu from "@/components/UserMenu";
import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";

type RiwayatDetail = {
  id_riwayat: number;
  tanggal_donor: string;
  lokasi_donor: string;
  alamat_lokasi: string | null;
  keterangan: string | null;
  darah_terkumpul: number | null;
  status_donor: "berhasil" | "gagal" | "ditunda";
  pendonor: {
    nama_lengkap: string;
    email: string;
    golongan_darah: string;
    jenis_kelamin: string;
    tanggal_lahir: string;
    alamat: string;
    foto_profil: string | null;
  };
};

const statusLabel: Record<string, string> = {
  berhasil: "Berhasil",
  gagal: "Gagal",
  ditunda: "Ditunda",
};

const statusColor: Record<string, string> = {
  berhasil: "text-green-600",
  gagal: "text-red-600",
  ditunda: "text-yellow-600",
};

export default function DetailRiwayatPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<RiwayatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDarahModal, setShowDarahModal] = useState(false);
  const [darahInput, setDarahInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDetail();
  }, [params.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
      }
    };
    if (showStatusMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showStatusMenu]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/web/riwayat/${params.id}`);
      if (!res.ok) {
        setData(null);
        return;
      }
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDarahModal = () => {
    setDarahInput(data?.darah_terkumpul?.toString() ?? "");
    setShowDarahModal(true);
  };

  const handleSimpanDarah = async () => {
    if (darahInput === "" || isNaN(Number(darahInput))) {
      alert("Masukkan jumlah darah terkumpul yang valid");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/web/riwayat/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ darah_terkumpul: Number(darahInput) }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message ?? "Gagal menyimpan data");
        return;
      }
      setShowDarahModal(false);
      await fetchDetail();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleUbahStatus = async (status: "berhasil" | "gagal" | "ditunda") => {
    setShowStatusMenu(false);
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/web/riwayat/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_donor: status }),
      });
      if (res.ok) {
        await fetchDetail();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const hitungUmur = (tanggalLahir: string) => {
    const today = new Date();
    const lahir = new Date(tanggalLahir);
    let umur = today.getFullYear() - lahir.getFullYear();
    const belumUlangTahun =
      today.getMonth() < lahir.getMonth() ||
      (today.getMonth() === lahir.getMonth() && today.getDate() < lahir.getDate());
    if (belumUlangTahun) umur--;
    return umur;
  };

  const formatTanggalLahir = (tanggal: string) => {
    const bulanIndo = [
      "januari", "februari", "maret", "april", "mei", "juni",
      "juli", "agustus", "september", "oktober", "november", "desember",
    ];
    const d = new Date(tanggal);
    return `${d.getDate()} ${bulanIndo[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatTanggalDonor = (tanggal: string) => {
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
          <div />
          <UserMenu />
        </header>

        <main className="flex-1 px-10 pt-28 pb-8">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-5xl font-extrabold text-black">Riwayat Donor</h1>
              <p className="mt-2 text-3xl font-extrabold text-black">ID {params.id}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard/riwayat")}
                className="flex items-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-black shadow-sm"
              >
                <Image src="/button/back.png" alt="kembali" className="rounded" width={20} height={20}/> Kembali
              </button>

              {data && (
                <div className="relative" ref={statusRef}>
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => setShowStatusMenu((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 font-semibold text-white shadow-sm disabled:opacity-60"
                  >
                    Ubah Status
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${showStatusMenu ? "rotate-180" : ""}`}
                    />
                  </button>
                  {showStatusMenu && (
                    <div className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-2xl bg-red-600 shadow-lg">
                      <button
                        onClick={() => handleUbahStatus("berhasil")}
                        className="block w-full px-4 py-3 text-center font-medium text-white hover:bg-red-700"
                      >
                        Berhasil
                      </button>
                      <button
                        onClick={() => handleUbahStatus("gagal")}
                        className="block w-full px-4 py-3 text-center font-medium text-white hover:bg-red-700"
                      >
                        Gagal
                      </button>
                      <button
                        onClick={() => handleUbahStatus("ditunda")}
                        className="block w-full px-4 py-3 text-center font-medium text-white hover:bg-red-700"
                      >
                        Ditunda
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {loading && <p className="text-gray-400">Memuat data...</p>}
          {!loading && !data && <p className="text-gray-400">Data tidak ditemukan</p>}

          {!loading && data && (
            <>
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="relative h-75 w-75 flex-shrink-0 overflow-hidden rounded-xl bg-gray-300">
                  {data.pendonor.foto_profil ? (
                    <Image
                      src={data.pendonor.foto_profil}
                      alt={data.pendonor.nama_lengkap}
                      className="object-cover"
                      fill
                    />
                  ) : null}
                </div>

                <div className="flex-1">
                  <h2 className="mb-4 text-xl font-bold text-black">Detail Pendonor</h2>
                  <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-3">
                    <div>
                      <p className="text-black">Nama</p>
                      <p className="text-lg font-semibold text-black">{data.pendonor.nama_lengkap}</p>
                    </div>
                    <div>
                      <p className="text-black">Email</p>
                      <p className="text-lg font-semibold text-black">{data.pendonor.email}</p>
                    </div>
                    <div>
                      <p className="text-black">Golongan Darah</p>
                      <p className="text-lg font-semibold text-black">{data.pendonor.golongan_darah}</p>
                    </div>

                    <div>
                      <p className="text-black">Jenis Kelamin</p>
                      <p className="text-lg font-semibold text-black">
                        {data.pendonor.jenis_kelamin === "Laki-laki"
                          ? "Laki - Laki"
                          : data.pendonor.jenis_kelamin}
                      </p>
                    </div>
                    <div>
                      <p className="text-black">Tanggal Lahir</p>
                      <p className="text-lg font-semibold text-black">
                        {formatTanggalLahir(data.pendonor.tanggal_lahir)}
                      </p>
                    </div>
                    <div>
                      <p className="text-black">Umur</p>
                      <p className="text-lg font-semibold text-black">
                        {hitungUmur(data.pendonor.tanggal_lahir)}
                      </p>
                    </div>

                    <div className="sm:col-span-3">
                      <p className="text-black">Alamat</p>
                      <p className="text-lg font-semibold text-black">{data.pendonor.alamat}</p>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="my-8 border-gray-300" />

              <h2 className="mb-4 text-xl font-bold text-black">Detail Donor</h2>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-4">
                <div>
                  <p className="text-black">Tanggal Pendonoran</p>
                  <p className="text-lg font-semibold text-black">
                    {formatTanggalDonor(data.tanggal_donor)}
                  </p>
                </div>
                <div>
                  <p className="text-black">Lokasi</p>
                  <p className="text-lg font-semibold text-black">{data.lokasi_donor}</p>
                </div>
                <div>
                  <p className="text-black">Status</p>
                  <p className={`text-lg font-semibold ${statusColor[data.status_donor]}`}>
                    {statusLabel[data.status_donor]}
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleOpenDarahModal}
                    className="flex items-center gap-2 text-black hover:text-red-600"
                  >
                    Darah Terkumpul <ArrowRight size={16} />
                  </button>
                  <p className="text-lg font-semibold text-black">
                    {data.darah_terkumpul ? `${data.darah_terkumpul}ml` : "-"}
                  </p>
                </div>
                <div className="sm:col-span-1">
                  <p className="text-black">Alamat Lokasi</p>
                  <p className="text-lg font-semibold text-black">{data.alamat_lokasi ?? "-"}</p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {showDarahModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-2xl font-extrabold text-black">Darah Terkumpul</h2>

            <div className="mb-6 flex items-center overflow-hidden rounded-xl border border-gray-200">
              <input
                type="number"
                value={darahInput}
                onChange={(e) => setDarahInput(e.target.value)}
                autoFocus
                className="flex-1 px-5 py-3 text-black focus:outline-none"
              />
              <span className="pr-5 font-semibold text-black">ml</span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSimpanDarah}
                disabled={saving}
                className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white shadow-sm hover:brightness-105 disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                type="button"
                onClick={() => setShowDarahModal(false)}
                disabled={saving}
                className="flex-1 rounded-xl border border-gray-200 py-3 font-semibold text-black hover:bg-gray-50 disabled:opacity-60"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}