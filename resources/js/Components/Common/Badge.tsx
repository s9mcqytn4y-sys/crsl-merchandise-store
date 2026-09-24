import React from 'react';

interface BadgeProps {
    variant?: 'primary' | 'emerald' | 'amber' | 'rose' | 'sky' | 'slate';
    children: React.ReactNode;
    className?: string;
}

export default function Badge({
    variant = 'primary',
    children,
    className = '',
}: BadgeProps) {
    const variants = {
        primary: 'bg-[#E52027] text-white',
        emerald: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        amber: 'bg-amber-100 text-amber-800 border border-amber-300',
        rose: 'bg-rose-100 text-rose-800 border border-rose-300',
        sky: 'bg-sky-100 text-sky-800 border border-sky-300',
        slate: 'bg-slate-100 text-slate-800 border border-slate-300',
    };

    return (
        <span
            className={`inline-flex items-center gap-1 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${variants[variant]} ${className}`}
        >
            {children}
        </span>
    );
}
