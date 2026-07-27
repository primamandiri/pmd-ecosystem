"use client";
import { useState } from "react";

interface PhotoUploaderProps {
  onUpload: (file: File) => void;
  max?: number;
  current?: number;
}

export default function PhotoUploader({ onUpload, max = 2, current = 0 }: PhotoUploaderProps) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (current >= max) { alert(`Maksimal ${max} foto`); return; }
    onUpload(file);
  };

  return (
    <div>
      <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" id="photo-upload" />
      <label htmlFor="photo-upload" className="inline-block px-4 py-2 bg-gray-100 border rounded-lg text-sm cursor-pointer hover:bg-gray-200">
        📸 Upload Foto ({current}/{max})
      </label>
    </div>
  );
}
