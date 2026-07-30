"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

export type FotoItem = { id: string; url: string; uploading?: boolean };

export type Lokasi = {
  id_lokasi: number;
  nama_lokasi: string;
  alamat: string;
};

export type JadwalFormData = {
  hari_tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  id_lokasi: string;
  nama_penanggung_jawab: string;
  kontak_penanggung_jawab: string;
  total_pendaftar_online: string;
  total_pendonor_offline: string;
  pendonor_hadir: string;
  darah_terkumpul: string;
};

type JadwalFormProps = {
  form: JadwalFormData;
  onChange: (field: keyof JadwalFormData, value: string) => void;
  foto: FotoItem[];
  onAddFoto: (items: FotoItem[]) => void;
  onRemoveFoto: (id: string) => void;
};

export default function JadwalForm({
  form,
  onChange,
  foto,
  onAddFoto,
  onRemoveFoto,
}: JadwalFormProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);
  const [showLokasiMenu, setShowLokasiMenu] = useState(false);
  const [loadingLokasi, setLoadingLokasi] = useState(true);
  const lokasiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLokasi();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (lokasiRef.current && !lokasiRef.current.contains(event.target as Node)) {
        setShowLokasiMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchLokasi = async () => {
    setLoadingLokasi(true);
    try {
      const res = await fetch("/api/web/lokasi");
      const data = await res.json();
      setLokasiList(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingLokasi(false);
    }
  };

  const selectedLokasi = lokasiList.find(
    (l) => l.id_lokasi === Number(form.id_lokasi)
  );

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: FotoItem[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      uploading: true,
    }));

    onAddFoto(newItems);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tempItem = newItems[i];

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "lokasi");

      try {
        const res = await fetch("/api/web/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message ?? "Gagal upload gambar");
          onRemoveFoto(tempItem.id);
          continue;
        }

        onAddFoto([{ id: tempItem.id, url: data.url, uploading: false }]);
      } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan saat upload gambar");
        onRemoveFoto(tempItem.id);
      }
    }
  };

  return (
    <>
      <h2 className="mb-4 text-xl font-bold text-black">Detail Jadwal</h2>
      <div className="mb-8 rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-black">
              Hari / Tanggal<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.hari_tanggal}
              onChange={(e) => onChange("hari_tanggal", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div>
            <label className="mb-2 block text-black">
              Waktu Mulai<span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={form.waktu_mulai}
              onChange={(e) => onChange("waktu_mulai", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div>
            <label className="mb-2 block text-black">
              Waktu Selesai<span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={form.waktu_selesai}
              onChange={(e) => onChange("waktu_selesai", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <div ref={lokasiRef}>
            <label className="mb-2 block text-black">
              Lokasi<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLokasiMenu((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-5 py-3 text-left text-black focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <span className={selectedLokasi ? "text-black" : "text-gray-400"}>
                  {selectedLokasi ? selectedLokasi.nama_lokasi : "Masukan Lokasi"}
                </span>
                <ChevronDown size={16} className={`transition-transform ${showLokasiMenu ? "rotate-180" : ""}`} />
              </button>

              {showLokasiMenu && (
                <div className="absolute left-0 z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg text-black">
                  {loadingLokasi && (
                    <p className="px-5 py-3 text-sm text-gray-400">Memuat lokasi...</p>
                  )}
                  {!loadingLokasi && lokasiList.length === 0 && (
                    <p className="px-5 py-3 text-sm text-gray-400">Belum ada data lokasi</p>
                  )}
                  {!loadingLokasi &&
                    lokasiList.map((lokasi) => (
                      <button
                        key={lokasi.id_lokasi}
                        type="button"
                        onClick={() => {
                          onChange("id_lokasi", String(lokasi.id_lokasi));
                          setShowLokasiMenu(false);
                        }}
                        className={`block w-full px-5 py-3 text-left ${
                          Number(form.id_lokasi) === lokasi.id_lokasi
                            ? "bg-gray-100"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {lokasi.nama_lokasi}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="mb-2 block text-black">
              Alamat Lokasi<span className="text-red-500">*</span>
            </label>
            <textarea
              readOnly
              placeholder="Alamat otomatis terisi setelah memilih lokasi"
              value={selectedLokasi ? selectedLokasi.alamat :""}
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-100 px-5 py-3 text-black placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-xl font-bold text-black">Penanggung Jawab</h2>
      <div className="mb-8 rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-black">
              Nama Penanggung Jawab<span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Masukan Nama"
              value={form.nama_penanggung_jawab}
              onChange={(e) => onChange("nama_penanggung_jawab", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div>
            <label className="mb-2 block text-black">
              Kontak Penanggung Jawab<span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Masukan Kontak"
              value={form.kontak_penanggung_jawab}
              onChange={(e) => onChange("kontak_penanggung_jawab", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-xl font-bold text-black">Detail Donor</h2>
      <div className="mb-8 rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-black">
              Total Pendaftar (Online)<span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Masukan Total Pendaftar Online"
              value={form.total_pendaftar_online}
              onChange={(e) => onChange("total_pendaftar_online", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div>
            <label className="mb-2 block text-black">Total Pendonor (Offline)</label>
            <input
              placeholder="Masukan Total Pendonor Offline"
              value={form.total_pendonor_offline}
              onChange={(e) => onChange("total_pendonor_offline", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-black">Pendonor Hadir</label>
            <input
              placeholder="Masukan Pendonor yang hadir"
              value={form.pendonor_hadir}
              onChange={(e) => onChange("pendonor_hadir", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div>
            <label className="mb-2 block text-black">Darah Terkumpul</label>
            <input
              placeholder="Masukan Darah Terkumpul"
              value={form.darah_terkumpul}
              onChange={(e) => onChange("darah_terkumpul", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-xl font-bold text-black">Foto Lokasi</h2>
      <div className="rounded-2xl border border-gray-200 p-8 shadow-sm">
        <label className="mb-2 block text-black">Foto</label>
        <div className="mb-6 flex max-w-xl overflow-hidden rounded-xl border border-gray-200">
          <input
            readOnly
            placeholder="Pilih Gambar"
            value={foto.length > 0 ? `${foto.length} file dipilih` : ""}
            className="flex-1 px-5 py-3 text-gray-400 placeholder:text-gray-400 focus:outline-none"
          />
          <label className="flex cursor-pointer items-center bg-gray-100 px-6 py-3 font-medium text-black hover:bg-gray-200">
            Browse
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </label>
        </div>

        {foto.length > 0 && (
          <>
            <p className="mb-3 text-black">Preview</p>
            <div className="flex flex-wrap gap-4">
              {foto.map((f) => (
                <div
                  key={f.id}
                  className="relative h-40 w-56 overflow-hidden rounded-xl bg-gray-100"
                >
                  <Image
                    src={f.url}
                    alt="Foto lokasi"
                    className="object-cover"
                    fill
                  />

                  {f.uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-white">
                      Mengupload...
                    </div>
                  )}

                  <div className="absolute right-2 top-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(f.url)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90"
                    >
                      <Image src="/button/view.png" alt="detail gambar" width={20} height={20}/>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveFoto(f.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600"
                    >
                      <Image src="/button/delete.png" alt="hapus gambar" width={20} height={20}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8"
          onClick={() => setPreviewImage(null)}
        >
          <Image
            src={previewImage}
            alt="Preview"
            className="rounded-xl object-contain"
            fill
          />
        </div>
      )}
    </>
  );
}