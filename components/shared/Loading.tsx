export default function Loading({ text = "Memuat..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-xs text-gray-400">{text}</p>
      </div>
    </div>
  );
}
