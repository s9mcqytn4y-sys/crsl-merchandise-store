import React from "react";

interface OrderItem {
    id: number | string;
    nama_produk: string;
    harga: number;
    jumlah: number;
    ukuran?: string;
    warna?: string;
    sku?: string;
}

interface ShippingPayload {
    nama_penerima?: string;
    telepon?: string;
    email?: string;
    alamat_lengkap?: string;
    catatan?: string;
    is_dropship?: boolean;
    dropship_pengirim?: string;
    dropship_telepon?: string;
}

interface ShippingDetail {
    kurir?: string;
    layanan?: string;
    nomor_resi?: string;
    penerima?: string;
    alamat_lengkap?: string;
    telepon?: string;
    email?: string;
    catatan?: string;
    json_payload?: ShippingPayload;
}

interface PaymentDetail {
    metode_bayar?: string;
    nomor_va?: string;
    kode_biller?: string;
    bill_key?: string;
}

interface OrderData {
    id?: string | number;
    nomor_pesanan: string;
    status: string;
    subtotal: number;
    ongkir: number;
    diskon?: number;
    total: number;
    catatan?: string;
    created_at?: string;
    pembayaran?: PaymentDetail;
    pengiriman?: ShippingDetail;
    items?: OrderItem[];
    is_dropship?: boolean;
    dropship_pengirim?: string;
    dropship_telepon?: string;
    asuransi_pengiriman?: boolean;
    biaya_asuransi?: number;
}

interface PrintableA4InvoiceProps {
    pesanan: OrderData;
    statusPesanan: string;
    formatRupiah: (val: number | string | undefined | null) => string;
    formatTanggalIndo: (val?: string) => string;
    companyInfo?: {
        name: string;
        legalName: string;
        address: string;
        contact: string;
        taxId?: string;
    };
}

const DEFAULT_COMPANY = {
    name: "CRSL OFFICIAL STORE",
    legalName: "PT KREASI SAHABAT SEJATI",
    address:
        "Jl. Pandega Marta No. 25, Caturtunggal, Depok, Sleman, D.I. Yogyakarta 55281",
    contact:
        "Email: official@crsl-store.id | WA: +62 856-7060-477 | www.crsl-store.id",
    taxId: "NPWP: 02.894.218.4-542.000",
};

