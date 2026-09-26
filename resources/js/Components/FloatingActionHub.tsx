import React, { useState, useEffect, useRef } from "react";
import { X, Percent, Gift, Mail, ArrowUpRight } from "lucide-react";
import DiscountsModal from "../Components/PDP/DiscountsModal";
import { SITUS_CONFIG } from "../Config/situsConfig";

interface FloatingActionHubProps {
    onOpenCart?: () => void;
    cartCount?: number;
}

// Ikon WhatsApp Vektor Resmi & Presisi
function OfficialWhatsAppIcon({
    className = "w-5 h-5",
}: {
    className?: string;
}) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.68C7.02 10.88 7.89 12.04 8.01 12.2C8.13 12.37 9.7 14.79 12.11 15.83C12.69 16.08 13.14 16.23 13.49 16.34C14.07 16.53 14.6 16.5 15.02 16.44C15.49 16.37 16.46 15.85 16.66 15.29C16.86 14.73 16.86 14.25 16.8 14.15C16.74 14.05 16.58 13.99 16.34 13.87C16.1 13.75 14.92 13.17 14.7 13.09C14.48 13.01 14.32 12.97 14.16 13.21C14 13.45 13.54 13.99 13.4 14.15C13.26 14.31 13.12 14.33 12.88 14.21C12.64 14.09 11.87 13.84 10.96 13.02C10.25 12.39 9.77 11.61 9.63 11.37C9.49 11.13 9.61 11 9.73 10.88C9.84 10.77 9.98 10.59 10.1 10.45C10.22 10.31 10.26 10.21 10.34 10.05C10.42 9.89 10.38 9.75 10.32 9.63C10.26 9.51 9.78 8.33 9.58 7.85C9.39 7.38 9.19 7.44 9.04 7.43C8.9 7.43 8.74 7.33 8.53 7.33Z" />
        </svg>
    );
}

