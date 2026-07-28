"use client";

interface ModalCetakProps {
  data: {
    noFaktur: string;
    namaToko: string;
    namaSales: string;
    tanggal: string;
    metodePembayaran: string;
    totalBayar: number;
    items: Array<{ nama: string; qty: number; harga: number; subtotal: number }>;
  };
  onClose: () => void;
}

export default function ModalCetak({ data, onClose }: ModalCetakProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full space-y-4 overflow-y-auto max-h-[90vh]">
        
        {/* AREA NOTA CONTINUOUS FORM (DOT MATRIX) */}
        <div id="printable-continuous" className="border p-4 font-mono text-xs bg-white text-black">
          {/* Header Nota */}
          <div className="flex justify-between border-b border-black pb-2 mb-2">
            <div>
              <h2 className="font-bold text-sm uppercase">CV PRIMA MANDIRI DISTRIBUSI</h2>
              <p className="text-[10px]">PMD Ecosystem</p>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-sm">FAKTUR PENJUALAN</h3>
              <p className="text-[10px]">No: {data.noFaktur}</p>
              <p className="text-[10px]">Tgl: {data.tanggal}</p>
            </div>
          </div>

          {/* Info Pelanggan & Sales */}
          <div className="mb-3 text-[11px] grid grid-cols-2">
            <p><strong>Pelanggan:</strong> {data.namaToko}</p>
            <p className="text-right"><strong>Sales:</strong> {data.namaSales}</p>
          </div>

          {/* Tabel Barang */}
          <table className="w-full text-left border-collapse mb-3 text-[11px]">
            <thead>
              <tr className="border-t border-b border-black">
                <th className="py-1 w-8">No</th>
                <th className="py-1">Nama Barang</th>
                <th className="py-1 text-center w-12">Qty</th>
                <th className="py-1 text-right w-24">Harga</th>
                <th className="py-1 text-right w-28">Total (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-1">{idx + 1}</td>
                  <td className="py-1">{item.nama}</td>
                  <td className="py-1 text-center">{item.qty}</td>
                  <td className="py-1 text-right">{item.harga.toLocaleString("id-ID")}</td>
                  <td className="py-1 text-right">{item.subtotal.toLocaleString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer Nota & Tanda Tangan */}
          <div className="flex justify-between items-end border-t border-black pt-2 text-[11px]">
            <div className="flex gap-8 text-center">
              <div>
                <p className="mb-6">Tanda Terima</p>
                <p>( .................... )</p>
              </div>
              <div>
                <p className="mb-6">Hormat Kami</p>
                <p>( .................... )</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold">
                TOTAL: Rp {data.totalBayar.toLocaleString("id-ID")}
              </div>
              <p className="text-[10px]">Pembayaran: {data.metodePembayaran}</p>
            </div>
          </div>
        </div>

        {/* Tombol Aksi Web (Sembunyi saat diprint) */}
        <div className="flex gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 bg-sky-600 text-white py-2.5 rounded font-semibold text-sm hover:bg-sky-700"
          >
            🖨️ Cetak ke Continuous Form
          </button>
          <button
            onClick={onClose}
            className="px-5 border border-gray-300 text-gray-700 py-2.5 rounded text-sm hover:bg-gray-50"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}