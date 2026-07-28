"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  BarChart3, ClipboardList, MapPin, Plus, 
  LayoutDashboard, Database, Settings,
  Store, Key, ChevronDown, ChevronRight, FileText, Clock
} from "lucide-react";

const menu = [
  { label: "Sales", icon: BarChart3, children: [
    { label: "Absensi", icon: ClipboardList, path: "/absensi" },
    { label: "SPK Sales", icon: FileText, path: "/spk" },
    { label: "Aktivitas", icon: MapPin, path: "/aktivitas" },
    { label: "Tambah NOO", icon: Plus, path: "/tambah-noo" },
  ]},
  { label: "Dashboard", icon: LayoutDashboard, children: [
    { label: "Laporan Bulanan", icon: BarChart3, path: "/dashboard/laporan" },
    { label: "Laporan Mingguan", icon: BarChart3, path: "/dashboard/mingguan" },
    { label: "History Absensi", icon: Clock, path: "/dashboard/absensi" },
  ]},
  { label: "Database", icon: Database, children: [
    { label: "Data Toko", icon: Store, path: "/database/toko" },
  ]},
  { label: "Pengaturan", icon: Settings, children: [
    { label: "Ubah Password", icon: Key, path: "/pengaturan/password" },
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
      <div className="p-4 border-b border-gray-200">
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
