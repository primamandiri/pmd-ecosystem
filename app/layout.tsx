"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [greeting, setGreeting] = useState("");
  const [time, setTime] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
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

    const updateTime = () => {
      const now = new Date();
      const h = now.getHours();
      const day = now.getDay();
      const peakDays: Record<number, string> = { 1: "Solo Peak Day 🔥", 4: "Solo Peak Day 🔥", 2: "DIY Peak Day 🔥", 5: "DIY Peak Day 🔥", 3: "Semarang Peak Day 🔥", 6: "Semarang Peak Day 🔥" };
      const peak = peakDays[day] || "";
      if (peak) setGreeting(peak);
      else if (h < 11) setGreeting("Selamat Pagi");
      else if (h < 15) setGreeting("Selamat Siang");
      else if (h < 18) setGreeting("Selamat Sore");
      else setGreeting("Selamat Malam");
      setTime(now.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) + " • " + now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => { clearInterval(interval); document.removeEventListener("mousedown", handleClickOutside); };
  }, []);

  const logout = async () => { await supabase.auth.signOut(); window.location.href = "/login"; };

  if (isLogin) return (<html lang="id"><body className="bg-slate-100 antialiased">{children}</body></html>);

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Pengguna";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <html lang="id">
      <body className="bg-slate-100 text-slate-800 antialiased font-sans">
        <div className="flex h-screen overflow-hidden">
          {mobileOpen && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          )}
          <div className={`fixed md:relative inset-y-0 left-0 z-50 h-screen transform transition-transform duration-200 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}>
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
            <header className="bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-2.5 flex items-center gap-3 shrink-0 shadow-md min-h-[52px]">
              <button onClick={() => setMobileOpen(true)}
                className="md:hidden p-1.5 text-white/80 hover:text-white rounded-lg transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-white leading-tight">{greeting || "Selamat datang"}</h2>
                <p className="text-[11px] text-blue-200">{time || "—"}</p>
              </div>
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition">
                  <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-sm">{userInitial}</div>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-800">{displayName}</p>
                      <p className="text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <button onClick={logout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition border-t border-slate-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
