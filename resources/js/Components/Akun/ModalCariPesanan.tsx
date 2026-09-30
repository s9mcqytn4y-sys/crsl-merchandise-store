import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogDescription,
    DialogBackdrop,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { router } from "@inertiajs/react";
import { X, Search, Link2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

interface ModalCariPesananProps {
    isOpen?: boolean;
    onClose: () => void;
    userEmail?: string;
    userPhone?: string;
    className?: string;
}

export default function ModalCariPesanan({
    isOpen = false,
    onClose,
    userEmail = "",
    userPhone = "",
    className,
}: ModalCariPesananProps) {
    const isVisible = Boolean(isOpen);

    const [nomorPesanan, setNomorPesanan] = useState("");
    const [email, setEmail] = useState(userEmail);
    const [telepon, setTelepon] = useState(userPhone);
    const [isLoading, setIsLoading] = useState(false);

    // Sinkronisasi state saat props email atau phone pengguna terisi
    useEffect(() => {
        if (isVisible) {
            setEmail(userEmail || "");
            setTelepon(userPhone || "");
        }
    }, [isVisible, userEmail, userPhone]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const cleanNomor = nomorPesanan.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanTelepon = telepon.trim().replace(/\D/g, "");

        if (!cleanNomor && !cleanEmail && !cleanTelepon) {
            toast.error(
                "Mohon isi nomor pesanan, email, atau nomor WhatsApp yang digunakan saat checkout.",
            );
            return;
        }

        setIsLoading(true);
        router.post(
            "/account/klaim-pesanan",
            {
                nomor_pesanan: cleanNomor || undefined,
                email: cleanEmail || undefined,
                telepon: cleanTelepon || undefined,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsLoading(false);
                    toast.success("Pesanan berhasil ditautkan ke akun Anda!");
                    setNomorPesanan("");
                    onClose();
                },
                onError: (errors) => {
                    setIsLoading(false);
                    const firstErr =
                        typeof errors === "object"
                            ? Object.values(errors)[0]
                            : null;
                    toast.error(
                        firstErr ||
                            "Pesanan tidak ditemukan. Pastikan data nomor invoice, email, atau telepon sesuai.",
                    );
                },
            },
        );
    };

    return (
        <Transition show={isVisible} as={React.Fragment}>
            <Dialog
                as="div"
                id="modal-cari-pesanan-tamu"
                className={cn("relative z-50 select-none", className)}
                onClose={onClose}
            >
                {/* Backdrop Overlay */}
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

                {/* Viewport Kontainer Modal */}
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
                        <TransitionChild
                            as={React.Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95 -translate-y-2"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 -translate-y-2"
                        >
                            <DialogPanel className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200/90 flex flex-col text-left transition-all">
                                {/* Header Modal */}
                                <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#E52027] border border-red-100 flex items-center justify-center shrink-0">
                                            <Search className="w-5 h-5 stroke-[2.2]" />
                                        </div>
                                        <div>
                                            <DialogTitle
                                                as="h3"
                                                className="font-black text-base text-slate-900 tracking-tight"
                                            >
                                                Tautkan Pesanan Tamu
                                            </DialogTitle>
                                            <DialogDescription className="text-xs text-slate-500">
                                                Hubungkan transaksi yang dipesan
                                                tanpa login
                                            </DialogDescription>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]"
                                        aria-label="Tutup modal tautkan pesanan"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Form Body */}
                                <form
                                    onSubmit={handleSubmit}
                                    className="p-5 sm:p-6 space-y-4"
                                    noValidate
                                >
                                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
                                        <p className="font-bold text-slate-800 flex items-center gap-1.5">
                                            <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                                            Pernah checkout tanpa login?
                                        </p>
                                        <p className="text-[11px] text-slate-500 leading-relaxed pl-5">
                                            Masukkan Nomor Pesanan Invoice (atau
                                            Email / No. WhatsApp yang digunakan
                                            saat checkout) untuk memindahkan
                                            pesanan ke riwayat akun ini.
                                        </p>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="input-nomor-pesanan-klaim"
                                            className="block text-xs font-bold text-slate-700 mb-1.5"
                                        >
                                            Nomor Pesanan / Invoice
                                        </label>
                                        <input
                                            id="input-nomor-pesanan-klaim"
                                            type="text"
                                            value={nomorPesanan}
                                            onChange={(e) =>
                                                setNomorPesanan(e.target.value)
                                            }
                                            placeholder="Contoh: INV/2026/09/CRSL-0001"
                                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/10 font-mono font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 transition-all"
                                            autoFocus
                                            autoComplete="off"
                                            spellCheck={false}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label
                                                htmlFor="input-email-klaim"
                                                className="block text-xs font-bold text-slate-700 mb-1.5"
                                            >
                                                Email Pembeli
                                            </label>
                                            <input
                                                id="input-email-klaim"
                                                type="email"
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                                placeholder="nama@email.com"
                                                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/10 text-slate-900 placeholder:text-slate-400 transition-all"
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                spellCheck={false}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="input-telepon-klaim"
                                                className="block text-xs font-bold text-slate-700 mb-1.5"
                                            >
                                                No. WhatsApp / HP
                                            </label>
                                            <input
                                                id="input-telepon-klaim"
                                                type="tel"
                                                inputMode="numeric"
                                                value={telepon}
                                                onChange={(e) =>
                                                    setTelepon(
                                                        e.target.value.replace(
                                                            /\D/g,
                                                            "",
                                                        ),
                                                    )
                                                }
                                                placeholder="08123456789"
                                                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/10 font-mono text-slate-900 placeholder:text-slate-400 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            disabled={isLoading}
                                            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                        >
                                            Batal
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#E52027] hover:bg-[#CC1C22] active:scale-95 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span>Mencari...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Link2 className="w-3.5 h-3.5 stroke-[2.2]" />
                                                    <span>Tautkan Pesanan</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
