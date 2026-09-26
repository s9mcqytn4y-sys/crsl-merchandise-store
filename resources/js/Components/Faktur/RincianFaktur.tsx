import React, { useState } from "react";
import { Truck, MapPin, ShieldCheck, UserCheck, Copy, Check, Edit3, Phone, Mail, FileText } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
    id: number | string;
    nama_produk: string;
    harga: number;
    jumlah: number;
    ukuran?: string;
    warna?: string;
    gambar?: string;
}

interface ShippingDetail {
    kurir?: string;
    layanan?: string;
    nomor_resi?: string;
    penerima?: string;
    alamat_lengkap?: string;
    json_payload?: {
        nama_penerima?: string;
        telepon?: string;
        email?: string;
        alamat_lengkap?: string;
        kota?: string;
        provinsi?: string;
        catatan?: string;
    };
}

interface RincianFakturProps {
    nomorPesanan?: string;
    status?: string;
    catatan?: string;
    items: OrderItem[];
    subtotal: number;
    ongkir: number;
    diskon?: number;
    total: number;
    pengiriman?: ShippingDetail;
    isDropship?: boolean;
    dropshipPengirim?: string;
    dropshipTelepon?: string;
    asuransiPengiriman?: boolean;
    biayaAsuransi?: number;
    formatRupiah: (val: number | string | undefined | null) => string;
    onOpenEditRecipient?: () => void;
}

