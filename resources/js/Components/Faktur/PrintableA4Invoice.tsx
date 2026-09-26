import React from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface OrderItem {
    id: number | string;
    nama_produk: string;
    harga: number;
    jumlah: number;
    ukuran?: string;
    warna?: string;
    sku?: string;
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
    json_payload?: {
        nama_penerima?: string;
        telepon?: string;
        email?: string;
        alamat_lengkap?: string;
        catatan?: string;
        is_dropship?: boolean;
        dropship_pengirim?: string;
        dropship_telepon?: string;
    };
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
}

export default function PrintableA4Invoice({
    pesanan,
    statusPesanan,
    formatRupiah,
    formatTanggalIndo,
}: PrintableA4InvoiceProps) {
    const pembayaran = pesanan.pembayaran || {};
    const pengiriman = pesanan.pengiriman || {};
    const items = pesanan.items || [];

    const recipientName =
        pengiriman.json_payload?.nama_penerima ||
        pengiriman.penerima ||
        "Pelanggan";
    const recipientPhone =
        pengiriman.json_payload?.telepon || pengiriman.telepon || "-";
    const recipientAddress =
        pengiriman.json_payload?.alamat_lengkap ||
        pengiriman.alamat_lengkap ||
        "-";
    const orderNotes =
        pesanan.catatan || pengiriman.json_payload?.catatan || "-";

    const isLunas = ["akan_dikirim", "dikirim", "selesai"].includes(
        statusPesanan.toLowerCase(),
    );

    const isBatal = ["dibatalkan", "expired"].includes(
        statusPesanan.toLowerCase(),
    );

    return (
        <div
            id="printable-a4-invoice"
            className="hidden print:block bg-white text-slate-900 text-xs w-full max-w-[210mm] mx-auto p-4 leading-normal"
            style={{ minHeight: "297mm" }}
        >
            {/* Header Surat Resmi */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
                        CRSL OFFICIAL STORE
                    </h1>
                    <p className="text-[11px] font-bold text-slate-700">
                        PT KREASI SAHABAT SEJATI (CRSL INDONESIA)
                    </p>
                    <p className="text-[10px] text-slate-600 max-w-sm leading-tight">
                        Jl. Pandega Marta No. 25, Caturtunggal, Depok, Sleman, D.I. Yogyakarta 55281
                    </p>
                    <p className="text-[10px] text-slate-600">
                        Email: official@crsl-store.id | Telepon/WA: +62 856-7060-477 | www.crsl-store.id
                    </p>
                    <p className="text-[9px] text-slate-500 font-mono">
                        NIB: 1205220029341 | NPWP: 02.894.218.4-542.000
                    </p>
                </div>

                <div className="text-right space-y-1">
                    <div className="inline-block bg-slate-900 text-white font-black text-sm px-3 py-1 rounded uppercase tracking-wider mb-1">
                        FAKTUR PENJUALAN
                    </div>
                    <p className="text-xs font-mono font-bold text-slate-900">
                        #{pesanan.nomor_pesanan}
                    </p>
                    <p className="text-[10px] text-slate-600">
                        Tanggal: {formatTanggalIndo(pesanan.created_at)}
                    </p>
                    <div className="pt-1">
                        {isLunas && (
                            <span className="inline-flex items-center gap-1 border border-emerald-700 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                LUNAS
                            </span>
                        )}
                        {!isLunas && !isBatal && (
                            <span className="inline-flex items-center gap-1 border border-amber-700 bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                <Clock className="w-3 h-3 text-amber-700" />
                                MENUNGGU PEMBAYARAN
                            </span>
                        )}
                        {isBatal && (
                            <span className="inline-flex items-center gap-1 border border-rose-700 bg-rose-50 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                <XCircle className="w-3 h-3 text-rose-700" />
                                DIBATALKAN
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* 2-Kolom Informasi Penerima & Pengiriman */}
            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-200">
                <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Tujuan Pengiriman:
                    </span>
                    <p className="font-bold text-slate-900 text-xs">{recipientName}</p>
                    <p className="text-[10px] text-slate-700 font-mono">{recipientPhone}</p>
                    <p className="text-[10px] text-slate-700 leading-tight">{recipientAddress}</p>
                    {orderNotes !== "-" && (
                        <p className="text-[10px] text-slate-500 italic mt-1">
                            Catatan: {orderNotes}
                        </p>
                    )}
                </div>

                <div className="space-y-1 pl-4 border-l border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Informasi Ekspedisi & Pembayaran:
                    </span>
                    <p className="text-[10px] text-slate-700">
                        <strong className="text-slate-900">Kurir:</strong>{" "}
                        {(pengiriman.kurir || "Biteship").toUpperCase()} -{" "}
                        {(pengiriman.layanan || "Standar").toUpperCase()}
                    </p>
                    <p className="text-[10px] text-slate-700">
                        <strong className="text-slate-900">No. Resi:</strong>{" "}
                        <span className="font-mono">{pengiriman.nomor_resi || "Menunggu Alokasi Kurir"}</span>
                    </p>
                    <p className="text-[10px] text-slate-700">
                        <strong className="text-slate-900">Metode Bayar:</strong>{" "}
                        {pembayaran.metode_bayar || "Midtrans Payment Gateway"}
                    </p>
                    {pesanan.is_dropship && (
                        <div className="mt-1 pt-1 border-t border-slate-200 text-[10px] text-slate-600">
                            <strong>Pengirim Dropship:</strong> {pesanan.dropship_pengirim || "-"}{" "}
                            ({pesanan.dropship_telepon || "-"})
                        </div>
                    )}
                </div>
            </div>

            {/* Tabel Item Pesanan Resmi */}
            <div className="mb-4">
                <table className="w-full border-collapse border border-slate-300 text-left">
                    <thead>
                        <tr className="bg-slate-100 text-slate-900 text-[10px] font-bold uppercase tracking-wider">
                            <th className="border border-slate-300 px-2 py-1.5 text-center w-8">No</th>
                            <th className="border border-slate-300 px-2.5 py-1.5">Deskripsi Produk</th>
                            <th className="border border-slate-300 px-2.5 py-1.5">Variasi</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-center w-12">Qty</th>
                            <th className="border border-slate-300 px-2.5 py-1.5 text-right w-24">Harga</th>
                            <th className="border border-slate-300 px-2.5 py-1.5 text-right w-28">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-200 text-[10px]">
                                <td className="border border-slate-300 px-2 py-2 text-center font-mono">
                                    {idx + 1}
                                </td>
                                <td className="border border-slate-300 px-2.5 py-2 font-semibold text-slate-900">
                                    {item.nama_produk}
                                </td>
                                <td className="border border-slate-300 px-2.5 py-2 text-slate-600">
                                    {[item.warna, item.ukuran].filter(Boolean).join(" / ") || "-"}
                                </td>
                                <td className="border border-slate-300 px-2 py-2 text-center font-bold font-mono">
                                    {item.jumlah}
                                </td>
                                <td className="border border-slate-300 px-2.5 py-2 text-right font-mono">
                                    {formatRupiah(item.harga)}
                                </td>
                                <td className="border border-slate-300 px-2.5 py-2 text-right font-bold text-slate-900 font-mono">
                                    {formatRupiah(item.harga * item.jumlah)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Total Kalkulasi & Rincian */}
            <div className="flex justify-between items-start gap-6 mb-6">
                <div className="flex-1 space-y-1 text-[10px] text-slate-600">
                    <p className="font-bold text-slate-800 uppercase">Catatan Transaksi Resmi:</p>
                    <p>1. Faktur ini sah diterbitkan secara digital oleh CRSL Store.</p>
                    <p>2. Retur & penukaran produk dijamin maksimal 7 hari setelah barang diterima dengan video unboxing.</p>
                    <p>3. Simpan dokumen ini sebagai bukti kepemilikan dan garansi merchandise resmi.</p>
                </div>

                <div className="w-64 space-y-1.5 text-xs border border-slate-300 p-2.5 rounded">
                    <div className="flex justify-between text-[11px] text-slate-600">
                        <span>Subtotal Produk</span>
                        <span className="font-mono font-medium">{formatRupiah(pesanan.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-600">
                        <span>Ongkos Kirim</span>
                        <span className="font-mono font-medium">{formatRupiah(pesanan.ongkir)}</span>
                    </div>
                    {Boolean(pesanan.biaya_asuransi) && (
                        <div className="flex justify-between text-[11px] text-slate-600">
                            <span>Asuransi Pengiriman</span>
                            <span className="font-mono font-medium">{formatRupiah(pesanan.biaya_asuransi)}</span>
                        </div>
                    )}
                    {Boolean(pesanan.diskon) && (
                        <div className="flex justify-between text-[11px] text-emerald-700 font-semibold">
                            <span>Potongan Diskon</span>
                            <span className="font-mono">-{formatRupiah(pesanan.diskon)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-xs font-black text-slate-900 pt-1.5 border-t-2 border-slate-900">
                        <span>TOTAL TAGIHAN</span>
                        <span className="font-mono text-sm">{formatRupiah(pesanan.total)}</span>
                    </div>
                </div>
            </div>

            {/* Tanda Tangan & Verifikasi Keabsahan */}
            <div className="grid grid-cols-2 gap-8 items-end pt-4 border-t border-slate-200">
                <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        Kode Verifikasi Digital
                    </span>
                    <div className="p-2 border border-slate-300 bg-slate-50 font-mono text-[9px] text-slate-700 tracking-wider">
                        CRSL-SECURE-INV::{pesanan.nomor_pesanan}::{pesanan.total}::VERIFIED
                    </div>
                </div>

                <div className="text-right space-y-1">
                    <p className="text-[10px] text-slate-600">
                        D.I. Yogyakarta, {formatTanggalIndo(pesanan.created_at).split(" pukul")[0]}
                    </p>
                    <p className="text-[10px] font-bold text-slate-900">
                        CRSL Indonesia Operations & Finance
                    </p>
                    <div className="h-12 flex items-center justify-end">
                        <div className="border border-emerald-700 text-emerald-800 font-black text-[9px] uppercase px-3 py-1 rounded tracking-wider bg-emerald-50">
                            [ DIGITAL AUTHORIZED SIGNATURE ]
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-800 font-bold">
                        ( Departemen Logistik & Keuangan )
                    </p>
                </div>
            </div>
        </div>
    );
}
