import { Link } from "@inertiajs/react";
import { Check, ArrowRight } from "lucide-react";
import CardProductPreOrder from "./CardProductPreOrder";
import { ProdukItem } from "./ProductGridSection";
import { cn } from "../../lib/utils";

export interface PreOrderFeature {
    id?: string | number;
    teks: string;
}

interface PreOrderSectionProps {
    produk?: ProdukItem | null;
    tagBadge?: string;
    judul?: string;
    judulAksen?: string;
    deskripsi?: string;
    fitur?: (string | PreOrderFeature)[];
    tautanKatalog?: string;
    labelTautan?: string;
    allowFallback?: boolean;
    className?: string;
}

// Fallback aman khusus testing/development lokal jika database belum memiliki event PO
const DEV_FALLBACK_PRODUCT: ProdukItem = {
    id: 7,
    nama: "CRSL Drinke Tumblr Series | Botol Tempat Minum Stainless 304",
    slug: "crsl-drinke-tumblr-series",
    harga_dasar: 339000,
    harga_diskon: 289000,
    gambar_utama: "/assets/gambar/drinke-tumblr.webp",
    status_stok: "in_stock",
    varian: [
        {
            id: 1,
            nama_varian: "DUSTY PINK",
            warna: "Dusty Pink",
            gambar_varian: "/assets/gambar/drinke-tumblr.webp",
        },
        {
            id: 2,
            nama_varian: "BROKEN WHITE",
            warna: "Broken White",
            gambar_varian: "/assets/gambar/drinke-tumblr.webp",
        },
        {
            id: 3,
            nama_varian: "DARK GREY",
            warna: "Dark Grey",
            gambar_varian: "/assets/gambar/drinke-tumblr.webp",
        },
    ],
};

const DEFAULT_FEATURES: string[] = [
    "Estimasi pengiriman 30 hari kerja setelah masa pre-order",
    "Material food-grade stainless steel 304 tahan karat (BPA Free)",
    "Termasuk bonus stiker pack karakter eksklusif edisi kolektor",
];

export default function PreOrderSection({
    produk,
    tagBadge = "Edisi Spesial Pre-Order",
    judul = "PRE-ORDER",
    judulAksen = "NOW!",
    deskripsi,
    fitur,
    tautanKatalog = "/katalog",
    labelTautan = "Eksplor Koleksi Lainnya",
    allowFallback = Boolean(import.meta.env.DEV),
    className,
}: PreOrderSectionProps) {
    // 1. Evaluasi Ketersediaan Produk
    const activeProduct =
        produk || (allowFallback ? DEV_FALLBACK_PRODUCT : null);

    // Jika di produksi tidak ada produk PO yang aktif, sembunyikan seksi sepenuhnya
    if (!activeProduct) {
        return null;
    }

    // 2. Normalisasi Copywriting Dinamis
    const effectiveDescription =
        deskripsi ||
        (activeProduct.id === 7
            ? "Miliki koleksi Drinke Tumblr Series eksklusif dengan 5 karakter sahabat CRSL. Menjaga suhu minuman tetap dingin hingga 12 jam, dirancang tahan bocor dan siap menemani petualangan harianmu."
            : `Dapatkan penawaran eksklusif pre-order untuk ${activeProduct.nama}. Pesan sekarang sebelum periode promo ditutup.`);

    const effectiveFeatures =
        fitur && fitur.length > 0 ? fitur : DEFAULT_FEATURES;

    return (
        <section
            id="pre-order-section"
            aria-labelledby="pre-order-heading"
            className={cn(
                "py-12 sm:py-16 bg-gradient-to-b from-white via-slate-50 to-white border-y border-slate-100 select-none",
                className,
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
                    {/* Kolom Kiri: Copywriting & Benefit Pre-Order */}
                    <div className="md:col-span-7 flex flex-col gap-4 text-left">
                        {/* Tag Badge */}
                        <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 bg-red-50 text-[#E52027] border border-red-100 rounded-full text-xs font-bold tracking-wider uppercase shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-[#E52027] animate-pulse" />
                            <span>{tagBadge}</span>
                        </div>

                        {/* Heading Dinamis */}
                        <h2
                            id="pre-order-heading"
                            className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight"
                        >
                            {judul}{" "}
                            <span className="text-[#E52027]">{judulAksen}</span>
                        </h2>

                        {/* Deskripsi Produk */}
                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xl">
                            {effectiveDescription}
                        </p>

                        {/* Poin Benefit / Keunggulan */}
                        <ul className="flex flex-col gap-3 my-2" role="list">
                            {effectiveFeatures.map((item, index) => {
                                const text =
                                    typeof item === "string" ? item : item.teks;
                                const key =
                                    typeof item === "string"
                                        ? index
                                        : item.id || index;

                                return (
                                    <li
                                        key={key}
                                        className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium"
                                    >
                                        <span className="shrink-0 w-6 h-6 rounded-full bg-red-50 text-[#E52027] border border-red-100 flex items-center justify-center font-bold">
                                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                        </span>
                                        <span className="leading-snug">
                                            {text}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Link Navigasi SPA Inertia */}
                        <div className="pt-2">
                            <Link
                                href={tautanKatalog}
                                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#E52027] hover:text-[#CC1C22] transition-colors group cursor-pointer"
                            >
                                <span>{labelTautan}</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>

                    {/* Kolom Kanan: Card Product Pre-Order */}
                    <div className="md:col-span-5 flex justify-center md:justify-end">
                        <CardProductPreOrder produk={activeProduct} />
                    </div>
                </div>
            </div>
        </section>
    );
}
