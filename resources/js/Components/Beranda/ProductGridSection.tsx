import React from "react";
import { Link } from "@inertiajs/react";
import { ArrowRight, Package, Plus } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";
import { useCartModalStore } from "../../Stores/useCartModalStore";

export interface ProdukItem {
    id: number;
    nama: string;
    slug: string;
    harga_dasar: number;
    harga_diskon: number | null;
    gambar_utama: string | null;
    status_stok?: "in_stock" | "low_stock" | "out_of_stock" | string;
    terjual?: number;
    varian?: any[];
}

function hitungDiskon(dasar: number, diskon: number): number {
    if (dasar <= 0) return 0;
    return Math.round(((dasar - diskon) / dasar) * 100);
}

export function KartuProduk({ produk }: { produk: ProdukItem }) {
    const openCartModal = useCartModalStore((state) => state.openCartModal);
    const hargaAkhir = produk.harga_diskon ?? produk.harga_dasar;
    const adaDiskon =
        produk.harga_diskon !== null && produk.harga_diskon < produk.harga_dasar;
    const diskonPct = adaDiskon
        ? hitungDiskon(produk.harga_dasar, produk.harga_diskon!)
        : 0;
    const habis = produk.status_stok === "out_of_stock";

    return (
        <Link
            href={`/produk/${encodeURIComponent(produk.slug)}`}
            className="group block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col"
            aria-label={`Lihat detail ${produk.nama}`}
        >
            {/* Foto Produk Mendominasi ~70% Card */}
            <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                {produk.gambar_utama ? (
                    <img
                        src={produk.gambar_utama}
                        alt={produk.nama}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        width={320}
                        height={400}
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center text-slate-300"
                        aria-hidden="true"
                    >
                        <Package className="w-12 h-12" />
                    </div>
                )}

                {/* Valid Calculated Promo Badge Only */}
                {adaDiskon && diskonPct > 0 && (
                    <span
                        className="absolute top-2.5 left-2.5 bg-[#E52027] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs"
                        aria-label={`Diskon ${diskonPct}%`}
                    >
                        -{diskonPct}%
                    </span>
                )}

                {!habis && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openCartModal(produk);
                        }}
                        className="absolute bottom-2.5 right-2.5 bg-white/95 hover:bg-[#E52027] text-slate-800 hover:text-white p-2 rounded-full shadow-md transition-colors active:scale-95 z-10"
                        title="Add to Cart"
                        aria-label={`Tambah ${produk.nama} ke keranjang`}
                    >
                        <Plus className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                )}

                {habis && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-xs bg-black/70 px-3 py-1.5 rounded-full">
                            Habis
                        </span>
                    </div>
                )}
            </div>

            {/* Nama Produk & Harga Aktual Saja */}
            <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
                <h3 className="text-xs font-bold text-slate-800 line-clamp-2 mb-2 group-hover:text-[#E52027] transition-colors leading-snug">
                    {produk.nama}
                </h3>
                <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-extrabold text-[#E52027] tabular-nums">
                        {formatRupiah(hargaAkhir)}
                    </span>
                    {adaDiskon && (
                        <span className="text-[11px] text-slate-400 line-through tabular-nums">
                            {formatRupiah(produk.harga_dasar)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

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
                dark ? "bg-[#E52027] text-white" : "bg-slate-50 text-slate-900"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header (Optional jika divider banner sudah digunakan) */}
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

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
                    {produk.slice(0, 8).map((p) => (
                        <KartuProduk key={p.id} produk={p} />
                    ))}
                </div>

                {/* Mobile Button View All */}
                <div className="mt-8 text-center sm:hidden">
                    <Link
                        href={linkHref}
                        className={`inline-flex items-center gap-2 text-xs font-extrabold px-6 py-2.5 rounded-full shadow-xs transition-all ${
                            dark
                                ? "bg-white text-[#E52027] hover:bg-red-50"
                                : "bg-[#E52027] text-white hover:bg-[#CC1C22]"
                        }`}
                    >
                        <span>{linkLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
