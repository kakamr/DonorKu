"use client";
import Image from "next/image";

type ConfirmModalProps = {
  isOpen: boolean;
  variant: "add" | "back" | "edit" | "delete";
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
};

const content = {
  add: {
    title: "Konfirmasi Tambah",
    description: "Apakah anda yakin ingin menambah jadwal donor baru?",
    confirmLabel: "Tambah",
    icon: "/popup-card/tanya.png",
  },
  back: {
    title: "Konfirmasi Kembali",
    description: "Apakah anda yakin ingin kembali? (Data tidak akan teredit)",
    confirmLabel: "Kembali",
    icon: "/popup-card/tanya.png",
  },
  edit: {
    title: "Konfirmasi Edit",
    description: "Apakah anda yakin ingin mengubah jadwal donor?",
    confirmLabel: "Edit",
    icon: "/popup-card/tanya.png",
  },
  delete: {
    title: "Konfirmasi Hapus",
    description: "Apakah anda yakin ingin mengahapus data?",
    confirmLabel: "Hapus",
    icon: "/popup-card/tanya.png",
  },
};

export default function ConfirmModal({
  isOpen,
  variant,
  onConfirm,
  onCancel,
  title,
  description,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const defaults = content[variant];
  const finalTitle = title ?? defaults.title;
  const finalDescription = description ?? defaults.description;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
        <div className="mb-6 flex justify-center">
          <Image src={defaults.icon} className="rounded-2xl" alt={finalTitle} width={100} height={100} />
        </div>
        <h2 className="mb-3 text-2xl font-extrabold text-black">{finalTitle}</h2>
        <p className="mb-8 text-base text-gray-600">{finalDescription}</p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:brightness-105"
          >
            {defaults.confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-300 py-3 font-semibold text-black transition hover:bg-gray-50"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}