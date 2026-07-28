"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  BarChart3, ClipboardList, MapPin, Plus, 
  LayoutDashboard, Database, Settings,
  Store, Key, ChevronDown, ChevronRight, FileText, Clock,
  ShoppingCart, Package, Truck, Users, Building2, 
  History, RotateCcw, AlertTriangle, Search, UserCheck,
  Image
} from "lucide-react";

const menu = [
  { label: "Sales", icon: BarChart3, children: [
    { label: "Absensi", icon: ClipboardList, path: "/absensi" },
    { label: "SPK Sales", icon: FileText, path: "/spk" },
    { label: "Aktivitas", icon: MapPin, path: "/aktivitas" },
    { label: "Tambah NOO", icon: Plus, path: "/tambah-noo" },
  ]},
  { label: "Penjualan", icon: ShoppingCart, children: [
    { label: "Input penjualan", icon: Plus, path: "/penjualan/input" },
    { label: "Riwayat penjualan", icon: History, path: "/penjualan/riwayat" },
    { label: "Retur penjualan", icon: RotateCcw, path: "/penjualan/retur" },
  ]},
  { label: "Pembelian", icon: Package, children: [
    { label: "Input pembelian", icon: Plus, path: "/pembelian/input" },
    { label: "Riwayat pembelian", icon: History, path: "/pembelian/riwayat" },
    { label: "Retur pembelian", icon: RotateCcw, path: "/pembelian/retur" },
    { label: "Stok minimal", icon: AlertTriangle, path: "/pembelian/stok-minimal" },
  ]},
  { label: "Ekspedisi", icon: Truck, children: [
    { label: "Lacak pengiriman", icon: Search, path: "/ekspedisi/lacak" },
    { label: "Penugasan driver", icon: UserCheck, path: "/ekspedisi/penugasan" },
  ]},
  { label: "Dashboard", icon: LayoutDashboard, children: [
    { label: "Laporan bulanan", icon: FileText, path: "/dashboard/laporan" },
    { label: "Laporan mingguan", icon: BarChart3, path: "/dashboard/mingguan" },
    { label: "Laporan harian", icon: Clock, path: "/dashboard/harian" },
    { label: "History absensi", icon: ClipboardList, path: "/dashboard/absensi" },
  ]},
  { label: "Database", icon: Database, children: [
    { label: "Data Toko", icon: Store, path: "/database/toko" },
    { label: "Supplier", icon: Truck, path: "/database/supplier" },
    { label: "Karyawan", icon: Users, path: "/database/karyawan" },
  ]},
  { label: "Pengaturan", icon: Settings, children: [
    { label: "Ubah Password", icon: Key, path: "/pengaturan/password" },
    { label: "Logo & Nama", icon: Image, path: "/pengaturan/logo" },
    { label: "Detail Perusahaan", icon: Building2, path: "/pengaturan/detail" },
  ]},
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const [openMenu, setOpenMenu] = useState<string[]>(["Sales"]);
  const router = useRouter();
  const pathname = usePathname();

  const toggle = (label: string) => setOpenMenu(p => p.includes(label) ? p.filter(m => m !== label) : [...p, label]);
  const navigate = (path: string) => { router.push(path); if (onClose) onClose(); };

  return (
    <div className="w-64 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* LOGO - klik ke /home */}
      <div className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
        onClick={() => { router.push("/home"); if (onClose) onClose(); }}>
        <div className="flex items-center gap-3">
          <img src="/logoPMD.png" alt="Logo" className="w-10 h-10 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <div>
            <p className="font-bold text-sm text-blue-700">PMD Ecosystem</p>
            <p className="text-xs text-gray-400">CV Prima Mandiri Distribusi</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {menu.map(m => (
          <div key={m.label}>
            <button onClick={() => toggle(m.label)}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 text-sm font-medium text-gray-700">
              <m.icon className="w-4 h-4 text-blue-600" />
              <span className="flex-1 text-left">{m.label}</span>
              {openMenu.includes(m.label) ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {openMenu.includes(m.label) && (
              <div className="ml-2 space-y-0.5">
                {m.children.map(c => (
                  <button key={c.path} onClick={() => navigate(c.path)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm ${
                      pathname === c.path ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"
                    }`}>
                    <c.icon className="w-3.5 h-3.5" />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
