"use client";
import { useRef, useState, useCallback } from "react";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  mirrored?: boolean;
}

export default function CameraCapture({ onCapture, mirrored = true }: CameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onCapture(file);
  }, [onCapture]);

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" capture="environment"
        onChange={handleFile} className="hidden" />
      <button onClick={() => inputRef.current?.click()}
        className="px-4 py-2 bg-gray-100 border rounded-lg text-sm hover:bg-gray-200">
        📸 Ambil Foto
      </button>
      {preview && (
        <img src={preview} alt="Preview"
          className={`w-24 h-24 object-cover rounded-lg mt-2 ${mirrored ? "" : ""}`} />
      )}
    </div>
  );
}
