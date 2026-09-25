import React, { useState } from "react";
import { MessageCircle, X, Percent, ShoppingBag, ShieldCheck } from "lucide-react";
import VoucherModal from "./VoucherModal";
import { SITUS_CONFIG } from "../Config/situsConfig";

interface FloatingActionHubProps {
    cartCount?: number;
    onOpenCart?: () => void;
}

export default function FloatingActionHub({
    cartCount = 0,
    onOpenCart,
}: FloatingActionHubProps) {
    const [isWaOpen, setIsWaOpen] = useState(false);
    const [isVoucherOpen, setIsVoucherOpen] = useState(false);

    const waNumber = SITUS_CONFIG.whatsappCS || "6281234567890";
    const waLink = `https://api.whatsapp.com/send?phone=${waNumber}&text=${encodeURIComponent(
        "Halo CRSL, saya ingin bertanya seputar produk dan pesanan di website.",
    )}`;

    return (
        <>
            {/* 1. RIGHT EDGE FLOATING CTA: Available Voucher Tab (%) (Screenshot 2) */}
            <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
                <button
                    type="button"
                    onClick={() => setIsVoucherOpen(true)}
                    className="flex items-center justify-center w-10 h-11 bg-[#E52027] hover:bg-[#CC1C22] text-white rounded-l-xl shadow-lg transition-transform duration-200 hover:-translate-x-1 focus-visible:ring-2 focus-visible:ring-[#E52027] focus-visible:outline-none cursor-pointer"
                    aria-label="Buka Available Voucher"
                    title="Available Voucher"
                >
                    <Percent className="w-5 h-5 stroke-[2.2]" />
                </button>
            </div>

            {/* 2. BOTTOM LEFT FLOATING CTA: Mascot Loyalty Launcher (Screenshot 2) */}
            <div className="fixed left-4 bottom-5 z-40">
                <button
                    type="button"
                    onClick={() => setIsVoucherOpen(true)}
                    className="w-12 h-12 rounded-full bg-[#E52027] hover:bg-[#CC1C22] text-white shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#E52027] focus-visible:outline-none"
                    aria-label="CRSL Loyalty & Voucher"
                    title="CRSL Rewards"
                >
                    <img
                        src="/favicon.webp"
                        alt="CRSL Mascot"
                        width={28}
                        height={28}
                        className="w-7 h-7 object-contain drop-shadow-xs"
                        onError={(e) => {
                            // Fallback jika icon belum siap
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                    />
                </button>
            </div>

            {/* 3. BOTTOM RIGHT FLOATING CTA: WhatsApp Support & Chat Support Card (Screenshot 2) */}
            <div className="fixed right-4 bottom-5 z-40 flex flex-col items-end gap-3">
                {/* Chat Support Popup Card (Screenshot 2) */}
                {isWaOpen && (
                    <div
                        role="dialog"
                        aria-label="Chat Support"
                        className="w-[320px] max-w-[calc(100vw-32px)] bg-[#F3F4F6] sm:bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200"
                    >
                        {/* Header Card */}
                        <div className="text-center">
                            <h4 className="text-base font-bold text-slate-800">
                                Chat Support
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">
                                We're available on Whatsapp!
                            </p>
                        </div>

                        {/* Button WhatsApp (Maroon / Red Tone Sesuai Screenshot 2) */}
                        <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3.5 px-4 bg-[#E52027] hover:bg-[#CC1C22] text-white font-bold text-sm rounded-full flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all duration-150 transform hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#E52027] focus-visible:outline-none cursor-pointer"
                        >
                            {/* WhatsApp SVG Icon */}
                            <svg
                                className="w-5 h-5 fill-current"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.476-.15-.677.15-.2.301-.776.98-.952 1.18-.175.201-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.676-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.151-.176.201-.301.301-.502.101-.201.05-.376-.025-.527-.075-.15-.677-1.632-.927-2.233-.244-.585-.492-.506-.677-.515-.175-.008-.376-.01-.577-.01-.201 0-.527.075-.802.376-.276.301-1.053 1.029-1.053 2.509 0 1.48 1.078 2.909 1.229 3.109.15.201 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.38.197 1.9.12.579-.087 1.78-.727 2.03-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.351zM12.05 2C6.516 2 2.022 6.494 2.022 12.028c0 1.767.461 3.493 1.336 5.01l-1.42 5.187 5.307-1.392c1.465.798 3.116 1.22 4.805 1.22 5.534 0 10.028-4.494 10.028-10.025C22.078 6.494 17.584 2 12.05 2zm0 18.25c-1.503 0-2.977-.405-4.264-1.17l-.306-.182-3.155.828.842-3.076-.2-.318c-.843-1.341-1.288-2.901-1.288-4.504 0-4.632 3.769-8.401 8.371-8.401 4.603 0 8.372 3.769 8.372 8.401 0 4.632-3.769 8.402-8.372 8.402z" />
                            </svg>
                            <span>Chat us on Whatsapp</span>
                        </a>
                    </div>
                )}

                {/* Floating Trigger Button: Toggles WA or Close (X) (Screenshot 2) */}
                <button
                    type="button"
                    onClick={() => setIsWaOpen(!isWaOpen)}
                    className={`w-13 h-13 rounded-full ${
                        isWaOpen
                            ? "bg-[#eab308] hover:bg-[#ca8a04] text-slate-900"
                            : "bg-[#E52027] hover:bg-[#CC1C22] text-white"
                    } shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#E52027] focus-visible:outline-none cursor-pointer`}
                    aria-label={isWaOpen ? "Tutup bantuan chat" : "Buka bantuan chat WhatsApp"}
                    aria-expanded={isWaOpen}
                >
                    {isWaOpen ? (
                        <X className="w-6 h-6 stroke-[3] text-slate-900" />
                    ) : (
                        <svg
                            className="w-6 h-6 fill-current"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.476-.15-.677.15-.2.301-.776.98-.952 1.18-.175.201-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.676-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.151-.176.201-.301.301-.502.101-.201.05-.376-.025-.527-.075-.15-.677-1.632-.927-2.233-.244-.585-.492-.506-.677-.515-.175-.008-.376-.01-.577-.01-.201 0-.527.075-.802.376-.276.301-1.053 1.029-1.053 2.509 0 1.48 1.078 2.909 1.229 3.109.15.201 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.38.197 1.9.12.579-.087 1.78-.727 2.03-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.351zM12.05 2C6.516 2 2.022 6.494 2.022 12.028c0 1.767.461 3.493 1.336 5.01l-1.42 5.187 5.307-1.392c1.465.798 3.116 1.22 4.805 1.22 5.534 0 10.028-4.494 10.028-10.025C22.078 6.494 17.584 2 12.05 2zm0 18.25c-1.503 0-2.977-.405-4.264-1.17l-.306-.182-3.155.828.842-3.076-.2-.318c-.843-1.341-1.288-2.901-1.288-4.504 0-4.632 3.769-8.401 8.371-8.401 4.603 0 8.372 3.769 8.372 8.401 0 4.632-3.769 8.402-8.372 8.402z" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Modal Available Voucher */}
            <VoucherModal
                isOpen={isVoucherOpen}
                onClose={() => setIsVoucherOpen(false)}
            />
        </>
    );
}
