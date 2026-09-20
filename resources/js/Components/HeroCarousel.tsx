import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { THEME_TOKENS } from '../Config/situsConfig';

export interface HeroSlide {
    gambar: string;
    tag: string;
    judul: string;
    subjudul: string;
    tombol: string;
    tautan: string;
    alt: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
    {
        gambar: '/assets/banner/new-arrival-banner.webp',
        tag: 'NEW SEASON',
        judul: 'Animals as your Bestfriends!',
        subjudul: 'Merchandise karakter hewan lucu & fungsional untuk menemani hari-harimu.',
        tombol: 'Adopt Now',
        tautan: '/katalog',
        alt: 'CRSL Koleksi Terbaru',
    },
    {
        gambar: '/assets/banner/banner-bts-section.webp',
        tag: 'BTS ESSENTIALS',
        judul: 'Back to School with Odin & Friends',
        subjudul: 'Ransel water-repellent, kapasitas laptop 14 inci, dan kompartemen lengkap.',
        tombol: 'Lihat Ransel',
        tautan: '/katalog?kategori=backpack-collection',
        alt: 'CRSL Back to School Essentials',
    },
    {
        gambar: '/assets/banner/banner-all-tumbler.webp',
        tag: 'EVERYDAY HYDRATION',
        judul: 'Tumbler Termos 12 Jam Dingin',
        subjudul: 'Stainless steel food-grade anti tumpah dengan karakter imut Popo si Panda.',
        tombol: 'Pilih Tumbler',
        tautan: '/katalog?kategori=tumbler-collection',
        alt: 'CRSL Tumbler Collection',
    },
    {
        gambar: '/assets/banner/banner-cassie-wallet.webp',
        tag: 'BEST SELLER',
        judul: 'Compact & Stylish Cassie Wallet',
        subjudul: 'Dompet kanvas lipat wanita dengan motif plaid ikonik dan slot kartu lengkap.',
        tombol: 'Beli Cassie Wallet',
        tautan: '/katalog?kategori=wallet-accessories',
        alt: 'CRSL Cassie Wallet',
    },
    {
        gambar: '/assets/banner/banner-monie-cap.webp',
        tag: 'SPECIAL EDITION',
        judul: 'Meet The 5 Bestfriends Squad',
        subjudul: 'Temukan kepribadianmu bersama Odin, Chilo, Pigko, Popo, dan Choco.',
        tombol: 'Kenali Karakter',
        tautan: '/katalog',
        alt: 'CRSL Animal Characters',
    },
];

export default function HeroCarousel({ slides = DEFAULT_SLIDES }: { slides?: HeroSlide[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

    const activeSlides = slides.length > 0 ? slides : DEFAULT_SLIDES;

    // Auto-advance Carousel Timer (5 seconds per slide)
    useEffect(() => {
        if (isPaused) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [isPaused, activeSlides.length]);

    // GSAP 3 Parallax Effect on Scroll
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

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    };

    return (
        <section
            ref={containerRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="relative w-full h-[calc(100dvh-96px)] min-h-[480px] max-h-[850px] overflow-hidden bg-slate-900 select-none"
            aria-label="Sorotan Utama CRSL"
        >
            {/* Carousel Track */}
            <div
                ref={trackRef}
                className="flex w-full h-full transition-transform duration-700 ease-out will-change-transform"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {activeSlides.map((slide, idx) => (
                    <div
                        key={idx}
                        className="flex-none w-full h-full relative overflow-hidden shrink-0"
                        role="group"
                        aria-label={`Slide ${idx + 1} dari ${activeSlides.length}`}
                    >
                        {/* Background Image Wadah */}
                        <div className="w-full h-full relative">
                            <img
                                ref={(el) => { imageRefs.current[idx] = el; }}
                                src={slide.gambar}
                                alt={slide.alt}
                                className="w-full h-full object-cover object-center transform scale-105"
                                loading={idx === 0 ? 'eager' : 'lazy'}
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />
                        </div>

                        {/* Slide Content Overlay */}
                        <div className="absolute bottom-16 sm:bottom-20 left-6 sm:left-12 lg:left-16 max-w-xl z-10 text-white space-y-3">
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

            {/* Navigation Arrows */}
            <button
                type="button"
                onClick={goToPrev}
                className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/40 hover:bg-slate-950/80 text-white/90 hover:text-white items-center justify-center backdrop-blur-md border border-white/10 transition-all shadow-lg hover:scale-110"
                aria-label="Slide sebelumnya"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                type="button"
                onClick={goToNext}
                className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/40 hover:bg-slate-950/80 text-white/90 hover:text-white items-center justify-center backdrop-blur-md border border-white/10 transition-all shadow-lg hover:scale-110"
                aria-label="Slide berikutnya"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Interactive Capsule Dot Indicators */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-950/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
                {activeSlides.map((_, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-2 rounded-full transition-all duration-300 overflow-hidden relative ${
                            idx === currentIndex ? 'w-8 bg-white/30' : 'w-2 bg-white/40 hover:bg-white/70'
                        }`}
                        aria-label={`Ke slide ${idx + 1}`}
                    >
                        {idx === currentIndex && (
                            <span
                                className="absolute left-0 top-0 bottom-0 bg-white rounded-full animate-progress"
                                style={{ animationDuration: '5000ms' }}
                            />
                        )}
                    </button>
                ))}
            </div>
        </section>
    );
}
