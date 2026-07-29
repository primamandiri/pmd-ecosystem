function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        const maxDim = 800;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = (h * maxDim) / w; w = maxDim; }
          else { w = (w * maxDim) / h; h = maxDim; }
        }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => {
          if (blob) resolve(new File([blob], file.name, { type: "image/jpeg" }));
          else resolve(file);
        }, "image/jpeg", 0.7);
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export async function uploadToCloudinary(file: File, folder?: string): Promise<string> {
  const compressed = await compressImage(file);
  const formData = new FormData();
  formData.append("file", compressed);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
  if (folder) formData.append("folder", folder);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData, signal: controller.signal }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Upload gagal");
    return data.secure_url;
  } finally {
    clearTimeout(timeout);
  }
}
