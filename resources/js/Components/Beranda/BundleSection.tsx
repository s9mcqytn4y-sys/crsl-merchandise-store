import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { formatRupiah } from '../../Utils/formatters';

export interface BundleItem {
    id: number;
    slug: string;
    judul: string;
    hargaPaket: number;
    hargaAsli: number;
    diskonPersen: number;
    gambarCover: string;
    gambarFreebies: string;
    deskripsiSingkat: string;
}

const DAFTAR_BUNDLE: BundleItem[] = [
    {
        id: 3516,
        slug: 'back-to-school-with-miflo',
        judul: 'BACK TO SCHOOL with Miflo',
        hargaPaket: 289000,
        hargaAsli: 343100,
        diskonPersen: 15,
        gambarCover: '/assets/gambar/bundle-miflo-cover.webp',
        gambarFreebies: '/assets/gambar/bundle-miflo-freebies.webp',
        deskripsiSingkat: 'Paket ransel Miflo water-repellent + gantungan kunci Ropy + sticker pack eksklusif BTS.',
    },
    {
        id: 2188,
        slug: 'back-to-school-with-haru',
        judul: 'BACK TO SCHOOL WITH HARU!',
        hargaPaket: 329000,
        hargaAsli: 395000,
        diskonPersen: 16,
        gambarCover: '/assets/gambar/bundle-haru-cover.webp',
        gambarFreebies: '/assets/gambar/bundle-haru-freebies.webp',
        deskripsiSingkat: 'Paket ransel Tartan Haru premium + pin enamel set 5 karakter + gantungan kunci eksklusif.',
    },
];

export default function BundleSection() {
    const [activeSlide, setActiveSlide] = useState(0);

    // Auto-sliding antara cover bundle & freebies pack setiap 3.5 detik
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev === 0 ? 1 : 0));
        }, 3500);

        return () => clearInterval(timer);
    }, []);

    return (
        <section
            id="bts-bundles"
            className="py-10 sm:py-16 bg-slate-50 border-b border-slate-200/80"
            aria-labelledby="judul-bundle"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section Bersih Sesuai Website Resmi */}
                <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
                    <h2
                        id="judul-bundle"
                        className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading"
                    >
                        BTS Must-Have Bundle
                    </h2>
                </div>

                {/* 2-Column Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                    {DAFTAR_BUNDLE.map((bundle) => {
                        const bundleUrl = `/bundles/${bundle.id}/${bundle.slug}`;

                        return (
                            <article
                                key={bundle.id}
                                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
                            >
                                {/* Media Container dengan Slider Otomatis */}
                                <Link
                                    href={bundleUrl}
                                    className="relative block aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer"
                                    aria-label={`Lihat paket ${bundle.judul}`}
                                >
                                    <span className="absolute top-4 left-4 z-20 bg-[#E52027] text-white text-[11px] font-black uppercase px-3 py-1 rounded-full shadow-md tracking-wider">
                                        BUNDLE SPECIAL
                                    </span>

                                    <span className="absolute top-4 right-4 z-20 bg-amber-400 text-slate-950 text-[11px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                                        {bundle.diskonPersen}% OFF
                                    </span>

                                    {/* Slide 1: Cover Image */}
                                    <img
                                        src={bundle.gambarCover}
                                        alt={`${bundle.judul} - Cover`}
                                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                                            activeSlide === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                                        }`}
                                        loading="lazy"
                                        width={600}
                                        height={450}
                                    />

                                    {/* Slide 2: Freebies Pack Image */}
                                    <img
                                        src={bundle.gambarFreebies}
                                        alt={`${bundle.judul} - Freebies`}
                                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                                            activeSlide === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                                        }`}
                                        loading="lazy"
                                        width={600}
                                        height={450}
                                    />

                                    {/* Indikator Slider Dot */}
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setActiveSlide(0);
                                            }}
                                            aria-label="Tampilkan gambar cover"
                                            className={`h-1.5 rounded-full transition-all ${
                                                activeSlide === 0 ? "w-5 bg-white" : "w-1.5 bg-white/50"
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setActiveSlide(1);
                                            }}
                                            aria-label="Tampilkan gambar isi bundle"
                                            className={`h-1.5 rounded-full transition-all ${
                                                activeSlide === 1 ? "w-5 bg-white" : "w-1.5 bg-white/50"
                                            }`}
                                        />
                                    </div>
                                </Link>

                                {/* Info & CTA Container */}
                                <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between gap-5">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-[11px] font-bold text-[#E52027] uppercase tracking-wider">
                                                Back to School Essentials
                                            </span>
                                        </div>

                                        <Link href={bundleUrl} className="group-hover:text-[#E52027] transition-colors">
                                            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
                                                {bundle.judul}
                                            </h3>
                                        </Link>

                                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                            {bundle.deskripsiSingkat}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xl sm:text-2xl font-black text-slate-900">
                                                    {formatRupiah(bundle.hargaPaket)}
                                                </span>
                                                <span className="text-xs sm:text-sm font-semibold text-slate-400 line-through">
                                                    {formatRupiah(bundle.hargaAsli)}
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-bold text-emerald-600 block mt-0.5">
                                                Hemat {formatRupiah(bundle.hargaAsli - bundle.hargaPaket)}
                                            </span>
                                        </div>

                                        <Link
                                            href={bundleUrl}
                                            className="w-full sm:w-auto px-6 py-3 bg-[#E52027] hover:bg-[#CC1C22] active:scale-95 text-white font-black text-xs rounded-full shadow-md transition-all flex items-center justify-center gap-2"
                                            aria-label={`Lihat detail paket ${bundle.judul}`}
                                        >
                                            <span>Lihat Detail Paket</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
