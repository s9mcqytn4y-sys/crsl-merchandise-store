import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "@inertiajs/react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

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

const AUTOPLAY_DELAY = 5000;

export default function HeroCarousel({
    slides = DEFAULT_SLIDES,
}: {
    slides?: HeroSlide[];
}) {
    const activeSlides = slides.length > 0 ? slides : DEFAULT_SLIDES;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [timerKey, setTimerKey] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef<number | null>(null);
    const scrollRafId = useRef<number | null>(null);

    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index);
        setTimerKey((k) => k + 1);
    }, []);

    const goToPrev = useCallback(() => {
        setCurrentIndex(
            (prev) => (prev - 1 + activeSlides.length) % activeSlides.length,
        );
        setTimerKey((k) => k + 1);
    }, [activeSlides.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
        setTimerKey((k) => k + 1);
    }, [activeSlides.length]);

    // Autoplay Timer Loop
    useEffect(() => {
        if (isPaused || activeSlides.length <= 1) return;

        const timer = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
            setTimerKey((k) => k + 1);
        }, AUTOPLAY_DELAY);

        return () => clearTimeout(timer);
    }, [currentIndex, isPaused, timerKey, activeSlides.length]);

    // Parallax Scroll Effect
    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReducedMotion) return;

        let setY: (value: number) => void;

        const ctx = gsap.context(() => {
            const images =
                gsap.utils.toArray<HTMLElement>(".hero-parallax-img");
            setY = gsap.quickTo(images, "y", {
                duration: 0.35,
                ease: "power1.out",
            });

            const onScroll = () => {
                if (scrollRafId.current !== null) return;

                scrollRafId.current = window.requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    if (scrollY < window.innerHeight && setY) {
                        setY(scrollY * 0.18);
                    }
                    scrollRafId.current = null;
                });
            };

            window.addEventListener("scroll", onScroll, { passive: true });
        }, containerRef);

        return () => {
            if (scrollRafId.current !== null) {
                window.cancelAnimationFrame(scrollRafId.current);
            }
            ctx.revert();
        };
    }, [activeSlides]);

    // Touch Swiping Handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        setIsPaused(true);
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
        setIsPaused(false);
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
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="group relative w-full h-[520px] sm:h-[580px] lg:h-[640px] overflow-hidden bg-slate-950 select-none focus:outline-none"
            aria-label="Carousel Banner Utama CRSL"
        >
            {/* Inline Keyframe Khusus Progress Carousel */}
            <style>{`
                @keyframes crslBarProgress {
                    from { transform: scaleX(0); }
                    to { transform: scaleX(1); }
                }
            `}</style>

            {/* Track Slider Banner */}
            <div
                className="flex w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform motion-reduce:transition-none"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {activeSlides.map((slide, idx) => {
                    const isCurrent = idx === currentIndex;
                    return (
                        <div
                            key={slide.tautan + idx}
                            className="flex-none w-full h-full relative overflow-hidden shrink-0"
                            role="group"
                            aria-roledescription="slide"
                            aria-label={`Slide ${idx + 1} dari ${activeSlides.length}`}
                            aria-hidden={!isCurrent}
                        >
                            {/* Layer Gambar */}
                            <div className="w-full h-full relative overflow-hidden">
                                <img
                                    src={slide.gambar}
                                    alt={slide.alt}
                                    className="hero-parallax-img absolute -top-[10%] left-0 w-full h-[120%] object-cover object-center transform scale-105 will-change-transform"
                                    loading={idx === 0 ? "eager" : "lazy"}
                                    fetchPriority={idx === 0 ? "high" : "auto"}
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent pointer-events-none" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />
                            </div>

                            {/* Konten Teks Slide */}
                            <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 flex flex-col justify-center pointer-events-none">
                                <div className="max-w-xl text-white space-y-3.5 pointer-events-auto">
                                    <div>
                                        <span className="inline-block bg-[#E52027] text-white text-[11px] font-black px-3.5 py-1 rounded-full tracking-wider uppercase shadow-xs">
                                            {slide.tag}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight drop-shadow-sm text-white">
                                        {slide.judul}
                                    </h2>
                                    <p className="text-xs sm:text-sm md:text-base text-slate-200/90 leading-relaxed drop-shadow-xs max-w-lg">
                                        {slide.subjudul}
                                    </p>
                                    <div className="pt-2">
                                        <Link
                                            href={slide.tautan}
                                            tabIndex={isCurrent ? 0 : -1}
                                            className="inline-flex items-center gap-2.5 bg-white hover:bg-[#E52027] text-slate-900 hover:text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-lg transition-all duration-200 active:scale-95 group/btn"
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

            {/* Tombol Navigasi Kiri */}
            <button
                type="button"
                onClick={goToPrev}
                className="hidden sm:flex absolute left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/40 hover:bg-white text-white hover:text-slate-900 items-center justify-center backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl active:scale-95 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#E52027] focus-visible:outline-none"
                aria-label="Slide sebelumnya"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Tombol Navigasi Kanan */}
            <button
                type="button"
                onClick={goToNext}
                className="hidden sm:flex absolute right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/40 hover:bg-white text-white hover:text-slate-900 items-center justify-center backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl active:scale-95 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#E52027] focus-visible:outline-none"
                aria-label="Slide berikutnya"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indikator Titik Progress Bar Bawah */}
            <div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10 shadow-lg"
                role="tablist"
                aria-label="Indikator slide banner"
            >
                {activeSlides.map((_, idx) => {
                    const isActive = idx === currentIndex;
                    return (
                        <button
                            key={idx}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            aria-label={`Buka slide ${idx + 1}`}
                            onClick={() => goToSlide(idx)}
                            className="p-0.5 focus-visible:outline-none group/dot"
                        >
                            <span
                                className={`block h-1.5 rounded-full transition-all duration-300 overflow-hidden relative ${
                                    isActive
                                        ? "w-8 bg-white/30"
                                        : "w-2 bg-white/50 group-hover/dot:bg-white/80"
                                }`}
                            >
                                {isActive && (
                                    <span
                                        key={`bar-${timerKey}`}
                                        className="absolute inset-0 bg-white rounded-full origin-left will-change-transform"
                                        style={{
                                            animation: `crslBarProgress ${AUTOPLAY_DELAY}ms linear forwards`,
                                            animationPlayState: isPaused
                                                ? "paused"
                                                : "running",
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
