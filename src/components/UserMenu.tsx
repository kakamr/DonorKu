"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function UserMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [nama, setNama] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const [fotoProfil, setFotoProfil] = useState<string | null>(null);

  useEffect(() => {
    fetchAdmin();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAdmin = async () => {
    try {
      const res = await fetch("/api/web/admin/me");
      if (!res.ok) return;
      const data = await res.json();
      const firstName = data.nama_admin?.split(" ").pop() ?? data.nama_admin;
      setNama(firstName || "Admin");
      setFotoProfil(data.foto_profil ?? null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/web/auth/logout", { method: "POST" });
    } catch (error) {
      console.error(error);
    } finally {
      router.push("/login");
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-3"
      >
        <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-300">
          {fotoProfil && <Image src={fotoProfil} alt="Foto profil" className="h-full w-full object-cover" width={50} height={50}/>}
        </div>
        <span className="text-black">Hi, {nama || "..."}</span>
        <ChevronDown size={16} className={`text-black transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-3 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              router.push("/dashboard/profile");
            }}
            className="flex w-full items-center gap-3 border-b border-gray-100 px-5 py-4 text-left text-black hover:bg-gray-50"
          >
            <Image src="/button/profile.png" alt="profil akun" width={20} height={20}/>
            Profile
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-5 py-4 text-left text-red-600 hover:bg-red-50"
          >
            <Image src="/button/logout.png" alt="keluar akun" width={20} height={20}/>
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}