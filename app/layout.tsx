"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [greeting, setGreeting] = useState("");
  const [now, setNow] = useState(new Date());
  const isLogin = pathname === "/login";

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) supabase.from("profiles").select("display_name").eq("id", data.user.id).single()
        .then(({ data: p }) => { if (p) setProfile(p); });
    });
    const h = new Date().getHours();
    if (h < 11) setGreeting("Selamat Pagi");
    else if (h < 15) setGreeting("Selamat Siang");
    else if (h < 18) setGreeting("Selamat Sore");
    else setGreeting("Selamat Malam");
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (isLogin) return <html lang="id"><body>{children}</body></html>;

  return (
    <html lang="id">
      <body className="bg-blue-50/30">
        <div className="flex h-screen overflow-hidden">
          {mobileOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}
          <div className={`fixed md:static inset-y-0 left-0 z-50 transform transition-transform ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            <header className="bg-white/80 backdrop-blur border-b border-blue-100 px-4 py-2 flex items-center gap-3 shrink-0">
              <button onClick={() => setMobileOpen(true)} className="md:hidden text-xl text-blue-600">☰</button>
              <div className="flex items-center gap-3 flex-1">
                <img src="/logoPMD.png" alt="" className="w-8 h-8 object-contain md:hidden"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-800 truncate">
                    {greeting}, {profile?.display_name || "User"}
                  </p>
                  <p className="text-xs text-blue-400">
                    {now.toLocaleDateString("id-ID", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
                    {" • "}{now.toLocaleTimeString("id-ID")}
                  </p>
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-auto bg-blue-50/20">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
