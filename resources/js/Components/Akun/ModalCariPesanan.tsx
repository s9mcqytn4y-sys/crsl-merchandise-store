import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { X, Search, Link2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ModalCariPesananProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail?: string;
    userPhone?: string;
}

export default function ModalCariPesanan({
    isOpen,
    onClose,
    userEmail = "",
    userPhone = "",
}: ModalCariPesananProps) {
    const [nomorPesanan, setNomorPesanan] = useState("");
    const [email, setEmail] = useState(userEmail);
    const [telepon, setTelepon] = useState(userPhone);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!nomorPesanan.trim() && !email.trim() && !telepon.trim()) {
            toast.error("Mohon isi nomor pesanan, email, atau nomor telepon.");
            return;
        }

        setIsLoading(true);
        router.post(
            "/account/klaim-pesanan",
            {
                nomor_pesanan: nomorPesanan.trim() || undefined,
                email: email.trim() || undefined,
                telepon: telepon.trim() || undefined,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsLoading(false);
                    onClose();
                },
                onError: (errors) => {
                    setIsLoading(false);
                    toast.error(
                        typeof errors === "object"
                            ? Object.values(errors)[0]
                            : "Gagal menautkan pesanan. Pastikan data sesuai.",
                    );
                },
            },
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                            <Search className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-slate-900 tracking-tight">
                                Tautkan Pesanan Tamu
                            </h3>
                            <p className="text-xs text-slate-500">
                                Temukan transaksi yang dipesan tanpa akun
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
                        <p className="font-semibold text-slate-800">
                            Pernah checkout tanpa login?
                        </p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Masukkan Nomor Pesanan Invoice (atau Email / No. WhatsApp saat Anda checkout) untuk menghubungkan pesanan tersebut ke akun ini.
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Nomor Pesanan / Invoice
                        </label>
                        <input
                            type="text"
                            value={nomorPesanan}
                            onChange={(e) => setNomorPesanan(e.target.value)}
                            placeholder="Contoh: INV/CRSL/20260926/0001"
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Email Pembeli
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email saat checkout"
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                No. Telepon / WhatsApp
                            </label>
                            <input
                                type="tel"
                                value={telepon}
                                onChange={(e) => setTelepon(e.target.value)}
                                placeholder="08xxxxxxxxxx"
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2.5">
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
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Mencari...</span>
                                </>
                            ) : (
                                <>
                                    <Link2 className="w-3.5 h-3.5" />
                                    <span>Tautkan Pesanan</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
