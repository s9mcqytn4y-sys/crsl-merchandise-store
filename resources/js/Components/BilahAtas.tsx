import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { SITUS_CONFIG, THEME_TOKENS } from "../Config/situsConfig";

export default function BilahAtas() {
    const messages = SITUS_CONFIG.pesanPromoBilahAtas;

    const [currentIdx, setCurrentIdx] = useState(0);
    const [nextIdx, setNextIdx] = useState(1);

    const containerRef = useRef<HTMLDivElement>(null);
    const currentTextRef = useRef<HTMLSpanElement>(null);
    const nextTextRef = useRef<HTMLSpanElement>(null);

    const isPausedRef = useRef(false);
    const isAnimatingRef = useRef(false);
    const indexRef = useRef(0);

    useEffect(() => {
        if (!messages || messages.length <= 1) return;

        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        // Inisialisasi posisi: Teks aktif di tengah (0%), teks cadangan siap di sebelah kiri (-100%)
        gsap.set(currentTextRef.current, { xPercent: 0, opacity: 1 });
        gsap.set(nextTextRef.current, { xPercent: -100, opacity: 0 });

        const duration = THEME_TOKENS.motion.rotatorDuration || 4;

        const interval = setInterval(() => {
            if (isPausedRef.current || isAnimatingRef.current) return;

            const nextIndexValue = (indexRef.current + 1) % messages.length;

            if (prefersReducedMotion) {
                indexRef.current = nextIndexValue;
                setCurrentIdx(nextIndexValue);
                return;
            }

            isAnimatingRef.current = true;
            setNextIdx(nextIndexValue);

            // Timeline transisi horizontal serentak (Kiri IN -> Kanan OUT)
            const tl = gsap.timeline({
                onComplete: () => {
                    indexRef.current = nextIndexValue;
                    setCurrentIdx(nextIndexValue);

                    // Reset posisi instan tanpa glitch: aktif di tengah, cadangan kembali di kiri luar
                    gsap.set(currentTextRef.current, {
                        xPercent: 0,
                        opacity: 1,
                    });
                    gsap.set(nextTextRef.current, {
                        xPercent: -100,
                        opacity: 0,
                    });

                    isAnimatingRef.current = false;
                },
            });

            // 1. Teks aktif KELUAR ke arah KANAN (0% -> 100%)
            tl.to(
                currentTextRef.current,
                {
                    xPercent: 100,
                    opacity: 0,
                    duration: 0.6,
                    ease: "power2.inOut",
                },
                0,
            );

            // 2. Teks berikutnya MASUK dari arah KIRI (-100% -> 0%)
            tl.fromTo(
                nextTextRef.current,
                { xPercent: -100, opacity: 0 },
                {
                    xPercent: 0,
                    opacity: 1,
                    duration: 0.6,
                    ease: "power2.inOut",
                },
                0,
            );
        }, duration * 1000);

        return () => {
            clearInterval(interval);
        };
    }, [messages]);

    if (!messages || messages.length === 0) return null;

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
            className="bg-[#E52027] text-white h-9 px-4 flex items-center justify-center overflow-hidden relative select-none z-30 border-b border-red-700/30"
        >
            <div className="max-w-4xl w-full h-full flex items-center justify-center relative overflow-hidden">
                {/* Slot Teks 1: Sedang Aktif */}
                <span
                    ref={currentTextRef}
                    role="status"
                    aria-live="polite"
                    className="absolute text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-center whitespace-nowrap text-white will-change-transform"
                >
                    {messages[currentIdx]}
                </span>

                {/* Slot Teks 2: Masuk dari Kiri */}
                <span
                    ref={nextTextRef}
                    aria-hidden="true"
                    className="absolute text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-center whitespace-nowrap text-white will-change-transform pointer-events-none"
                >
                    {messages[nextIdx]}
                </span>
            </div>
        </aside>
    );
}
