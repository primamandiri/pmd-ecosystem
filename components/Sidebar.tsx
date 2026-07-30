"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  BarChart3, ClipboardList, MapPin, Plus, 
  LayoutDashboard, Database, Settings,
  Store, Key, ChevronDown, ChevronRight, FileText, Clock,
  ShoppingCart, Package, Truck, Users, Building2, 
  History, RotateCcw, AlertTriangle, Search, UserCheck,
  Image, Fingerprint
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
    { label: "Biometric", icon: Fingerprint, path: "/pengaturan/biometric" },
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
    <div className="w-64 h-full sidebar-dark flex flex-col">
      <div className="p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition"
        onClick={() => { router.push("/home"); if (onClose) onClose(); }}>
        <div className="flex items-center gap-3">
          <img src="/logoPMD.png" alt="Logo" className="w-10 h-10 object-contain rounded-lg"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <div>
            <p className="font-bold text-sm text-white">PMD Ecosystem</p>
            <p className="text-xs text-gray-400">CV Prima Mandiri Distribusi</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {menu.map(m => (
          <div key={m.label}>
            <button onClick={() => toggle(m.label)}
              className="w-full flex items-center gap-2 p-2 rounded-lg menu-item text-sm font-medium text-gray-300">
              <m.icon className="w-4 h-4 text-blue-400" />
              <span className="flex-1 text-left">{m.label}</span>
              {openMenu.includes(m.label) ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {openMenu.includes(m.label) && (
              <div className="ml-2 space-y-0.5">
                {m.children.map(c => (
                  <button key={c.path} onClick={() => navigate(c.path)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm ${
                      pathname === c.path ? "bg-blue-600 text-white font-medium" : "text-gray-400 hover:bg-white/10 hover:text-white"
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
