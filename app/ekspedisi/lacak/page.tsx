"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function LacakPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data } = await supabase.from("deliveries").select("*").order("created_at", { ascending: false });
    if (data) setData(data);
    setLoading(false);
  }

  const filtered = data.filter(d =>
    d.nama_driver?.toLowerCase().includes(filter.toLowerCase()) ||
    d.nama_toko?.toLowerCase().includes(filter.toLowerCase())
  );

  const fmtRp = (v: any) => {
    const n = Number(v||0);
    return n ? "Rp" + n.toLocaleString("id-ID") : "-";
  };

  if (loading) return <div className="p-4 text-center text-gray-400">Loading...</div>;

  return (
    <div className="p-3 max-w-6xl mx-auto space-y-3">
      <h1 className="text-sm font-bold text-blue-800">🚚 Lacak Pengiriman</h1>

      <input type="text" placeholder="Cari driver atau toko..." value={filter}
        onChange={e => setFilter(e.target.value)}
        className="w-full p-2 border rounded-lg text-xs" />

      <div className="overflow-x-auto">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr className="bg-blue-50 text-blue-800">
              <th className="p-1.5 border text-left">Tgl</th>
              <th className="p-1.5 border text-left">Jam</th>
              <th className="p-1.5 border text-left">Driver</th>
              <th className="p-1.5 border text-left">Toko</th>
              <th className="p-1.5 border text-left">Armada</th>
              <th className="p-1.5 border text-left">Bayar</th>
              <th className="p-1.5 border text-right">Tunai</th>
              <th className="p-1.5 border text-right">Transfer</th>
              <th className="p-1.5 border text-left">Ket</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="p-4 text-center text-gray-400">Belum ada data</td></tr>
            ) : filtered.map((d, i) => (
              <tr key={d.id || i} className="hover:bg-gray-50">
                <td className="p-1.5 border">{d.tanggal || "-"}</td>
                <td className="p-1.5 border">{d.jam || "-"}</td>
                <td className="p-1.5 border font-medium">{d.nama_driver || "-"}</td>
                <td className="p-1.5 border">{d.nama_toko || "-"}</td>
                <td className="p-1.5 border">{d.armada || "-"}</td>
                <td className="p-1.5 border">{d.bayar || d.type_byr || "-"}</td>
                <td className="p-1.5 border text-right font-mono">{fmtRp(d.tunai)}</td>
                <td className="p-1.5 border text-right font-mono">{fmtRp(d.transfer)}</td>
                <td className="p-1.5 border text-xs max-w-[100px] truncate">{d.keterangan || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[9px] text-gray-400 text-center">
        {filtered.length} data · sumber: Google Spreadsheet (FORM2)
      </p>
    </div>
  );
}
