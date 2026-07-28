"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else router.push("/home");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm space-y-5">
        <div className="text-center space-y-2">
          <img src="/logoPMD.png" alt="Logo" className="w-20 h-20 mx-auto object-contain rounded-xl"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <h1 className="text-xl font-bold text-blue-700">PMD Ecosystem</h1>
          <p className="text-xs text-gray-400">CV Prima Mandiri Distribusi</p>
        </div>
        {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded text-center">{error}</p>}
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 border rounded-lg" />
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 border rounded-lg" />
        <button type="submit" disabled={loading}
          className="w-full p-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Loading..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
