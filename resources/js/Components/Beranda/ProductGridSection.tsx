import { Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import ProductCard, { ProductData } from "../Common/ProductCard";
import { cn } from "../../lib/utils";

export type ProdukItem = ProductData;

export type GridVariant = "default" | "crimson" | "slate";

interface ProductGridSectionProps {
    id: string;
    labelSubjudul?: string;
    judul?: string;
    produk: ProdukItem[];
    linkHref?: string;
    linkLabel?: string;
    limit?: number | null;
    variant?: GridVariant;
    /** @deprecated Gunakan prop `variant="crimson"` untuk keselarasan tema */
    dark?: boolean;
    priorityFirstRow?: boolean;
    className?: string;
}

export default function ProductGridSection({
    id,
    labelSubjudul,
    judul,
    produk = [],
    linkHref,
    linkLabel = "Lihat Semua",
    limit = 8,
    variant = "default",
    dark = false,
    priorityFirstRow = false,
    className,
}: ProductGridSectionProps) {
    if (!produk || produk.length === 0) return null;

    // Normalisasi varian tema (mendukung prop lama `dark={true}` sebagai varian crimson)
    const effectiveVariant: GridVariant =
        variant !== "default" ? variant : dark ? "crimson" : "default";

    const isCrimson = effectiveVariant === "crimson";
    const isSlate = effectiveVariant === "slate";

    const displayedProducts =
        typeof limit === "number" && limit > 0
            ? produk.slice(0, limit)
            : produk;

    const headingId = `${id}-heading`;

    return (
        <section
            id={id}
            aria-labelledby={judul ? headingId : undefined}
            className={cn(
                "py-10 sm:py-14 select-none transition-colors",
                isCrimson && "bg-primary text-white",
                isSlate && "bg-slate-900 text-white",
                !isCrimson && !isSlate && "bg-white text-slate-900",
                className,
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Bagian Atas */}
                {judul && (
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
                        <div className="space-y-1">
                            {labelSubjudul && (
                                <p
                                    className={cn(
                                        "text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em]",
                                        isCrimson && "text-red-100",
                                        isSlate && "text-slate-400",
                                        !isCrimson &&
                                            !isSlate &&
                                            "text-primary",
                                    )}
                                >
                                    {labelSubjudul}
                                </p>
                            )}
                            <h2
                                id={headingId}
                                className={cn(
                                    "text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight leading-tight",
                                    isCrimson || isSlate
                                        ? "text-white"
                                        : "text-slate-900",
                                )}
                            >
                                {judul}
                            </h2>
                        </div>

                        {/* Tombol Tautan Desktop */}
                        {linkHref && (
                            <Link
                                href={linkHref}
                                className={cn(
                                    "hidden sm:inline-flex items-center gap-1.5 text-xs font-bold transition-all group shrink-0 cursor-pointer",
                                    isCrimson &&
                                        "text-white hover:text-red-100",
                                    isSlate &&
                                        "text-slate-200 hover:text-white",
                                    !isCrimson &&
                                        !isSlate &&
                                        "text-primary hover:text-primary-hover",
                                )}
                                aria-label={linkLabel}
                            >
                                <span>{linkLabel}</span>
                                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-1" />
                            </Link>
                        )}
                    </div>
                )}

                {/* Grid Produk Responsif (2 Kolom Mobile, 3 Kolom Tablet, 4 Kolom Desktop) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
                    {displayedProducts.map((p, idx) => (
                        <ProductCard
                            key={p.id}
                            produk={p}
                            priority={priorityFirstRow && idx < 4}
                        />
                    ))}
                </div>

                {/* Tombol Tautan Mobile Bawah */}
                {linkHref && (
                    <div className="mt-8 text-center sm:hidden">
                        <Link
                            href={linkHref}
                            className={cn(
                                "inline-flex items-center justify-center gap-2 text-xs font-black px-6 py-3 rounded-full shadow-sm transition-all active:scale-[0.98] cursor-pointer",
                                isCrimson &&
                                    "bg-white text-primary hover:bg-red-50",
                                isSlate &&
                                    "bg-white text-slate-900 hover:bg-slate-100",
                                !isCrimson &&
                                    !isSlate &&
                                    "bg-primary text-white hover:bg-primary-hover",
                            )}
                            aria-label={linkLabel}
                        >
                            <span>{linkLabel}</span>
                            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
