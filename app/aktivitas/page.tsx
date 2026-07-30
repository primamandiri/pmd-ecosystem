"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import ExportExcel from "@/components/ExportExcel";
import ModalDetailVisit from "@/components/ModalDetailVisit";

export default function AktivitasPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [filterSales, setFilterSales] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [detail, setDetail] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data } = await supabase.from("spk_visits").select("*").order("created_at", { ascending: false });
    if (data) setData(data);
    setLoading(false);
  }

  const filteredData = data.filter(d => {
    const tgl = d.created_at?.split("T")[0] || "";
    if (filterDate && tgl !== filterDate) return false;
    if (filterSales && !(d.name || "").toLowerCase().includes(filterSales.toLowerCase())) return false;
    if (filterArea && d.area !== filterArea) return false;
    return true;
  });

  const salesList = [...new Set(data.map(d => d.name).filter(Boolean))] as string[];
  const areaList = [...new Set(data.map(d => d.area).filter(Boolean))] as string[];

  const grouped = filteredData.reduce((acc: any, item: any) => {
    const date = item.created_at?.split("T")[0] || "Tanpa Tanggal";
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const fmt = (v: any) => { if (!v) return "-"; try { return new Date(v).toLocaleString("id-ID"); } catch { return v; } };

  if (loading) return <div className="p-4 text-center text-gray-400">Loading...</div>;

  return (
    <div className="p-3 max-w-5xl mx-auto space-y-3">
      <ModalDetailVisit open={!!detail} onClose={() => setDetail(null)} data={detail} />

      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg font-bold text-blue-800">📋 Aktivitas Sales</h1>
        <ExportExcel
          data={filteredData}
          columns={[
            { key: "created_at", label: "Tanggal" },
            { key: "name", label: "Nama Sales" },
            { key: "customer_name", label: "Nama Toko" },
            { key: "area", label: "Area" },
            { key: "status", label: "Status" },
          ]}
          filename="aktivitas_sales"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
          className="p-2 border rounded-lg text-xs" />
        <select value={filterSales} onChange={e => setFilterSales(e.target.value)}
          className="p-2 border rounded-lg text-xs bg-white">
          <option value="">Semua Sales</option>
          {salesList.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterArea} onChange={e => setFilterArea(e.target.value)}
          className="p-2 border rounded-lg text-xs bg-white">
          <option value="">Semua Area</option>
          {areaList.map(a => <option key={a}>{a}</option>)}
        </select>
      </div>

      <p className="text-[10px] text-gray-400">{filteredData.length} data</p>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-center text-gray-400 py-8">Belum ada data</p>
      ) : Object.entries(grouped).map(([date, items]: any) => (
        <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 space-y-2">
          <p className="text-xs font-semibold text-blue-700">📅 {fmt(date)}</p>
          {items.map((d: any, i: number) => (
            <div key={d.id || i} className="flex gap-3 items-start border-b border-gray-50 pb-3 last:border-0 last:pb-0">
              {/* Foto Selfie Thumbnail */}
              {d.selfie_url && (
                <img src={d.selfie_url} alt="selfie"
                  className="w-14 h-14 rounded-lg object-cover shrink-0 border"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{d.customer_name || "-"}</p>
                <p className="text-[10px] text-gray-500">{d.name} · {d.area}</p>
                <p className="text-[10px] text-gray-400">{d.status || "-"}</p>
                {d.latitude && (
                  <a href={`https://maps.google.com/?q=${d.latitude},${d.longitude}`} target="_blank"
                    className="text-[9px] text-blue-500 hover:underline">📍 Lihat Map</a>
                )}
              </div>
              {/* Tombol Detail */}
              <button onClick={() => setDetail(d)}
                className="px-2.5 py-1 text-[10px] bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 shrink-0">
                Detail
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
