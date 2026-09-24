import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'emerald';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    children: React.ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    children,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles =
        'inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
        primary: 'bg-[#E52027] hover:bg-[#CC1C22] text-white shadow-sm active:scale-95',
        secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95',
        ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
        danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:scale-95',
        emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs rounded-lg',
        md: 'px-4 py-2.5 text-xs sm:text-sm rounded-xl',
        lg: 'px-6 py-3.5 text-sm sm:text-base rounded-2xl',
    };

    return (
        <button
            disabled={disabled || loading}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {loading ? (
                <span className="inline-flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Memproses...</span>
                </span>
            ) : (
                children
            )}
        </button>
    );
}
