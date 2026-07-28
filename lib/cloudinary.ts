export async function uploadToCloudinary(file: File, folderName: string): Promise<string> {
  const formData = new FormData();
  
  // Kompres gambar sebelum upload
  const compressed = await compressImage(file);
  formData.append("file", compressed);
  
  // Menambahkan nama folder yang dikirim dari argumen kedua (misal: "selfie")
  formData.append("folder", folderName);
  
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Upload gagal");
  return data.secure_url;
}

function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let w = img.width, h = img.height;
      if (w > 800) { h = (h * 800) / w; w = 800; }
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => {
        resolve(new File([blob!], file.name, { type: "image/jpeg" }));
        URL.revokeObjectURL(url);
      }, "image/jpeg", 0.7);
    };
    img.src = url;
  });
}
