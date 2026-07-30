"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import ExportExcel from "@/components/ExportExcel";

export default function HistoryAbsensiPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.from("attendance").select("*").order("created_at", { ascending: false }).then(({ data: d }) => {
      if (d) setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-4 text-center text-gray-400">Loading...</div>;

  return (
    <div className="p-3 max-w-5xl mx-auto space-y-3">
      {preview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <img src={preview} alt="selfie" className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg font-bold text-blue-800">📋 History Absensi</h1>
        <ExportExcel
          data={data}
          columns={[
            { key: "created_at", label: "Tanggal" },
            { key: "name", label: "Nama" },
            { key: "type", label: "Tipe" },
          ]}
          filename="history_absensi"
        />
      </div>

      <div className="space-y-2">
        {data.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Belum ada data</p>
        ) : data.map((d, i) => (
          <div key={d.id || i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex gap-3 items-center">
            {d.selfie_url ? (
              <img src={d.selfie_url} alt="selfie" className="w-12 h-12 rounded-full object-cover border cursor-pointer hover:opacity-80"
                onClick={() => setPreview(d.selfie_url)} onError={(e: any) => e.target.style.display = "none"} />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{d.name || "-"}</p>
              <p className="text-[10px] text-gray-400">{d.created_at ? new Date(d.created_at).toLocaleString("id-ID") : "-"}</p>
              <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium ${
                d.type === "pulang" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}>{d.type === "pulang" ? "Pulang" : "Berangkat"}</span>
            </div>
            {d.latitude && (
              <a href={`https://maps.google.com/?q=${d.latitude},${d.longitude}`} target="_blank"
                className="text-blue-500 hover:underline shrink-0 text-xs">📍</a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
