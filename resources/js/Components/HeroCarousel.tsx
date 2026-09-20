import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from '@inertiajs/react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export interface HeroSlide {
    gambar: string;
    tag: string;
    judul: string;
    subjudul: string;
    tombol: string;
    tautan: string;
    alt: string;
}

const LEGACY_SLIDES: HeroSlide[] = [
    {
        gambar: '/assets/gambar/banner-1.webp',
        tag: 'NEW SEASON',
        judul: 'Animals as your Bestfriends!',
        subjudul: 'Merchandise karakter hewan lucu & fungsional untuk menemani hari-harimu.',
        tombol: 'Adopt Now',
        tautan: '/katalog',
        alt: 'CRSL Koleksi Terbaru',
    },
    {
        gambar: '/assets/gambar/banner-hero-main.webp',
        tag: 'BTS ESSENTIALS',
        judul: 'Back to School with Odin & Friends',
        subjudul: 'Ransel water-repellent, kapasitas laptop 14 inci, dan kompartemen lengkap.',
        tombol: 'Lihat Ransel',
        tautan: '/katalog?kategori=backpack-collection',
        alt: 'CRSL Back to School Essentials',
    },
    {
        gambar: '/assets/gambar/banner-tumbler.webp',
        tag: 'EVERYDAY HYDRATION',
        judul: 'Tumbler Termos 12 Jam Dingin',
        subjudul: 'Stainless steel food-grade anti tumpah dengan karakter imut Popo si Panda.',
        tombol: 'Pilih Tumbler',
        tautan: '/katalog?kategori=tumbler-collection',
        alt: 'CRSL Tumbler Collection',
    },
    {
        gambar: '/assets/gambar/banner-cassie.webp',
        tag: 'BEST SELLER',
        judul: 'Compact & Stylish Cassie Wallet',
        subjudul: 'Dompet kanvas lipat wanita dengan motif plaid ikonik dan slot kartu lengkap.',
        tombol: 'Beli Cassie Wallet',
        tautan: '/katalog?kategori=wallet-accessories',
        alt: 'CRSL Cassie Wallet',
    },
    {
        gambar: '/assets/gambar/banner-2.webp',
        tag: 'SPECIAL EDITION',
        judul: 'Meet The 5 Bestfriends Squad',
        subjudul: 'Temukan kepribadianmu bersama Odin, Chilo, Pigko, Popo, dan Choco.',
        tombol: 'Kenali Karakter',
        tautan: '/katalog',
        alt: 'CRSL Animal Characters',
    },
];

const AUTOPLAY_DELAY = 5000;

