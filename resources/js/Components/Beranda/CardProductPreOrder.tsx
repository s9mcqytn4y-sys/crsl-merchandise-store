import React from "react";
import { Link } from "@inertiajs/react";
import { formatRupiah } from "../../Utils/formatters";
import { useCartModalStore } from "../../Stores/useCartModalStore";
import { ProdukItem } from "./ProductGridSection";

interface CardProductPreOrderProps {
    produk: ProdukItem;
}

export default function CardProductPreOrder({ produk }: CardProductPreOrderProps) {
    const openCartModal = useCartModalStore((state) => state.openCartModal);

    const hargaDasar = produk.harga_dasar || 339000;
    const hargaDiskon = produk.harga_diskon || 289000;
    const diskonPersen =
        hargaDasar > hargaDiskon
            ? Math.round(((hargaDasar - hargaDiskon) / hargaDasar) * 100)
            : 14;

    const productUrl = `/produk/${encodeURIComponent(produk.slug)}`;

    return (
        <article className="w-full max-w-[280px] sm:max-w-[300px] bg-white rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col group border border-slate-100">
            {/* Media Container ~70% Card dengan Badge Diskon di Kanan Atas Sesuai Screenshot 1 */}
            <div className="relative aspect-[4/5] bg-[#E8F3F9] overflow-hidden">
                <Link
                    href={productUrl}
                    className="block w-full h-full cursor-pointer"
                    aria-label={`Detail produk ${produk.nama}`}
                >
                    <img
                        src={produk.gambar_utama || "/assets/gambar/drinke-tumblr.webp"}
                        alt={produk.nama}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        width={300}
                        height={375}
                    />
                </Link>

                {/* Badge Diskon di Kanan Atas Sesuai Screenshot 1: 14% */}
                {diskonPersen > 0 && (
                    <span
                        className="absolute top-2.5 right-2.5 bg-[#4b5563]/85 text-white text-[11px] font-bold px-1.5 py-0.5 rounded shadow-xs tracking-tight"
                        aria-label={`Diskon ${diskonPersen}%`}
                    >
                        {diskonPersen}%
                    </span>
                )}
            </div>

            {/* Informasi Produk: Judul & Harga Sesuai Screenshot 1 */}
            <div className="p-3.5 flex flex-col gap-1.5 flex-1 justify-between">
                <div>
                    <Link
                        href={productUrl}
                        className="text-xs sm:text-[13px] text-slate-800 hover:text-[#E52027] font-normal leading-snug line-clamp-2 transition-colors"
                    >
                        {produk.nama}
                    </Link>

                    <div className="mt-1 flex flex-col">
                        {hargaDasar > hargaDiskon && (
                            <span className="text-[11px] text-slate-400 line-through tabular-nums leading-none">
                                {formatRupiah(hargaDasar)}
                            </span>
                        )}
                        <span className="text-xs sm:text-sm font-semibold text-slate-700 tabular-nums mt-0.5">
                            {formatRupiah(hargaDiskon)}
                        </span>
                    </div>
                </div>

                {/* Tombol Outline Pill Merah: Buy Sesuai Screenshot 1 */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openCartModal(produk);
                    }}
                    className="w-full mt-2 py-2 border border-[#E52027] text-[#E52027] hover:bg-[#E52027] hover:text-white active:scale-[0.98] rounded-full text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer text-center"
                    aria-label={`Beli ${produk.nama}`}
                >
                    Buy
                </button>
            </div>
        </article>
    );
}
