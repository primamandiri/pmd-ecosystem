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

  const maxOmset = Math.max(...bulanArr.map(b => b.omset), 1);
  const targetBln = 5800000000;
  const targetThn = targetBln * 12;
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
  const pctBln = (omset: number) => targetBln > 0 ? ((omset / targetBln) * 100).toFixed(1) : "0";

  return (
    <div className="p-3 max-w-6xl mx-auto space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-sm font-bold text-blue-800">📈 Grafik Tahunan</h1>
        <div className="flex items-center gap-2">
          <select value={tahun} onChange={e => setTahun(parseInt(e.target.value))}
            className="p-1 border rounded text-xs bg-white">
            {[2024,2025,2026,2027].map(t => <option key={t}>{t}</option>)}
          </select>
          <button onClick={() => setShowPaste(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs">📋 Paste</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-[9px] text-gray-400">Total Omset</p>
          <p className="text-sm font-bold text-blue-700">{fmt(totalOmset)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-[9px] text-gray-400">Target {tahun}</p>
          <p className="text-sm font-bold text-orange-600">{fmt(targetThn)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-[9px] text-gray-400">Pencapaian</p>
          <p className={`text-sm font-bold ${Number(pcp)>=100?"text-green-600":"text-gray-800"}`}>{pcp}%</p>
        </div>
      </div>

      {data.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
          <svg viewBox="0 0 600 200" className="w-full h-auto" style={{maxHeight:"220px"}}>
            <line x1="50" y1={185 - (targetBln/maxOmset)*145} x2="590" y2={185 - (targetBln/maxOmset)*145}
              stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,3" />
            <text x="590" y={185 - (targetBln/maxOmset)*145 - 3} textAnchor="end" className="text-[7px]" fill="#f59e0b">
              Target {fmt(targetBln)}/bln
            </text>
            {[0,1,2,3].map(i => (
              <line key={i} x1="50" y1={25+i*40} x2="590" y2={25+i*40} stroke="#f0f0f0" strokeWidth="1" />
            ))}
            {(() => {
              const stepX = 540 / 11;
              const getY = (v: number) => 185 - (v / maxOmset) * 145;
              const pts = bulanArr.map((b, i) => ({ x: 50 + i * stepX, y: getY(b.omset) }));
              const dLine = pts.map((p, i) => `${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
              return (
                <>
                  <path d={dLine + ` L${pts[11].x},185 L50,185 Z`} fill="#3b82f6" fillOpacity="0.06" />
                  <path d={dLine} stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinejoin="round" />
                  {pts.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="3" fill="#3b82f6" stroke="white" strokeWidth="1.5" />
                      <text x={p.x} y={p.y - 8} textAnchor="middle" className="text-[6px]" fill="#2563eb" fontWeight="bold">
                        {fmt(bulanArr[i].omset)}
                      </text>
                      <text x={p.x} y="197" textAnchor="middle" className="text-[7px]" fill="#666">{bulanArr[i].label}</text>
                    </g>
                  ))}
                </>
              );
            })()}
          </svg>
        </div>
      )}

      {data.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
          <table className="w-full text-[10px] table-fixed">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="p-1.5 text-left w-[12%]">Bulan</th>
                <th className="p-1.5 text-right w-[38%]">Omset</th>
                <th className="p-1.5 text-right w-[25%]">Target/Bln</th>
                <th className="p-1.5 text-right w-[25%]">% Capai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bulanArr.map((b, i) => {
                const pct = pctBln(b.omset);
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-1.5 font-medium">{b.label}</td>
                    <td className="p-1.5 text-right">{fmt(b.omset)}</td>
                    <td className="p-1.5 text-right text-gray-400">{fmt(targetBln)}</td>
                    <td className={`p-1.5 text-right font-medium ${Number(pct)>=100?"text-green-600":""}`}>{pct}%</td>
                  </tr>
                );
              })}
              <tr className="bg-blue-50 font-bold text-blue-800">
                <td className="p-1.5">TOTAL</td>
                <td className="p-1.5 text-right">{fmt(totalOmset)}</td>
                <td className="p-1.5 text-right">{fmt(targetThn)}</td>
                <td className={`p-1.5 text-right ${Number(pcp)>=100?"text-green-600":""}`}>{pcp}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-gray-400 text-center py-8">Belum ada data. Klik "Paste"</p>
      )}

      {showPaste && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-lg space-y-2">
            <p className="text-sm font-medium">📋 Paste data {tahun}</p>
            <p className="text-[9px] text-gray-400">Copy dari Excel: Bulan (tab) Omset</p>
            <textarea value={pasteText} onChange={e => setPasteText(e.target.value)}
              className="w-full h-28 border rounded-lg p-2 text-xs font-mono" />
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
