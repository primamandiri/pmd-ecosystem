"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function MingguanPage() {
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
    const { data } = await supabase.from("weekly_reports").select("*").order("no");
    if (data) setData(data);
    setLoading(false);
  }

  const areas = [...new Set(data.map(d => d.area).filter(Boolean))];
  const filtered = area === "ALL" ? data : data.filter(d => d.area === area);

  const chartData = {
    m1: filtered.reduce((s, d) => s + Number(d.act_m1 || 0), 0),
    m2: filtered.reduce((s, d) => s + Number(d.act_m2 || 0), 0),
    m3: filtered.reduce((s, d) => s + Number(d.act_m3 || 0), 0),
    m4: filtered.reduce((s, d) => s + Number(d.act_m4 || 0), 0),
    m5: filtered.reduce((s, d) => s + Number(d.act_m5 || 0), 0),
  };
  const maxAct = Math.max(...Object.values(chartData), 1);

  const handlePaste = async () => {
    const lines = pasteText.trim().split("\n").filter(l => l.trim());
    if (lines.length < 2) { alert("Paste header + data dari Excel"); return; }
    const rows = lines.slice(1).map((line, i) => {
      const cols = line.split("\t");
      return {
        no: i + 1,
        jabatan: cols[1] || "",
        area: cols[2] || "",
        nama_sdm: cols[3] || "",
        tgt_per_minggu: parseFloat(cols[4]?.replace(/[Rp. ]/g,"").replace(",",".")) || 0,
        act_m1: parseFloat(cols[5]?.replace(/[Rp. ]/g,"").replace(",",".")) || 0,
        act_m2: parseFloat(cols[7]?.replace(/[Rp. ]/g,"").replace(",",".")) || 0,
        act_m3: parseFloat(cols[9]?.replace(/[Rp. ]/g,"").replace(",",".")) || 0,
        act_m4: parseFloat(cols[11]?.replace(/[Rp. ]/g,"").replace(",",".")) || 0,
        act_m5: parseFloat(cols[13]?.replace(/[Rp. ]/g,"").replace(",",".")) || 0,
      };
    });
    const { error } = await supabase.from("weekly_reports").insert(rows);
    if (error) { alert("Error: " + error.message); return; }
    setShowPaste(false); setPasteText(""); loadData();
  };

  const openEdit = (d: any) => { setEditId(d.id); setEditForm({...d}); setShowEdit(true); };
  const saveEdit = async () => { await supabase.from("weekly_reports").update(editForm).eq("id", editId); setShowEdit(false); loadData(); };
  const hapus = async (id: string) => { if (!confirm("Hapus?")) return; await supabase.from("weekly_reports").delete().eq("id", id); loadData(); };

  if (loading) return <div className="p-4 text-center text-gray-400">Loading...</div>;

  const fmt = (v: any) => { const n = Number(v || 0); return n === 0 ? "0" : "Rp" + n.toLocaleString("id-ID"); };
  const pct = (act: any, tgt: any) => { const a = Number(act || 0); const t = Number(tgt || 0); return t > 0 ? Math.round((a/t)*100) : 0; };

  return (
    <div className="p-3 max-w-6xl mx-auto space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-sm font-bold text-blue-800">📊 Laporan Mingguan</h1>
        <button onClick={() => setShowPaste(true)}
          className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">📋 Paste</button>
      </div>

      {/* Filter */}
      <div className="flex gap-1 flex-wrap">
        <button onClick={() => setArea("ALL")}
          className={`px-2.5 py-1 rounded text-[10px] font-medium ${area === "ALL" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>ALL</button>
        {areas.map(a => (
          <button key={a} onClick={() => setArea(a)}
            className={`px-2.5 py-1 rounded text-[10px] font-medium ${area === a ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>{a}</button>
        ))}
      </div>

      {/* Grafik */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs font-medium text-gray-600 mb-3">📈 ACT per Minggu - {area}</p>
          <div className="flex items-end gap-3 h-40">
            {[
              { label: "M1", val: chartData.m1 },
              { label: "M2", val: chartData.m2 },
              { label: "M3", val: chartData.m3 },
              { label: "M4", val: chartData.m4 },
              { label: "M5", val: chartData.m5 },
            ].map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[8px] text-gray-400">{fmt(m.val)}</span>
                <div className="w-full bg-blue-100 rounded-t relative" style={{ height: "100%" }}>
                  <div className="absolute bottom-0 w-full bg-blue-500 rounded-t transition-all" style={{ height: `${(m.val/maxAct)*100}%` }} />
                </div>
                <span className="text-[9px] font-medium">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabel */}
      {filtered.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
          <table className="w-full text-[9px] table-fixed">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-0.5 py-1 text-left w-[2%]">No</th>
                <th className="px-0.5 py-1 text-left w-[7%]">Jab</th>
                <th className="px-0.5 py-1 text-left w-[4%]">Area</th>
                <th className="px-0.5 py-1 text-left w-[10%]">Nama</th>
                <th className="px-0.5 py-1 text-right w-[9%]">TGT/MGG</th>
                <th className="px-0.5 py-1 text-right w-[9%]">M1</th>
                <th className="px-0.5 py-1 text-right w-[4%]">%</th>
                <th className="px-0.5 py-1 text-right w-[9%]">M2</th>
                <th className="px-0.5 py-1 text-right w-[4%]">%</th>
                <th className="px-0.5 py-1 text-right w-[9%]">M3</th>
                <th className="px-0.5 py-1 text-right w-[4%]">%</th>
                <th className="px-0.5 py-1 text-right w-[9%]">M4</th>
                <th className="px-0.5 py-1 text-right w-[4%]">%</th>
                <th className="px-0.5 py-1 text-right w-[9%]">M5</th>
                <th className="px-0.5 py-1 text-right w-[4%]">%</th>
                <th className="px-0.5 py-1 text-center w-[3%]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((d: any) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-0.5 py-1 text-gray-500">{d.no}</td>
                  <td className="px-0.5 py-1 truncate">{d.jabatan}</td>
                  <td className="px-0.5 py-1">{d.area}</td>
                  <td className="px-0.5 py-1 truncate">{d.nama_sdm}</td>
                  <td className="px-0.5 py-1 text-right font-medium">{fmt(d.tgt_per_minggu)}</td>
                  <td className="px-0.5 py-1 text-right">{fmt(d.act_m1)}</td>
                  <td className={`px-0.5 py-1 text-right font-medium ${pct(d.act_m1,d.tgt_per_minggu)>=100?"text-green-600":""}`}>{pct(d.act_m1,d.tgt_per_minggu)}%</td>
                  <td className="px-0.5 py-1 text-right">{fmt(d.act_m2)}</td>
                  <td className={`px-0.5 py-1 text-right font-medium ${pct(d.act_m2,d.tgt_per_minggu)>=100?"text-green-600":""}`}>{pct(d.act_m2,d.tgt_per_minggu)}%</td>
                  <td className="px-0.5 py-1 text-right">{fmt(d.act_m3)}</td>
                  <td className={`px-0.5 py-1 text-right font-medium ${pct(d.act_m3,d.tgt_per_minggu)>=100?"text-green-600":""}`}>{pct(d.act_m3,d.tgt_per_minggu)}%</td>
                  <td className="px-0.5 py-1 text-right">{fmt(d.act_m4)}</td>
                  <td className={`px-0.5 py-1 text-right font-medium ${pct(d.act_m4,d.tgt_per_minggu)>=100?"text-green-600":""}`}>{pct(d.act_m4,d.tgt_per_minggu)}%</td>
                  <td className="px-0.5 py-1 text-right">{fmt(d.act_m5)}</td>
                  <td className={`px-0.5 py-1 text-right font-medium ${pct(d.act_m5,d.tgt_per_minggu)>=100?"text-green-600":""}`}>{pct(d.act_m5,d.tgt_per_minggu)}%</td>
                  <td className="px-0.5 py-1 text-center">
                    <button onClick={() => openEdit(d)} className="text-blue-600 mr-1">✏️</button>
                    <button onClick={() => hapus(d.id)} className="text-red-600">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="text-xs text-gray-400 text-center py-8">Belum ada data</p>}

      {/* Modal Paste */}
      {showPaste && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-lg space-y-2">
            <p className="text-sm font-medium">📋 Paste dari Excel</p>
            <textarea value={pasteText} onChange={e => setPasteText(e.target.value)}
              className="w-full h-32 border rounded-lg p-2 text-xs font-mono" />
            <div className="flex gap-2">
              <button onClick={() => setShowPaste(false)} className="flex-1 p-2 border rounded text-xs">Batal</button>
              <button onClick={handlePaste} className="flex-1 p-2 bg-blue-600 text-white rounded text-xs">Import</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-md space-y-2 max-h-[80vh] overflow-y-auto">
            <p className="text-sm font-medium">✏️ Edit Data</p>
            {["jabatan","area","nama_sdm","tgt_per_minggu","act_m1","act_m2","act_m3","act_m4","act_m5"].map(f => (
              <input key={f} placeholder={f} value={editForm[f]??""}
                onChange={e => setEditForm({...editForm, [f]: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value)})}
                className="w-full p-2 border rounded text-xs" />
            ))}
            <div className="flex gap-2">
              <button onClick={() => setShowEdit(false)} className="flex-1 p-2 border rounded text-xs">Batal</button>
              <button onClick={saveEdit} className="flex-1 p-2 bg-blue-600 text-white rounded text-xs">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
