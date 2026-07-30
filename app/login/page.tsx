"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { getSavedBiometric, saveBiometric, removeBiometric, authenticateWithBiometric, registerBiometric } from "@/lib/biometric";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [savedBio, setSavedBio] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const saved = getSavedBiometric();
    if (saved) { setEmail(saved.email); setSavedBio(saved); }
    document.title = "PMD Ecosystem";
  }, []);

  const login = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) { setMsg("❌ Email dan password wajib diisi"); return; }
    setLoading(true); setMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setMsg("❌ " + error.message); setLoading(false); return; }
    saveBiometric({ email, token: btoa(password) });
    window.location.href = "/home";
  };

  const bioLogin = async () => {
    const saved = getSavedBiometric();
    if (!saved || !saved.token) { setMsg("❌ Belum simpan"); return; }
    setMsg("🔐 Verifikasi biometric...");
    setLoading(true);
    const ok = await authenticateWithBiometric();
    if (!ok) { setMsg("❌ Biometric gagal"); setLoading(false); return; }
    const pwd = atob(saved.token);
    const { error } = await supabase.auth.signInWithPassword({ email: saved.email, password: pwd });
    if (error) { setMsg("❌ " + error.message); setLoading(false); return; }
    window.location.href = "/home";
  };

  const toggleSave = () => {
    if (savedBio) { removeBiometric(); setSavedBio(null); setMsg("✅ Data login dihapus"); }
    else {
      if (!email || !password) { setMsg("❌ Isi email & password dulu"); return; }
      registerBiometric().then(ok => {
        saveBiometric({ email, token: btoa(password) });
        setSavedBio({ email, token: btoa(password) });
        setMsg(ok ? "✅ Biometric tersimpan!" : "✅ Tersimpan (biometric tidak didukung perangkat)");
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <img src="/logoPMD.png" alt="Logo" className="w-16 h-16 mx-auto object-contain mb-2"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <h1 className="text-lg font-bold text-blue-800">PMD Ecosystem</h1>
          <p className="text-xs text-gray-400">CV Prima Mandiri Distribusi</p>
        </div>

        {savedBio ? (
          <div className="space-y-3">
            <p className="text-sm text-center text-gray-600">Masuk sebagai</p>
            <p className="text-sm font-semibold text-center text-blue-800">{savedBio.email}</p>
            <button onClick={bioLogin} disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2">
              🔐 Biometric
            </button>
            <button onClick={() => { setSavedBio(null); setEmail(""); setPassword(""); }}
              className="w-full py-2 text-xs text-gray-400 hover:text-gray-600">
              Ganti akun
            </button>
            <button onClick={toggleSave} className="w-full py-1 text-[10px] text-red-400 hover:text-red-600">
              Hapus data login
            </button>
          </div>
        ) : (
          <form onSubmit={login} className="space-y-3">
            <input type="email" placeholder="Email" value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" required />
            <input type="password" placeholder="Password" value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" required />
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? "Memproses..." : "Masuk"}
            </button>
            <button type="button" onClick={toggleSave}
              className="w-full py-2 text-xs text-blue-600 hover:text-blue-800">
              💾 Simpan Biometric
            </button>
            {msg && <p className="text-xs text-center">{msg}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
