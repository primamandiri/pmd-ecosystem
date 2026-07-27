"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function TambahNOOPage() {
  const [form, setForm] = useState({ name: "", phone: "", address: "", area: "Solo" });
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { alert("Nama toko harus diisi!"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("customers").insert({ ...form, category: "NOO" });
    if (error) { alert("Gagal: " + error.message); setSubmitting(false); return; }
    setSubmitting(false);
    setShowModal(true);
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">➕ Tambah NOO</h1>
      <p className="text-sm text-gray-500">New Outlet Opportunity — pelanggan baru</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <select value={form.area} onChange={(e) => setForm({...form, area: e.target.value})}
          className="w-full p-3 border rounded-lg">
          <option>Solo</option><option>DIY</option><option>Semarang</option><option>LAIN</option>
        </select>
        <input type="text" placeholder="Nama Toko *" value={form.name} required
          onChange={(e) => setForm({...form, name: e.target.value})} className="w-full p-3 border rounded-lg" />
        <input type="text" placeholder="No. HP" value={form.phone}
          onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full p-3 border rounded-lg" />
        <textarea placeholder="Alamat" value={form.address}
          onChange={(e) => setForm({...form, address: e.target.value})} className="w-full p-3 border rounded-lg" rows={3} />
        <button type="submit" disabled={submitting}
          className="w-full p-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
          {submitting ? "Menyimpan..." : "💾 Simpan"}
        </button>
      </form>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center space-y-4"
            onClick={(e) => e.stopPropagation()}>
            <div className="text-6xl">✅</div>
            <h2 className="text-xl font-bold">NOO Berhasil!</h2>
            <p className="text-gray-500">Pelanggan <b>{form.name}</b> sudah ditambahkan</p>
            <button onClick={() => {
              setShowModal(false);
              setForm({ name: "", phone: "", address: "", area: "Solo" });
            }} className="w-full p-3 bg-blue-600 text-white rounded-lg font-medium">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
