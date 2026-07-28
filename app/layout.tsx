"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [greeting, setGreeting] = useState("");
  const [time, setTime] = useState("");
  const isLogin = pathname === "/login";
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUser(data.user);
        const { data: p } = await supabase.from("profiles").select("display_name").eq("id", data.user.id).single();
        if (p) setProfile(p);
      }
    });
    const h = new Date().getHours();
    if (h < 11) setGreeting("Selamat Pagi");
    else if (h < 15) setGreeting("Selamat Siang");
    else if (h < 18) setGreeting("Selamat Sore");
    else setGreeting("Selamat Malam");
    setTime(new Date().toLocaleDateString("id-ID") + " - " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }));
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (isLogin) return <html lang="id"><body>{children}</body></html>;

  return (
    <html lang="id">
      <body className="bg-gray-50">
        <div className="flex h-screen overflow-hidden">
          {mobileOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}
          <div className={`fixed md:static inset-y-0 left-0 z-50 transform transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            <header className="bg-white border-b shadow-sm px-4 py-2 flex items-center gap-3 shrink-0">
              <button onClick={() => setMobileOpen(true)} className="md:hidden text-xl text-gray-600">☰</button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{greeting}, {profile?.display_name || user?.email?.split("@")[0] || "User"}</p>
                <p className="text-xs text-gray-400">{time}</p>
              </div>
              <button onClick={logout} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600">🚪 Logout</button>
            </header>
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
