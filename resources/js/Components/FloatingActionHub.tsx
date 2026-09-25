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
                                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.586 1.761.88 2.79.88 3.179 0 5.767-2.587 5.767-5.766.001-3.187-2.575-5.766-5.766-5.766zm9.969 5.766c0 5.422-4.408 9.83-9.83 9.83-1.637 0-3.172-.403-4.52-1.111l-5.65 1.479 1.506-5.505c-.777-1.393-1.218-3-1.218-4.693 0-5.422 4.408-9.83 9.83-9.83 5.424 0 9.832 4.408 9.832 9.83z" />
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
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.586 1.761.88 2.79.88 3.179 0 5.767-2.587 5.767-5.766.001-3.187-2.575-5.766-5.766zm9.969 5.766c0 5.422-4.408 9.83-9.83 9.83-1.637 0-3.172-.403-4.52-1.111l-5.65 1.479 1.506-5.505c-.777-1.393-1.218-3-1.218-4.693 0-5.422 4.408-9.83 9.83-9.83 5.424 0 9.832 4.408 9.832 9.83z" />
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
