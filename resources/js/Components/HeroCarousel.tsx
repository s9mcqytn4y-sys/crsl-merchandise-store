import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "@inertiajs/react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";

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
        gambar: "/assets/gambar/banner-1.webp",
        tag: "NEW SEASON",
        judul: "Animals as your Bestfriends!",
        subjudul:
            "Merchandise karakter hewan lucu & fungsional untuk menemani hari-harimu.",
        tombol: "Adopt Now",
        tautan: "/katalog",
        alt: "CRSL Koleksi Terbaru",
    },
    {
        gambar: "/assets/gambar/banner-hero-main.webp",
        tag: "BTS ESSENTIALS",
        judul: "Back to School with Odin & Friends",
        subjudul:
            "Ransel water-repellent, kapasitas laptop 14 inci, dan kompartemen lengkap.",
        tombol: "Lihat Ransel",
        tautan: "/katalog?kategori=backpack-collection",
        alt: "CRSL Back to School Essentials",
    },
    {
        gambar: "/assets/gambar/banner-tumbler.webp",
        tag: "EVERYDAY HYDRATION",
        judul: "Tumbler Termos 12 Jam Dingin",
        subjudul:
            "Stainless steel food-grade anti tumpah dengan karakter imut Popo si Panda.",
        tombol: "Pilih Tumbler",
        tautan: "/katalog?kategori=tumbler-collection",
        alt: "CRSL Tumbler Collection",
    },
    {
        gambar: "/assets/gambar/banner-cassie.webp",
        tag: "BEST SELLER",
        judul: "Compact & Stylish Cassie Wallet",
        subjudul:
            "Dompet kanvas lipat wanita dengan motif plaid ikonik dan slot kartu lengkap.",
        tombol: "Beli Cassie Wallet",
        tautan: "/katalog?kategori=wallet-accessories",
        alt: "CRSL Cassie Wallet",
    },
    {
        gambar: "/assets/gambar/banner-2.webp",
        tag: "SPECIAL EDITION",
        judul: "Meet The 5 Bestfriends Squad",
        subjudul:
            "Temukan kepribadianmu bersama Odin, Chilo, Pigko, Popo, dan Choco.",
        tombol: "Kenali Karakter",
        tautan: "/katalog",
        alt: "CRSL Animal Characters",
    },
];

const AUTOPLAY_INTERVAL = 5000;

