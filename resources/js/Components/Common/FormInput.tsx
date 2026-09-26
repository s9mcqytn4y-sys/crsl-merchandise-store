import React, { forwardRef } from "react";

export interface FormInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    sublabel?: string;
    error?: string;
    icon?: React.ReactNode;
    rightElement?: React.ReactNode;
    containerClassName?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    (
        {
            label,
            sublabel,
            error,
            icon,
            rightElement,
            className = "",
            containerClassName = "",
            id,
            disabled,
            ...props
        },
        ref,
    ) => {
        const inputId = id || props.name;

        return (
            <div className={`w-full space-y-1.5 ${containerClassName}`}>
                {label && (
                    <div className="flex items-center justify-between">
                        <label
                            htmlFor={inputId}
                            className="block text-xs font-semibold text-slate-700 tracking-tight"
                        >
                            {label}
                        </label>
                        {sublabel && (
                            <span className="text-[11px] text-slate-400">
                                {sublabel}
                            </span>
                        )}
                    </div>
                )}

                <div
                    className={`relative flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border transition-all duration-200 ${
                        error
                            ? "border-red-400 ring-1 ring-red-200"
                            : "border-slate-200/90 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-300"
                    } ${disabled ? "bg-slate-50 opacity-75 cursor-not-allowed select-none" : ""}`}
                >
                    {icon && (
                        <div className="shrink-0 text-slate-400">{icon}</div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        disabled={disabled}
                        className={`w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 border-0 p-0 m-0 outline-none ${className}`}
                        {...props}
                    />

                    {rightElement && (
                        <div className="shrink-0 flex items-center">
                            {rightElement}
                        </div>
                    )}
                </div>

                {error && (
                    <p
                        id={`${inputId}-error`}
                        role="alert"
                        className="text-[11px] font-medium text-red-500 pl-1 animate-in fade-in duration-200"
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
