"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function DataTokoPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [edit, setEdit] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", area: "Solo", category: "Existing" });
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data } = await supabase.from("customers").select("*").order("name");
    if (data) setData(data);
    setLoading(false);
  }

  const filtered = data.filter(d => d.name?.toLowerCase().includes(search.toLowerCase()));
  const openAdd = () => { setForm({ name:"", phone:"", address:"", area:"Solo", category:"Existing" }); setEdit(null); setShowModal(true); };
  const openEdit = (d: any) => { setForm({ name:d.name, phone:d.phone||"", address:d.address||"", area:d.area, category:d.category }); setEdit(d.id); setShowModal(true); };
  const save = async () => { if (!form.name) { alert("Nama harus diisi!"); return; } if (edit) await supabase.from("customers").update(form).eq("id", edit); else await supabase.from("customers").insert(form); setShowModal(false); loadData(); };
  const hapus = async (id: string) => { if (!confirm("Hapus?")) return; await supabase.from("customers").delete().eq("id", id); loadData(); };

  const EI = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>;
  const DI = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>;
  const PI = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>;

  if (loading) return <div className="p-4 text-center text-gray-400">Loading...</div>;

  return (
    <div className="p-3 max-w-5xl mx-auto space-y-2">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-bold text-blue-800">🏪 Data Toko</h1>
        <button onClick={openAdd} className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] hover:bg-blue-700 flex items-center gap-1"><PI /> Tambah</button>
      </div>

      <input type="text" placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)}
        className="w-full p-1.5 border rounded text-xs" />

      <p className="text-[9px] text-gray-400">{filtered.length} toko</p>

      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
        <table className="w-full text-[10px] table-fixed">
          <thead><tr className="bg-blue-50 text-blue-800">
            <th className="px-1 py-0.5 text-left w-[35%]">Nama</th>
            <th className="px-1 py-0.5 text-left w-[8%]">Area</th>
            <th className="px-1 py-0.5 text-left w-[15%]">HP</th>
            <th className="px-1 py-0.5 text-left w-[30%] hidden md:table-cell">Alamat</th>
            <th className="px-1 py-0.5 text-left w-[7%]">Kat</th>
            <th className="px-1 py-0.5 text-center w-[5%]">Aksi</th>
          </tr></thead>
          <tbody>{filtered.map(d => (
            <tr key={d.id} className="border-t hover:bg-gray-50">
              <td className="px-1 py-0.5 font-medium truncate">{d.name}</td>
              <td className="px-1 py-0.5 truncate">{d.area}</td>
              <td className="px-1 py-0.5 truncate">{d.phone || "-"}</td>
              <td className="px-1 py-0.5 text-gray-500 truncate hidden md:table-cell">{d.address || "-"}</td>
              <td className="px-1 py-0.5 truncate">{d.category}</td>
              <td className="px-1 py-0.5 text-center whitespace-nowrap">
                <button onClick={() => openEdit(d)} className="p-0.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><EI /></button>
                <button onClick={() => hapus(d.id)} className="p-0.5 text-red-600 hover:bg-red-50 rounded" title="Hapus"><DI /></button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-4 w-full max-w-sm space-y-2" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-sm">{edit ? "✏️ Edit" : "➕ Tambah"} Toko</h2>
            <select value={form.area} onChange={e => setForm({...form,area:e.target.value})} className="w-full p-1.5 border rounded text-xs">
              <option>Solo</option><option>DIY</option><option>Semarang</option><option>TAB</option>
            </select>
            <input placeholder="Nama Toko" value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="w-full p-1.5 border rounded text-xs" />
            <input placeholder="No HP" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} className="w-full p-1.5 border rounded text-xs" />
            <textarea placeholder="Alamat" value={form.address} onChange={e => setForm({...form,address:e.target.value})} className="w-full p-1.5 border rounded text-xs" rows={2} />
            <select value={form.category} onChange={e => setForm({...form,category:e.target.value})} className="w-full p-1.5 border rounded text-xs">
              <option>Existing</option><option>NOO</option>
            </select>
            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 p-1.5 border rounded text-xs">Batal</button>
              <button onClick={save} className="flex-1 p-1.5 bg-blue-600 text-white rounded text-xs">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
