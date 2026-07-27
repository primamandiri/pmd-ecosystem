"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import CamCapture from "@/components/shared/CamCapture";
import { uploadToCloudinary } from "@/lib/cloudinary";

const ALASAN = ["Pemilik tidak ada di toko", "Stok masih cukup", "Kalah harga",
  "Harga masih dipelajari", "Janji order dengan admin", "Masih ada piutang", "Penjualan toko menurun"];

export default function SPKPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState("Mendapatkan lokasi...");
  const [q, setQ] = useState("");
  const [hasil, setHasil] = useState<any[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [ketemu, setKetemu] = useState("Owner");
  const [bayar, setBayar] = useState("");
  const [nominal, setNominal] = useState("");
  const [metode, setMetode] = useState("Titip sales");
  const [janji, setJanji] = useState("");
  const [order, setOrder] = useState("");
  const [catatanOrder, setCatatanOrder] = useState("");
  const [alasan, setAlasan] = useState("");
  const [tren, setTren] = useState("");
  const [ket, setKet] = useState("");
  const [fotoFiles, setFotoFiles] = useState<File[]>([]);
  const [fotoPrev, setFotoPrev] = useState<string[]>([]);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePrev, setSelfiePrev] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
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

  useEffect(() => {
    if (q.length < 2) { setHasil([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase.from("customers").select("*").ilike("name", `%${q}%`).limit(10);
      if (data) setHasil(data);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const handleFoto = (file: File) => {
    if (fotoFiles.length >= 2) { setMsg("Maks 2 foto"); return; }
    setFotoFiles(p => [...p, file]);
    setFotoPrev(p => [...p, URL.createObjectURL(file)]);
  };

  const handleSelfie = (file: File) => { setSelfieFile(file); setSelfiePrev(URL.createObjectURL(file)); };

  const submit = async () => {
    if (!customer) { setMsg("❌ Pilih toko!"); return; }
    if (!selfieFile) { setMsg("❌ Foto selfie wajib!"); return; }
    if (!lat || !lng) { setMsg("❌ GPS belum aktif!"); return; }
    if (order === "T" && !alasan) { setMsg("❌ Pilih alasan tidak order!"); return; }
    setLoading(true); setMsg("");
    try {
      const fotoUrls = await Promise.all(fotoFiles.map(f => uploadToCloudinary(f, "spk-foto")));
      const selfieUrl = await uploadToCloudinary(selfieFile, "spk-selfie");
      const now = new Date();
      const payload: any = {
        user_id: user.id, name: profile?.display_name || user.email?.split("@")[0],
        date: now.toISOString().slice(0, 10),
        time: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }),
        latitude: lat, longitude: lng, customer_id: customer.id, customer_name: customer.name,
        ketemu, tren, keterangan: ket, foto_urls: fotoUrls, selfie_url: selfieUrl,
      };
      if (bayar === "Y") { payload.bayar = "Y"; payload.nominal_bayar = parseInt(nominal.replace(/[^0-9]/g,""))||0; payload.metode_bayar = metode; }
      else if (bayar === "T") { payload.bayar = "T"; payload.janji_bayar = janji; }
      else if (bayar === "N") { payload.bayar = "N"; }
      if (order === "Y") { payload.order = "Y"; payload.catatan_order = catatanOrder; }
      else if (order === "T") { payload.order = "T"; payload.alasan_order = alasan; }
      const { error } = await supabase.from("spk_visits").insert(payload);
      if (error) throw error;
      setMsg("✅ SPK berhasil!");
      router.push("/aktivitas");
    } catch (e: any) { setMsg("❌ Gagal: " + e.message); }
    setLoading(false);
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-base font-bold text-blue-800 mb-3">📝 SPK Sales</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y">
        {/* Header Sales */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400">Sales</p>
            <p className="text-sm font-semibold text-gray-800">{profile?.display_name || "Memuat..."}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] ${gpsStatus.includes("✅") ? "text-green-600" : "text-orange-500"}`}>
              📍{gpsStatus.includes("✅") ? (lat?.toFixed(4)+","+lng?.toFixed(4)) : "..."}
            </span>
          </div>
        </div>

        {/* Cari Toko */}
        <div className="px-4 py-3 space-y-3">
          <div className="relative">
            <p className="text-xs font-medium text-gray-600 mb-1">🏪 Cari Toko</p>
            <input type="text" placeholder="Ketik nama toko..." value={q}
              onChange={e => { setQ(e.target.value); setCustomer(null); }}
              className="w-full p-2 border rounded-lg text-sm bg-gray-50" />
            {hasil.length > 0 && !customer && (
              <div className="absolute z-10 bg-white border rounded-lg mt-1 w-full shadow max-h-40 overflow-y-auto">
                {hasil.map(r => (
                  <button key={r.id} onClick={() => { setCustomer(r); setQ(r.name); setHasil([]); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b text-gray-700">
                    {r.name} <span className="text-gray-400 text-[10px]">({r.area})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {customer && <p className="text-xs text-green-700">✅ {customer.name}</p>}

          {/* Ketemu */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Ketemu</p>
            <select value={ketemu} onChange={e => setKetemu(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-gray-50">
              <option>Owner</option><option>PIC</option><option>Karyawan</option><option>Keluarga</option>
            </select>
          </div>

          {/* Bayar - 3 pilihan */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Bayar</p>
            <div className="grid grid-cols-3 gap-1">
              {["Y","T","N"].map(b => (
                <button key={b} onClick={() => setBayar(b)}
                  className={`py-2 rounded-lg text-xs font-medium ${bayar === b ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                  {b === "Y" ? "💰 Bayar" : b === "T" ? "📅 Janji" : "🚫 N/A"}
                </button>
              ))}
            </div>
          </div>
          {bayar === "Y" && (
            <div className="grid grid-cols-2 gap-2 p-2 bg-yellow-50 rounded-lg">
              <input type="text" placeholder="Rp" value={nominal} onChange={e => setNominal(e.target.value)}
                className="p-2 border rounded text-sm" />
              <select value={metode} onChange={e => setMetode(e.target.value)} className="p-2 border rounded text-sm">
                <option>Titip sales</option><option>Transfer</option>
              </select>
            </div>
          )}
          {bayar === "T" && (
            <div className="p-2 bg-yellow-50 rounded-lg">
              <input type="date" value={janji} onChange={e => setJanji(e.target.value)}
                className="w-full p-2 border rounded text-sm" />
            </div>
          )}

          {/* Order - 2 pilihan */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Order</p>
            <div className="grid grid-cols-2 gap-1">
              {["Y","T"].map(o => (
                <button key={o} onClick={() => setOrder(o)}
                  className={`py-2 rounded-lg text-xs font-medium ${order === o ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                  {o === "Y" ? "✅ Ya" : "❌ Tidak"}
                </button>
              ))}
            </div>
          </div>
          {order === "Y" && (
            <div className="p-2 bg-green-50 rounded-lg">
              <textarea placeholder="Catatan order..." value={catatanOrder}
                onChange={e => setCatatanOrder(e.target.value)} className="w-full p-2 border rounded text-sm" rows={2} />
            </div>
          )}
          {order === "T" && (
            <div className="p-2 bg-red-50 rounded-lg">
              <select value={alasan} onChange={e => setAlasan(e.target.value)} className="w-full p-2 border rounded text-sm">
                <option value="">-- Alasan --</option>
                {ALASAN.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          )}

          {/* Trend */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Trend</p>
            <textarea value={tren} onChange={e => setTren(e.target.value)}
              className="w-full p-2 border rounded text-sm bg-gray-50" rows={2} />
          </div>

          {/* Keterangan */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Keterangan</p>
            <textarea value={ket} onChange={e => setKet(e.target.value)}
              className="w-full p-2 border rounded text-sm bg-gray-50" rows={2} />
          </div>

          {/* Foto */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">📸 Foto ({fotoFiles.length}/2)</p>
            <CamCapture onCapture={handleFoto} />
            <div className="flex gap-2 mt-2">
              {fotoPrev.map((p,i) => <img key={i} src={p} className="w-16 h-16 object-cover rounded border" />)}
            </div>
          </div>

          {/* Selfie */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">🤳 Selfie</p>
            <CamCapture onCapture={handleSelfie} front />
            {selfiePrev && <img src={selfiePrev} className="w-20 h-20 object-cover rounded mt-2 mx-auto border" />}
          </div>
        </div>

        {/* Submit */}
        <div className="px-4 py-3">
          <button onClick={submit} disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Mengirim..." : "📩 Kirim SPK"}
          </button>
          {msg && <p className="text-xs text-center mt-2">{msg}</p>}
        </div>
      </div>
    </div>
  );
}
