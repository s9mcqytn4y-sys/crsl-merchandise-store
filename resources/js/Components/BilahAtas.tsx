import { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "../lib/utils";

interface BilahAtasProps {
    pesan?: string[];
    intervalMs?: number;
    className?: string;
}

const DEFAULT_PROMO_PESAN = [
    "GRATIS ONGKIR SELURUH INDONESIA",
    "BELANJA DI WEBSITE LEBIH HEMAT & PRAKTIS",
];

export default function BilahAtas({
    pesan = DEFAULT_PROMO_PESAN,
    intervalMs = 3500,
    className,
}: BilahAtasProps) {
    const daftarPesan = useMemo(() => {
        return pesan && pesan.length > 0 ? pesan : DEFAULT_PROMO_PESAN;
    }, [pesan]);

    const [indeksAktif, setIndeksAktif] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (daftarPesan.length <= 1 || isPaused) return;

        // Cek preferensi reduced motion dari pengguna
        const prefersReducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const interval = setInterval(() => {
            if (prefersReducedMotion) {
                // Pergantian teks instan tanpa animasi geser
                setIndeksAktif((prev) => (prev + 1) % daftarPesan.length);
                return;
            }

            setIsTransitioning(true);
            timeoutRef.current = setTimeout(() => {
                setIndeksAktif((prev) => (prev + 1) % daftarPesan.length);
                setIsTransitioning(false);
            }, 300); // durasi fase keluar (300ms)
        }, intervalMs);

        return () => {
            clearInterval(interval);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [daftarPesan.length, intervalMs, isPaused]);

    return (
        <aside
            aria-label="Pemberitahuan Promo Toko"
            aria-live="polite"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className={cn(
                "bg-[#E52027] text-white h-9 overflow-hidden relative select-none z-30 flex items-center justify-center border-b border-[#CC1C22]/30 px-4",
                className,
            )}
        >
            <div className="relative w-full max-w-4xl h-full flex items-center justify-center text-center">
                <span
                    key={indeksAktif}
                    className={cn(
                        "text-[11px] sm:text-xs font-bold tracking-wider text-white uppercase transition-all duration-300 transform",
                        isTransitioning
                            ? "opacity-0 translate-x-6 scale-95"
                            : "opacity-100 translate-x-0 scale-100",
                    )}
                >
                    {daftarPesan[indeksAktif]}
                </span>
            </div>
        </aside>
    );
}
