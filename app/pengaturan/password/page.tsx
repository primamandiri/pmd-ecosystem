"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function UbahPasswordPage() {
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pass !== confirm) { setMsg("Password tidak cocok!"); return; }
    if (pass.length < 6) { setMsg("Password minimal 6 karakter!"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pass });
    if (error) setMsg("Gagal: " + error.message);
    else { setMsg("✅ Password berhasil diubah!"); setPass(""); setConfirm(""); }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-lg font-bold mb-4">🔑 Ubah Password</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="password" placeholder="Password baru" value={pass}
          onChange={(e) => setPass(e.target.value)} required className="w-full p-2 border rounded-lg" />
        <input type="password" placeholder="Konfirmasi password" value={confirm}
          onChange={(e) => setConfirm(e.target.value)} required className="w-full p-2 border rounded-lg" />
        <button type="submit" disabled={loading}
          className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
        {msg && <p className="text-sm text-center">{msg}</p>}
      </form>
    </div>
  );
}
