"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

const menuItems = [
  { label: "Beranda", href: "/dashboard", icon: HomeIcon },
  { label: "Daftar Lokasi", href: "/dashboard/lokasi", icon: LocationIcon },
  { label: "Jadwal Donor", href: "/dashboard/jadwal", icon: CalendarIcon },
  { label: "Daftar Pendonor", href: "/dashboard/pendonor", icon: UsersListIcon },
  { label: "Stok Darah", href: "/dashboard/stok-darah", icon: DropIcon },
  { label: "Aturan dan tips", href: "/dashboard/tips", icon: ListIcon },
  { label: "Riwayat Donor", href: "/dashboard/riwayat", icon: UsersIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 border-r-2 border-black bg-white px-6 py-8">
      <div className="mb-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
        >
          <Image src="/logo/logo_sd_type.png" alt="logo sidebar" className="h-full object-cover" width={200} height={50}/>
        </button>
        
      </div>

      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 rounded-lg px-3 py-3 text-lg transition ${
                isActive
                  ? "font-semibold text-red-600"
                  : "text-black hover:bg-gray-50"
              }`}
            >
              <Icon active={isActive} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <Image src={active ? "/sidebar/beranda_red.png" : "/sidebar/beranda.png"} alt="beranda" width={24} height={24}/>
  );
}

function LocationIcon({ active }: { active?: boolean }) {
  return (
    <Image src={active ? "/sidebar/lokasi_donor_red.png" : "/sidebar/lokasi_donor.png"} alt="lokasi" width={24} height={24}/>
  );
}

function CalendarIcon({ active }: { active?: boolean }) {
  return (
    <Image src={active ? "/sidebar/jadwal_donor_red.png" : "/sidebar/jadwal_donor.png"} alt="jadwal" width={24} height={24}/>
  );
}

function UsersListIcon({ active }: { active?: boolean }) {
  return (
    <Image src={active ? "/sidebar/daftar_pendonor_red.png" : "/sidebar/daftar_pendonor.png"} alt="daftar" width={24} height={24}/>
  );
}

function DropIcon({ active }: { active?: boolean }) {
  return (
    <Image src={active ? "/sidebar/stok_darah_red.png" : "/sidebar/stok_darah.png"} alt="stok" width={24} height={24}/>
  );
}

function ListIcon({ active }: { active?: boolean }) {
  return (
    <Image src={active ? "/sidebar/aturan_tips_red.png" : "/sidebar/aturan_tips.png"} alt="aturan tips" width={24} height={24}/>
  );
}

function UsersIcon({ active }: { active?: boolean }) {
  return (
    <Image src={active ? "/sidebar/riwayat_pendonor_red.png" : "/sidebar/riwayat_pendonor.png"} alt="riwayat" width={24} height={24}/>
  );
}