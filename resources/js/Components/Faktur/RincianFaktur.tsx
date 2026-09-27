import React, { useState } from "react";
import {
    Truck,
    MapPin,
    ShieldCheck,
    UserCheck,
    Copy,
    Check,
    Edit3,
    Phone,
    Mail,
    FileText,
    Package,
} from "lucide-react";
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
    const [copiedField, setCopiedField] = useState<
        "orderId" | "total" | "resi" | null
    >(null);

    const handleCopy = async (
        text: string,
        field: "orderId" | "total" | "resi",
        label: string,
    ) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            toast.success(`${label} berhasil disalin`);
            setTimeout(() => setCopiedField(null), 2000);
        } catch {
            toast.error("Gagal menyalin ke clipboard");
        }
    };

    const payload = pengiriman.json_payload;
    const recipientName =
        payload?.nama_penerima || pengiriman.penerima || "Pelanggan";
    const recipientPhone = payload?.telepon;
    const recipientEmail = payload?.email;
    const recipientAddress =
        payload?.alamat_lengkap ||
        pengiriman.alamat_lengkap ||
        "Alamat pengiriman belum ditentukan.";
    const orderNotes = catatan || payload?.catatan;

    const canEditAddress =
        status === "belum_bayar" || status === "akan_dikirim";

    return (
        <aside className="space-y-4" aria-label="Rincian Transaksi Faktur">
            {/* 1. Quick Info Box: Nomor Faktur */}
            {nomorPesanan && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                        <span className="text-[10px] uppercase font-medium text-slate-500 block tracking-wider">
                            Nomor Pesanan
                        </span>
                        <span className="font-mono font-semibold text-slate-900 truncate block text-sm select-all">
                            #{nomorPesanan}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() =>
                                handleCopy(
                                    nomorPesanan,
                                    "orderId",
                                    "Nomor Pesanan",
                                )
                            }
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                                copiedField === "orderId"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs"
                            }`}
                        >
                            {copiedField === "orderId" ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span>
                                {copiedField === "orderId"
                                    ? "Tersalin"
                                    : "Salin ID"}
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {/* 2. Informasi Pengiriman & Penerima */}
            <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-slate-600" />
                        <span>Informasi Pengiriman</span>
                    </h2>

                    <div className="flex items-center gap-2">
                        {pengiriman.kurir && (
                            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                {pengiriman.kurir}{" "}
                                {pengiriman.layanan
                                    ? `(${pengiriman.layanan})`
                                    : ""}
                            </span>
                        )}
                        {canEditAddress && onOpenEditRecipient && (
                            <button
                                type="button"
                                onClick={onOpenEditRecipient}
                                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                            >
                                <Edit3 className="w-3 h-3" />
                                <span>Ubah</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-3 text-xs">
                    {pengiriman.nomor_resi && (
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                            <span className="text-slate-600">No. Resi:</span>
                            <div className="flex items-center gap-1.5">
                                <span className="font-mono font-semibold text-slate-900 select-all">
                                    {pengiriman.nomor_resi}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleCopy(
                                            pengiriman.nomor_resi!,
                                            "resi",
                                            "Nomor Resi",
                                        )
                                    }
                                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                                    title="Salin Resi"
                                >
                                    {copiedField === "resi" ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex items-start gap-2.5">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5 min-w-0">
                                <p className="font-medium text-slate-900">
                                    {recipientName}
                                </p>
                                <p className="text-slate-600 leading-relaxed">
                                    {recipientAddress}
                                </p>
                            </div>
                        </div>

                        {(recipientPhone || recipientEmail) && (
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 pl-6 pt-0.5">
                                {recipientPhone && (
                                    <a
                                        href={`tel:${recipientPhone}`}
                                        className="inline-flex items-center gap-1 hover:text-slate-900 font-mono transition-colors"
                                    >
                                        <Phone className="w-3 h-3 text-slate-400" />
                                        <span>{recipientPhone}</span>
                                    </a>
                                )}
                                {recipientEmail && (
                                    <a
                                        href={`mailto:${recipientEmail}`}
                                        className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
                                    >
                                        <Mail className="w-3 h-3 text-slate-400" />
                                        <span>{recipientEmail}</span>
                                    </a>
                                )}
                            </div>
                        )}

                        {orderNotes && (
                            <div className="flex items-start gap-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 mt-2">
                                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span>
                                    <strong className="text-slate-700">
                                        Catatan:
                                    </strong>{" "}
                                    {orderNotes}
                                </span>
                            </div>
                        )}
                    </div>

                    {isDropship && (
                        <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/70 text-xs text-amber-950 space-y-0.5">
                            <div className="flex items-center gap-1.5 font-medium text-amber-900">
                                <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                                <span>Pengiriman Dropship</span>
                            </div>
                            <p className="text-amber-800 text-[11px]">
                                Pengirim: {dropshipPengirim || "-"}{" "}
                                {dropshipTelepon ? `(${dropshipTelepon})` : ""}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* 3. Ringkasan Item Pesanan */}
            <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
                <h2 className="font-semibold text-sm text-slate-900 border-b border-slate-100 pb-3 flex justify-between items-center">
                    <span>Item Pesanan</span>
                    <span className="text-xs font-normal text-slate-500">
                        ({items.length} produk)
                    </span>
                </h2>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-slate-100">
                    {items.map((it, idx) => (
                        <div
                            key={it.id || idx}
                            className="flex items-center justify-between gap-3 text-xs pt-3 first:pt-0"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                {it.gambar ? (
                                    <img
                                        src={it.gambar}
                                        alt={it.nama_produk}
                                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                                        <Package className="w-5 h-5" />
                                    </div>
                                )}

                                <div className="min-w-0 space-y-0.5">
                                    <p className="font-medium text-slate-900 truncate leading-snug">
                                        {it.nama_produk}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
                                        {it.ukuran && (
                                            <span className="bg-slate-100 px-1.5 py-0.2 rounded text-[10px]">
                                                {it.ukuran}
                                            </span>
                                        )}
                                        {it.warna && (
                                            <span className="bg-slate-100 px-1.5 py-0.2 rounded text-[10px]">
                                                {it.warna}
                                            </span>
                                        )}
                                        <span className="text-slate-400">
                                            •
                                        </span>
                                        <span>{it.jumlah}x</span>
                                    </div>
                                </div>
                            </div>

                            <span className="font-medium text-slate-900 shrink-0 tabular-nums font-mono text-xs">
                                {formatRupiah(it.harga * it.jumlah)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* 4. Rincian Biaya */}
                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex justify-between">
                        <span>Subtotal Produk</span>
                        <span className="font-mono text-slate-900 tabular-nums">
                            {formatRupiah(subtotal)}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span>Biaya Pengiriman</span>
                        <span className="font-mono text-slate-900 tabular-nums">
                            {formatRupiah(ongkir)}
                        </span>
                    </div>

                    {asuransiPengiriman && (
                        <div className="flex justify-between text-slate-700">
                            <span className="flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Asuransi Pengiriman</span>
                            </span>
                            <span className="font-mono tabular-nums">
                                +{formatRupiah(biayaAsuransi)}
                            </span>
                        </div>
                    )}

                    {diskon > 0 && (
                        <div className="flex justify-between text-emerald-700 font-medium">
                            <span>Diskon Voucher</span>
                            <span className="font-mono tabular-nums">
                                -{formatRupiah(diskon)}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between items-baseline pt-3 border-t border-slate-200 text-sm">
                        <span className="font-semibold text-slate-900">
                            Total Tagihan
                        </span>
                        <span className="text-lg font-semibold text-slate-900 font-mono tabular-nums tracking-tight">
                            {formatRupiah(total)}
                        </span>
                    </div>
                </div>
            </section>
        </aside>
    );
}
