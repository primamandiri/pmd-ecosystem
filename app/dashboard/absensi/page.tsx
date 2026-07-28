"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function HistoryAbsensiPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDate, setOpenDate] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data } = await supabase.from("attendance").select("*").order("date", { ascending: false }).order("time", { ascending: false });
    if (data) setData(data);
    setLoading(false);
  }

  const grouped: any = {};
  for (const d of data) {
    if (!grouped[d.date]) grouped[d.date] = [];
    grouped[d.date].push(d);
  }

  if (loading) return <div className="p-4 text-center text-gray-400">Loading...</div>;

  return (
    <div className="p-3 max-w-3xl mx-auto">
      <h1 className="text-base font-bold text-blue-800 mb-3">📋 History Absensi</h1>
      {Object.entries(grouped).map(([date, items]: [string, any]) => (
        <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-100 mb-2 overflow-hidden">
          <button onClick={() => setOpenDate(openDate === date ? null : date)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-blue-50 hover:bg-blue-100">
            <span className="text-sm font-medium text-blue-800">📅 {new Date(date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
            <span className="text-xs text-blue-500">{openDate === date ? "▲" : "▼"}</span>
          </button>
          {openDate === date && items.map((d: any) => (
            <div key={d.id} className="flex items-center gap-3 px-4 py-2 border-t border-gray-50">
              {d.selfie_url ? <img src={d.selfie_url} className="w-10 h-10 rounded-full object-cover border" /> : <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs">📷</div>}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{d.name} <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${d.type === "berangkat" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{d.type}</span></p>
                <p className="text-[10px] text-gray-400">🕐 {d.time?.slice(0, 5)}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
      {data.length === 0 && <p className="text-xs text-gray-400 text-center py-8">Belum ada data absensi</p>}
    </div>
  );
}
