"use client";

export default function ModalDetailVisit({ open, onClose, data }: any) {
  if (!open || !data) return null;

  const skip = ["id", "user_id", "updated_at", "created_at", "customer_id"];
  const labelMap: any = {
    name: "Sales", customer_name: "Toko", nama_toko: "Toko",
    area: "Area", status: "Status", bayar: "Bayar",
    tunai: "Tunai", transfer: "Transfer", type_byr: "Tipe",
    order: "Order", notes: "Keterangan", keterangan: "Ket",
    trend: "Trend", alasan: "Alasan", address: "Alamat",
    latitude: "Lat", longitude: "Lng", noo: "NOO",
  };

  const fmt = (v: any) => {
    if (!v) return "";
    if (String(Number(v)) !== "NaN" && v !== true) return Number(v).toLocaleString("id-ID");
    return v;
  };

  const isImgUrl = (s: string) => typeof s === "string" && (s.startsWith("http://") || s.startsWith("https://"));

  let photoUrls: string[] = [];
  let textRows: { label: string; val: string }[] = [];

  Object.entries(data).forEach(([key, val]: any) => {
    if (skip.includes(key)) return;
    if (!val || val === "null" || val === "undefined") return;

    if (typeof val === "string" && isImgUrl(val)) { photoUrls.push(val); return; }
    if (Array.isArray(val)) { val.forEach((v: any) => { if (typeof v === "string" && isImgUrl(v)) photoUrls.push(v); }); return; }
    if (typeof val === "string") {
      try { JSON.parse(val).forEach((v: any) => { if (typeof v === "string" && isImgUrl(v)) photoUrls.push(v); }); return; } catch {}
    }

    const label = labelMap[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
    textRows.push({ label, val: fmt(val) });
  });

  const selfieUrl = data.selfie_url || null;
  const stockUrls = selfieUrl ? photoUrls.filter((u: string) => u !== selfieUrl) : photoUrls;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-2" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-sm w-full max-h-[90vh] overflow-y-auto" onClick={(e: any) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-3 py-2 flex justify-between items-center z-10">
          <span className="text-xs font-bold text-blue-800">Detail SPK</span>
          <button onClick={onClose} className="text-lg leading-none text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <div className="p-3 space-y-2 text-xs">

          {selfieUrl && (
            <div className="flex justify-center">
              <img src={selfieUrl} alt="" className="w-20 h-20 rounded-lg object-cover border"
                onError={(e: any) => e.target.style.display = "none"} />
            </div>
          )}

          {textRows.map((r, i) => r.val && (
            <div key={i} className="flex gap-2">
              <span className="text-gray-400 w-16 shrink-0">{r.label}</span>
              <span className="font-medium">{r.val}</span>
            </div>
          ))}

          {stockUrls.length > 0 && (
            <div className={`grid gap-1.5 pt-2 border-t border-gray-100 ${
              stockUrls.length === 1 ? "grid-cols-1 justify-items-center" :
              stockUrls.length === 2 ? "grid-cols-2" : "grid-cols-3"
            }`}>
              {stockUrls.map((url: string, i: number) => (
                <img key={i} src={url} alt=""
                  className={`${stockUrls.length === 1 ? "w-40" : "w-full"} h-20 object-cover rounded-lg border cursor-pointer hover:opacity-80`}
                  onClick={() => window.open(url, "_blank")}
                  onError={(e: any) => e.target.style.display = "none"} />
              ))}
            </div>
          )}

          {(data.latitude || data.lat) && (
            <a href={`https://maps.google.com/?q=${data.latitude || data.lat},${data.longitude || data.lng || ""}`}
              target="_blank" className="block text-[9px] text-blue-500 text-center pt-2 border-t">📍 Buka Map</a>
          )}

        </div>
      </div>
    </div>
  );
}
