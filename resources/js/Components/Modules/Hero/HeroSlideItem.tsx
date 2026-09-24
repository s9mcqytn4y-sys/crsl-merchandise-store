import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { HeroSlide } from '../../HeroCarousel';

interface HeroSlideItemProps {
    slide: HeroSlide;
    idx: number;
    imageRef: (el: HTMLImageElement | null) => void;
}

export default function HeroSlideItem({ slide, idx, imageRef }: HeroSlideItemProps) {
    return (
        <div
            className="flex-none w-full h-full relative overflow-hidden shrink-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${idx + 1}`}
        >
            <div className="w-full h-full relative overflow-hidden">
                <img
                    ref={imageRef}
                    src={slide.gambar}
                    alt={slide.alt}
                    className="absolute -top-[10%] left-0 w-full h-[120%] object-cover object-center transform scale-105 will-change-transform"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />
            </div>

            <div className="absolute bottom-16 sm:bottom-20 left-6 sm:left-12 lg:left-16 max-w-xl z-10 text-white space-y-3">
                <span className="inline-block bg-[#E52027] text-white text-[11px] font-black px-3 py-1 rounded-full tracking-widest uppercase shadow-sm">
                    {slide.tag}
                </span>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight drop-shadow-md">
                    {slide.judul}
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-md drop-shadow-sm">
                    {slide.subjudul}
                </p>
                <div className="pt-2">
                    <Link
                        href={slide.tautan}
                        className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                        <span>{slide.tombol}</span>
                        <ArrowRight className="w-4 h-4 text-[#E52027]" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
