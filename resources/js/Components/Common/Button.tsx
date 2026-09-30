import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export type ButtonVariant =
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "emerald";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    loadingText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children: React.ReactNode;
}

const BASE_BUTTON_STYLES =
    "inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027] focus-visible:ring-offset-2 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
    primary:
        "bg-[#E52027] hover:bg-[#CC1C22] text-white shadow-2xs border border-transparent",
    secondary:
        "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-transparent",
    outline:
        "bg-transparent hover:bg-red-50/60 text-[#E52027] border border-[#E52027]",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700 border border-transparent active:scale-100",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-2xs border border-transparent",
    emerald:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs border border-transparent",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs rounded-xl min-h-[34px] gap-1.5",
    md: "px-4 py-2.5 text-xs sm:text-sm rounded-xl min-h-[42px] gap-2",
    lg: "px-6 py-3.5 text-sm sm:text-base rounded-2xl min-h-[48px] gap-2.5",
};

export default function Button({
    type = "button",
    variant = "primary",
    size = "md",
    loading = false,
    loadingText,
    disabled = false,
    leftIcon,
    rightIcon,
    children,
    className,
    ...props
}: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <button
            type={type}
            disabled={isDisabled}
            aria-busy={loading}
            aria-disabled={isDisabled}
            className={cn(
                BASE_BUTTON_STYLES,
                BUTTON_VARIANTS[variant],
                BUTTON_SIZES[size],
                className,
            )}
            {...props}
        >
            {loading ? (
                <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
                    <span>{loadingText || children}</span>
                </span>
            ) : (
                <>
                    {leftIcon && (
                        <span
                            className="inline-flex shrink-0 items-center"
                            aria-hidden="true"
                        >
                            {leftIcon}
                        </span>
                    )}
                    <span>{children}</span>
                    {rightIcon && (
                        <span
                            className="inline-flex shrink-0 items-center"
                            aria-hidden="true"
                        >
                            {rightIcon}
                        </span>
                    )}
                </>
            )}
        </button>
    );
}
