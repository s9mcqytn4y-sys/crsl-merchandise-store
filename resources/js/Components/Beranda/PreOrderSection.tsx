import React from "react";
import CardProductPreOrder from "./CardProductPreOrder";
import { ProdukItem } from "./ProductGridSection";

interface PreOrderSectionProps {
    produk?: ProdukItem | null;
}

export default function PreOrderSection({ produk }: PreOrderSectionProps) {
    // Fallback data jika belum ter-load dari DB
    const activeProduct: ProdukItem = produk || {
        id: 7,
        nama: "CRSL Drinke Tumblr Series | Botol Tempat minum | Tumbler | Tumblr...",
        slug: "crsl-drinke-tumblr-series",
        harga_dasar: 339000,
        harga_diskon: 289000,
        gambar_utama: "/assets/gambar/drinke-tumblr.webp",
        status_stok: "in_stock",
        varian: [
            { id: 1, nama_varian: "DUSTY PINK", warna: "Dusty Pink", gambar_varian: "/assets/gambar/drinke-tumblr.webp" },
            { id: 2, nama_varian: "BROKEN WHITE", warna: "Broken White", gambar_varian: "/assets/gambar/drinke-tumblr.webp" },
            { id: 3, nama_varian: "DARK GREY", warna: "Dark Grey", gambar_varian: "/assets/gambar/drinke-tumblr.webp" },
        ],
    };

    return (
        <section
            id="pre-order-section"
            className="py-10 sm:py-14 bg-gradient-to-b from-white via-slate-50 to-white border-y border-slate-100"
            aria-label="Section Pre-Order CRSL"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
                    {/* Kolom Kiri: Copywriting & Benefit Pre-Order */}
                    <div className="md:col-span-7 flex flex-col gap-4 text-left">
                        <div className="inline-flex items-center gap-2 self-start px-3 py-1 bg-red-50 text-[#E52027] rounded-full text-xs font-bold tracking-wider uppercase">
                            <span className="w-2 h-2 rounded-full bg-[#E52027] animate-pulse" />
                            EDISI SPESIAL PRE-ORDER
                        </div>

                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                            PRE-ORDER <span className="text-[#E52027]">NOW!</span>
                        </h2>

                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xl">
                            Miliki koleksi Drinke Tumblr Series eksklusif dengan 5 karakter sahabat CRSL. Menjaga suhu minuman tetap dingin hingga 12 jam, dirancang tahan bocor dan siap menemani petualangan harianmu.
                        </p>

                        <ul className="flex flex-col gap-2.5 my-1" role="list">
                            <li className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-50 text-[#E52027] flex items-center justify-center font-bold text-xs">
                                    ✓
                                </span>
                                <span>Estimasi pengiriman 30 hari kerja</span>
                            </li>
                            <li className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-50 text-[#E52027] flex items-center justify-center font-bold text-xs">
                                    ✓
                                </span>
                                <span>Material food-grade stainless steel 304 (BPA Free)</span>
                            </li>
                            <li className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-50 text-[#E52027] flex items-center justify-center font-bold text-xs">
                                    ✓
                                </span>
                                <span>Termasuk bonus stiker pack karakter eksklusif</span>
                            </li>
                        </ul>

                        <div className="pt-2">
                            <a
                                href="/katalog"
                                className="inline-flex items-center gap-2 text-xs font-bold text-[#E52027] hover:text-[#CC1C22] transition-colors group"
                            >
                                <span>Eksplor Koleksi Lainnya</span>
                                <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                            </a>
                        </div>
                    </div>

                    {/* Kolom Kanan: Card Product Pre-Order Persis Sesuai Screenshot 1 */}
                    <div className="md:col-span-5 flex justify-center md:justify-end">
                        <CardProductPreOrder produk={activeProduct} />
                    </div>
                </div>
            </div>
        </section>
    );
}
