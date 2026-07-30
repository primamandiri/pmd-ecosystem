"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { isBiometricAvailable, getSavedBiometric, saveBiometric, removeBiometric, authenticateWithBiometric, registerBiometric } from "@/lib/biometric";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [bioAvailable, setBioAvailable] = useState(false);
  const [savedBio, setSavedBio] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    isBiometricAvailable().then(setBioAvailable);
    const saved = getSavedBiometric();
    if (saved) { setSavedBio(saved); setEmail(saved.email); }
  }, []);

  const login = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) { setMsg("❌ Email dan password wajib diisi"); return; }
    setLoading(true); setMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setMsg("❌ " + error.message); setLoading(false); return; }
    window.location.href = "/home";
  };

  const bioLogin = async () => {
    if (!savedBio) return;
    setMsg("🔐 Verifikasi sidik jari...");
    try {
      const ok = await authenticateWithBiometric();
      if (ok) {
        setPassword("");
        setMsg("✅ Berhasil! Mengisi email...");
        setEmail(savedBio.email);
        setTimeout(() => login(), 500);
      } else setMsg("❌ Verifikasi gagal");
    } catch { setMsg("❌ Biometric tidak tersedia"); }
  };

  const enableBiometric = async () => {
    if (!email || !password) { setMsg("❌ Login dulu dengan email & password"); return; }
    const ok = await registerBiometric(email, email.split("@")[0]);
    if (ok) {
      saveBiometric({ email, name: email.split("@")[0] });
      setSavedBio({ email, name: email.split("@")[0] });
      setMsg("✅ Biometric berhasil didaftarkan!");
    } else setMsg("❌ Gagal daftarkan biometric");
  };

  const disableBiometric = () => {
    removeBiometric();
    setSavedBio(null);
    setMsg("✅ Biometric dihapus");
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

        {savedBio && bioAvailable ? (
          <div className="space-y-3">
            <p className="text-sm text-center text-gray-600">Selamat datang kembali</p>
            <p className="text-sm font-medium text-center">{savedBio.email}</p>
            <button onClick={bioLogin} disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2">
              🔐 Login dengan Sidik Jari
            </button>
            <button onClick={() => { setSavedBio(null); setEmail(""); setPassword(""); }}
              className="w-full py-2 text-xs text-gray-400 hover:text-gray-600">
              Gunakan email lain
            </button>
            <button onClick={disableBiometric} className="w-full py-1 text-[10px] text-red-400 hover:text-red-600">
              Hapus biometric
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

            {bioAvailable && email && (
              <button type="button" onClick={enableBiometric}
                className="w-full py-2 text-xs text-blue-600 hover:text-blue-800">
                🔐 Ingat perangkat ini (Fingerprint/Face ID)
              </button>
            )}

            {msg && <p className="text-xs text-center">{msg}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
