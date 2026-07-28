"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [profile, setProfile] = useState<any>(null);
  const [greeting, setGreeting] = useState("");
  const [date, setDate] = useState("");
  const [stats, setStats] = useState({ absensi:0, spk:0, aktif:0, noo:0, reaktif:0 });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 11) setGreeting("Selamat Pagi");
    else if (h < 15) setGreeting("Selamat Siang");
    else if (h < 18) setGreeting("Selamat Sore");
    else setGreeting("Selamat Malam");
    setDate(new Date().toLocaleDateString("id-ID", { weekday:"long", day:"numeric", month:"long", year:"numeric" }));

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      const { data: p } = await supabase.from("profiles").select("display_name").eq("id", data.user.id).single();
      if (p) setProfile(p);

      const today = new Date().toISOString().slice(0,10);
      const { count: a } = await supabase.from("attendance").select("*", { count:"exact", head:true }).eq("date", today);
      const { count: s } = await supabase.from("spk_visits").select("*", { count:"exact", head:true }).eq("date", today);
      const { data: monthly } = await supabase.from("monthly_reports").select("ta_total, ta_noo, toko_reaktif").eq("area", "ALL");
     const sum = (arr: any[] | null, key: string) => arr?.reduce((s, r) => s + (Number(r[key]) || 0), 0) || 0;
      setStats({ absensi: a||0, spk: s||0, aktif: sum(monthly, "ta_total"), noo: sum(monthly, "ta_noo"), reaktif: sum(monthly, "toko_reaktif") });
    });
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-lg font-bold text-blue-800">{greeting}, {profile?.display_name || "User"}! 👋</h1>
        <p className="text-xs text-gray-400">{date}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.absensi}</p>
          <p className="text-xs text-gray-500 mt-1">Absensi Hari Ini</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.spk}</p>
          <p className="text-xs text-gray-500 mt-1">SPK Hari Ini</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{stats.aktif}</p>
          <p className="text-xs text-gray-500 mt-1">Toko Aktif</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.noo}</p>
          <p className="text-xs text-gray-500 mt-1">Toko NOO</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{stats.reaktif}</p>
          <p className="text-xs text-gray-500 mt-1">Toko Reaktif</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => router.push("/absensi")}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left hover:bg-blue-100">
          <p className="text-sm font-medium text-blue-700">📋 Absensi</p>
          <p className="text-xs text-blue-500 mt-1">Absen berangkat / pulang</p>
        </button>
        <button onClick={() => router.push("/spk")}
          className="bg-green-50 border border-green-200 rounded-xl p-4 text-left hover:bg-green-100">
          <p className="text-sm font-medium text-green-700">📝 SPK Sales</p>
          <p className="text-xs text-green-500 mt-1">Laporan kunjungan sales</p>
        </button>
        <button onClick={() => router.push("/aktivitas")}
          className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-left hover:bg-purple-100">
          <p className="text-sm font-medium text-purple-700">📍 Aktivitas</p>
          <p className="text-xs text-purple-500 mt-1">Riwayat kunjungan</p>
        </button>
        <button onClick={() => router.push("/dashboard/laporan")}
          className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-left hover:bg-orange-100">
          <p className="text-sm font-medium text-orange-700">📊 Laporan</p>
          <p className="text-xs text-orange-500 mt-1">Lihat laporan bulanan</p>
        </button>
      </div>
    </div>
  );
}
