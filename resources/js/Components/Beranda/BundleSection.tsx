import { useState, useEffect, useMemo } from "react";
import { Link } from "@inertiajs/react";
import { Package, Tag, ArrowRight } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";
import { cn } from "../../lib/utils";

export interface BundleItem {
    id: number | string;
    slug: string;
    judul: string;
    hargaPaket: number;
    hargaAsli: number;
    daftarGambar: string[];
    deskripsiSingkat?: string;
    badge?: string;
}

interface BundleSectionProps {
    bundles?: BundleItem[] | null;
    judul?: string;
    subjudul?: string;
    tautanSemua?: string;
    labelTautan?: string;
    allowFallback?: boolean;
    className?: string;
}

const DEFAULT_BUNDLES: BundleItem[] = [
    {
        id: 3516,
        slug: "back-to-school-with-miflo",
        judul: "BACK TO SCHOOL with Miflo",
        hargaPaket: 289000,
        hargaAsli: 343100,
        daftarGambar: [
            "/assets/gambar/bundle-miflo-cover.webp",
            "/assets/gambar/bundle-miflo-freebies.webp",
        ],
    },
    {
        id: 2188,
        slug: "back-to-school-with-haru",
        judul: "BACK TO SCHOOL WITH HARU!",
        hargaPaket: 329000,
        hargaAsli: 395000,
        daftarGambar: [
            "/assets/gambar/bundle-haru-cover.webp",
            "/assets/gambar/bundle-haru-freebies.webp",
        ],
    },
];

const PLACEHOLDER_SQUARE = "/assets/gambar/produk-placeholder.webp";

interface BundleCardProps {
    bundle: BundleItem;
}

