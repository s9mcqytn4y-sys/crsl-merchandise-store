import React from "react";
import { cn } from "../../lib/utils";

export type BadgeVariant =
    | "primary"
    | "emerald"
    | "amber"
    | "rose"
    | "sky"
    | "slate";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    children: React.ReactNode;
}

const BADGE_VARIANTS: Record<BadgeVariant, string> = {
    primary: "bg-[#E52027] text-white border-transparent shadow-2xs",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200/90",
    amber: "bg-amber-50 text-amber-900 border-amber-200/90",
    rose: "bg-rose-50 text-rose-800 border-rose-200/90",
    sky: "bg-sky-50 text-sky-800 border-sky-200/90",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function Badge({
    variant = "primary",
    children,
    className,
    ...props
}: BadgeProps) {
    return (
        <span
            {...props}
            className={cn(
                "inline-flex items-center gap-1 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider border select-none transition-colors",
                BADGE_VARIANTS[variant],
                className,
            )}
        >
            {children}
        </span>
    );
}
