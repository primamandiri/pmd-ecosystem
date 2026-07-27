"use client";
import { useState, useEffect } from "react";

interface GPSCaptureProps {
  onLocation: (lat: number, lng: number) => void;
}

export default function GPSCapture({ onLocation }: GPSCaptureProps) {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [status, setStatus] = useState("Mendapatkan lokasi...");

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("GPS tidak didukung browser ini");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        onLocation(pos.coords.latitude, pos.coords.longitude);
        setStatus("✅ GPS aktif");
      },
      () => setStatus("❌ GPS tidak aktif. Izinkan akses lokasi"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs">
      <p className="font-medium text-gray-600">📍 Lokasi</p>
      <p className={`text-sm ${status.includes("✅") ? "text-green-600" : "text-orange-500"}`}>{status}</p>
      {lat && lng && (
        <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank"
          className="text-blue-600 underline text-[10px]">
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </a>
      )}
    </div>
  );
}
