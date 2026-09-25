import React, { useState, useEffect } from "react";

export default function BilahAtas() {
    const promoPesan = [
        "GRATIS ONGKIR SELURUH INDONESIA",
        "BELANJA DI WEBSITE LEBIH MURAH",
    ];

    const [indeksAktif, setIndeksAktif] = useState(0);
    const [sedangTransisi, setSedangTransisi] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setSedangTransisi(true);
            setTimeout(() => {
                setIndeksAktif((prev) => (prev + 1) % promoPesan.length);
                setSedangTransisi(false);
            }, 500); // durasi animasi keluar-masuk
        }, 3500);

        return () => clearInterval(interval);
    }, [promoPesan.length]);

    return (
        <aside
            aria-label="Pemberitahuan Promo Toko"
            className="bg-primary text-white h-9 overflow-hidden relative select-none z-30 flex items-center justify-center border-b border-red-700/20 px-4"
        >
            <style>{`
                @keyframes slideInFromLeft {
                    0% {
                        opacity: 0;
                        transform: translateX(-40px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes slideOutToRight {
                    0% {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    100% {
                        opacity: 0;
                        transform: translateX(40px);
                    }
                }
                .anim-slide-kiri-kanan-in {
                    animation: slideInFromLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .anim-slide-kiri-kanan-out {
                    animation: slideOutToRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
            <div className="relative w-full max-w-4xl h-full flex items-center justify-center text-center">
                <span
                    key={indeksAktif}
                    className={`text-[12px] sm:text-[13px] font-normal tracking-wider text-white uppercase will-change-transform ${
                        sedangTransisi ? "anim-slide-kiri-kanan-out" : "anim-slide-kiri-kanan-in"
                    }`}
                >
                    {promoPesan[indeksAktif]}
                </span>
            </div>
        </aside>
    );
}
