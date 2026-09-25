import React from "react";

export default function BilahAtas() {
    const promoMessages = [
        "BELANJA DI WEBSITE LEBIH MURAH",
        "DISKON 10% ALL ITEM UNTUK NEW ADOPTER",
        "GRATIS ONGKIR SELURUH INDONESIA",
    ];

    // Gandakan daftar untuk animasi continuous marquee yang mulus
    const items = [...promoMessages, ...promoMessages, ...promoMessages, ...promoMessages];

    return (
        <aside
            aria-label="Pemberitahuan Promo Toko"
            className="bg-[#E52027] text-white h-8 overflow-hidden relative select-none z-30 flex items-center border-b border-red-700/20"
        >
            <style>{`
                @keyframes marquee-ltr {
                    0% {
                        transform: translateX(-50%);
                    }
                    100% {
                        transform: translateX(0%);
                    }
                }
                .bilah-atas-marquee {
                    display: flex;
                    width: max-content;
                    animation: marquee-ltr 28s linear infinite;
                }
                .bilah-atas-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
            <div className="bilah-atas-marquee will-change-transform py-1">
                {items.map((msg, idx) => (
                    <div
                        key={idx}
                        className="flex items-center space-x-6 px-6 shrink-0"
                    >
                        <span className="text-[11px] sm:text-xs font-light tracking-widest text-white/95 uppercase">
                            {msg}
                        </span>
                        <span className="text-white/40 text-[10px] select-none font-thin">•</span>
                    </div>
                ))}
            </div>
        </aside>
    );
}
