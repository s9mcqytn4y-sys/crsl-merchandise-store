import React, { forwardRef, useId } from "react";
import { cn } from "../../lib/utils";

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    sublabel?: string;
    error?: string;
    icon?: React.ReactNode;
    rightElement?: React.ReactNode;
    containerClassName?: string;
    isRequired?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    (
        {
            label,
            sublabel,
            error,
            icon,
            rightElement,
            className,
            containerClassName,
            id,
            name,
            disabled,
            required,
            isRequired,
            ...props
        },
        ref,
    ) => {
        // Fallback ID unik yang stabil untuk SSR & Hydration Inertia.js
        const generatedId = useId();
        const inputId = id || name || generatedId;
        const errorId = `${inputId}-error`;
        const showRequiredMark = isRequired ?? required;

        return (
            <div
                className={cn(
                    "w-full space-y-1.5 text-left",
                    containerClassName,
                )}
            >
                {/* Header Label & Sublabel */}
                {(label || sublabel) && (
                    <div className="flex items-center justify-between gap-2">
                        {label && (
                            <label
                                htmlFor={inputId}
                                className="block text-xs font-bold text-slate-700 tracking-tight select-none cursor-pointer"
                            >
                                {label}
                                {showRequiredMark && (
                                    <span
                                        className="text-[#E52027] ml-1 font-bold"
                                        aria-hidden="true"
                                    >
                                        *
                                    </span>
                                )}
                            </label>
                        )}
                        {sublabel && (
                            <span className="text-[11px] font-medium text-slate-400 select-none">
                                {sublabel}
                            </span>
                        )}
                    </div>
                )}

                {/* Input Container Wrapper */}
                <div
                    className={cn(
                        "relative flex items-center gap-3 px-3.5 sm:px-4 py-2.5 rounded-2xl bg-white border transition-all duration-200 shadow-2xs",
                        error
                            ? "border-rose-500 ring-2 ring-rose-500/10 focus-within:border-rose-600 focus-within:ring-rose-500/20"
                            : "border-slate-200/90 hover:border-slate-300 focus-within:border-[#E52027] focus-within:ring-2 focus-within:ring-[#E52027]/10",
                        disabled &&
                            "bg-slate-50/80 opacity-60 cursor-not-allowed select-none pointer-events-none",
                    )}
                >
                    {/* Leading Icon Slot */}
                    {icon && (
                        <div
                            className={cn(
                                "shrink-0 transition-colors pointer-events-none",
                                error
                                    ? "text-rose-500"
                                    : "text-slate-400 group-focus-within:text-[#E52027]",
                            )}
                            aria-hidden="true"
                        >
                            {icon}
                        </div>
                    )}

                    {/* Native Input Element */}
                    <input
                        ref={ref}
                        id={inputId}
                        name={name}
                        disabled={disabled}
                        required={required}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? errorId : undefined}
                        className={cn(
                            "w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 placeholder:text-xs sm:placeholder:text-sm focus:outline-none focus:ring-0 border-0 p-0 m-0 outline-none font-normal disabled:cursor-not-allowed",
                            className,
                        )}
                        {...props}
                    />

                    {/* Trailing Right Element Slot */}
                    {rightElement && (
                        <div className="shrink-0 flex items-center text-slate-400">
                            {rightElement}
                        </div>
                    )}
                </div>

                {/* Pesan Kesalahan Aksesibel */}
                {error && (
                    <p
                        id={errorId}
                        role="alert"
                        aria-live="polite"
                        className="text-[11px] font-semibold text-rose-600 pl-1 animate-in fade-in duration-150 leading-tight"
                    >
                        {error}
                    </p>
                )}
            </div>
        );
    },
);

FormInput.displayName = "FormInput";
export default FormInput;
