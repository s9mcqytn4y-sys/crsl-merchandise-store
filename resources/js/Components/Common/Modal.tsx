import React from "react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogDescription,
    DialogBackdrop,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export type ModalMaxWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
export type ModalPosition = "center" | "top-right" | "top";

interface ModalProps {
    isOpen?: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: ModalMaxWidth;
    position?: ModalPosition;
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    className?: string;
    panelClassName?: string;
}

const MAX_WIDTHS: Record<ModalMaxWidth, string> = {
    sm: "max-w-xs",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    full: "max-w-5xl",
};

const POSITIONS: Record<ModalPosition, string> = {
    center: "items-center justify-center p-3 sm:p-4",
    "top-right":
        "items-start justify-center sm:justify-end p-3 sm:p-6 sm:pt-16 sm:pr-16",
    top: "items-start justify-center pt-8 sm:pt-14 px-3 sm:px-4",
};

export default function Modal({
    isOpen = false,
    onClose,
    title,
    description,
    children,
    footer,
    maxWidth = "md",
    position = "center",
    showCloseButton = true,
    closeOnOverlayClick = true,
    className,
    panelClassName,
}: ModalProps) {
    const handleClose = () => {
        if (closeOnOverlayClick) {
            onClose();
        }
    };

    return (
        <Transition show={Boolean(isOpen)} as={React.Fragment}>
            <Dialog
                as="div"
                className={cn("relative z-50 select-none", className)}
                onClose={handleClose}
            >
                {/* Backdrop Layer */}
                <TransitionChild
                    as={React.Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <DialogBackdrop className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" />
                </TransitionChild>

                {/* Kontainer Viewport Scroll */}
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div
                        className={cn(
                            "flex min-h-full text-center overscroll-contain",
                            POSITIONS[position],
                        )}
                    >
                        <TransitionChild
                            as={React.Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95 -translate-y-2"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 -translate-y-2"
                        >
                            <DialogPanel
                                className={cn(
                                    "w-full transform rounded-3xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-200/80 flex flex-col max-h-[calc(100dvh-2rem)] overflow-hidden",
                                    MAX_WIDTHS[maxWidth],
                                    panelClassName,
                                )}
                            >
                                {/* Header Modal */}
                                {(title || showCloseButton) && (
                                    <div className="flex items-start justify-between border-b border-slate-100 px-5 sm:px-6 py-4 shrink-0 bg-white">
                                        <div className="space-y-1 min-w-0 pr-2">
                                            {title && (
                                                <DialogTitle
                                                    as="h3"
                                                    className="text-base font-bold text-slate-900 tracking-tight leading-snug"
                                                >
                                                    {title}
                                                </DialogTitle>
                                            )}
                                            {description && (
                                                <DialogDescription className="text-xs text-slate-500 leading-relaxed">
                                                    {description}
                                                </DialogDescription>
                                            )}
                                        </div>

                                        {showCloseButton && (
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="p-2 -mr-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
                                                aria-label="Tutup jendela modal"
                                            >
                                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Body Area (Scrollable bila konten panjang) */}
                                <div className="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-contain text-xs sm:text-sm text-slate-700 leading-relaxed">
                                    {children}
                                </div>

                                {/* Footer Opsional */}
                                {footer && (
                                    <div className="px-5 sm:px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 shrink-0 flex items-center justify-end gap-2.5">
                                        {footer}
                                    </div>
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
