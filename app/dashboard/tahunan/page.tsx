"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function TahunanPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tahun, setTahun] = useState(2026);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const supabase = createClient();

  useEffect(() => { loadData(); }, [tahun]);

  async function loadData() {
    const { data } = await supabase.from("annual_charts").select("*").eq("tahun", tahun).order("bulan");
    if (data) setData(data);
    setLoading(false);
  }

  const bulanArr = Array.from({ length: 12 }, (_, i) => {
    const d = data.find(x => x.bulan === i + 1);
    return { label: ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"][i], omset: d?.omset || 0 };
  });

  const targetBln = 5800000000;
  const targetThn = targetBln * 12;
  const maxOmset = Math.max(...bulanArr.map(b => b.omset), targetBln * 1.3);
  const totalOmset = bulanArr.reduce((s, b) => s + b.omset, 0);
  const pcp = targetThn > 0 ? ((totalOmset / targetThn) * 100).toFixed(2) : 0;

  const handlePaste = async () => {
    const lines = pasteText.trim().split("\n").filter(l => l.trim());
    if (lines.length < 2) { alert("Paste dari Excel"); return; }
    const rows = lines.slice(1).map((line, i) => {
      const cols = line.split("\t");
      return { tahun, bulan: i + 1, omset: parseFloat(cols[1]?.replace(/[Rp. ]/g,"").replace(",",".")) || 0 };
    });
    await supabase.from("annual_charts").delete().eq("tahun", tahun);
    const { error } = await supabase.from("annual_charts").insert(rows);
    if (error) { alert("Error: " + error.message); return; }
    setShowPaste(false); setPasteText(""); loadData();
  };

  if (loading) return <div className="p-4 text-center text-gray-400">Loading...</div>;

  const fmt = (v: any) => { const n = Number(v||0); return "Rp" + n.toLocaleString("id-ID"); };
  const fmtPendek = (v: any) => { const n = Number(v||0); return "Rp" + (n / 1000000000).toFixed(1) + "M"; };
  const pctBln = (omset: number) => targetBln > 0 ? ((omset / targetBln) * 100).toFixed(1) : "0";

  const w = 900, h = 320;
  const pad = { top: 30, right: 20, bottom: 35, left: 100 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;
  const scaleY = (v: number) => pad.top + ch - (v / maxOmset) * ch;
  const targetY = scaleY(targetBln);
  const points = bulanArr.map((b, i) => `${pad.left + (i + 0.5) * (cw / 12)},${scaleY(b.omset)}`).join(" ");

  return (
    <div className="p-3 max-w-6xl mx-auto space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-sm font-bold text-blue-800">📈 Grafik Tahunan</h1>
        <div className="flex items-center gap-2">
          <select value={tahun} onChange={e => setTahun(parseInt(e.target.value))}
            className="p-1 border rounded text-xs bg-white">{[2024,2025,2026,2027].map(t => <option key={t}>{t}</option>)}</select>
          <button onClick={() => setShowPaste(true)} className="px-3 py-1 bg-blue-600 text-white rounded text-xs">📋 Paste</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-[9px] text-gray-400">Total Omset</p>
          <p className="text-sm font-bold text-blue-800">{fmt(totalOmset)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-[9px] text-gray-400">Target Tahun</p>
          <p className="text-sm font-bold text-orange-600">{fmt(targetThn)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-[9px] text-gray-400">Pencapaian</p>
          <p className="text-sm font-bold text-green-600">{pcp}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map(r => {
            const y = scaleY(maxOmset * r);
            return (<g key={r}>
              <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x={pad.left - 8} y={y + 4} textAnchor="end" className="text-[9px]" fill="#6b7280">{fmtPendek(maxOmset * r)}</text>
            </g>);
          })}
          <line x1={pad.left} y1={targetY} x2={w - pad.right} y2={targetY} stroke="#f97316" strokeWidth="3" strokeDasharray="6,3" />
          <rect x={w - pad.right - 55} y={targetY - 12} width="55" height="14" rx="3" fill="#f97316" />
          <text x={w - pad.right - 27} y={targetY + 2} textAnchor="middle" className="text-[8px]" fill="white" fontWeight="bold">TARGET</text>
          <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          {bulanArr.map((b, i) => {
            const x = pad.left + (i + 0.5) * (cw / 12);
            const y = scaleY(b.omset);
            return (<g key={i}>
              <circle cx={x} cy={y} r="5" fill="#2563eb" stroke="white" strokeWidth="2" />
              <text x={x} y={pad.top + ch + 16} textAnchor="middle" className="text-[9px] font-medium" fill="#374151">{b.label}</text>
              {b.omset > 0 && <>
                <rect x={x - 35} y={y - 20} width="70" height="14" rx="3" fill="#1e40af" opacity="0.9" />
                <text x={x} y={y - 10} textAnchor="middle" className="text-[7px]" fill="white" fontWeight="bold">{fmtPendek(b.omset)}</text>
              </>}
            </g>);
          })}
        </svg>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="bg-blue-50 text-blue-800">
            <th className="p-2 border">Bulan</th>
            {bulanArr.map((b, i) => <th key={i} className="p-2 border text-right">{b.label}</th>)}
          </tr></thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="p-2 border font-medium">Omset</td>
              {bulanArr.map((b, i) => <td key={i} className="p-2 border text-right font-mono">{fmt(b.omset)}</td>)}
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-2 border font-medium">% Target</td>
              {bulanArr.map((b, i) => (
                <td key={i} className={`p-2 border text-right font-mono ${Number(pctBln(b.omset)) >= 100 ? "text-green-600 font-bold" : "text-orange-500"}`}>
                  {pctBln(b.omset)}%
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {showPaste && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowPaste(false)}>
          <div className="bg-white rounded-xl p-4 max-w-sm w-full space-y-2" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-medium">📋 Paste data {tahun}</p>
            <p className="text-[9px] text-gray-400">Copy dari Excel: Bulan (tab) Omset</p>
            <textarea value={pasteText} onChange={e => setPasteText(e.target.value)} className="w-full h-28 border rounded-lg p-2 text-xs font-mono" />
            <div className="flex gap-2">
              <button onClick={() => setShowPaste(false)} className="flex-1 p-2 border rounded text-xs">Batal</button>
              <button onClick={handlePaste} className="flex-1 p-2 bg-blue-600 text-white rounded text-xs">Import</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
