import React, { useState, useEffect, useMemo, useCallback } from "react";
import { X, Check, ChevronDown, ChevronUp, AlertCircle, ArrowLeft } from "lucide-react";
import { PaymentOption } from "./PaymentMethodSection";
import { toast } from "sonner";

interface PaymentSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedPaymentId: string;
    onConfirmPayment: (method: PaymentOption) => void;
}

export interface BankVAItem {
    id: string;
    nama: string;
    subjudul: string;
    ikon: string;
    tipe: "bank_transfer" | "echannel";
}

const VA_BANKS: BankVAItem[] = [
    {
        id: "va_bca",
        nama: "BCA",
        subjudul: "Virtual Account BCA (Automated)",
        ikon: "/assets/ikon/payment-bca.svg",
        tipe: "bank_transfer",
    },
    {
        id: "va_mandiri",
        nama: "Mandiri",
        subjudul: "Mandiri Bill / Livin' by Mandiri",
        ikon: "/assets/ikon/payment-mandiri.svg",
        tipe: "echannel",
    },
    {
        id: "va_bri",
        nama: "BRI",
        subjudul: "Virtual Account BRIVA",
        ikon: "/assets/ikon/payment-bri.svg",
        tipe: "bank_transfer",
    },
    {
        id: "va_bni",
        nama: "BNI",
        subjudul: "Virtual Account BNI",
        ikon: "/assets/ikon/payment-bni.svg",
        tipe: "bank_transfer",
    },
    {
        id: "va_permata",
        nama: "Permata",
        subjudul: "Virtual Account Permata Bank",
        ikon: "/assets/ikon/payment-permata.svg",
        tipe: "bank_transfer",
    },
];

