"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function LaporanPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [area, setArea] = useState("ALL");
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [showEdit, setShowEdit] = useState(false);
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data } = await supabase.from("monthly_reports").select("*").order("no");
    if (data) setData(data);
    setLoading(false);
  }

  const filtered = area === "ALL" ? data.filter(d => d.area === "ALL") : data.filter(d => d.area === area);

  const totals = {
    ta_total: filtered.reduce((s, d) => s + (d.ta_total || 0), 0),
    ta_noo: filtered.reduce((s, d) => s + (d.ta_noo || 0), 0),
    toko_reaktif: filtered.reduce((s, d) => s + (d.toko_reaktif || 0), 0),
    tgt: filtered.reduce((s, d) => s + Number(d.tgt || 0), 0),
    act: filtered.reduce((s, d) => s + Number(d.act || 0), 0),
  };
  const pcp = totals.tgt > 0 ? ((totals.act / totals.tgt) * 100).toFixed(2) : 0;
  const rpKejar = totals.tgt - totals.act;

  const handlePaste = async () => {
    const lines = pasteText.trim().split("\n").filter(l => l.trim());
    if (lines.length < 2) { alert("Paste header + rows dari Excel"); return; }
    const rows = lines.slice(1).map((line, i) => {
      const cols = line.split("\t");
      return {
        bulan: new Date().toISOString().slice(0,7), no: i+1,
        jabatan: cols[1]||"", area: cols[2]||"", nama_sdm: cols[3]||"",
        ta_total: parseInt(cols[4])||0, ta_noo: parseInt(cols[5])||0, toko_reaktif: parseInt(cols[6])||0,
        tgt: parseFloat(cols[7]?.replace(/[Rp. ]/g,"").replace(",","."))||0,
        act: parseFloat(cols[8]?.replace(/[Rp. ]/g,"").replace(",","."))||0,
      };
    });
    const { error } = await supabase.from("monthly_reports").insert(rows);
    if (error) { alert("Error: " + error.message); return; }
    setShowPaste(false); setPasteText(""); loadData();
  };

  const openEdit = (d: any) => { setEditId(d.id); setEditForm({...d}); setShowEdit(true); };
  const saveEdit = async () => { await supabase.from("monthly_reports").update(editForm).eq("id", editId); setShowEdit(false); loadData(); };
  const hapus = async (id: string) => { if (!confirm("Hapus?")) return; await supabase.from("monthly_reports").delete().eq("id", id); loadData(); };

  if (loading) return <div className="p-4 text-center text-gray-400">Loading...</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg font-bold text-blue-800">📊 Laporan Bulanan</h1>
        <button onClick={() => setShowPaste(true)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">📋 Paste Excel</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["ALL","SOC","DIY","SMG","TAB"].map(a => (
          <button key={a} onClick={() => setArea(a)}
            className={`px-3 py-1 rounded-lg text-xs font-medium ${
              area === a ? "bg-blue-600 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}>{a}</button>
        ))}
      </div>

      {filtered.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-40 h-40">
            <div className="w-full h-full rounded-full shadow-inner"
              style={{ background: `conic-gradient(${Number(pcp) >= 100 ? "#22c55e" : "#3b82f6"} 0% ${Math.min(Number(pcp),100)}%, #e5e7eb ${Math.min(Number(pcp),100)}% 100%)` }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 rounded-full w-20 h-20 flex flex-col items-center justify-center shadow">
                <p className={`text-xl font-bold ${Number(pcp) >= 100 ? "text-green-600" : "text-blue-600"}`}>{pcp}%</p>
                <p className="text-[9px] text-gray-400 -mt-0.5">PCP</p>
              </div>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <p><b>Target:</b> Rp {totals.tgt.toLocaleString()}</p>
            <p><b>Aktual:</b> Rp {totals.act.toLocaleString()}</p>
            <p><b>RP Kejar:</b> <span className="text-red-600">Rp {rpKejar.toLocaleString()}</span></p>
            <p className="text-xs text-gray-500">TA: {totals.ta_total} | NOO: {totals.ta_noo} | Reaktif: {totals.toko_reaktif}</p>
            {Number(pcp) >= 100 && <p className="text-green-600 font-bold text-sm">🏆 MVP (100%+)</p>}
          </div>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full text-xs">
          <thead><tr className="bg-blue-50 text-blue-800">
            <th className="p-1.5">NO</th><th className="p-1.5">JABATAN</th><th className="p-1.5">AREA</th>
            <th className="p-1.5">SDM</th><th className="p-1.5">TA</th><th className="p-1.5">NOO</th>
            <th className="p-1.5">REAK</th><th className="p-1.5">TGT</th><th className="p-1.5">ACT</th>
            <th className="p-1.5">PCP</th><th className="p-1.5">KEJAR</th><th className="p-1.5">AKSI</th>
          </tr></thead>
          <tbody>{filtered.map(d => {
            const p = d.tgt > 0 ? ((d.act/d.tgt)*100).toFixed(2) : 0;
            const rp = d.tgt-d.act;
            return (
              <tr key={d.id} className="border-t hover:bg-gray-50">
                <td className="p-1.5 text-center">{d.no}</td>
                <td className="p-1.5">{d.jabatan}</td><td className="p-1.5">{d.area}</td>
                <td className="p-1.5">{d.nama_sdm}</td>
                <td className="p-1.5 text-center">{d.ta_total}</td>
                <td className="p-1.5 text-center">{d.ta_noo}</td>
                <td className="p-1.5 text-center">{d.toko_reaktif}</td>
                <td className="p-1.5 text-right">Rp {Number(d.tgt).toLocaleString()}</td>
                <td className="p-1.5 text-right">Rp {Number(d.act).toLocaleString()}</td>
                <td className="p-1.5 text-center font-medium">{p}%</td>
                <td className="p-1.5 text-right text-red-600">Rp {rp.toLocaleString()}</td>
                <td className="p-1.5">
                  <button onClick={() => openEdit(d)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button onClick={() => hapus(d.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Hapus">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>

      {showPaste && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowPaste(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl space-y-3" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold">📋 Paste dari Excel</h2>
            <p className="text-xs text-gray-400">Copy tabel Excel (Ctrl+C) → paste (Ctrl+V)</p>
            <textarea rows={8} value={pasteText} onChange={e => setPasteText(e.target.value)}
              className="w-full p-3 border rounded-lg font-mono text-sm" placeholder="Paste di sini..." />
            <div className="flex gap-2">
              <button onClick={() => setShowPaste(false)} className="flex-1 p-2 border rounded-lg">Batal</button>
              <button onClick={handlePaste} className="flex-1 p-2 bg-green-600 text-white rounded-lg">Import</button>
            </div>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowEdit(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-3" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold">✏️ Edit</h2>
            {["jabatan","area","nama_sdm","ta_total","ta_noo","toko_reaktif","tgt","act"].map(f => (
              <input key={f} placeholder={f} value={editForm[f]??""}
                onChange={e => setEditForm({...editForm, [f]: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value)})}
                className="w-full p-2 border rounded-lg" />
            ))}
            <div className="flex gap-2">
              <button onClick={() => setShowEdit(false)} className="flex-1 p-2 border rounded-lg">Batal</button>
              <button onClick={saveEdit} className="flex-1 p-2 bg-blue-600 text-white rounded-lg">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
