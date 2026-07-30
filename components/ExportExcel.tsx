"use client";
import * as XLSX from "xlsx";

interface ExportExcelProps {
  data: any[];
  columns: { key: string; label: string }[];
  filename: string;
  children?: React.ReactNode;
}

export default function ExportExcel({ data, columns, filename, children }: ExportExcelProps) {
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      data.map(row => {
        const obj: any = {};
        columns.forEach(col => { obj[col.label] = row[col.key] ?? "-"; });
        return obj;
      })
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  return (
    <button onClick={exportExcel}
      className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 flex items-center gap-1">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {children || "Export Excel"}
    </button>
  );
}
