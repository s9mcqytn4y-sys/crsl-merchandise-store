import React, { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BilahAtas() {
    const messages = [
        "DISKON 10% ALL ITEM UNTUK NEW ADOPTER",
        "GRATIS ONGKIR SELURUH INDONESIA",
        "BELANJA DI WEBSITE LEBIH MURAH",
    ] as const;

    const [currentIdx, setCurrentIdx] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const sliderTrackRef = useRef<HTMLDivElement>(null);
    const isPausedRef = useRef(false);
    const isAnimatingRef = useRef(false);

    const slideTo = useCallback((newIndex: number, direction: "next" | "prev" = "next") => {
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;

        const targetX = direction === "next" ? -100 : 100;
        const enterX = direction === "next" ? 100 : -100;

        if (sliderTrackRef.current) {
            gsap.to(sliderTrackRef.current, {
                xPercent: targetX,
                opacity: 0,
                duration: 0.45,
                ease: "power2.inOut",
                onComplete: () => {
                    setCurrentIdx(newIndex);
                    gsap.fromTo(
                        sliderTrackRef.current,
                        { xPercent: enterX, opacity: 0 },
                        {
                            xPercent: 0,
                            opacity: 1,
                            duration: 0.45,
                            ease: "power2.out",
                            onComplete: () => {
                                isAnimatingRef.current = false;
                            },
                        }
                    );
                },
            });
        } else {
            setCurrentIdx(newIndex);
            isAnimatingRef.current = false;
        }
    }, []);

    const nextSlide = useCallback(() => {
        const nextIdx = (currentIdx + 1) % messages.length;
        slideTo(nextIdx, "next");
    }, [currentIdx, messages.length, slideTo]);

    const prevSlide = useCallback(() => {
        const prevIdx = (currentIdx - 1 + messages.length) % messages.length;
        slideTo(prevIdx, "prev");
    }, [currentIdx, messages.length, slideTo]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isPausedRef.current && !isAnimatingRef.current) {
                nextSlide();
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [nextSlide]);

    if (!messages.length) return null;

    return (
        <aside
            ref={containerRef}
            aria-label="Pemberitahuan Promo Toko"
            onMouseEnter={() => {
                isPausedRef.current = true;
            }}
            onMouseLeave={() => {
                isPausedRef.current = false;
            }}
            className="bg-[#E52027] text-white h-9 px-3 sm:px-6 flex items-center justify-between overflow-hidden relative select-none z-30 border-b border-red-700/30"
        >
            {/* Tombol Navigasi Slider Kiri */}
            <button
                type="button"
                onClick={prevSlide}
                aria-label="Pesan promo sebelumnya"
                className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
                <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Slider Content */}
            <div className="flex-1 max-w-2xl mx-auto h-full flex items-center justify-center overflow-hidden">
                <div
                    ref={sliderTrackRef}
                    role="status"
                    aria-live="polite"
                    className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-center whitespace-nowrap text-white will-change-transform"
                >
                    {messages[currentIdx]}
                </div>
            </div>

            {/* Tombol Navigasi Slider Kanan */}
            <button
                type="button"
                onClick={nextSlide}
                aria-label="Pesan promo berikutnya"
                className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
                <ChevronRight className="w-3.5 h-3.5" />
            </button>
        </aside>
    );
}
