import React from "react";
import { Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import ProductCard, { ProductData } from "../Common/ProductCard";

export type ProdukItem = ProductData;

interface ProductGridSectionProps {
    id: string;
    labelSubjudul?: string;
    judul?: string;
    produk: ProdukItem[];
    linkHref?: string;
    linkLabel?: string;
    dark?: boolean;
}

export default function ProductGridSection({
    id,
    labelSubjudul,
    judul,
    produk,
    linkHref,
    linkLabel,
    dark = false,
}: ProductGridSectionProps) {
    if (!produk || produk.length === 0) return null;

    return (
        <section
            aria-labelledby={judul ? id : undefined}
            className={`py-8 sm:py-12 ${
                dark ? "bg-[#E52027] text-white" : "bg-white text-slate-900"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                {judul && (
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            {labelSubjudul && (
                                <p
                                    className={`text-[11px] font-black uppercase tracking-[0.25em] mb-1 ${
                                        dark ? "text-red-100" : "text-[#E52027]"
                                    }`}
                                >
                                    {labelSubjudul}
                                </p>
                            )}
                            <h2
                                id={id}
                                className={`text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight ${
                                    dark ? "text-white" : "text-slate-900"
                                }`}
                            >
                                {judul}
                            </h2>
                        </div>
                        {linkHref && (
                            <Link
                                href={linkHref}
                                className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-bold transition-colors ${
                                    dark
                                        ? "text-white hover:text-red-100"
                                        : "text-[#E52027] hover:text-[#CC1C22]"
                                }`}
                                aria-label={linkLabel}
                            >
                                <span>Lihat Semua</span>
                                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            </Link>
                        )}
                    </div>
                )}

                {/* Grid Sesuai Screenshot 1 & 5: 2 Kolom Mobile, 3 Kolom Tablet, 4 Kolom Desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
                    {produk.slice(0, 8).map((p) => (
                        <ProductCard key={p.id} produk={p} />
                    ))}
                </div>


                {/* Mobile Button View All */}
                {linkHref && (
                    <div className="mt-8 text-center sm:hidden">
                        <Link
                            href={linkHref}
                            className={`inline-flex items-center gap-2 text-xs font-extrabold px-6 py-2.5 rounded-full shadow-xs transition-all ${
                                dark
                                    ? "bg-white text-[#E52027] hover:bg-red-50"
                                    : "bg-[#E52027] text-white hover:bg-[#CC1C22]"
                            }`}
                        >
                            <span>{linkLabel || "Lihat Semua"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
