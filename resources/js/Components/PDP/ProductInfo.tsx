import { useState } from "react";
import { Link } from "@inertiajs/react";
import { TicketPercent, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";
import { cn } from "../../lib/utils";

interface ProductInfoProps {
    nama: string;
    kategoriNama: string;
    deskripsi?: string;
    hargaDasar: number;
    hargaDiskon?: number;
    stokTotal: number;
    isBestSeller?: boolean;
    onOpenDiscounts?: () => void;
    className?: string;
}

export default function ProductInfo({
    nama,
    kategoriNama,
    deskripsi,
    hargaDasar,
    hargaDiskon,
    stokTotal,
    isBestSeller = false,
    onOpenDiscounts,
    className,
}: ProductInfoProps) {
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const hasDiscount = !!hargaDiskon && hargaDiskon < hargaDasar;
    const persentaseDiskon = hasDiscount
        ? Math.round(((hargaDasar - (hargaDiskon || 0)) / hargaDasar) * 100)
        : 0;
    const hematNominal = hasDiscount ? hargaDasar - (hargaDiskon || 0) : 0;

    return (
        <section aria-label="Informasi Produk" className={cn("space-y-4", className)}>
            {/* Breadcrumb Kategori */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Link
                    href="/"
                    className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:underline"
                >
                    Beranda
                </Link>
                <span>/</span>
                <Link
                    href="/katalog"
                    className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:underline"
                >
                    Katalog
                </Link>
                <span>/</span>
                <span className="text-slate-800 font-semibold truncate max-w-50">
                    {kategoriNama || "Merchandise"}
                </span>
            </div>

            {/* Judul & Status Badge */}
            <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                    {isBestSeller && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            ★ Best Seller
                        </span>
                    )}
                    {stokTotal > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Stok Tersedia ({stokTotal})
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Stok Habis
                        </span>
                    )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    {nama}
                </h1>
            </div>

            {/* Ringkasan Deskripsi 2 Baris dengan Toggle */}
            {deskripsi && (
                <div className="text-xs text-slate-600 leading-relaxed space-y-1">
                    <p
                        className={cn(
                            "whitespace-pre-line transition-all duration-200",
                            !isDescExpanded && "line-clamp-2"
                        )}
                    >
                        {deskripsi}
                    </p>
                    <button
                        type="button"
                        onClick={() => setIsDescExpanded(!isDescExpanded)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer pt-0.5"
                    >
                        <span>{isDescExpanded ? "Tutup Deskripsi" : "Baca Selengkapnya"}</span>
                        {isDescExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                        )}
                    </button>
                </div>
            )}

            {/* Pricing Section */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
                        {formatRupiah(hasDiscount ? hargaDiskon! : hargaDasar)}
                    </span>
                    {hasDiscount && (
                        <>
                            <span className="text-base text-slate-400 line-through">
                                {formatRupiah(hargaDasar)}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-rose-100 text-rose-700">
                                Hemat {persentaseDiskon}%
                            </span>
                        </>
                    )}
                </div>

                {hasDiscount && hematNominal > 0 && (
                    <p className="text-xs text-emerald-700 font-medium">
                        Anda menghemat {formatRupiah(hematNominal)} untuk produk spesial ini!
                    </p>
                )}

                {/* Voucher Banner CTA - Selaras dengan theme orange & referensi live Plugo */}
                {onOpenDiscounts && (
                    <button
                        type="button"
                        onClick={onOpenDiscounts}
                        className="w-full mt-3 p-3 rounded-xl bg-amber-50/80 hover:bg-amber-100/90 border border-amber-300/80 flex items-center justify-between text-left group transition-all cursor-pointer shadow-2xs"
                    >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <TicketPercent className="w-4 h-4 stroke-[2.2]" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
                                    Voucher Promo & Diskon Tersedia
                                </div>
                                <div className="text-[11px] text-amber-800/80 font-medium">
                                    Gunakan kupon belanja untuk harga lebih hemat!
                                </div>
                            </div>
                        </div>
                        <span className="text-xs font-black text-amber-700 group-hover:text-amber-900 group-hover:translate-x-0.5 transition-all shrink-0">
                            Klaim Promo →
                        </span>
                    </button>
                )}
            </div>
        </section>
    );
}