export default function PrintableA4Invoice({
    pesanan,
    statusPesanan,
    formatRupiah,
    formatTanggalIndo,
    companyInfo = DEFAULT_COMPANY,
}: PrintableA4InvoiceProps) {
    const pembayaran = pesanan.pembayaran ?? {};
    const pengiriman = pesanan.pengiriman ?? {};
    const items = pesanan.items ?? [];
    const payload = pengiriman.json_payload;

    // Normalisasi data penerima & dropship
    const recipient = {
        name: payload?.nama_penerima || pengiriman.penerima || "Pelanggan",
        phone: payload?.telepon || pengiriman.telepon || "-",
        address: payload?.alamat_lengkap || pengiriman.alamat_lengkap || "-",
        notes: pesanan.catatan || payload?.catatan || null,
        isDropship: pesanan.is_dropship || payload?.is_dropship || false,
        dropshipSender:
            pesanan.dropship_pengirim || payload?.dropship_pengirim || "-",
        dropshipPhone:
            pesanan.dropship_telepon || payload?.dropship_telepon || "-",
    };

    const statusKey = statusPesanan.toLowerCase().trim();
    const isPaid = ["akan_dikirim", "dikirim", "selesai"].includes(statusKey);
    const isCancelled = ["dibatalkan", "expired"].includes(statusKey);

    return (
        <div
            id="printable-a4-invoice"
            className="hidden print:block w-full max-w-4xl mx-auto p-8 text-neutral-900 text-xs font-sans bg-white leading-normal"
        >
            {/* Header Faktur & Dokumen Legal */}
            <header className="flex justify-between items-start border-b-2 border-neutral-900 pb-5 mb-5">
                <div className="space-y-1 max-w-md">
                    <h1 className="text-xl font-bold tracking-tight text-neutral-950 uppercase">
                        {companyInfo.name}
                    </h1>
                    <p className="text-[11px] font-semibold text-neutral-800">
                        {companyInfo.legalName}
                    </p>
                    <p className="text-[10px] text-neutral-600 leading-relaxed">
                        {companyInfo.address}
                    </p>
                    <p className="text-[10px] text-neutral-600">
                        {companyInfo.contact}
                    </p>
                    {companyInfo.taxId && (
                        <p className="text-[9px] text-neutral-500 font-mono pt-0.5">
                            {companyInfo.taxId}
                        </p>
                    )}
                </div>

                <div className="text-right space-y-1.5 shrink-0">
                    <div className="inline-block bg-neutral-900 text-white font-semibold text-xs px-3 py-1 rounded-sm uppercase tracking-wider">
                        FAKTUR PENJUALAN
                    </div>
                    <p className="text-xs font-mono font-bold text-neutral-900">
                        #{pesanan.nomor_pesanan}
                    </p>
                    <p className="text-[11px] text-neutral-600">
                        {formatTanggalIndo(pesanan.created_at)}
                    </p>
                    <div className="pt-0.5">
                        <span
                            className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-sm border uppercase tracking-wide ${
                                isPaid
                                    ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                                    : isCancelled
                                      ? "border-rose-700 bg-rose-50 text-rose-800"
                                      : "border-amber-700 bg-amber-50 text-amber-800"
                            }`}
                        >
                            {isPaid
                                ? "LUNAS"
                                : isCancelled
                                  ? "DIBATALKAN"
                                  : "MENUNGGU PEMBAYARAN"}
                        </span>
                    </div>
                </div>
            </header>

            {/* Rincian Logistik & Pembayaran */}
            <section className="grid grid-cols-2 gap-6 pb-5 mb-5 border-b border-neutral-200">
                <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                        Alamat Pengiriman
                    </span>
                    <p className="font-semibold text-neutral-900 text-xs">
                        {recipient.name}
                    </p>
                    <p className="text-[11px] text-neutral-700 font-mono">
                        {recipient.phone}
                    </p>
                    <p className="text-[11px] text-neutral-700 leading-relaxed whitespace-pre-line">
                        {recipient.address}
                    </p>
                    {recipient.notes && (
                        <p className="text-[10px] text-neutral-600 bg-neutral-50 border border-neutral-200 p-2 rounded mt-2">
                            <strong className="text-neutral-800">
                                Catatan:
                            </strong>{" "}
                            {recipient.notes}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5 pl-6 border-l border-neutral-200">
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                        Rincian Logistik & Transaksi
                    </span>
                    <div className="space-y-1 text-[11px] text-neutral-700">
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Ekspedisi:</span>
                            <span className="font-medium text-neutral-900 uppercase">
                                {pengiriman.kurir || "Kurir"}{" "}
                                {pengiriman.layanan
                                    ? `(${pengiriman.layanan})`
                                    : ""}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">No. Resi:</span>
                            <span className="font-mono text-neutral-900">
                                {pengiriman.nomor_resi || "Menunggu Pickup"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">
                                Metode Bayar:
                            </span>
                            <span className="font-medium text-neutral-900">
                                {pembayaran.metode_bayar || "Payment Gateway"}
                            </span>
                        </div>
                    </div>

                    {recipient.isDropship && (
                        <div className="mt-3 pt-2 border-t border-neutral-200 text-[10px] text-neutral-600">
                            <span className="font-semibold text-neutral-800 block">
                                Pengirim Dropship:
                            </span>
                            <span>
                                {recipient.dropshipSender} (
                                {recipient.dropshipPhone})
                            </span>
                        </div>
                    )}
                </div>
            </section>

            {/* Tabel Item Pesanan */}
            <table className="w-full border-collapse border border-neutral-300 text-left mb-5">
                <thead>
                    <tr className="bg-neutral-100 text-neutral-900 text-[10px] font-semibold uppercase tracking-wider">
                        <th className="border border-neutral-300 px-2 py-2 text-center w-8">
                            No
                        </th>
                        <th className="border border-neutral-300 px-3 py-2">
                            Item
                        </th>
                        <th className="border border-neutral-300 px-3 py-2">
                            Varian
                        </th>
                        <th className="border border-neutral-300 px-2 py-2 text-center w-12">
                            Qty
                        </th>
                        <th className="border border-neutral-300 px-3 py-2 text-right w-28">
                            Harga
                        </th>
                        <th className="border border-neutral-300 px-3 py-2 text-right w-32">
                            Subtotal
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                    {items.map((item, idx) => (
                        <tr
                            key={item.id ?? idx}
                            className="text-[11px] break-inside-avoid"
                        >
                            <td className="border border-neutral-300 px-2 py-2 text-center font-mono text-neutral-500">
                                {idx + 1}
                            </td>
                            <td className="border border-neutral-300 px-3 py-2 font-medium text-neutral-900">
                                {item.nama_produk}
                            </td>
                            <td className="border border-neutral-300 px-3 py-2 text-neutral-600 text-[10px]">
                                {[item.warna, item.ukuran]
                                    .filter(Boolean)
                                    .join(" / ") || "-"}
                            </td>
                            <td className="border border-neutral-300 px-2 py-2 text-center font-mono font-medium">
                                {item.jumlah}
                            </td>
                            <td className="border border-neutral-300 px-3 py-2 text-right font-mono text-neutral-700">
                                {formatRupiah(item.harga)}
                            </td>
                            <td className="border border-neutral-300 px-3 py-2 text-right font-mono font-semibold text-neutral-900">
                                {formatRupiah(item.harga * item.jumlah)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Ringkasan Biaya & Kebijakan */}
            <section className="flex justify-between items-start gap-8 mb-8 break-inside-avoid">
                <div className="flex-1 space-y-1.5 text-[10px] text-neutral-600">
                    <p className="font-semibold text-neutral-800 uppercase tracking-wide">
                        Ketentuan & Kebijakan:
                    </p>
                    <ul className="list-disc pl-4 space-y-0.5">
                        <li>
                            Dokumen ini adalah bukti transaksi sah yang
                            diterbitkan secara digital.
                        </li>
                        <li>
                            Komplain dan retur wajib melampirkan video unboxing
                            utuh maksimal 7 hari setelah barang diterima.
                        </li>
                        <li>
                            Simpan faktur ini untuk keperluan klaim garansi
                            produk resmi.
                        </li>
                    </ul>
                </div>

                <div className="w-72 border border-neutral-300 divide-y divide-neutral-200 text-xs rounded-sm">
                    <div className="p-2 space-y-1">
                        <div className="flex justify-between text-neutral-600">
                            <span>Subtotal Produk</span>
                            <span className="font-mono">
                                {formatRupiah(pesanan.subtotal)}
                            </span>
                        </div>
                        <div className="flex justify-between text-neutral-600">
                            <span>Ongkos Kirim</span>
                            <span className="font-mono">
                                {formatRupiah(pesanan.ongkir)}
                            </span>
                        </div>
                        {Boolean(pesanan.biaya_asuransi) && (
                            <div className="flex justify-between text-neutral-600">
                                <span>Asuransi Pengiriman</span>
                                <span className="font-mono">
                                    {formatRupiah(pesanan.biaya_asuransi)}
                                </span>
                            </div>
                        )}
                        {Boolean(pesanan.diskon) && (
                            <div className="flex justify-between text-emerald-800 font-medium">
                                <span>Diskon</span>
                                <span className="font-mono">
                                    -{formatRupiah(pesanan.diskon)}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="p-2.5 bg-neutral-50 flex justify-between items-center font-bold text-neutral-950">
                        <span>TOTAL TAGIHAN</span>
                        <span className="font-mono text-sm">
                            {formatRupiah(pesanan.total)}
                        </span>
                    </div>
                </div>
            </section>

            {/* Validasi & Tanda Tangan */}
            <footer className="pt-4 border-t border-neutral-300 grid grid-cols-2 gap-8 items-end break-inside-avoid">
                <div className="text-[10px] text-neutral-500 space-y-1">
                    <p>
                        Faktur dicetak otomatis melalui Sistem Manajemen Order
                        CRSL.
                    </p>
                    <p className="font-mono text-[9px]">
                        Ref: {pesanan.nomor_pesanan}
                    </p>
                </div>

                <div className="text-right space-y-1">
                    <p className="text-[10px] text-neutral-600 font-medium">
                        CRSL Finance & Operational
                    </p>
                    <div className="h-16 flex items-center justify-end">
                        <span className="text-[10px] font-mono text-neutral-400 border border-dashed border-neutral-300 px-3 py-1 rounded">
                            Validasi Dokumen Elektronik
                        </span>
                    </div>
                    <p className="text-[10px] text-neutral-800 font-medium">
                        Departemen Logistik & Keuangan
                    </p>
                </div>
            </footer>
        </div>
    );
}
