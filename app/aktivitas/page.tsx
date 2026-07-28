"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function AktivitasPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDate, setOpenDate] = useState<string | null>(null);
  const [openSales, setOpenSales] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data } = await supabase.from("spk_visits").select("*").order("date", { ascending: false }).order("time", { ascending: false });
    if (data) setData(data);
    setLoading(false);
  }

  const grouped: any = {};
  for (const d of data) {
    if (!grouped[d.date]) grouped[d.date] = {};
    const name = d.name || "Unknown";
    if (!grouped[d.date][name]) grouped[d.date][name] = [];
    grouped[d.date][name].push(d);
  }

  if (loading) return <div className="p-4 text-center text-gray-400">Loading...</div>;

  return (
    <div className="p-3 max-w-3xl mx-auto">
      <h1 className="text-base font-bold text-blue-800 mb-3">📍 Aktivitas Sales</h1>
      {Object.entries(grouped).map(([date, salesGroup]: [string, any]) => (
        <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-100 mb-2 overflow-hidden">
          <button onClick={() => setOpenDate(openDate === date ? null : date)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-blue-50 hover:bg-blue-100">
            <span className="text-sm font-medium text-blue-800">📅 {new Date(date).toLocaleDateString("id-ID", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</span>
            <span className="text-xs text-blue-500">{openDate === date ? "▲" : "▼"}</span>
          </button>
          {openDate === date && Object.entries(salesGroup).map(([salesName, visits]: [string, any]) => (
            <div key={salesName} className="border-t">
              <button onClick={() => setOpenSales(openSales === salesName ? null : salesName)}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-gray-100">
                <span className="text-xs font-semibold text-gray-700">👤 {salesName} ({visits.length})</span>
                <span className="text-xs text-gray-400">{openSales === salesName ? "▲" : "▼"}</span>
              </button>
              {openSales === salesName && visits.map((v: any) => (
                <div key={v.id}>
                  <button onClick={() => setDetail(detail === v.id ? null : v.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-t border-gray-50">
                    <img src={v.selfie_url} className="w-12 h-12 rounded-full object-cover border-2 border-blue-200" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{v.customer_name}</p>
                      <p className="text-xs text-gray-400">🕐 {v.time?.slice(0,5)} | {v.ketemu}</p>
                    </div>
                    <span className="text-xs text-gray-400">{detail === v.id ? "▲" : "▼"}</span>
                  </button>
                  {detail === v.id && (
                    <div className="px-4 py-3 bg-gray-50 border-t space-y-2 text-sm">
                      <a href={`https://www.google.com/maps?q=${v.latitude},${v.longitude}`} target="_blank" className="text-blue-600 underline text-xs">📍 {v.latitude?.toFixed(6)}, {v.longitude?.toFixed(6)}</a>
                      <p><span className="font-medium">Ketemu:</span> {v.ketemu}</p>
                      <p><span className="font-medium">Bayar:</span> {v.bayar === "Y" ? `✅ Rp ${(v.nominal_bayar||0).toLocaleString("id-ID")} (${v.metode_bayar})` : v.bayar === "T" ? `📅 Janji: ${v.janji_bayar||"-"}` : v.bayar === "N" ? "🚫 Tidak ada piutang" : "-"}</p>
                      <p><span className="font-medium">Order:</span> {v.order === "Y" ? `✅ Ya${v.catatan_order ? ": "+v.catatan_order : ""}` : v.order === "T" ? `❌ Tidak (${v.alasan_order||"-"})` : "-"}</p>
                      {v.tren && <p><span className="font-medium">Trend:</span> {v.tren}</p>}
                      {v.keterangan && <p><span className="font-medium">Ket:</span> {v.keterangan}</p>}
                      {v.foto_urls?.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {v.foto_urls.map((url: string, i: number) => <img key={i} src={url} className="w-24 h-24 object-cover rounded-lg border shadow-sm" />)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
      {data.length === 0 && <p className="text-xs text-gray-400 text-center py-8">Belum ada kunjungan</p>}
    </div>
  );
}
