"use client";
import { useState, useEffect } from "react";
import { getSavedBiometric, saveBiometric, removeBiometric, registerBiometric } from "@/lib/biometric";
import { createClient } from "@/lib/supabase";

export default function BiometricPage() {
  const [saved, setSaved] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    setSaved(getSavedBiometric());
    supabase.auth.getUser().then(({ data }) => { if (data.user) setUser(data.user); });
  }, []);

  const daftarkan = async () => {
    const bio = getSavedBiometric();
    if (!bio || !bio.token) { setMsg("❌ Login dulu dengan email & password"); return; }
    const ok = await registerBiometric(bio.email);
    if (ok) setMsg("✅ Biometric berhasil didaftarkan! Next login cukup fingerprint");
    else setMsg("❌ Gagal");
  };

  const hapus = () => {
    removeBiometric();
    setSaved(null);
    setMsg("✅ Biometric & password dihapus");
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-base font-bold text-blue-800">🔐 Biometric</h1>
      {saved ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          <p className="text-sm text-green-600">✅ Biometric aktif</p>
          <p className="text-xs text-gray-400">{saved.email}</p>
          <button onClick={daftarkan} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            🔐 Daftarkan Fingerprint
          </button>
          <button onClick={hapus} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 ml-2">
            🗑️ Hapus
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Login dulu dengan email & password, nanti otomatis tersimpan</p>
        </div>
      )}
      {msg && <p className="text-xs text-center">{msg}</p>}
    </div>
  );
}