// Ikon Balon Percakapan
function ChatBubbleIcon({ className = "w-6 h-6" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}

export default function FloatingActionHub({
    cartCount = 0,
}: FloatingActionHubProps) {
    const [isWaOpen, setIsWaOpen] = useState(false);
    const [isVoucherOpen, setIsVoucherOpen] = useState(false);
    const [mascotError, setMascotError] = useState(false);

    const waCardRef = useRef<HTMLDivElement>(null);
    const waTriggerRef = useRef<HTMLButtonElement>(null);

    const waNumber = SITUS_CONFIG?.whatsappCS || "6281234567890";
    const waLink = `https://api.whatsapp.com/send?phone=${waNumber}&text=${encodeURIComponent(
        "Halo CRSL, saya ingin bertanya seputar produk dan pesanan",
    )}`;
    const emailLink = `mailto:support@crsl-store.id?subject=${encodeURIComponent(
        "Tanya CRSL Store",
    )}&body=${encodeURIComponent("Halo Tim CRSL,\n\nSaya ingin menanyakan:")}`;

    // Menutup popup saat klik di luar atau tekan tombol Esc
    useEffect(() => {
        if (!isWaOpen) return;

        function handleClickOutside(e: MouseEvent) {
            if (
                waCardRef.current &&
                !waCardRef.current.contains(e.target as Node) &&
                waTriggerRef.current &&
                !waTriggerRef.current.contains(e.target as Node)
            ) {
                setIsWaOpen(false);
            }
        }

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setIsWaOpen(false);
                waTriggerRef.current?.focus();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isWaOpen]);

    // Offset posisi bawah dengan dukungan safe area iOS
    const bottomPositionClass =
        cartCount > 0
            ? "bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] sm:bottom-6"
            : "bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:bottom-6";

    return (
        <>
            {/* 1. SISI KANAN TENGAH: Launcher Tab Diskon / Kupon */}
            <aside
                aria-label="Promo Cepat"
                className="fixed right-0 top-1/2 -translate-y-1/2 z-30"
            >
                <button
                    type="button"
                    onClick={() => setIsVoucherOpen(true)}
                    className="flex items-center gap-1.5 py-3 px-2 bg-[#E52027] hover:bg-[#CC1C22] active:bg-[#B3171D] text-white rounded-l-2xl shadow-xl transition-all duration-200 hover:-translate-x-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600 focus-visible:outline-none cursor-pointer group"
                    aria-label="Lihat kupon diskon dan promo yang tersedia"
                >
                    <Percent className="w-4 h-4 stroke-[2.5] group-hover:rotate-12 transition-transform duration-200" />
                    <span className="[writing-mode:vertical-rl] text-[10px] font-black tracking-widest uppercase hidden sm:inline-block">
                        Voucher
                    </span>
                </button>
            </aside>

            {/* 2. SISI KIRI BAWAH: Maskot Loyalty / Member Rewards */}
            <div
                className={`fixed left-4 ${bottomPositionClass} z-30 transition-all duration-300`}
            >
                <div className="relative group">
                    <button
                        type="button"
                        onClick={() => setIsVoucherOpen(true)}
                        className="w-12 h-12 rounded-2xl bg-white hover:bg-slate-50 active:scale-95 text-slate-800 shadow-lg border border-slate-200/90 flex items-center justify-center transition-all duration-200 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none cursor-pointer"
                        aria-label="Buka reward dan promo eksklusif CRSL"
                    >
                        {!mascotError ? (
                            <img
                                src="/favicon.webp"
                                alt="CRSL Mascot"
                                width={28}
                                height={28}
                                className="w-7 h-7 object-contain drop-shadow-2xs group-hover:scale-110 transition-transform duration-200"
                                onError={() => setMascotError(true)}
                            />
                        ) : (
                            <Gift className="w-5 h-5 text-[#E52027]" />
                        )}

                        {/* Indikator Badge Interaksi */}
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#E52027] border-2 border-white" />
                        </span>
                    </button>

                    {/* Tooltip Hover untuk Desktop */}
                    <div className="hidden sm:block absolute left-14 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150">
                        Klaim Hadiah & Voucher
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                    </div>
                </div>
            </div>

            {/* 3. SISI KANAN BAWAH: Help Center & WhatsApp CS */}
            <div
                className={`fixed right-4 ${bottomPositionClass} z-30 flex flex-col items-end gap-3 transition-all duration-300`}
            >
                {/* Pop-up Dialog Bantuan */}
                {isWaOpen && (
                    <div
                        ref={waCardRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cs-support-title"
                        className="w-[310px] sm:w-[340px] max-w-[calc(100vw-32px)] bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200 z-50 text-left"
                    >
                        {/* Header Dialog */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden shrink-0">
                                    <img
                                        src="/favicon.webp"
                                        alt="CRSL Logo"
                                        className="w-6 h-6 object-contain"
                                        onError={(e) => {
                                            (
                                                e.target as HTMLElement
                                            ).style.display = "none";
                                        }}
                                    />
                                </div>
                                <div>
                                    <h4
                                        id="cs-support-title"
                                        className="text-sm font-black text-slate-900 tracking-tight"
                                    >
                                        Customer Care CRSL
                                    </h4>
                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Siap Membantu (Online)
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsWaOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                                aria-label="Tutup jendela chat bantuan"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Teks Pengantar */}
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Halo Freen! Ada kendala saat memilih ukuran,
                            informasi stok, atau konfirmasi pesanan? Hubungi tim
                            support kami:
                        </p>

                        {/* Opsi Kontak */}
                        <div className="flex flex-col gap-2">
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba5a] active:scale-[0.98] text-white font-bold text-xs rounded-2xl flex items-center justify-between shadow-xs transition-all cursor-pointer"
                                aria-label="Hubungi WhatsApp Customer Support"
                            >
                                <span className="flex items-center gap-2.5">
                                    <OfficialWhatsAppIcon className="w-4 h-4" />
                                    <span>Chat via WhatsApp</span>
                                </span>
                                <ArrowUpRight className="w-4 h-4 opacity-80" />
                            </a>

                            <a
                                href={emailLink}
                                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 active:scale-[0.98] text-slate-700 font-bold text-xs rounded-2xl flex items-center justify-between border border-slate-200/80 transition-all cursor-pointer"
                                aria-label="Kirim tiket pertanyaan melalui email"
                            >
                                <span className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <span>Kirim Email Support</span>
                                </span>
                                <ArrowUpRight className="w-4 h-4 text-slate-400" />
                            </a>
                        </div>
                    </div>
                )}

                {/* Tombol Pemicu Bantuan */}
                <button
                    ref={waTriggerRef}
                    type="button"
                    onClick={() => setIsWaOpen(!isWaOpen)}
                    className={`w-13 h-13 rounded-2xl ${
                        isWaOpen
                            ? "bg-slate-900 text-white hover:bg-slate-800"
                            : "bg-[#25D366] hover:bg-[#20ba5a] text-white"
                    } shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366] focus-visible:outline-none cursor-pointer border-2 border-white`}
                    aria-label={
                        isWaOpen
                            ? "Tutup kotak pesan bantuan"
                            : "Buka bantuan pelanggan CRSL Official"
                    }
                    aria-expanded={isWaOpen}
                >
                    {isWaOpen ? (
                        <X className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                        <ChatBubbleIcon className="w-6 h-6 stroke-[2]" />
                    )}
                </button>
            </div>

            {/* Modal Kupon Diskon */}
            <DiscountsModal
                isOpen={isVoucherOpen}
                onClose={() => setIsVoucherOpen(false)}
            />
        </>
    );
}
