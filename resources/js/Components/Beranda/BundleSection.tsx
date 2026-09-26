import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { formatRupiah } from "../../Utils/formatters";

export interface BundleItem {
    id: number;
    slug: string;
    judul: string;
    hargaPaket: number;
    hargaAsli: number;
    daftarGambar: string[];
}

const DAFTAR_BUNDLE: BundleItem[] = [
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

interface BundleCardProps {
    bundle: BundleItem;
}

function BundleCard({ bundle }: BundleCardProps) {
    const [indeksAktif, setIndeksAktif] = useState(0);
    const [apakahHover, setApakahHover] = useState(false);
    const totalGambar = bundle.daftarGambar.length;

    // Timer putar otomatis per 3.5 detik (pause saat hover)
    useEffect(() => {
        if (apakahHover || totalGambar <= 1) return;

        const interval = setInterval(() => {
            setIndeksAktif((prev) => (prev + 1) % totalGambar);
        }, 3500);

        return () => clearInterval(interval);
    }, [apakahHover, totalGambar]);

    const bundleUrl = `/bundles/${bundle.id}/${bundle.slug}`;

    return (
        <article
            className="group flex flex-col bg-white overflow-hidden"
            onMouseEnter={() => setApakahHover(true)}
            onMouseLeave={() => setApakahHover(false)}
        >
            <div className="relative aspect-square w-full bg-slate-100 overflow-hidden rounded-xl">
                <Link
                    href={bundleUrl}
                    className="block w-full h-full cursor-pointer relative overflow-hidden"
                    aria-label={`Lihat ${bundle.judul}`}
                >
                    <div
                        className="flex h-full w-full transition-transform duration-600 ease-in-out"
                        style={{
                            transform: `translateX(-${indeksAktif * 100}%)`,
                        }}
                    >
                        {bundle.daftarGambar.map((imgSrc, idx) => (
                            <div
                                key={imgSrc}
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
                                        const target = e.currentTarget as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = "/assets/gambar/banner-bts.webp";
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </Link>
            </div>

            <div className="pt-2.5 flex flex-col">
                <Link
                    href={bundleUrl}
                    className="text-xs sm:text-sm font-normal text-slate-800 hover:text-[#E52027] line-clamp-1 transition-colors"
                >
                    {bundle.judul}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs sm:text-sm font-normal text-slate-600 tabular-nums">
                        {formatRupiah(bundle.hargaPaket)}
                    </span>
                    {bundle.hargaAsli > bundle.hargaPaket && (
                        <span className="text-[11px] text-slate-400 line-through tabular-nums">
                            {formatRupiah(bundle.hargaAsli)}
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
}

export default function BundleSection() {
    return (
        <section
            id="bts-bundles"
            className="py-8 sm:py-12 bg-white border-b border-slate-100"
            aria-labelledby="judul-bundle"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section Sesuai Screenshot 4 */}
                <div className="text-center mb-6 sm:mb-8">
                    <h2
                        id="judul-bundle"
                        className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight"
                    >
                        BTS Must-Have Bundle
                    </h2>
                </div>

                {/* 2-Column Clean Grid Sesuai Screenshot 4 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
                    {DAFTAR_BUNDLE.map((bundle) => (
                        <BundleCard key={bundle.id} bundle={bundle} />
                    ))}
                </div>
            </div>
        </section>
    );
}
