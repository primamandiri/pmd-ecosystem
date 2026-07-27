"use client";

interface CamCaptureProps {
  onCapture: (file: File) => void;
  front?: boolean;
}

export default function CamCapture({ onCapture, front }: CamCaptureProps) {
  return (
    <div className="flex gap-2">
      <label className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200 cursor-pointer">
        📸 Kamera
        <input type="file" accept="image/*"
          capture={front ? "user" : "environment"}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onCapture(f); e.target.value = ""; }}
          className="hidden" />
      </label>
      <label className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 cursor-pointer">
        📁 Galeri
        <input type="file" accept="image/*"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onCapture(f); e.target.value = ""; }}
          className="hidden" />
      </label>
    </div>
  );
}
