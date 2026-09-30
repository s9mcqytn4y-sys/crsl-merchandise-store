import React, { useState } from "react";
import {
    Ticket,
    Copy,
    Check,
    ChevronRight,
    Clock,
    Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export interface VoucherItem {
    id: number | string;
    nama?: string;
    title?: string;
    judul?: string;
    kode?: string;
    code?: string;
    tipe?: "persen" | "persentase" | "nominal" | "fixed" | string;
    nilai?: number;
    discount?: string;
    min_belanja?: number;
    minimal_belanja?: number;
    deskripsi?: string;
    berlaku_hingga?: string;
    expired_at?: string;
    timeLeft?: string;
    sisa_waktu?: string;
}

interface KartuVoucherProps {
    vouchers?: VoucherItem[];
    onOpenVoucherModal?: () => void;
}

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
});

function formatDiskon(v: VoucherItem): string {
    if (v.discount) return v.discount;
    if (v.tipe === "persen" || v.tipe === "persentase") {
        return `${v.nilai || 0}%`;
    }
    if (v.nilai) {
        return rupiahFormatter.format(v.nilai);
    }
    return "Promo Spesial";
}

function formatBatasWaktu(v: VoucherItem): string {
    if (v.timeLeft || v.sisa_waktu) {
        return v.timeLeft || v.sisa_waktu || "";
    }
    const targetDate = v.berlaku_hingga || v.expired_at;
    if (!targetDate) return "Berlaku terbatas";

    try {
        const d = new Date(targetDate);
        if (isNaN(d.getTime())) return targetDate;
        return `s/d ${d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`;
    } catch {
        return "Berlaku terbatas";
    }
}

export default function KartuVoucher({
    vouchers = [],
    onOpenVoucherModal,
}: KartuVoucherProps) {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopy = async (e: React.MouseEvent, codeToCopy: string) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(codeToCopy);
            setCopiedCode(codeToCopy);
            toast.success(`Kode voucher ${codeToCopy} berhasil disalin!`);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch {
            toast.error("Gagal menyalin kode voucher");
        }
    };

    // 1. Tampilan Jujur Jika Pengguna Tidak Memiliki Voucher
    if (!vouchers || vouchers.length === 0) {
        return (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Voucher Belanja
                    </span>
                </div>

                <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center space-y-2 bg-slate-50/50">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Ticket className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                        Belum Ada Voucher Tersedia
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                        Ikuti promo dan kumpulkan poin loyalitas untuk
                        mendapatkan potongan belanja eksklusif.
                    </p>
                </div>
            </div>
        );
    }

    // Ambil voucher utama (maksimal 2 ditampilkan di widget ringkasan)
    const displayVouchers = vouchers.slice(0, 2);
    const hasMore = vouchers.length > 2;

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Voucher Belanja Saya
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                        {vouchers.length}
                    </span>
                </div>

                {hasMore && onOpenVoucherModal && (
                    <button
                        type="button"
                        onClick={onOpenVoucherModal}
                        className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                    >
                        <span>Lihat Semua</span>
                        <ChevronRight className="w-3 h-3" />
                    </button>
                )}
            </div>

            <div className="space-y-2.5">
                {displayVouchers.map((v, idx) => {
                    const title =
                        v.title || v.judul || v.nama || "Voucher Diskon";
                    const code = v.code || v.kode || "";
                    const discount = formatDiskon(v);
                    const expiryText = formatBatasWaktu(v);
                    const isCopied = copiedCode === code;

                    return (
                        <div
                            key={v.id || idx}
                            className="group relative border border-slate-200/90 hover:border-slate-300 rounded-xl p-3.5 flex items-center justify-between gap-3 bg-gradient-to-r from-white to-slate-50/50 transition-all shadow-2xs"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <Ticket className="w-4 h-4 stroke-[1.8]" />
                                </div>
                                <div className="min-w-0 space-y-0.5">
                                    <h4 className="font-bold text-xs text-slate-900 truncate">
                                        {title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                        <span className="font-semibold text-emerald-600">
                                            Diskon {discount}
                                        </span>
                                        {code && (
                                            <>
                                                <span>•</span>
                                                <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1 rounded">
                                                    {code}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap hidden sm:inline">
                                    {expiryText}
                                </span>

                                {code && (
                                    <button
                                        type="button"
                                        onClick={(e) => handleCopy(e, code)}
                                        className={`inline-flex items-center justify-center p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                            isCopied
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200 shadow-2xs"
                                        }`}
                                        title="Salin Kode Voucher"
                                        aria-label={`Salin kode ${code}`}
                                    >
                                        {isCopied ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
