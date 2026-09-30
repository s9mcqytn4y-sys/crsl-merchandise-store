import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import { ShoppingBag, Check, Package, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "../../Utils/formatters";

export interface RecommendedProduct {
    id: number | string;
    nama_produk: string;
    slug?: string;
    harga: number;
    harga_asli?: number;
    gambar?: string | null;
    warna?: string | null;
    ukuran?: string | null;
    kategori?: string;
}

interface RecommendedProductsProps {
    items: RecommendedProduct[];
    title?: string;
    onAdd: (product: RecommendedProduct) => void;
}

/** Helper normalisasi URL gambar aman */
function normalizeImageUrl(gambar?: string | null): string {
    if (!gambar) return "";
    const g = gambar.trim();
    if (
        g.startsWith("http://") ||
        g.startsWith("https://") ||
        g.startsWith("data:")
    ) {
        return g;
    }
    if (g.startsWith("/storage/")) return g;
    if (g.startsWith("storage/")) return `/${g}`;
    if (g.startsWith("/")) return g;
    return `/storage/${g}`;
}

export default function RecommendedProducts({
    items,
    title = "Rekomendasi Pilihan",
    onAdd,
}: RecommendedProductsProps) {
    const [addedId, setAddedId] = useState<number | string | null>(null);

    if (!items || items.length === 0) return null;

    const handleAddClick = (e: React.MouseEvent, prod: RecommendedProduct) => {
        e.preventDefault();
        e.stopPropagation();

        onAdd(prod);
        setAddedId(prod.id);
        toast.success(`${prod.nama_produk} berhasil ditambahkan!`);

        setTimeout(() => {
            setAddedId(null);
        }, 1500);
    };

    return (
        <div className="pt-4 border-t border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>{title}</span>
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {items.map((prod) => {
                    const isAdded = addedId === prod.id;
                    const imageUrl = normalizeImageUrl(prod.gambar);
                    const hasDiscount =
                        prod.harga_asli && prod.harga_asli > prod.harga;
                    const productHref = prod.slug
                        ? `/produk/${encodeURIComponent(prod.slug)}`
                        : "#";

                    return (
                        <div
                            key={prod.id}
                            className="p-2.5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-2xs transition-all flex flex-col justify-between group"
                        >
                            <div className="space-y-2">
                                {/* Thumbnail Gambar & Tombol Quick Add */}
                                <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden relative flex items-center justify-center">
                                    <Link
                                        href={productHref}
                                        className="w-full h-full block"
                                    >
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={prod.nama_produk}
                                                loading="lazy"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    const target =
                                                        e.currentTarget;
                                                    target.onerror = null; // Mencegah infinite loop jika fallback gagal
                                                    target.src =
                                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m21 16-4-4a3.5 3.5 0 0 0-4.95 0L4 20'/%3E%3Cpath d='m14.5 13.5 1-1a3.5 3.5 0 0 1 4.95 0L21 13'/%3E%3Ccircle cx='9' cy='8' r='2'/%3E%3Crect width='18' height='18' x='3' y='3' rx='2'/%3E%3C/svg%3E";
                                                    target.className =
                                                        "w-7 h-7 text-slate-300 opacity-60";
                                                }}
                                            />
                                        ) : (
                                            <Package className="w-7 h-7 text-slate-300 stroke-[1.5]" />
                                        )}
                                    </Link>

                                    {/* Tombol Tambah Cepat */}
                                    <button
                                        type="button"
                                        onClick={(e) => handleAddClick(e, prod)}
                                        disabled={isAdded}
                                        className={`absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer ${
                                            isAdded
                                                ? "bg-emerald-600 text-white scale-110"
                                                : "bg-white/95 backdrop-blur-xs text-slate-700 hover:text-white hover:bg-primary active:scale-95"
                                        }`}
                                        title={
                                            isAdded
                                                ? "Berhasil ditambahkan"
                                                : "Tambah ke keranjang"
                                        }
                                        aria-label={`Tambah ${prod.nama_produk} ke keranjang`}
                                    >
                                        {isAdded ? (
                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                        ) : (
                                            <ShoppingBag className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>

                                {/* Judul & Link PDP */}
                                <Link
                                    href={productHref}
                                    className="block group-hover:text-primary transition-colors"
                                >
                                    <h4 className="text-[11px] font-bold text-slate-900 line-clamp-2 leading-tight">
                                        {prod.nama_produk}
                                    </h4>
                                </Link>
                            </div>

                            {/* Harga Produk */}
                            <div className="pt-2">
                                {hasDiscount && (
                                    <p className="text-[10px] text-slate-400 line-through tabular-nums">
                                        {formatRupiah(prod.harga_asli)}
                                    </p>
                                )}
                                <p className="text-xs font-black text-slate-900 font-mono tabular-nums">
                                    {formatRupiah(prod.harga)}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
