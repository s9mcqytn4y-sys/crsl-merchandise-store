import {
    useState,
    useEffect,
    useMemo,
    useCallback,
    Fragment,
} from "react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogBackdrop,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import {
    X,
    Check,
    ChevronDown,
    ChevronUp,
    ArrowLeft,
    CreditCard,
} from "lucide-react";
import { PaymentOption } from "./PaymentMethodSection";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

interface PaymentSelectModalProps {
    isOpen?: boolean;
    onClose: () => void;
    selectedPaymentId?: string;
    onConfirmPayment: (method: PaymentOption) => void;
    className?: string;
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
        subjudul: "Virtual Account BCA (Otomatis)",
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
    isOpen = false,
    onClose,
    selectedPaymentId = "qris",
    onConfirmPayment,
    className,
}: PaymentSelectModalProps) {
    const isVisible = Boolean(isOpen);
    const [temporaryId, setTemporaryId] = useState<string>(selectedPaymentId);
    const [isOtherExpanded, setIsOtherExpanded] = useState<boolean>(true);
    const [showingVaSubmenu, setShowingVaSubmenu] = useState<boolean>(false);
    const [failedIcons, setFailedIcons] = useState<Record<string, boolean>>({});

    // Sinkronisasi state saat modal dibuka
    useEffect(() => {
        if (isVisible) {
            setTemporaryId(selectedPaymentId);
            setShowingVaSubmenu(selectedPaymentId.startsWith("va_"));
            setIsOtherExpanded(true);
        }
    }, [isVisible, selectedPaymentId]);

    // Cari entitas metode pembayaran aktif
    const selectedItem = useMemo<PaymentOption | null>(() => {
        if (temporaryId === "qris") {
            return {
                id: "qris",
                nama: "QRIS (GoPay, OVO, Dana, ShopeePay)",
                subjudul:
                    "Mendukung semua aplikasi e-wallet & m-banking berstandar QRIS",
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
                subjudul: "Pembayaran instan via aplikasi OVO",
                tipe: "qris",
                ikon: "/assets/ikon/payment-ovo.svg",
            };
        }

        if (temporaryId === "credit_card") {
            return {
                id: "credit_card",
                nama: "Kartu Kredit / Debit Online",
                subjudul: "Visa, Mastercard, JCB berlogo 3D Secure",
                tipe: "credit_card",
                ikon: "/assets/ikon/payment-visa.svg",
            };
        }

        if (temporaryId === "alfamart") {
            return {
                id: "alfamart",
                nama: "Alfamart / AlfaMIDI",
                subjudul: "Bayar di gerai Alfamart terdekat",
                tipe: "cstore",
                ikon: "/assets/ikon/payment-alfamart.svg",
            };
        }

        if (temporaryId === "akulaku") {
            return {
                id: "akulaku",
                nama: "Akulaku PayLater",
                subjudul: "Cicilan belanja online instan via Akulaku",
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
            toast.info(
                `${id === "credit_card" ? "Kartu Kredit" : id.toUpperCase()} saat ini dalam mode Sandbox Midtrans. Disarankan menggunakan QRIS atau Virtual Account.`,
            );
        }

        setTemporaryId(id);
    };

    const handleConfirm = useCallback(() => {
        if (selectedItem) {
            onConfirmPayment(selectedItem);
            onClose();
        } else {
            toast.error("Silakan pilih saluran pembayaran terlebih dahulu.");
        }
    }, [selectedItem, onConfirmPayment, onClose]);

    const handleIconError = (id: string) => {
        setFailedIcons((prev) => ({ ...prev, [id]: true }));
    };

    const isVaSelected = temporaryId.startsWith("va_");

    return (
        <Transition show={isVisible} as={Fragment}>
            <Dialog
                as="div"
                id="modal-pilih-metode-pembayaran"
                className={cn("relative z-50 select-none", className)}
                onClose={() => {
                    if (showingVaSubmenu) {
                        setShowingVaSubmenu(false);
                    } else {
                        onClose();
                    }
                }}
            >
                {/* Backdrop Layer */}
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <DialogBackdrop className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" />
                </TransitionChild>

                {/* Kontainer Modal Tengah */}
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95 -translate-y-2"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 -translate-y-2"
                        >
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-200/90 flex flex-col max-h-[calc(100dvh-3rem)]">
                                {/* Header Modal */}
                                <div className="relative px-5 py-4 border-b border-slate-100 flex items-center justify-center shrink-0">
                                    {showingVaSubmenu && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowingVaSubmenu(false)
                                            }
                                            className="absolute left-4 p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]"
                                            aria-label="Kembali ke pilihan utama pembayaran"
                                        >
                                            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
                                            <span>Kembali</span>
                                        </button>
                                    )}

                                    <DialogTitle
                                        as="h3"
                                        className="text-base font-black text-slate-900 tracking-tight"
                                    >
                                        {showingVaSubmenu
                                            ? "Pilih Bank Virtual Account"
                                            : "Pilih Metode Pembayaran"}
                                    </DialogTitle>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="absolute right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]"
                                        aria-label="Tutup jendela pembayaran"
                                    >
                                        <X className="w-4 h-4 stroke-[2.2]" />
                                    </button>
                                </div>

                                {/* Body Content */}
                                <div className="p-5 sm:p-6 overflow-y-auto space-y-4 no-scrollbar overscroll-contain flex-1">
                                    {showingVaSubmenu ? (
                                        /* Submenu Bank Virtual Account WAI-ARIA List */
                                        <div className="space-y-3">
                                            <p className="text-xs text-slate-500">
                                                Pilih rekening bank tujuan untuk
                                                mendapatkan nomor Virtual
                                                Account otomatis dari Midtrans:
                                            </p>

                                            <div
                                                role="radiogroup"
                                                aria-label="Daftar Bank Virtual Account"
                                                className="divide-y divide-slate-100 border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs"
                                            >
                                                {VA_BANKS.map((bank) => {
                                                    const isSelected =
                                                        temporaryId === bank.id;
                                                    const isIconBroken =
                                                        failedIcons[bank.id];

                                                    return (
                                                        <div
                                                            key={bank.id}
                                                            role="radio"
                                                            aria-checked={
                                                                isSelected
                                                            }
                                                            tabIndex={0}
                                                            onClick={() =>
                                                                setTemporaryId(
                                                                    bank.id,
                                                                )
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (
                                                                    e.key ===
                                                                        "Enter" ||
                                                                    e.key ===
                                                                        " "
                                                                ) {
                                                                    e.preventDefault();
                                                                    setTemporaryId(
                                                                        bank.id,
                                                                    );
                                                                }
                                                            }}
                                                            className={cn(
                                                                "p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors focus:outline-none focus-visible:bg-red-50/40",
                                                                isSelected
                                                                    ? "bg-red-50/30"
                                                                    : "hover:bg-slate-50/80 bg-white",
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0 pr-2">
                                                                <div className="w-12 h-8 bg-white border border-slate-200/80 rounded-xl p-1 flex items-center justify-center shrink-0 shadow-2xs">
                                                                    {!isIconBroken ? (
                                                                        <img
                                                                            src={
                                                                                bank.ikon
                                                                            }
                                                                            alt={
                                                                                bank.nama
                                                                            }
                                                                            className="max-h-full max-w-full object-contain"
                                                                            onError={() =>
                                                                                handleIconError(
                                                                                    bank.id,
                                                                                )
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        <span className="text-[10px] font-black text-slate-800 font-mono">
                                                                            {
                                                                                bank.nama
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-xs font-bold text-slate-900 truncate">
                                                                        {
                                                                            bank.nama
                                                                        }{" "}
                                                                        Virtual
                                                                        Account
                                                                    </p>
                                                                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                                                                        {
                                                                            bank.subjudul
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="shrink-0">
                                                                {isSelected ? (
                                                                    <span className="w-5 h-5 rounded-full bg-[#E52027] text-white flex items-center justify-center shadow-2xs">
                                                                        <Check className="w-3 h-3 stroke-[3]" />
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
                                        /* Main Payment Selection Layout */
                                        <>
                                            {/* Primary Card: QRIS */}
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSelectMethod(
                                                            "qris",
                                                        )
                                                    }
                                                    className={cn(
                                                        "w-full h-16 sm:h-18 px-5 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]",
                                                        temporaryId === "qris"
                                                            ? "border-[#E52027] bg-red-50/20 ring-2 ring-[#E52027]/20"
                                                            : "border-slate-200 hover:border-slate-300 bg-white",
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 px-2 bg-white rounded-xl border border-slate-100 flex items-center justify-center">
                                                            <img
                                                                src="/assets/ikon/payment-qris.svg"
                                                                alt="QRIS"
                                                                className="h-6 sm:h-7 object-contain"
                                                                onError={(
                                                                    e,
                                                                ) => {
                                                                    const target =
                                                                        e.currentTarget;
                                                                    target.style.display =
                                                                        "none";
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="text-left">
                                                            <span className="block text-xs font-black text-slate-900">
                                                                QRIS Instan
                                                            </span>
                                                            <span className="block text-[10px] text-slate-500 font-medium">
                                                                GoPay, OVO,
                                                                ShopeePay, BCA,
                                                                Mandiri
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0">
                                                        {temporaryId ===
                                                        "qris" ? (
                                                            <span className="w-5 h-5 rounded-full bg-[#E52027] text-white flex items-center justify-center shadow-2xs">
                                                                <Check className="w-3 h-3 stroke-[3]" />
                                                            </span>
                                                        ) : (
                                                            <span className="w-5 h-5 rounded-full border border-slate-300 bg-white block" />
                                                        )}
                                                    </div>
                                                </button>
                                            </div>

                                            {/* Collapsible: Saluran Lainnya */}
                                            <div className="space-y-3 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setIsOtherExpanded(
                                                            (prev) => !prev,
                                                        )
                                                    }
                                                    className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer py-1"
                                                >
                                                    <span className="uppercase tracking-wider">
                                                        Metode Pembayaran
                                                        Lainnya
                                                    </span>
                                                    {isOtherExpanded ? (
                                                        <ChevronUp className="w-4 h-4 text-slate-500" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 text-slate-500" />
                                                    )}
                                                </button>

                                                {isOtherExpanded && (
                                                    <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                                                        {/* OVO */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleSelectMethod(
                                                                    "ovo",
                                                                )
                                                            }
                                                            className={cn(
                                                                "h-16 px-3.5 rounded-2xl border flex items-center justify-center transition-all cursor-pointer shadow-2xs",
                                                                temporaryId ===
                                                                    "ovo"
                                                                    ? "border-[#E52027] bg-red-50/20 ring-1 ring-[#E52027]"
                                                                    : "border-slate-200 hover:border-slate-300 bg-white",
                                                            )}
                                                        >
                                                            <span className="text-base font-black text-[#4c3494] tracking-tight font-mono">
                                                                OVO
                                                            </span>
                                                        </button>

                                                        {/* Virtual Account Submenu Trigger */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleSelectMethod(
                                                                    "virtual_account",
                                                                )
                                                            }
                                                            className={cn(
                                                                "h-16 px-3.5 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xs",
                                                                isVaSelected
                                                                    ? "border-[#E52027] bg-red-50/20 ring-1 ring-[#E52027]"
                                                                    : "border-slate-200 hover:border-slate-300 bg-white",
                                                            )}
                                                        >
                                                            <span className="text-xs font-bold text-slate-900 leading-tight">
                                                                Virtual Account
                                                            </span>
                                                            <span className="text-[10px] text-[#E52027] font-bold truncate max-w-full mt-0.5">
                                                                {isVaSelected
                                                                    ? VA_BANKS.find(
                                                                          (b) =>
                                                                              b.id ===
                                                                              temporaryId,
                                                                      )?.nama ||
                                                                      "Pilih Bank"
                                                                    : "BCA, Mandiri, BRI..."}
                                                            </span>
                                                        </button>

                                                        {/* Alfamart */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleSelectMethod(
                                                                    "alfamart",
                                                                )
                                                            }
                                                            className={cn(
                                                                "h-16 px-3.5 rounded-2xl border flex items-center justify-center transition-all cursor-pointer shadow-2xs",
                                                                temporaryId ===
                                                                    "alfamart"
                                                                    ? "border-[#E52027] bg-red-50/20 ring-1 ring-[#E52027]"
                                                                    : "border-slate-200 hover:border-slate-300 bg-white",
                                                            )}
                                                        >
                                                            <img
                                                                src="/assets/ikon/payment-alfamart.svg"
                                                                alt="Alfamart"
                                                                className="h-6 object-contain"
                                                                onError={(
                                                                    e,
                                                                ) => {
                                                                    const target =
                                                                        e.currentTarget;
                                                                    target.style.display =
                                                                        "none";
                                                                }}
                                                            />
                                                        </button>

                                                        {/* Akulaku */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleSelectMethod(
                                                                    "akulaku",
                                                                )
                                                            }
                                                            className={cn(
                                                                "h-16 px-3.5 rounded-2xl border flex items-center justify-center transition-all cursor-pointer shadow-2xs",
                                                                temporaryId ===
                                                                    "akulaku"
                                                                    ? "border-[#E52027] bg-red-50/20 ring-1 ring-[#E52027]"
                                                                    : "border-slate-200 hover:border-slate-300 bg-white",
                                                            )}
                                                        >
                                                            <span className="text-xs font-bold text-slate-900">
                                                                Akulaku PayLater
                                                            </span>
                                                        </button>

                                                        {/* Kartu Kredit / Debit */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleSelectMethod(
                                                                    "credit_card",
                                                                )
                                                            }
                                                            className={cn(
                                                                "col-span-2 h-14 px-4 rounded-2xl border flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs",
                                                                temporaryId ===
                                                                    "credit_card"
                                                                    ? "border-[#E52027] bg-red-50/20 ring-1 ring-[#E52027]"
                                                                    : "border-slate-200 hover:border-slate-300 bg-white",
                                                            )}
                                                        >
                                                            <CreditCard className="w-4 h-4 text-slate-500" />
                                                            <span className="text-xs font-bold text-slate-900">
                                                                Kartu Kredit /
                                                                Debit Online
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Sticky Footer Konfirmasi */}
                                <div className="p-4 sm:p-5 border-t border-slate-100 bg-white shrink-0">
                                    <button
                                        type="button"
                                        onClick={handleConfirm}
                                        disabled={!selectedItem}
                                        className={cn(
                                            "w-full min-h-[46px] py-3 px-6 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md flex items-center justify-center gap-2",
                                            selectedItem
                                                ? "bg-[#E52027] hover:bg-[#CC1C22] active:scale-[0.99] text-white shadow-red-500/20"
                                                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none",
                                        )}
                                    >
                                        <Check className="w-4 h-4 stroke-[2.5]" />
                                        <span>
                                            Konfirmasi Metode Pembayaran
                                        </span>
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
