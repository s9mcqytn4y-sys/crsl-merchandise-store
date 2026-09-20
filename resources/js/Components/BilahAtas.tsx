import React, { useState, useEffect } from 'react';

const PESAN_PROMO = [
    'GRATIS ONGKIR SELURUH INDONESIA',
    'DISKON 10% ALL ITEM UNTUK NEW ADOPTER',
    'BELANJA DI WEBSITE LEBIH MURAH',
];

export default function BilahAtas() {
    const [index, setIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setIndex((prevIndex) => (prevIndex + 1) % PESAN_PROMO.length);
                setIsAnimating(false);
            }, 400); // 400ms transition duration
        }, 4000); // 4000ms (4s) rotation cycle matching legacy bilah-atas.js

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-[#E52027] text-white h-9 px-4 flex items-center justify-center overflow-hidden relative shadow-inner select-none z-30">
            <div className="max-w-4xl w-full h-full flex items-center justify-center relative">
                <span
                    className={`absolute text-xs sm:text-sm font-extrabold uppercase tracking-widest whitespace-nowrap transition-all duration-500 ease-out ${
                        isAnimating
                            ? '-translate-x-full opacity-0'
                            : 'translate-x-0 opacity-100'
                    }`}
                >
                    {PESAN_PROMO[index]}
                </span>
            </div>
        </div>
    );
}
