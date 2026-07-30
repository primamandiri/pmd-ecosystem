"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { Camera, Upload } from "lucide-react";

export default function ProfilPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUser(data.user);
        const { data: p } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
        if (p) { setProfile(p); setDisplayName(p.display_name || ""); setAvatar(p.avatar_url || ""); }
      }
    });
  }, []);

  const uploadAvatar = async (file: File) => {
    if (!file) return;
    setLoading(true); setMsg("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/" + process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME + "/image/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.secure_url) {
        setAvatar(data.secure_url);
        await supabase.from("profiles").upsert({ id: user.id, avatar_url: data.secure_url });
        setMsg("✅ Foto profil berhasil diupload");
      }
    } catch { setMsg("❌ Gagal upload"); }
    setLoading(false);
  };

  const saveProfile = async () => {
    setLoading(true); setMsg("");
    const { error } = await supabase.from("profiles").upsert({ id: user.id, display_name: displayName, avatar_url: avatar });
    if (error) setMsg("❌ " + error.message);
    else setMsg("✅ Profil tersimpan");
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-base font-bold text-blue-800">👤 Pengaturan Profil</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-blue-200"
                onError={(e: any) => e.target.style.display = "none"} />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                {displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <button onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow hover:bg-blue-700">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
          {loading && <p className="text-xs text-gray-400">Uploading...</p>}
        </div>

        {/* Nama */}
        <div>
          <label className="text-xs text-gray-400">Nama Tampilan</label>
          <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm mt-1" placeholder="Nama kamu" />
        </div>

        {/* Email */}
        <div>
          <label className="text-xs text-gray-400">Email</label>
          <p className="text-sm font-medium mt-1">{user?.email || "-"}</p>
        </div>

        <button onClick={saveProfile} disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Menyimpan..." : "Simpan Profil"}
        </button>

        {msg && <p className="text-xs text-center">{msg}</p>}
      </div>
    </div>
  );
}
