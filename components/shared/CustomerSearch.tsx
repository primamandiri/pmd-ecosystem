"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

interface CustomerSearchProps {
  onSelect: (customer: any) => void;
}

export default function CustomerSearch({ onSelect }: CustomerSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("customers")
        .select("*")
        .ilike("name", `%${query}%`)
        .limit(10);
      if (data) setResults(data);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1">Nama Toko</label>
      <input type="text" placeholder="Cari toko..." value={query}
        onChange={(e) => { setQuery(e.target.value); setShow(true); }}
        className="w-full p-2 border rounded-lg text-sm" />

      {show && results.length > 0 && (
        <div className="absolute z-10 bg-white border rounded-lg mt-1 w-full shadow max-h-40 overflow-y-auto">
          {results.map((r) => (
            <button key={r.id} onClick={() => { onSelect(r); setQuery(r.name); setShow(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b last:border-0">
              {r.name} <span className="text-gray-400 text-[10px]">({r.area})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
