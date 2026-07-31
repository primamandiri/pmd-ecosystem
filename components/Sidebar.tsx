"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Users, DollarSign, Package, Truck, LayoutDashboard, Database, Settings,
  ClipboardCheck, FileText, Activity, UserPlus, Clock,
  ShoppingCart, History, RotateCcw,
  PackagePlus, PackageOpen, AlertTriangle,
  MapPin, UserCheck,
  BarChart3, Calendar, TrendingUp,
  Store, Key, Fingerprint, User,
  ChevronLeft, ChevronRight } from "lucide-react";

const MENU_ITEMS = [
  { label: "Sales", icon: Users, children: [
    { label: "Absensi", path: "/absensi", icon: ClipboardCheck },
    { label: "SPK Sales", path: "/spk", icon: FileText },
    { label: "Aktivitas", path: "/aktivitas", icon: Activity },
    { label: "Tambah NOO", path: "/tambah-noo", icon: UserPlus },
    { label: "History Absensi", path: "/absensi/history", icon: Clock },
  ]},
  { label: "Penjualan", icon: DollarSign, children: [
    { label: "Input Penjualan", path: "#", icon: ShoppingCart },
    { label: "Riwayat Penjualan", path: "#", icon: History },
    { label: "Retur Penjualan", path: "#", icon: RotateCcw },
  ]},
  { label: "Pembelian", icon: Package, children: [
    { label: "Input Pembelian", path: "#", icon: PackagePlus },
    { label: "Riwayat Pembelian", path: "#", icon: PackageOpen },
    { label: "Retur Pembelian", path: "#", icon: RotateCcw },
    { label: "Stok Minimal", path: "#", icon: AlertTriangle },
  ]},
  { label: "Ekspedisi", icon: Truck, children: [
    { label: "Lacak Pengiriman", path: "/ekspedisi/lacak", icon: MapPin },
    { label: "Penugasan Driver", path: "#", icon: UserCheck },
  ]},
  { label: "Dashboard", icon: LayoutDashboard, children: [
    { label: "Grafik Tahunan", path: "/dashboard/tahunan", icon: BarChart3 },
    { label: "Laporan Bulanan", path: "/dashboard/laporan", icon: Calendar },
    { label: "Laporan Mingguan", path: "/dashboard/mingguan", icon: TrendingUp },
  ]},
  { label: "Database", icon: Database, children: [
    { label: "Data Toko", path: "/database/toko", icon: Store },
  ]},
  { label: "Pengaturan", icon: Settings, children: [
    { label: "Profil", path: "/pengaturan/profil", icon: User },
    { label: "Ubah Password", path: "/pengaturan/password", icon: Key },
    { label: "Biometric", path: "/pengaturan/biometric", icon: Fingerprint },
  ]},
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isActive = (path: string) => pathname === path;
  const isInGroup = (children: any[]) => children?.some((c: any) => isActive(c.path));

  MENU_ITEMS.forEach((item) => {
    if (isInGroup(item.children) && !openMenus[item.label])
      setOpenMenus((prev) => ({ ...prev, [item.label]: true }));
  });

  const toggleMenu = (label: string) => setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  const expanded = !collapsed || hovered;

  return (
    <aside className={`bg-gradient-to-b from-blue-900 to-blue-950 text-white h-full flex flex-col transition-all duration-200 ${expanded ? "w-60" : "w-14"}`}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => { if (collapsed) setHovered(false); }}>
      <div className="border-b border-blue-800/40 px-4 py-3">
        <div className="cursor-pointer flex items-center gap-3" onClick={() => router.push("/home")}>
          <img src="/logoPMD.png" alt="" className="w-8 h-8 object-contain shrink-0" onError={(e: any) => e.target.style.display = "none"} />
          {expanded && <div><p className="text-sm font-bold text-white leading-tight">PMD Ecosystem</p>
            <p className="text-[9px] text-blue-300 leading-tight">CV Prima Mandiri Distribusi</p>
            <p className="text-[7px] text-blue-400/60 leading-tight">by NB Projects</p></div>}
        </div>
      </div>
      <button onClick={() => { setCollapsed(!collapsed); setHovered(false); }}
        className={`flex items-center py-2 text-blue-300 hover:text-white ${expanded ? "px-4 justify-end" : "justify-center"}`}>
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
      <nav className="flex-1 overflow-y-auto py-1 space-y-0.5 px-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isInGroup(item.children);
          return (<div key={item.label}>
            <button onClick={() => toggleMenu(item.label)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition ${expanded ? "justify-start" : "justify-center"} ${active ? "bg-blue-700/50 text-white font-semibold" : "text-blue-100 hover:bg-blue-800/40 hover:text-white"}`}
              title={!expanded ? item.label : undefined}>
              <Icon className="w-5 h-5 shrink-0" />
              {expanded && <span>{item.label}</span>}
            </button>
            {expanded && openMenus[item.label] && item.children && (
              <div className="ml-2 border-l border-blue-800/40">
                {item.children.map((child) => {
                  const ChildIcon = child.icon;
                  return (<button key={child.label} onClick={() => { router.push(child.path); if (onClose) onClose(); }}
                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm transition ${isActive(child.path) ? "bg-blue-700/50 text-white font-semibold" : "text-blue-200 hover:text-white hover:bg-blue-800/30"}`}>
                    <ChildIcon className="w-4 h-4 shrink-0 text-blue-300" />
                    {child.label}
                  </button>);
                })}
              </div>
            )}
          </div>);
        })}
      </nav>
    </aside>
  );
}