export default function RincianFaktur({
    nomorPesanan,
    status = "belum_bayar",
    catatan,
    items = [],
    subtotal,
    ongkir,
    diskon = 0,
    total,
    pengiriman = {},
    isDropship = false,
    dropshipPengirim,
    dropshipTelepon,
    asuransiPengiriman = false,
    biayaAsuransi = 0,
    formatRupiah,
    onOpenEditRecipient,
}: RincianFakturProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = (text: string, field: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success(`${label} berhasil disalin!`);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const recipientName =
        pengiriman.json_payload?.nama_penerima ||
        pengiriman.penerima ||
        "Penerima Pesanan";
    const recipientPhone =
        pengiriman.json_payload?.telepon || "-";
    const recipientEmail =
        pengiriman.json_payload?.email;
    const recipientAddress =
        pengiriman.json_payload?.alamat_lengkap ||
        pengiriman.alamat_lengkap ||
        "Alamat pengiriman telah tersimpan di sistem.";

    const canEditAddress =
        status === "belum_bayar" || status === "akan_dikirim";

    return (
        <aside className="space-y-6" aria-label="Rincian Transaksi Faktur">
            {/* Quick Copy Box: Nomor Invoice & Total (Hanya jika nomorPesanan dioper) */}
            {nomorPesanan && (
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                            Nomor Pesanan
                        </span>
                        <span className="font-mono font-black text-slate-800 truncate block text-sm">
                            {nomorPesanan}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            type="button"
                            onClick={() =>
                                handleCopy(nomorPesanan, "orderId", "Nomor Pesanan")
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-bold transition-colors cursor-pointer"
                        >
                            {copiedField === "orderId" ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span>{copiedField === "orderId" ? "Tersalin" : "Salin ID"}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                handleCopy(String(Math.round(total)), "total", "Nominal Tagihan")
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-primary/10 hover:bg-primary/15 border border-primary/20 rounded-lg text-primary font-bold transition-colors cursor-pointer"
                        >
                            {copiedField === "total" ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                                <Copy className="w-3.5 h-3.5 text-primary" />
                            )}
                            <span>Salin Total</span>
                        </button>
                    </div>
                </div>
            )}

            {/* 1. Rincian Pengiriman & Profil Penerima */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-primary" />
                        Informasi Pengiriman
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                            {pengiriman.kurir?.toUpperCase() || "ANTERAJA"} ({pengiriman.layanan || "REGULER"})
                        </span>
                        {canEditAddress && onOpenEditRecipient && (
                            <button
                                type="button"
                                onClick={onOpenEditRecipient}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer"
                            >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-3 text-xs">
                    {pengiriman.nomor_resi && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                            <span className="text-slate-600 font-semibold">
                                Nomor Resi / Waybill:
                            </span>
                            <span className="font-mono font-bold text-slate-900 select-all">
                                {pengiriman.nomor_resi}
                            </span>
                        </div>
                    )}

                    <div className="space-y-2 text-slate-700">
                        <div className="flex items-start gap-2.5">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                                <p className="font-bold text-slate-900">
                                    {recipientName}
                                </p>
                                <p className="text-slate-600 mt-0.5 leading-relaxed">
                                    {recipientAddress}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600 pl-6.5 pt-1">
                            {recipientPhone !== "-" && (
                                <a
                                    href={`tel:${recipientPhone}`}
                                    className="inline-flex items-center gap-1 hover:text-slate-900 font-semibold transition-colors"
                                >
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    {recipientPhone}
                                </a>
                            )}
                            {recipientEmail && (
                                <a
                                    href={`mailto:${recipientEmail}`}
                                    className="inline-flex items-center gap-1 hover:text-slate-900 font-semibold transition-colors"
                                >
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    {recipientEmail}
                                </a>
                            )}
                        </div>

                        {catatan && (
                            <div className="flex items-start gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 mt-2">
                                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span>Catatan: {catatan}</span>
                            </div>
                        )}
                    </div>

                    {isDropship && (
                        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold">
                                <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                                <span>Pesanan Dropship</span>
                            </div>
                            <p className="text-amber-800">
                                Pengirim: {dropshipPengirim || "-"}{" "}
                                {dropshipTelepon ? `(${dropshipTelepon})` : ""}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Rincian Item Pesanan */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                    Item yang Dipesan ({items.length})
                </h3>

                <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                    {items.map((it, idx) => (
                        <div
                            key={it.id || idx}
                            className="flex items-center justify-between gap-3 text-xs py-2 border-b border-slate-100 last:border-0"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <img
                                    src={it.gambar || "/assets/gambar/banner-tumbler.webp"}
                                    alt={it.nama_produk}
                                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50 shadow-2xs"
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            "/assets/gambar/drinke-tumblr.webp";
                                    }}
                                />
                                <div className="min-w-0 space-y-1">
                                    <p className="font-bold text-slate-900 truncate text-xs leading-snug">
                                        {it.nama_produk}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-600">
                                        {it.ukuran && (
                                            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                                Size: {it.ukuran}
                                            </span>
                                        )}
                                        {it.warna && (
                                            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                                {it.warna}
                                            </span>
                                        )}
                                        <span className="font-bold text-slate-500 text-[10px]">
                                            • {it.jumlah} pcs
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <span className="font-bold text-slate-900 shrink-0 tabular-nums text-xs">
                                {formatRupiah(it.harga * it.jumlah)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* 3. Kalkulasi Pembayaran */}
                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex justify-between">
                        <span>Subtotal Produk</span>
                        <span className="font-bold text-slate-900 tabular-nums">
                            {formatRupiah(subtotal)}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span>Biaya Pengiriman</span>
                        <span className="font-bold text-slate-900 tabular-nums">
                            {formatRupiah(ongkir)}
                        </span>
                    </div>

                    {asuransiPengiriman && (
                        <div className="flex justify-between text-emerald-700">
                            <span className="flex items-center gap-1 font-semibold">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Proteksi Asuransi
                            </span>
                            <span className="font-bold tabular-nums">
                                + {formatRupiah(biayaAsuransi || 2500)}
                            </span>
                        </div>
                    )}

                    {diskon > 0 && (
                        <div className="flex justify-between text-primary font-bold">
                            <span>Diskon Voucher</span>
                            <span className="tabular-nums">
                                - {formatRupiah(diskon)}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between items-baseline pt-3 border-t border-slate-200 text-sm">
                        <span className="font-black text-slate-900">
                            Total Tagihan
                        </span>
                        <span className="text-xl font-black text-primary tabular-nums tracking-tight">
                            {formatRupiah(total)}
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