export default function PaymentSelectModal({
    isOpen,
    onClose,
    selectedPaymentId,
    onConfirmPayment,
}: PaymentSelectModalProps) {
    const [temporaryId, setTemporaryId] = useState<string>(selectedPaymentId);
    const [isOtherExpanded, setIsOtherExpanded] = useState<boolean>(true);
    const [showingVaSubmenu, setShowingVaSubmenu] = useState<boolean>(false);

    // Sinkronisasi state saat modal dibuka
    useEffect(() => {
        if (isOpen) {
            setTemporaryId(selectedPaymentId);
            setShowingVaSubmenu(selectedPaymentId.startsWith("va_"));
            setIsOtherExpanded(true);
        }
    }, [isOpen, selectedPaymentId]);

    // Aksesibilitas: Keyboard Escape & Lock Body Scroll
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (showingVaSubmenu) {
                    setShowingVaSubmenu(false);
                } else {
                    onClose();
                }
            }
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose, showingVaSubmenu]);

    // Cari item yang sedang dipilih
    const selectedItem = useMemo<PaymentOption | null>(() => {
        if (temporaryId === "qris") {
            return {
                id: "qris",
                nama: "QRIS",
                subjudul: "GoPay, OVO, Dana, ShopeePay & Mobile Banking",
                tipe: "qris",
                ikon: "/assets/ikon/payment-qris.svg",
            };
        }

        const vaMatch = VA_BANKS.find((b) => b.id === temporaryId);
        if (vaMatch) {
            return {
                id: vaMatch.id,
                nama: `${vaMatch.nama} Virtual Account`,
                subjudul: vaMatch.subjudul,
                tipe: vaMatch.tipe,
                ikon: vaMatch.ikon,
            };
        }

        if (temporaryId === "ovo") {
            return {
                id: "ovo",
                nama: "OVO",
                subjudul: "Pembayaran Instan via OVO",
                tipe: "qris",
                ikon: "/assets/ikon/payment-ovo.svg",
            };
        }

        if (temporaryId === "credit_card") {
            return {
                id: "credit_card",
                nama: "Credit/Debit Card",
                subjudul: "Visa, Mastercard, JCB",
                tipe: "credit_card",
                ikon: "/assets/ikon/payment-visa.svg",
            };
        }

        if (temporaryId === "alfamart") {
            return {
                id: "alfamart",
                nama: "Alfamart",
                subjudul: "Gerai Alfamart / AlfaMIDI",
                tipe: "cstore",
                ikon: "/assets/ikon/payment-alfamart.svg",
            };
        }

        if (temporaryId === "akulaku") {
            return {
                id: "akulaku",
                nama: "Akulaku",
                subjudul: "Cicilan Akulaku PayLater",
                tipe: "paylater",
                ikon: "",
            };
        }

        return null;
    }, [temporaryId]);

    const handleSelectMethod = (id: string) => {
        if (id === "virtual_account") {
            setShowingVaSubmenu(true);
            return;
        }

        if (id === "alfamart" || id === "akulaku" || id === "credit_card") {
            toast.info(`${id === "credit_card" ? "Credit Card" : id.toUpperCase()} saat ini dalam mode Sandbox Midtrans. Disarankan menggunakan QRIS atau Virtual Account.`);
        }

        setTemporaryId(id);
    };

    const handleConfirm = useCallback(() => {
        if (selectedItem) {
            onConfirmPayment(selectedItem);
            onClose();
        } else {
            toast.error("Silakan pilih metode pembayaran terlebih dahulu");
        }
    }, [selectedItem, onConfirmPayment, onClose]);

    if (!isOpen) return null;

    const isVaSelected = temporaryId.startsWith("va_");

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Modal persis Screenshot #1 */}
                <div className="relative px-6 py-4.5 border-b border-slate-100 flex items-center justify-center">
                    {showingVaSubmenu ? (
                        <button
                            type="button"
                            onClick={() => setShowingVaSubmenu(false)}
                            className="absolute left-5 p-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                            aria-label="Kembali"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali</span>
                        </button>
                    ) : null}

                    <h3
                        id="payment-modal-title"
                        className="text-base font-bold text-slate-800 tracking-tight"
                    >
                        {showingVaSubmenu ? "Pilih Bank Virtual Account" : "Payment Method"}
                    </h3>

                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-5 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer rounded-full"
                        aria-label="Tutup modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-5">
                    {showingVaSubmenu ? (
                        /* Submenu Bank Virtual Account */
                        <div className="space-y-2">
                            <p className="text-xs text-slate-500 mb-3">
                                Pilih bank untuk mendapatkan Nomor Virtual Account otomatis:
                            </p>
                            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                                {VA_BANKS.map((bank) => {
                                    const isSelected = temporaryId === bank.id;
                                    return (
                                        <div
                                            key={bank.id}
                                            onClick={() => {
                                                setTemporaryId(bank.id);
                                            }}
                                            className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                                                isSelected
                                                    ? "bg-red-50/30"
                                                    : "hover:bg-slate-50"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-8 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center shrink-0">
                                                    <img
                                                        src={bank.ikon}
                                                        alt={bank.nama}
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900">
                                                        {bank.nama} Virtual Account
                                                    </p>
                                                    <p className="text-[11px] text-slate-500">
                                                        {bank.subjudul}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="shrink-0">
                                                {isSelected ? (
                                                    <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-xs">
                                                        <Check className="w-3.5 h-3.5 stroke-3" />
                                                    </span>
                                                ) : (
                                                    <span className="w-5 h-5 rounded-full border border-slate-300 bg-white block" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        /* Main Payment Method Layout Sesuai Screenshot #1 */
                        <>
                            {/* Primary Method: QRIS Card */}
                            <div>
                                <button
                                    type="button"
                                    onClick={() => handleSelectMethod("qris")}
                                    className={`w-full h-16 sm:h-18 px-6 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                                        temporaryId === "qris"
                                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                                            : "border-slate-200 hover:border-slate-300 bg-white shadow-2xs"
                                    }`}
                                >
                                    <img
                                        src="/assets/ikon/payment-qris.svg"
                                        alt="QRIS"
                                        className="h-7 sm:h-8 object-contain"
                                    />
                                </button>
                            </div>

                            {/* Collapsible: Other Methods */}
                            <div className="space-y-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsOtherExpanded((prev) => !prev)}
                                    className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                                >
                                    <span>Other Methods</span>
                                    {isOtherExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-slate-500" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-slate-500" />
                                    )}
                                </button>

                                {isOtherExpanded && (
                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                        {/* OVO */}
                                        <button
                                            type="button"
                                            onClick={() => handleSelectMethod("ovo")}
                                            className={`h-16 px-4 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                                                temporaryId === "ovo"
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                                                    : "border-slate-200 hover:border-slate-300 bg-white"
                                            }`}
                                        >
                                            <span className="text-lg font-black text-[#4c3494] tracking-tight">
                                                OVO
                                            </span>
                                        </button>

                                        {/* Virtual Account (Triggers Submenu) */}
                                        <button
                                            type="button"
                                            onClick={() => handleSelectMethod("virtual_account")}
                                            className={`h-16 px-4 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                                                isVaSelected
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                                                    : "border-slate-200 hover:border-slate-300 bg-white"
                                            }`}
                                        >
                                            <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                                                Virtual Account
                                            </span>
                                            {isVaSelected && (
                                                <span className="text-[10px] text-primary font-semibold truncate max-w-full">
                                                    {VA_BANKS.find((b) => b.id === temporaryId)?.nama || "Pilih Bank"}
                                                </span>
                                            )}
                                        </button>

                                        {/* Alfamart */}
                                        <button
                                            type="button"
                                            onClick={() => handleSelectMethod("alfamart")}
                                            className={`h-16 px-4 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                                                temporaryId === "alfamart"
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                                                    : "border-slate-200 hover:border-slate-300 bg-white"
                                            }`}
                                        >
                                            <img
                                                src="/assets/ikon/payment-alfamart.svg"
                                                alt="Alfamart"
                                                className="h-6 object-contain"
                                            />
                                        </button>

                                        {/* Akulaku */}
                                        <button
                                            type="button"
                                            onClick={() => handleSelectMethod("akulaku")}
                                            className={`h-16 px-4 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                                                temporaryId === "akulaku"
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                                                    : "border-slate-200 hover:border-slate-300 bg-white"
                                            }`}
                                        >
                                            <span className="text-xs sm:text-sm font-bold text-slate-800">
                                                Akulaku
                                            </span>
                                        </button>

                                        {/* Credit/Debit Card */}
                                        <button
                                            type="button"
                                            onClick={() => handleSelectMethod("credit_card")}
                                            className={`h-16 px-4 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                                                temporaryId === "credit_card"
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                                                    : "border-slate-200 hover:border-slate-300 bg-white"
                                            }`}
                                        >
                                            <span className="text-xs sm:text-sm font-bold text-slate-800 text-center">
                                                Credit/Debit Card
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Sticky Footer: Confirm Button persis Screenshot #1 */}
                <div className="p-5 border-t border-slate-100 bg-white">
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!selectedItem}
                        className={`w-full py-3.5 px-6 rounded-full font-bold text-sm sm:text-base transition-all cursor-pointer shadow-xs ${
                            selectedItem
                                ? "bg-primary hover:bg-primary-hover text-white active:scale-[0.99]"
                                : "bg-red-200 text-white cursor-not-allowed"
                        }`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

