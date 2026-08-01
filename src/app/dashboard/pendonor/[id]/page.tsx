"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import UserMenu from "@/components/UserMenu";
import Image from "next/image";
import { ChevronDown, X } from "lucide-react";

type Kuesioner = {
  demam_flu_batuk: boolean;
  sehat_hari_ini: boolean;
  pernah_dirawat: boolean;
  sudah_makan: boolean;
  konsumsi_alkohol: boolean;
  konsumsi_obat: boolean;
  pernah_pingsan_donor: boolean;
  riwayat_jantung_diabetes: boolean;
  riwayat_hepatitis_hiv: boolean;
  hamil_menyusui: boolean;
  baru_operasi: boolean;
  baru_vaksin: boolean;
  bersedia_sukarela: boolean;
};

type PendonorDetail = {
  id_pendonor: number;
  nama_lengkap: string;
  email: string;
  golongan_darah: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  alamat: string;
  foto_profil: string | null;
  status_pendaftaran: "menunggu" | "diterima" | "ditolak" | "dibatalkan" | null;
  nomor_antrian: number | null;
  tanggal_donor: string | null;
  lokasi_donor: string;
  alamat_lokasi: string | null;
  kuesioner: Kuesioner | null;
};

const statusLabel: Record<string, string> = {
  menunggu: "Diproses",
  diterima: "Diterima",
  ditolak: "Ditolak",
  dibatalkan: "Dibatalkan",
};

const kuesionerPertanyaan: { key: keyof Kuesioner; label: string }[] = [
  { key: "demam_flu_batuk", label: "Apakah Anda sedang demam, flu, batuk, atau sakit?" },
  { key: "sehat_hari_ini", label: "Apakah Anda merasa sehat hari ini?" },
  { key: "pernah_dirawat", label: "Apakah pernah dirawat di rumah sakit" },
  { key: "sudah_makan", label: "Apakah Anda sudah makan dalam 3–4 jam terakhir?" },
  { key: "konsumsi_alkohol", label: "Apakah Anda mengonsumsi alkohol dalam 24 jam terakhir?" },
  { key: "konsumsi_obat", label: "Apakah Anda sedang mengonsumsi obat-obatan tertentu?" },
  { key: "pernah_pingsan_donor", label: "Apakah Anda pernah pingsan atau pusing saat donor darah sebelumnya?" },
  { key: "riwayat_jantung_diabetes", label: "Apakah Anda memiliki riwayat penyakit jantung, tekanan darah, atau diabetes?" },
  { key: "riwayat_hepatitis_hiv", label: "Apakah Anda pernah didiagnosis hepatitis, HIV/AIDS, atau penyakit menular darah?" },
  { key: "hamil_menyusui", label: "Apakah Anda sedang hamil atau menyusui? (untuk wanita)" },
  { key: "baru_operasi", label: "Apakah Anda baru menjalani operasi, atau tindakan medis dalam 6 bulan terakhir?" },
  { key: "baru_vaksin", label: "Apakah Anda baru menerima vaksinasi dalam 1 bulan terakhir?" },
  { key: "bersedia_sukarela", label: "Apakah Anda bersedia mendonorkan darah secara sukarela tanpa paksaan?" },
];

