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

        // GSAP 3 Horizontal Entrance Animation (Enter from RIGHT to CENTER)
        const ctx = gsap.context(() => {
            gsap.fromTo(
                textRef.current,
                { xPercent: 100, opacity: 0 },
                { xPercent: 0, opacity: 1, duration: 0.5, ease: THEME_TOKENS.motion.rotatorEaseOut }
            );
        }, containerRef);

        const interval = setInterval(() => {
            if (!textRef.current) return;

            // GSAP 3 Horizontal Exit Animation (Exit to LEFT)
            gsap.to(textRef.current, {
                xPercent: -100,
                opacity: 0,
                duration: 0.5,
                ease: THEME_TOKENS.motion.rotatorEaseIn,
                onComplete: () => {
                    setIndex((prev) => (prev + 1) % messages.length);
                    // Next Message Enters from RIGHT to CENTER
                    gsap.fromTo(
                        textRef.current,
                        { xPercent: 100, opacity: 0 },
                        { xPercent: 0, opacity: 1, duration: 0.5, ease: THEME_TOKENS.motion.rotatorEaseOut }
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
            className="bg-[#E52027] text-white h-[40px] px-4 flex items-center justify-center overflow-hidden relative shadow-inner select-none z-30 cursor-pointer"
            style={{ fontFamily: THEME_TOKENS.typography.fontBody }}
        >
            <div className="max-w-4xl w-full h-full flex items-center justify-center relative overflow-hidden">
                <span
                    ref={textRef}
                    className="absolute text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap text-white"
                >
                    {messages[index]}
                </span>
            </div>
        </div>
    );
}
