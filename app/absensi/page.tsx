"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import CamCapture from "@/components/shared/CamCapture";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function AbsensiPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [type, setType] = useState("berangkat");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [gpsStatus, setGpsStatus] = useState("Mendapatkan lokasi...");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUser(data.user);
        const { data: p } = await supabase.from("profiles").select("display_name").eq("id", data.user.id).single();
        if (p) setProfile(p);
      }
    });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); setGpsStatus("✅ GPS aktif"); },
        () => setGpsStatus("❌ Aktifkan GPS"),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleSelfie = (file: File) => { setSelfieFile(file); setSelfiePreview(URL.createObjectURL(file)); };

  const submit = async () => {
    if (!selfieFile) { setMsg("❌ Foto selfie wajib!"); return; }
    if (!lat || !lng) { setMsg("❌ GPS belum aktif!"); return; }
    setLoading(true); setMsg("");
    try {
      const selfieUrl = await uploadToCloudinary(selfieFile, "selfie");
      const now = new Date();
      const { error } = await supabase.from("attendance").insert({
        user_id: user.id, name: profile?.display_name || user.email?.split("@")[0],
        date: now.toISOString().slice(0, 10),
        time: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }),
        type, latitude: lat, longitude: lng, selfie_url: selfieUrl,
      });
      if (error) throw error;
      setMsg("✅ Absen berhasil!");
      setSelfieFile(null); setSelfiePreview(null);
    } catch (e: any) { setMsg("❌ Gagal: " + e.message); }
    setLoading(false);
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID");
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-base font-bold text-blue-800 mb-3">📋 Absensi</h1>

      {/* Card Utama */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400">Sales</p>
            <p className="text-sm font-semibold text-gray-800">{profile?.display_name || "Memuat..."}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400">{dateStr}</p>
            <p className="text-sm font-bold text-blue-600">{timeStr}</p>
          </div>
        </div>

        {/* GPS */}
        <div className="px-4 py-2 flex items-center gap-2">
          <span className="text-base">📍</span>
          <span className={`text-xs ${gpsStatus.includes("✅") ? "text-green-600" : "text-orange-500"}`}>{gpsStatus}</span>
          {lat && lng && (
            <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank"
              className="text-[9px] text-blue-500 underline ml-auto">{lat.toFixed(4)}, {lng.toFixed(4)}</a>
          )}
        </div>

        {/* Type + Selfie */}
        <div className="px-4 py-3 space-y-3">
          <select value={type} onChange={e => setType(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm bg-gray-50">
            <option value="berangkat">🚀 Berangkat</option>
            <option value="pulang">🏁 Pulang</option>
          </select>

          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">🤳 Selfie</p>
            <CamCapture onCapture={handleSelfie} front />
            {selfiePreview && (
              <img src={selfiePreview} className="w-20 h-20 object-cover rounded-lg mt-2 mx-auto border" />
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="px-4 py-3">
          <button onClick={submit} disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Mengirim..." : `✅ Absen ${type === "berangkat" ? "Berangkat" : "Pulang"}`}
          </button>
          {msg && <p className="text-xs text-center mt-2">{msg}</p>}
        </div>
      </div>
    </div>
  );
}
