import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { SITUS_CONFIG, THEME_TOKENS } from '../Config/situsConfig';

export default function BilahAtas() {
    const [index, setIndex] = useState(0);
    const textRef = useRef<HTMLSpanElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const messages = SITUS_CONFIG.pesanPromoBilahAtas;

    useEffect(() => {
        if (!textRef.current) return;

        // GSAP 3 Text Entrance Animation
        const ctx = gsap.context(() => {
            gsap.fromTo(
                textRef.current,
                { y: 15, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, ease: THEME_TOKENS.motion.rotatorEase }
            );
        }, containerRef);

        const interval = setInterval(() => {
            if (!textRef.current) return;

            // GSAP 3 Text Exit & Rotation Sequence
            gsap.to(textRef.current, {
                y: -15,
                opacity: 0,
                duration: 0.4,
                ease: 'power2.in',
                onComplete: () => {
                    setIndex((prev) => (prev + 1) % messages.length);
                    gsap.fromTo(
                        textRef.current,
                        { y: 15, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.5, ease: THEME_TOKENS.motion.rotatorEase }
                    );
                },
            });
        }, THEME_TOKENS.motion.rotatorDuration * 1000);

        return () => {
            clearInterval(interval);
            ctx.revert(); // GSAP Cleanup on unmount
        };
    }, [messages.length]);

    return (
        <div
            ref={containerRef}
            className="bg-[#E52027] text-white h-9 px-4 flex items-center justify-center overflow-hidden relative shadow-inner select-none z-30 cursor-pointer"
        >
            <div className="max-w-4xl w-full h-full flex items-center justify-center relative">
                <span
                    ref={textRef}
                    className="absolute text-xs sm:text-sm font-extrabold uppercase tracking-widest whitespace-nowrap text-white drop-shadow-xs"
                >
                    {messages[index]}
                </span>
            </div>
        </div>
    );
}
