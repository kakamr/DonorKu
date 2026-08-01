"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export type AturanTipsFormData = {
  judul: string;
  kategori: "Aturan" | "Tips";
  status: "publish" | "draft";
  isi: string;
};

type AturanTipsFormProps = {
  form: AturanTipsFormData;
  onChange: (field: keyof AturanTipsFormData, value: string) => void;
};

const kategoriOptions = ["Aturan", "Tips"];
const statusOptions: { value: "publish" | "draft"; label: string }[] = [
  { value: "publish", label: "Aktif" },
  { value: "draft", label: "Nonaktif" },
];

export default function AturanTipsForm({ form, onChange }: AturanTipsFormProps) {
  const [showKategoriMenu, setShowKategoriMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const kategoriRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (kategoriRef.current && !kategoriRef.current.contains(event.target as Node)) {
        setShowKategoriMenu(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statusLabel =
    statusOptions.find((s) => s.value === form.status)?.label ?? "Aktif";

  return (
    <>
      <label className="mb-2 block text-lg font-bold text-black">Judul</label>
      <input
        placeholder="Masukan Judul Baru Aturan/Tips disini...."
        value={form.judul}
        onChange={(e) => onChange("judul", e.target.value)}
        className="mb-8 w-full rounded-xl bg-white px-6 py-4 text-black shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
      />

      <div className="mb-8 flex flex-wrap gap-8">
        <div className="w-56" ref={kategoriRef}>
          <label className="mb-2 block text-lg font-bold text-black">Kategori</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowKategoriMenu((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl bg-white px-5 py-3 text-black shadow-sm"
            >
              {form.kategori} <ChevronDown size={14} className={`transition-transform ${showKategoriMenu ? "rotate-180" : ""}`} />
            </button>
            {showKategoriMenu && (
              <div className="absolute left-0 z-10 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg text-black">
                {kategoriOptions.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      onChange("kategori", k);
                      setShowKategoriMenu(false);
                    }}
                    className={`block w-full px-5 py-3 text-left ${
                      form.kategori === k ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-56" ref={statusRef}>
          <label className="mb-2 block text-lg font-bold text-black">Status</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStatusMenu((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl bg-white px-5 py-3 text-black shadow-sm"
            >
              {statusLabel} <ChevronDown size={14} className={`transition-transform ${showStatusMenu ? "rotate-180" : ""}`} />
            </button>
            {showStatusMenu && (
              <div className="absolute left-0 z-10 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg text-black">
                {statusOptions.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      onChange("status", s.value);
                      setShowStatusMenu(false);
                    }}
                    className={`block w-full px-5 py-3 text-left ${
                      form.status === s.value ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <label className="mb-2 block text-lg font-bold text-black">Isi/Deskripsi</label>
      <textarea
        placeholder="Masukan Isi/Deskripsi disini...."
        value={form.isi}
        onChange={(e) => onChange("isi", e.target.value)}
        rows={8}
        className="w-full resize-none rounded-xl bg-white px-6 py-4 text-black shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
      />
    </>
  );
}