export default function HeroCarousel({ slides = LEGACY_SLIDES }: { slides?: HeroSlide[] }) {
    const activeSlides = slides.length > 0 ? slides : LEGACY_SLIDES;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [timerKey, setTimerKey] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index);
        setTimerKey((prev) => prev + 1);
    }, []);

    const goToPrev = useCallback(() => {
        goToSlide((currentIndex - 1 + activeSlides.length) % activeSlides.length);
    }, [currentIndex, activeSlides.length, goToSlide]);

    const goToNext = useCallback(() => {
        goToSlide((currentIndex + 1) % activeSlides.length);
    }, [currentIndex, activeSlides.length, goToSlide]);

    // Autoplay Timer
    useEffect(() => {
        if (isPaused || activeSlides.length <= 1) return;

        const timer = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
            setTimerKey((prev) => prev + 1);
        }, AUTOPLAY_DELAY);

        return () => clearTimeout(timer);
    }, [currentIndex, isPaused, timerKey, activeSlides.length]);

    // GSAP Parallax Effect
    useEffect(() => {
        const ctx = gsap.context(() => {
            const handleScroll = () => {
                const scrollY = window.scrollY;
                if (scrollY < window.innerHeight && imageRefs.current) {
                    gsap.to(imageRefs.current, {
                        y: scrollY * 0.25,
                        duration: 0.3,
                        ease: 'power1.out',
                    });
                }
            };

            window.addEventListener('scroll', handleScroll, { passive: true });
            return () => window.removeEventListener('scroll', handleScroll);
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="group relative w-full h-[calc(100dvh-96px)] min-h-[480px] max-h-[850px] overflow-hidden bg-slate-950 select-none"
            aria-label="Sorotan Utama CRSL"
        >
            {/* Keyframes bawaan langsung aktif tanpa modifikasi tailwind.config.js */}
            <style>{`
                @keyframes progressFill {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                .dot-progress-active {
                    animation-name: progressFill;
                    animation-timing-function: linear;
                    animation-fill-mode: forwards;
                }
            `}</style>

            {/* Carousel Track */}
            <div
                className="flex w-full h-full transition-transform duration-700 ease-out will-change-transform"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {activeSlides.map((slide, idx) => (
                    <div
                        key={idx}
                        className="flex-none w-full h-full relative overflow-hidden shrink-0"
                        role="group"
                        aria-roledescription="slide"
                        aria-label={`Slide ${idx + 1} dari ${activeSlides.length}`}
                    >
                        <div className="w-full h-full relative overflow-hidden">
                            <img
                                ref={(el) => { imageRefs.current[idx] = el; }}
                                src={slide.gambar}
                                alt={slide.alt}
                                className="w-full h-full object-cover object-center transform scale-100"
                                loading={idx === 0 ? 'eager' : 'lazy'}
                            />
                            {/* Seamless Vignette Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/60 pointer-events-none" />
                        </div>

                        {/* Slide Content Overlay - Diberi padding aman dari arrow */}
                        <div className="absolute bottom-16 sm:bottom-20 left-6 sm:left-16 lg:left-24 max-w-xl z-10 text-white space-y-3 pointer-events-auto">
                            <span className="inline-block bg-[#E52027] text-white text-[11px] font-black px-3 py-1 rounded-full tracking-widest uppercase shadow-sm">
                                {slide.tag}
                            </span>
                            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight drop-shadow-md">
                                {slide.judul}
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-md drop-shadow-sm">
                                {slide.subjudul}
                            </p>
                            <div className="pt-2">
                                <Link
                                    href={slide.tautan}
                                    className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                                >
                                    <span>{slide.tombol}</span>
                                    <ArrowRight className="w-4 h-4 text-[#E52027]" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Seamless Floating Navigation Arrows: Tersembunyi rapi, muncul saat hover */}
            <button
                type="button"
                onClick={goToPrev}
                className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/20 hover:bg-black/60 text-white/70 hover:text-white items-center justify-center backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl hover:scale-110 active:scale-95"
                aria-label="Slide sebelumnya"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                type="button"
                onClick={goToNext}
                className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/20 hover:bg-black/60 text-white/70 hover:text-white items-center justify-center backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl hover:scale-110 active:scale-95"
                aria-label="Slide berikutnya"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Seamless Glass Dot Indicators */}
            <div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/25 hover:bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg transition-colors duration-300"
                role="tablist"
                aria-label="Indikator slide"
            >
                {activeSlides.map((_, idx) => {
                    const isActive = idx === currentIndex;
                    return (
                        <button
                            key={idx}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            aria-label={`Pindah ke slide ${idx + 1}`}
                            onClick={() => goToSlide(idx)}
                            className="group/btn p-1.5 focus:outline-none"
                        >
                            <span
                                className={`block h-1.5 rounded-full transition-all duration-300 overflow-hidden relative ${
                                    isActive ? 'w-8 bg-white/20' : 'w-2 bg-white/40 group-hover/btn:bg-white/80'
                                }`}
                            >
                                {isActive && (
                                    <span
                                        key={timerKey}
                                        className="absolute left-0 top-0 bottom-0 bg-white rounded-full dot-progress-active"
                                        style={{
                                            animationDuration: `${AUTOPLAY_DELAY}ms`,
                                            animationPlayState: isPaused ? 'paused' : 'running',
                                        }}
                                    />
                                )}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
