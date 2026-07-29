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
  const [online, setOnline] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isLogin = pathname === "/login";
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = "/login"; return; }
      setUser(data.user);
      const { data: p } = await supabase.from("profiles").select("display_name").eq("id", data.user.id).single();
      if (p) setProfile(p);
    });

    const updateTime = () => {
      const now = new Date();
      const day = now.getDay();
      const areas = ["", "Solo", "DIY", "Semarang", "Solo", "DIY", "Semarang"];
      setGreeting(`${areas[day]} Peak Day🔥`);
      setTime(
        now.toLocaleDateString("id-ID", { weekday:"short", day:"numeric", month:"short", year:"numeric" }) +
        " • " + now.toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit", hour12:false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);

    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (isLogin) return <html lang="id"><body className="bg-slate-100 antialiased">{children}</body></html>;

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Pengguna";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <html lang="id">
      <body className="bg-slate-100 text-slate-800 antialiased font-sans">
        {/* Offline Banner */}
        {!online && (
          <div className="bg-red-500 text-white text-center text-xs py-1.5 font-medium">
            ⚠️ Koneksi internet terputus — beberapa fitur mungkin tidak berfungsi
          </div>
        )}

        <div className="flex h-screen overflow-hidden">
          {mobileOpen && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
              onClick={() => setMobileOpen(false)} />
          )}

          <div className={`fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}>
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>

          <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
            <header className="header-gradient px-4 py-2 flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileOpen(true)}
                  className="md:hidden p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                  aria-label="Open Menu">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h2 className="text-sm font-semibold text-white leading-tight">
                    {greeting ? `${greeting}, ${displayName}` : "Selamat datang"}
                  </h2>
                  <p className="text-[11px] text-white/80 font-medium">{time || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white/60 w-48 lg:w-64">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input type="text" placeholder="Cari menu, transaksi..."
                    className="bg-transparent text-white outline-none w-full placeholder:text-white/40" />
                </div>

                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 p-1 rounded-full hover:bg-white/10 transition focus:outline-none">
                    <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {userInitial}
                    </div>
                    <svg className="w-4 h-4 text-white/60 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-xs">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="font-semibold text-slate-800">{displayName}</p>
                        <p className="text-slate-400 truncate">{user?.email}</p>
                      </div>
                      <a href="/pengaturan/password"
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Pengaturan Profil
                      </a>
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
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