function BundleCard({ bundle }: BundleCardProps) {
    const [indeksAktif, setIndeksAktif] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const gambarList = useMemo(() => {
        return bundle.daftarGambar && bundle.daftarGambar.length > 0
            ? bundle.daftarGambar
            : [PLACEHOLDER_SQUARE];
    }, [bundle.daftarGambar]);

    const totalGambar = gambarList.length;

    // Hitung persentase dan nilai penghematan
    const hargaPaket = Number(bundle.hargaPaket) || 0;
    const hargaAsli = Number(bundle.hargaAsli) || 0;
    const hasDiscount = hargaAsli > hargaPaket;
    const diskonPersen = hasDiscount
        ? Math.round(((hargaAsli - hargaPaket) / hargaAsli) * 100)
        : 0;
    const nominalHemat = hasDiscount ? hargaAsli - hargaPaket : 0;

    // Timer putar otomatis per 3.5 detik (terisolasi saat hover atau sentuhan layar)
    useEffect(() => {
        if (isPaused || totalGambar <= 1) return;

        const interval = setInterval(() => {
            setIndeksAktif((prev) => (prev + 1) % totalGambar);
        }, 3500);

        return () => clearInterval(interval);
    }, [isPaused, totalGambar]);

    const bundleUrl = `/bundles/${bundle.id}/${encodeURIComponent(bundle.slug)}`;

    return (
        <article
            className="group flex flex-col bg-white overflow-hidden select-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >
            {/* Visual Container Aspect-Square */}
            <div className="relative aspect-square w-full bg-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 shadow-2xs">
                <Link
                    href={bundleUrl}
                    className="block w-full h-full cursor-pointer relative overflow-hidden"
                    aria-label={`Lihat rincian paket ${bundle.judul}`}
                >
                    {/* Slider Track */}
                    <div
                        className="flex h-full w-full transition-transform duration-500 ease-out"
                        style={{
                            transform: `translate3d(-${indeksAktif * 100}%, 0, 0)`,
                        }}
                    >
                        {gambarList.map((imgSrc, idx) => (
                            <div
                                key={`${imgSrc}-${idx}`}
                                className="w-full h-full shrink-0 grow-0 relative overflow-hidden"
                            >
                                <img
                                    src={imgSrc}
                                    alt={`${bundle.judul} - Gambar ${idx + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                    loading="lazy"
                                    width={500}
                                    height={500}
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        target.onerror = null;
                                        target.src = PLACEHOLDER_SQUARE;
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </Link>

                {/* Badge Diskon Hemat di Kiri Atas */}
                {hasDiscount && diskonPersen > 0 && (
                    <div className="absolute top-2.5 left-2.5 bg-[#E52027] text-white text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm tracking-wide pointer-events-none z-10 flex items-center gap-1 font-mono">
                        <Tag className="w-3 h-3 stroke-[2.5]" />
                        <span>Hemat {diskonPersen}%</span>
                    </div>
                )}

                {/* Indikator Titik (Pagination Dots) jika lebih dari 1 gambar */}
                {totalGambar > 1 && (
                    <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-auto">
                        {gambarList.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIndeksAktif(idx);
                                }}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-300 cursor-pointer shadow-xs",
                                    indeksAktif === idx
                                        ? "w-5 bg-[#E52027]"
                                        : "w-1.5 bg-white/70 hover:bg-white",
                                )}
                                aria-label={`Tampilkan slide gambar ${idx + 1}`}
                                aria-current={
                                    indeksAktif === idx ? "true" : undefined
                                }
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Informasi Paket & Harga */}
            <div className="pt-3 flex flex-col space-y-1">
                <Link
                    href={bundleUrl}
                    className="text-xs sm:text-sm font-bold text-slate-800 hover:text-[#E52027] line-clamp-1 transition-colors leading-snug"
                    title={bundle.judul}
                >
                    {bundle.judul}
                </Link>

                <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-900 tabular-nums font-mono">
                        {formatRupiah(hargaPaket)}
                    </span>
                    {hasDiscount && (
                        <span className="text-[11px] text-slate-400 line-through tabular-nums font-mono">
                            {formatRupiah(hargaAsli)}
                        </span>
                    )}
                </div>

                {hasDiscount && nominalHemat > 0 && (
                    <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-700">
                        Hemat {formatRupiah(nominalHemat)} dibanding beli satuan
                    </p>
                )}
            </div>
        </article>
    );
}

export default function BundleSection({
    bundles,
    judul = "BTS Must-Have Bundle",
    subjudul = "Pilihan paket bundle spesial dengan merchandise eksklusif dan penawaran hemat.",
    tautanSemua = "/katalog?kategori=bundle",
    labelTautan = "Lihat Semua Paket",
    allowFallback = Boolean(import.meta.env.DEV),
    className,
}: BundleSectionProps) {
    const listToDisplay =
        bundles && bundles.length > 0
            ? bundles
            : allowFallback
              ? DEFAULT_BUNDLES
              : [];

    if (listToDisplay.length === 0) {
        return null; // Tidak me-render apa pun jika tidak ada event bundle aktif
    }

    return (
        <section
            id="bts-bundles"
            className={cn(
                "py-10 sm:py-14 bg-white border-b border-slate-100 select-none",
                className,
            )}
            aria-labelledby="judul-bundle"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section Dinamis */}
                <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-[#E52027] rounded-full text-[11px] font-bold tracking-wider uppercase mb-1">
                        <Package className="w-3.5 h-3.5" />
                        <span>Koleksi Paket Spesial</span>
                    </div>

                    <h2
                        id="judul-bundle"
                        className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight"
                    >
                        {judul}
                    </h2>

                    {subjudul && (
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                            {subjudul}
                        </p>
                    )}
                </div>

                {/* 2-Column Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 max-w-4xl mx-auto">
                    {listToDisplay.map((bundle) => (
                        <BundleCard key={bundle.id} bundle={bundle} />
                    ))}
                </div>

                {/* Link Eksplorasi Opsional */}
                {tautanSemua && (
                    <div className="text-center pt-8">
                        <Link
                            href={tautanSemua}
                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#E52027] hover:text-[#CC1C22] transition-colors group cursor-pointer"
                        >
                            <span>{labelTautan}</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
