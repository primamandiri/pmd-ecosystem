"use client";
import { useState, useEffect } from "react";
import { isBiometricAvailable, getSavedBiometric, saveBiometric, removeBiometric, registerBiometric } from "@/lib/biometric";
import { createClient } from "@/lib/supabase";

export default function BiometricPage() {
  const [bioAvailable, setBioAvailable] = useState(false);
  const [saved, setSaved] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    isBiometricAvailable().then(setBioAvailable);
    setSaved(getSavedBiometric());
    supabase.auth.getUser().then(({ data }) => { if (data.user) setUser(data.user); });
  }, []);

  const daftarkan = async () => {
    if (!user) return;
    const ok = await registerBiometric(user.email!, user.email!.split("@")[0]);
    if (ok) {
      saveBiometric({ email: user.email!, name: user.email!.split("@")[0] });
      setSaved({ email: user.email! });
      setMsg("✅ Biometric berhasil didaftarkan!");
    } else setMsg("❌ Gagal");
  };

  const hapus = () => {
    removeBiometric();
    setSaved(null);
    setMsg("✅ Biometric dihapus");
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-base font-bold text-blue-800">🔐 Biometric</h1>

      {!bioAvailable ? (
        <p className="text-sm text-gray-500">Perangkat ini tidak mendukung fingerprint/face ID</p>
      ) : saved ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          <p className="text-sm text-green-600">✅ Biometric terdaftar</p>
          <p className="text-xs text-gray-400">{saved.email}</p>
          <button onClick={hapus} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
            🗑️ Hapus Biometric
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          <p className="text-sm text-gray-600">Daftarkan sidik jari atau face ID untuk login cepat</p>
          <button onClick={daftarkan} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            🔐 Daftarkan Biometric
          </button>
        </div>
      )}

      {msg && <p className="text-xs text-center">{msg}</p>}
    </div>
  );
}
