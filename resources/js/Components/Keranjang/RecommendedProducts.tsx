import React from "react";
import { ShoppingBag } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";

export interface RecommendedProduct {
    id: string;
    nama_produk: string;
    harga: number;
    harga_asli?: number;
    gambar: string;
    warna?: string;
    ukuran?: string;
}

interface RecommendedProductsProps {
    items: RecommendedProduct[];
    onAdd: (product: RecommendedProduct) => void;
}

export default function RecommendedProducts({
    items,
    onAdd,
}: RecommendedProductsProps) {
    if (!items || items.length === 0) return null;

    return (
        <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Recently Ordered
            </h3>

            <div className="grid grid-cols-2 gap-3">
                {items.map((prod) => (
                    <div
                        key={prod.id}
                        className="p-2.5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex flex-col justify-between group"
                    >
                        <div className="space-y-2">
                            <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden relative">
                                <img
                                    src={prod.gambar}
                                    alt={prod.nama_produk}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                        const target = e.currentTarget as HTMLImageElement;
                                        target.src = "/assets/gambar/produk-placeholder.webp";
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => onAdd(prod)}
                                    className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 hover:text-white hover:bg-primary flex items-center justify-center shadow-md transition-colors cursor-pointer"
                                    aria-label={`Tambah ${prod.nama_produk} ke tas`}
                                >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <h4 className="text-[11px] font-bold text-slate-900 line-clamp-2 leading-tight">
                                {prod.nama_produk}
                            </h4>
                        </div>

                        <div className="pt-2">
                            {prod.harga_asli && (
                                <p className="text-[10px] text-slate-400 line-through">
                                    {formatRupiah(prod.harga_asli)}
                                </p>
                            )}
                            <p className="text-xs font-black text-slate-900">
                                {formatRupiah(prod.harga)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
