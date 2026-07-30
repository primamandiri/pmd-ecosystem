"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function LacakPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data } = await supabase.from("deliveries").select("*").order("created_at", { ascending: false });
    if (data) setData(data);
    setLoading(false);
  }

  const fmtRp = (v: any) => {
    const n = Number(v || 0);
    return n ? "Rp" + n.toLocaleString("id-ID") : "-";
  };

  const extractTime = (str: string) => {
    if (!str) return "-";
    const m = String(str).match(/\d{2}:\d{2}/);
    return m ? m[0] : str;
  };

  const totalAll = data.reduce((s, d) => s + Number(d.tunai || 0) + Number(d.transfer || 0), 0);

  const kategoriMap: Record<string, number> = {};
  data.forEach(d => {
    const kat = d.kategori || "Lain";
    kategoriMap[kat] = (kategoriMap[kat] || 0) + Number(d.tunai || 0) + Number(d.transfer || 0);
  });

  const armadaMap: Record<string, { prima: number; ecer: number; items: any[] }> = {};
  data.forEach(d => {
    const arm = d.armada || "Tanpa Armada";
    if (!armadaMap[arm]) armadaMap[arm] = { prima: 0, ecer: 0, items: [] };
    const total = Number(d.tunai || 0) + Number(d.transfer || 0);
    if ((d.kategori || "").toLowerCase() === "prima") armadaMap[arm].prima += total;
    else armadaMap[arm].ecer += total;
    armadaMap[arm].items.push(d);
  });

  const groupByDate = (items: any[]) => {
    const groups: Record<string, any[]> = {};
    items.forEach(item => {
      const tgl = item.tanggal || "Tanpa Tgl";
      if (!groups[tgl]) groups[tgl] = [];
      groups[tgl].push(item);
    });
    return groups;
  };

  if (loading) return <div className="p-4 text-center text-gray-400">Loading...</div>;

  return (
    <div className="p-2 md:p-3 max-w-7xl mx-auto space-y-3 text-xs">

      <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-xl px-4 py-3 text-white space-y-0.5">
        <h1 className="text-sm font-bold">🚚 PMD SPK Ekspedisi</h1>
        <p className="text-[10px] text-blue-200">Laporan Keuangan Ekspedisi</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 text-center">
        <p className="text-[9px] text-gray-400">💰 TOTAL ALL</p>
        <p className="text-lg md:text-xl font-bold text-blue-800">{fmtRp(totalAll)}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-50 px-3 py-2 border-b border-blue-100">
          <p className="text-xs font-semibold text-blue-800">📊 PER KATEGORI</p>
        </div>
        <table className="w-full text-xs">
          <thead><tr className="bg-gray-50"><th className="p-2 border text-left text-gray-500 font-medium">Kategori</th><th className="p-2 border text-right text-gray-500 font-medium">Total</th></tr></thead>
          <tbody>
            {Object.entries(kategoriMap).map(([kat, total]) => (
              <tr key={kat} className="hover:bg-blue-50/50">
                <td className="p-2 border font-medium">{kat}</td>
                <td className="p-2 border text-right font-mono text-blue-700">{fmtRp(total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-50 px-3 py-2 border-b border-blue-100">
          <p className="text-xs font-semibold text-blue-800">🚛 PER ARMADA</p>
        </div>
        <table className="w-full text-xs">
          <thead><tr className="bg-gray-50">
            <th className="p-2 border text-left text-gray-500 font-medium">Armada</th>
            <th className="p-2 border text-right text-gray-500 font-medium">Prima</th>
            <th className="p-2 border text-right text-gray-500 font-medium">Ecer</th>
            <th className="p-2 border text-right text-gray-500 font-medium">Total</th>
          </tr></thead>
          <tbody>
            {Object.entries(armadaMap).map(([arm, val]) => (
              <tr key={arm} className="hover:bg-blue-50/50">
                <td className="p-2 border font-medium">{arm}</td>
                <td className="p-2 border text-right font-mono text-green-700">{fmtRp(val.prima)}</td>
                <td className="p-2 border text-right font-mono text-orange-600">{fmtRp(val.ecer)}</td>
                <td className="p-2 border text-right font-mono font-semibold text-blue-800">{fmtRp(val.prima + val.ecer)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold text-blue-800 px-1">📋 DETAIL PENGIRIMAN</p>
        {Object.entries(armadaMap).map(([arm, val]) => {
          const dateGroups = groupByDate(val.items);
          const armTotal = val.prima + val.ecer;
          return Object.entries(dateGroups).map(([tgl, items]) => (
            <div key={arm + tgl} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 px-3 py-2 border-b border-blue-100">
                <p className="text-xs font-semibold text-blue-800">
                  📅 {tgl} &nbsp;🚛 {arm} &nbsp;({items.length} kiriman) — <span className="text-blue-700">{fmtRp(armTotal)}</span>
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] md:text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500">
                      <th className="p-1.5 border whitespace-nowrap">Tgl</th>
                      <th className="p-1.5 border whitespace-nowrap">Jam</th>
                      <th className="p-1.5 border whitespace-nowrap">Kat</th>
                      <th className="p-1.5 border text-left">Toko</th>
                      <th className="p-1.5 border whitespace-nowrap">Driver</th>
                      <th className="p-1.5 border whitespace-nowrap">Byr</th>
                      <th className="p-1.5 border text-right">Tunai</th>
                      <th className="p-1.5 border text-right">Transfer</th>
                      <th className="p-1.5 border text-left md:table-cell hidden">Ket</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((d: any, i: number) => (
                      <tr key={i} className="hover:bg-blue-50/30 border-b border-gray-50">
                        <td className="p-1.5 border whitespace-nowrap text-gray-600">{d.tanggal || "-"}</td>
                        <td className="p-1.5 border whitespace-nowrap text-gray-600">{extractTime(d.jam)}</td>
                        <td className="p-1.5 border whitespace-nowrap">
                          <span className={`px-1 py-0.5 rounded text-[9px] font-medium ${
                            (d.kategori || "").toLowerCase() === "prima" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600"
                          }`}>{d.kategori || "-"}</span>
                        </td>
                        <td className="p-1.5 border font-medium max-w-[120px] truncate" title={d.nama_toko}>{d.nama_toko || "-"}</td>
                        <td className="p-1.5 border whitespace-nowrap">{d.nama_driver || "-"}</td>
                        <td className="p-1.5 border whitespace-nowrap">
                          <span className={`px-1 py-0.5 rounded text-[9px] font-medium ${
                            d.bayar === "Ya" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>{d.bayar || "-"}</span>
                        </td>
                        <td className="p-1.5 border text-right font-mono text-green-700">{Number(d.tunai) ? fmtRp(d.tunai) : "-"}</td>
                        <td className="p-1.5 border text-right font-mono text-blue-700">{Number(d.transfer) ? fmtRp(d.transfer) : "-"}</td>
                        <td className="p-1.5 border text-gray-400 max-w-[100px] truncate md:table-cell hidden" title={d.keterangan}>{d.keterangan || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ));
        })}
      </div>

      <p className="text-[9px] text-gray-400 text-center pb-4">{data.length} data terkirim dari spreadsheet</p>
    </div>
  );
}