export default function DetailPendonorPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<PendonorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showKuesioner, setShowKuesioner] = useState(false);
  const [updating, setUpdating] = useState(false);
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
      const res = await fetch(`/api/web/pendonor/${params.id}`);
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

  const handleUbahStatus = async (status: "diterima" | "ditolak") => {
    setShowStatusMenu(false);
    setUpdating(true);
    try {
      const res = await fetch(`/api/web/pendonor/${params.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchDetail();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
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

  const formatTanggalDonor = (tanggal: string | null) => {
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
          <div />
          <UserMenu />
        </header>

        <main className="flex-1 px-10 pt-28 pb-8">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-5xl font-extrabold text-black">Daftar Pendonor</h1>
              <p className="mt-2 text-3xl font-extrabold text-black">ID {params.id}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard/pendonor")}
                className="flex items-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-black shadow-sm"
              >
                <Image src="/button/back.png" alt="kembali" className="rounded" width={20} height={20}/> Kembali
              </button>

              {data && (
                <div className="relative" ref={statusRef}>
                  <button
                    type="button"
                    disabled={updating}
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
                        onClick={() => handleUbahStatus("diterima")}
                        className="block w-full px-4 py-3 text-center font-medium text-white hover:bg-red-700"
                      >
                        Diterima
                      </button>
                      <button
                        onClick={() => handleUbahStatus("ditolak")}
                        className="block w-full px-4 py-3 text-center font-medium text-white hover:bg-red-700"
                      >
                        Ditolak
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
                <div className="h-75 w-75 flex-shrink-0 rounded-xl bg-gray-300" />

                <div className="flex-1">
                  <h2 className="mb-4 text-xl font-bold text-black">Detail Pendonor</h2>
                  <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-3">
                    <div>
                      <p className="text-black">Nama</p>
                      <p className="text-lg font-semibold text-black">{data.nama_lengkap}</p>
                    </div>
                    <div>
                      <p className="text-black">Email</p>
                      <p className="text-lg font-semibold text-black">{data.email}</p>
                    </div>
                    <div>
                      <p className="text-black">Golongan Darah</p>
                      <p className="text-lg font-semibold text-black">{data.golongan_darah}</p>
                    </div>

                    <div>
                      <p className="text-black">Jenis Kelamin</p>
                      <p className="text-lg font-semibold text-black">
                        {data.jenis_kelamin === "Laki-laki" ? "Laki - Laki" : data.jenis_kelamin}
                      </p>
                    </div>
                    <div>
                      <p className="text-black">Tanggal Lahir</p>
                      <p className="text-lg font-semibold text-black">
                        {formatTanggalLahir(data.tanggal_lahir)}
                      </p>
                    </div>
                    <div>
                      <p className="text-black">Umur</p>
                      <p className="text-lg font-semibold text-black">
                        {hitungUmur(data.tanggal_lahir)}
                      </p>
                    </div>

                    <div className="sm:col-span-3">
                      <p className="text-black">Alamat</p>
                      <p className="text-lg font-semibold text-black">{data.alamat}</p>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="my-8 border-gray-300" />

              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-black">Detail Donor</h2>
                {data.kuesioner && (
                  <button
                    type="button"
                    onClick={() => setShowKuesioner(true)}
                    className="rounded-full border border-gray-200 px-5 py-2 text-sm font-medium text-black shadow-sm"
                  >
                    Hasil Kuesioner
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
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
                  <p className="text-black">Alamat Lokasi</p>
                  <p className="text-lg font-semibold text-black">{data.alamat_lokasi ?? "-"}</p>
                </div>

                <div>
                  <p className="text-black">Status</p>
                  <p className="text-lg font-semibold text-black">
                    {statusLabel[data.status_pendaftaran ?? ""] ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-black">No Antrian</p>
                  <p className="text-lg font-semibold text-black">
                    {data.nomor_antrian ?? "-"}
                  </p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {showKuesioner && data?.kuesioner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <h2 className="text-2xl font-extrabold text-black">Hasil Kuesioner</h2>
                <button onClick={() => setShowKuesioner(false)}>
                  <X size={22} className="text-black" />
                </button>
              </div>
        
              <div className="flex flex-col gap-3 overflow-y-auto px-6 pb-6">
                {kuesionerPertanyaan.map((q) => {
                  const jawaban = data.kuesioner![q.key];
                  return (
                    <div
                      key={q.key}
                      className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3"
                    >
                      <p className="text-sm text-black">{q.label}</p>
                      <div className="flex flex-shrink-0 items-center gap-5 text-sm text-black">
                        <label className="flex items-center gap-2">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                              jawaban === true ? "border-gray-500" : "border-gray-300"
                            }`}
                          >
                            {jawaban === true && (
                              <span className="h-2.5 w-2.5 rounded-full bg-gray-500" />
                            )}
                          </span>
                          Ya
                        </label>
                        <label className="flex items-center gap-2">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                              jawaban === false ? "border-gray-500" : "border-gray-300"
                            }`}
                          >
                            {jawaban === false && (
                              <span className="h-2.5 w-2.5 rounded-full bg-gray-500" />
                            )}
                          </span>
                          Tidak
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}