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

export type DrawerSide = "left" | "right";
export type DrawerMaxWidth = "sm" | "md" | "lg" | "xl" | "full";

interface DrawerProps {
    isOpen?: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    side?: DrawerSide;
    maxWidth?: DrawerMaxWidth;
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    panelClassName?: string;
    bodyClassName?: string;
}

const MAX_WIDTHS: Record<DrawerMaxWidth, string> = {
    sm: "max-w-xs",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full",
};

export default function Drawer({
    isOpen = false,
    onClose,
    title,
    description,
    side = "right",
    maxWidth = "md",
    showCloseButton = true,
    closeOnOverlayClick = true,
    header,
    footer,
    children,
    className,
    panelClassName,
    bodyClassName,
}: DrawerProps) {
    const isRight = side === "right";

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
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <DialogBackdrop className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" />
                </TransitionChild>

                {/* Viewport Kontainer Geser */}
                <div className="fixed inset-0 overflow-hidden">
                    <div
                        className={cn(
                            "pointer-events-none fixed inset-y-0 flex max-w-full",
                            isRight
                                ? "right-0 pl-6 sm:pl-10"
                                : "left-0 pr-6 sm:pr-10",
                        )}
                    >
                        <TransitionChild
                            as={React.Fragment}
                            enter="transform transition ease-out duration-300"
                            enterFrom={
                                isRight
                                    ? "translate-x-full"
                                    : "-translate-x-full"
                            }
                            enterTo="translate-x-0"
                            leave="transform transition ease-in duration-200"
                            leaveFrom="translate-x-0"
                            leaveTo={
                                isRight
                                    ? "translate-x-full"
                                    : "-translate-x-full"
                            }
                        >
                            <DialogPanel
                                className={cn(
                                    "pointer-events-auto w-screen bg-white shadow-2xl flex flex-col h-full max-h-dvh border-slate-200/80 focus:outline-none",
                                    isRight ? "border-l" : "border-r",
                                    MAX_WIDTHS[maxWidth],
                                    panelClassName,
                                )}
                            >
                                {/* Header Drawer */}
                                {header ? (
                                    header
                                ) : title || showCloseButton ? (
                                    <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-white shrink-0">
                                        <div className="space-y-0.5 min-w-0 pr-2">
                                            {title && (
                                                <DialogTitle
                                                    as="h3"
                                                    className="text-base font-bold text-slate-900 tracking-tight leading-snug truncate"
                                                >
                                                    {title}
                                                </DialogTitle>
                                            )}
                                            {description && (
                                                <DialogDescription className="text-xs text-slate-500 leading-relaxed truncate">
                                                    {description}
                                                </DialogDescription>
                                            )}
                                        </div>

                                        {showCloseButton && (
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="p-2 -mr-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
                                                aria-label="Tutup panel"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ) : null}

                                {/* Body Area (Scrollable) */}
                                <div
                                    className={cn(
                                        "flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 text-xs sm:text-sm text-slate-700 leading-relaxed",
                                        bodyClassName,
                                    )}
                                >
                                    {children}
                                </div>

                                {/* Footer Area (Sticky Bottom) */}
                                {footer && (
                                    <div className="px-5 sm:px-6 py-4 bg-slate-50/90 border-t border-slate-100 shrink-0">
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
