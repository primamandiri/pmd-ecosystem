"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import ExportExcel from "@/components/ExportExcel";

export default function HistoryAbsensiPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg font-bold text-blue-800">📋 History Absensi</h1>
        <ExportExcel
          data={data}
          columns={[
            { key: "created_at", label: "Tanggal" },
            { key: "name", label: "Nama" },
            { key: "status", label: "Status" },
            { key: "latitude", label: "Latitude" },
            { key: "longitude", label: "Longitude" },
          ]}
          filename="history_absensi"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-blue-50 text-blue-800">
              <th className="p-2 border text-left">Tanggal</th>
              <th className="p-2 border text-left">Nama</th>
              <th className="p-2 border text-left">Status</th>
              <th className="p-2 border text-left">Lokasi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-400">Belum ada data</td></tr>
            ) : data.map((d, i) => (
              <tr key={d.id || i} className="hover:bg-gray-50">
                <td className="p-2 border">{d.created_at ? new Date(d.created_at).toLocaleString("id-ID") : "-"}</td>
                <td className="p-2 border font-medium">{d.name || "-"}</td>
                <td className="p-2 border">{d.status || "-"}</td>
                <td className="p-2 border">
                  {d.latitude ? (
                    <a href={`https://maps.google.com/?q=${d.latitude},${d.longitude}`} target="_blank"
                      className="text-blue-500 hover:underline text-[10px]">
                      📍 {d.latitude}, {d.longitude}
                    </a>
                  ) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
