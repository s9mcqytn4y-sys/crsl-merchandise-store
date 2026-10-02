import { Link } from "@inertiajs/react";
import { Star, TicketPercent, CheckCircle2, AlertCircle } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";
import { cn } from "../../lib/utils";

interface ProductInfoProps {
    nama: string;
    kategoriNama: string;
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
    hargaDasar,
    hargaDiskon,
    stokTotal,
    isBestSeller = false,
    onOpenDiscounts,
    className,
}: ProductInfoProps) {
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

                {/* Rating Social Proof */}
                <div className="flex items-center gap-3 pt-1">
                    <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className="w-4 h-4 fill-amber-400 stroke-amber-400"
                            />
                        ))}
                    </div>
                    <span className="text-sm font-semibold text-slate-800">4.9</span>
                    <span className="text-xs text-slate-400">|</span>
                    <span className="text-xs font-medium text-slate-500">
                        120+ Terjual
                    </span>
                </div>
            </div>

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

                {/* Voucher Banner CTA */}
                {onOpenDiscounts && (
                    <button
                        type="button"
                        onClick={onOpenDiscounts}
                        className="w-full mt-2 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-left group"
                    >
                        <div className="flex items-center gap-2">
                            <TicketPercent className="w-4 h-4 text-primary" />
                            <span className="text-xs font-semibold text-slate-800 group-hover:text-primary transition-colors">
                                Klaim voucher diskon hingga 25% & bebas ongkir
                            </span>
                        </div>
                        <span className="text-xs font-bold text-primary group-hover:underline">
                            Lihat Promo →
                        </span>
                    </button>
                )}
            </div>
        </section>
    );
}