export default function HeroCarousel({
    slides = DEFAULT_SLIDES,
}: {
    slides?: HeroSlide[] | readonly HeroSlide[];
}) {
    const activeSlides = slides.length > 0 ? (slides as HeroSlide[]) : DEFAULT_SLIDES;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef<number | null>(null);

    const goToPrev = useCallback(() => {
        setCurrentIndex(
            (prev) => (prev - 1 + activeSlides.length) % activeSlides.length
        );
    }, [activeSlides.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, [activeSlides.length]);

    // Autoplay Timer Loop dengan jeda saat hover/focus
    useEffect(() => {
        if (activeSlides.length <= 1 || isPaused) return;

        const interval = setInterval(() => {
            goToNext();
        }, AUTOPLAY_INTERVAL);

        return () => clearInterval(interval);
    }, [activeSlides.length, isPaused, goToNext]);

    // GSAP 3 Parallax Transitions
    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            const currentSlideEl = containerRef.current?.querySelector(
                `[data-slide-index="${currentIndex}"]`
            );
            if (!currentSlideEl) return;

            const bgImage = currentSlideEl.querySelector(".hero-bg-image");
            const tagEl = currentSlideEl.querySelector(".hero-tag");
            const titleEl = currentSlideEl.querySelector(".hero-title");
            const subtitleEl = currentSlideEl.querySelector(".hero-subtitle");
            const btnEl = currentSlideEl.querySelector(".hero-btn");

            // Animasi Parallax Background
            if (bgImage) {
                gsap.fromTo(
                    bgImage,
                    { scale: 1.12, opacity: 0.8 },
                    {
                        scale: 1.02,
                        opacity: 1,
                        duration: 1.2,
                        ease: "power2.out",
                    }
                );
            }

            // Staggered Entrance Teks
            const textGroup = [tagEl, titleEl, subtitleEl, btnEl].filter(Boolean);
            if (textGroup.length > 0) {
                gsap.fromTo(
                    textGroup,
                    { y: 28, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.7,
                        stagger: 0.1,
                        ease: "power2.out",
                        overwrite: "auto",
                    }
                );
            }
        }, containerRef);

        return () => ctx.revert();
    }, [currentIndex]);

    // Mouse Move Micro-Parallax untuk Desktop
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current || window.innerWidth < 1024) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
        const mouseY = (e.clientY - rect.top) / rect.height - 0.5;

        const currentSlideEl = containerRef.current.querySelector(
            `[data-slide-index="${currentIndex}"]`
        );
        const bgImage = currentSlideEl?.querySelector(".hero-bg-image");
        if (bgImage) {
            gsap.to(bgImage, {
                x: mouseX * -20,
                y: mouseY * -15,
                duration: 0.6,
                ease: "power1.out",
                overwrite: "auto",
            });
        }
    }, [currentIndex]);

    // Touch Swiping Handlers untuk Mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const diffX = touchStartX.current - e.changedTouches[0].clientX;
        if (diffX > 45) {
            goToNext();
        } else if (diffX < -45) {
            goToPrev();
        }
        touchStartX.current = null;
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowLeft") goToPrev();
        if (e.key === "ArrowRight") goToNext();
    };

    return (
        <section
            ref={containerRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onMouseMove={handleMouseMove}
            className="relative w-full h-[520px] sm:h-[580px] lg:h-[640px] overflow-hidden bg-slate-950 select-none focus:outline-hidden"
            aria-label="Carousel Banner Utama CRSL"
        >
            {/* Track Slider Banner */}
            <div
                className="flex w-full h-full transition-transform duration-700 ease-in-out will-change-transform"
                style={{
                    transform: `translateX(-${currentIndex * 100}%)`,
                }}
            >
                {activeSlides.map((slide, idx) => {
                    const isCurrent = idx === currentIndex;
                    return (
                        <div
                            key={slide.tautan + idx}
                            data-slide-index={idx}
                            className="flex-none w-full h-full relative overflow-hidden shrink-0"
                            role="group"
                            aria-roledescription="slide"
                            aria-label={`Slide ${idx + 1} dari ${activeSlides.length}`}
                            aria-hidden={!isCurrent}
                        >
                            {/* Layer Gambar Background dengan Parallax */}
                            <div className="w-full h-full relative overflow-hidden">
                                <img
                                    src={slide.gambar}
                                    alt={slide.alt}
                                    className="hero-bg-image absolute inset-0 w-full h-full object-cover object-center will-change-transform transform scale-105"
                                    loading={idx === 0 ? "eager" : "lazy"}
                                    fetchPriority={idx === 0 ? "high" : "auto"}
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent pointer-events-none" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />
                            </div>

                            {/* Konten Teks Slide */}
                            <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 flex flex-col justify-center pointer-events-none">
                                <div className="max-w-xl text-white space-y-4 pointer-events-auto">
                                    <div>
                                        <span className="hero-tag inline-block bg-[#E52027] text-white text-[11px] font-black px-3.5 py-1 rounded-full tracking-wider uppercase shadow-xs">
                                            {slide.tag}
                                        </span>
                                    </div>
                                    <h2 className="hero-title text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight drop-shadow-sm text-white">
                                        {slide.judul}
                                    </h2>
                                    <p className="hero-subtitle text-xs sm:text-sm md:text-base text-slate-200/90 leading-relaxed drop-shadow-xs max-w-lg">
                                        {slide.subjudul}
                                    </p>
                                    <div className="pt-2">
                                        <Link
                                            href={slide.tautan}
                                            tabIndex={isCurrent ? 0 : -1}
                                            className="hero-btn inline-flex items-center gap-2.5 bg-white hover:bg-[#E52027] text-slate-900 hover:text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-lg transition-all duration-200 active:scale-95 group/btn cursor-pointer"
                                            aria-label={`${slide.tombol} - ${slide.judul}`}
                                        >
                                            <span>{slide.tombol}</span>
                                            <ArrowRight className="w-4 h-4 text-[#E52027] group-hover/btn:text-white transition-colors" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tombol Navigasi Kiri / Kanan (A11y Touch-Friendly) */}
            {activeSlides.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={goToPrev}
                        aria-label="Slide sebelumnya"
                        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/40 hover:bg-slate-900/70 border border-white/10 text-white flex items-center justify-center backdrop-blur-xs transition-all duration-200 active:scale-95 cursor-pointer z-10"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={goToNext}
                        aria-label="Slide berikutnya"
                        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/40 hover:bg-slate-900/70 border border-white/10 text-white flex items-center justify-center backdrop-blur-xs transition-all duration-200 active:scale-95 cursor-pointer z-10"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Indikator Baris Bawah */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10">
                        {activeSlides.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentIndex(idx)}
                                aria-label={`Pindah ke slide ${idx + 1}`}
                                className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                                    idx === currentIndex
                                        ? "w-8 bg-[#E52027]"
                                        : "w-2 bg-white/40 hover:bg-white/70"
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
