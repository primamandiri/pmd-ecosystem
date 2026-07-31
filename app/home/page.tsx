"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();
  const [stats, setStats] = useState({ absensi: 0, spk: 0, aktif: 0, noo: 0, reaktif: 0 });
  const [monthly, setMonthly] = useState<any[]>([]);
  const [area, setArea] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().split("T")[0];
      const [{ count: a }, { count: s }, { data: m }] = await Promise.all([
        supabase.from("attendance").select("*", { count: "exact", head: true }).gte("created_at", today),
        supabase.from("spk_visits").select("*", { count: "exact", head: true }).gte("created_at", today),
        supabase.from("monthly_reports").select("*"),
      ]);
      const monthlyData: any[] = m || [];
      const allRow = monthlyData.find((r: any) => r.area === "ALL");
      setStats({
        absensi: a || 0, spk: s || 0,
        aktif: allRow ? Number(allRow.ta_total) || 0 : 0,
        noo: allRow ? Number(allRow.ta_noo) || 0 : 0,
        reaktif: allRow ? Number(allRow.toko_reaktif) || 0 : 0,
      });
      setMonthly(monthlyData);
      setLoading(false);
    })();
  }, []);

  const fmt = (v: any) => { const n = Number(v || 0); return "Rp" + n.toLocaleString("id-ID"); };

  const displayData = area === "ALL"
    ? monthly.filter(r => r.area && r.area !== "ALL")
    : monthly.filter(r => r.area === area);

  const Donut = ({ pcp = 0 }: { pcp: number }) => {
    const pct = Math.min(Math.max(pcp, 0), 100);
    // ≥100% Hijau, ≥75% Biru, <75% Merah
    const color = pct >= 100 ? "#16a34a" : pct >= 75 ? "#2563eb" : "#ef4444";
    return (
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.5" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold" style={{ color }}>{pct.toFixed(0)}%</span>
        </div>
        {pct >= 100 && (
          <span className="absolute -top-1 -right-1 text-[7px] bg-green-100 text-green-700 px-1 rounded-full font-bold border border-green-300">
            MVP
          </span>
        )}
      </div>
    );
  };

  if (loading) return <div className="p-4 text-center text-gray-400">Loading...</div>;

  const areaList = [...new Set(monthly.map(r => r.area).filter(Boolean))] as string[];

  return (
    <div className="p-3 max-w-5xl mx-auto space-y-4">
      <h1 className="text-lg font-bold text-blue-800">🏠 Dashboard Utama</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: "Absensi Hari Ini", value: stats.absensi, color: "bg-blue-50 text-blue-700" },
          { label: "SPK Hari Ini", value: stats.spk, color: "bg-indigo-50 text-indigo-700" },
          { label: "Toko Aktif", value: stats.aktif, color: "bg-green-50 text-green-700" },
          { label: "NOO", value: stats.noo, color: "bg-amber-50 text-amber-700" },
          { label: "Reaktif", value: stats.reaktif, color: "bg-purple-50 text-purple-700" },
        ].map((card, i) => (
          <div key={i} className={`${card.color} rounded-xl p-3 text-center`}>
            <p className="text-lg font-bold">{card.value}</p>
            <p className="text-[10px] opacity-75">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-700">🎯 PCP Sales per Area</h2>
          <select value={area} onChange={e => setArea(e.target.value)}
            className="p-1 border rounded text-[10px] bg-white">
            <option value="ALL">ALL</option>
            {areaList.filter(a => a !== "ALL").map(a => <option key={a}>{a}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {displayData.map((r, i) => {
            const pcp = r.tgt > 0 ? (Number(r.act) / Number(r.tgt)) * 100 : 0;
            return (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <Donut pcp={pcp} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{r.nama_sdm || "-"}</p>
                  <p className="text-[9px] text-gray-400">{r.jabatan} • {r.area}</p>
                  <div className="flex gap-2 mt-1 text-[9px] text-gray-500">
                    <span>TGT: {fmt(r.tgt)}</span>
                    <span>ACT: {fmt(r.act)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {displayData.length === 0 && (
          <p className="text-center text-[10px] text-gray-400 py-4">Belum ada data</p>
        )}
      </div>
    </div>
  );
}
