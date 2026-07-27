"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function HistoryAbsensiPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data } = await supabase
      .from("attendance")
      .select("*")
      .order("date", { ascending: false })
      .order("time", { ascending: false });
    if (data) setData(data);
    setLoading(false);
  }

  const grouped: any = {};
  for (const d of data) {
    const key = d.date;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(d);
  }

  if (loading) return <div className="p-4 text-center text-gray-400">Loading...</div>;

  return (
    <div className="p-3 max-w-3xl mx-auto space-y-3">
      <h1 className="text-sm font-bold text-blue-800">📋 History Absensi</h1>

      <input type="text" placeholder="Cari..." value={filter} onChange={e => setFilter(e.target.value)}
        className="w-full p-1.5 border rounded text-xs" />

      {Object.entries(grouped).map(([date, items]: [string, any]) => {
        const filtered = items.filter((d: any) => d.type?.includes(filter) || d.date?.includes(filter));
        if (filtered.length === 0) return null;
        return (
          <div key={date} className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="px-3 py-1.5 bg-blue-50 text-blue-800 font-medium text-xs rounded-t-lg">
              📅 {new Date(date).toLocaleDateString("id-ID", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
            </div>
            <div className="divide-y">
              {filtered.map((d: any) => (
                <div key={d.id} className="px-3 py-1.5 flex items-center gap-3">
                  {d.selfie_url ? (
                    <img src={d.selfie_url} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">?</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mr-1 ${
                        d.type === "berangkat" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                      }`}>{d.type}</span>
                      🕐 {d.time?.slice(0, 5)}
                    </p>
                    <p className="text-[9px] text-gray-400 truncate">{d.latitude?.toFixed(4)}, {d.longitude?.toFixed(4)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {data.length === 0 && <p className="text-xs text-gray-400 text-center py-8">Belum ada data absensi</p>}
    </div>
  );
}
