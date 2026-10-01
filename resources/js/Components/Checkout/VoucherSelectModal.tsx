import React, { useState, Fragment } from "react";
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
    AlertCircle,
    Loader2,
    Sparkles,
    Ban,
    TicketPercent,
} from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";
import { cn } from "../../lib/utils";

export interface VoucherItem {
    id: number;
    kode: string;
    judul: string;
    tipe: "persen" | "persentase" | "percentage" | "nominal" | "fixed" | string;
    nilai: number;
    min_belanja: number;
    minimal_belanja?: number;
    maksimal_diskon?: number;
    discount?: string;
    sudah_dipakai?: boolean;
    deskripsi?: string;
}

interface VoucherSelectModalProps {
    isOpen?: boolean;
    onClose: () => void;
    vouchers?: VoucherItem[];
    subtotal?: number;
    appliedVoucher?: VoucherItem | null;
    onApplyVoucher: (voucher: VoucherItem | null) => void;
    className?: string;
}

function getXsrfToken(): string {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
    return (
        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)
            ?.content || ""
    );
}

/** Helper normalisasi tipe diskon persentase */
function isPercentageDiscount(tipe?: string): boolean {
    if (!tipe) return false;
    const clean = tipe.toLowerCase().trim();
    return ["persen", "persentase", "percentage", "percent"].includes(clean);
}

/** Hitung estimasi diskon riil berdasarkan subtotal keranjang */
export function hitungEstimasiDiskon(
    voucher: VoucherItem,
    subtotal: number,
): number {
    const isPercent = isPercentageDiscount(voucher.tipe);
    let diskon = isPercent
        ? Math.round((subtotal * Number(voucher.nilai)) / 100)
        : Number(voucher.nilai) || 0;

    if (
        isPercent &&
        voucher.maksimal_diskon &&
        Number(voucher.maksimal_diskon) > 0
    ) {
        diskon = Math.min(diskon, Number(voucher.maksimal_diskon));
    }

    return Math.min(diskon, subtotal);
}

export default function VoucherSelectModal({
    isOpen = false,
    onClose,
    vouchers = [],
    subtotal = 0,
    appliedVoucher = null,
    onApplyVoucher,
    className,
}: VoucherSelectModalProps) {
    const isVisible = Boolean(isOpen);
    const [manualCode, setManualCode] = useState("");
    const [manualError, setManualError] = useState("");
    const [isLoadingManual, setIsLoadingManual] = useState(false);

    const handleApplyManual = async (e: React.FormEvent) => {
        e.preventDefault();
        setManualError("");

        const codeClean = manualCode.trim().toUpperCase();
        if (!codeClean) {
            setManualError("Masukkan kode voucher terlebih dahulu.");
            return;
        }

        setIsLoadingManual(true);
        try {
            const res = await fetch("/api/voucher/validasi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-XSRF-TOKEN": getXsrfToken(),
                },
                body: JSON.stringify({
                    kode: codeClean,
                    subtotal: subtotal,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.sukses) {
                setManualError(
                    data.pesan || "Kode voucher tidak dapat digunakan.",
                );
                return;
            }

            const rawTipe = String(data.tipe || "nominal").toLowerCase();
            const isPercent = isPercentageDiscount(rawTipe);

            const verifiedVoucher: VoucherItem = {
                id: data.id || Date.now(),
                kode: data.kode,
                judul: data.judul || `Diskon Voucher ${data.kode}`,
                tipe: rawTipe,
                nilai: Number(data.nilai) || 0,
                min_belanja: Number(
                    data.min_belanja ?? data.minimal_belanja ?? 0,
                ),
                minimal_belanja: Number(
                    data.min_belanja ?? data.minimal_belanja ?? 0,
                ),
                maksimal_diskon: Number(data.maksimal_diskon) || 0,
                discount: isPercent
                    ? `${data.nilai}%`
                    : formatRupiah(data.nilai),
            };

            onApplyVoucher(verifiedVoucher);
            setManualCode("");
            onClose();
        } catch {
            // Fallback lookup dari daftar voucher publik jika request offline
            const found = vouchers.find(
                (v) => v.kode.toUpperCase() === codeClean,
            );
            if (!found) {
                setManualError(
                    "Kode voucher tidak valid atau sudah kedaluwarsa.",
                );
                return;
            }

            const minBelanja = Number(
                found.min_belanja ?? found.minimal_belanja ?? 0,
            );
            if (subtotal < minBelanja) {
                setManualError(
                    `Minimal belanja untuk voucher ini adalah ${formatRupiah(minBelanja)}.`,
                );
                return;
            }

            if (found.sudah_dipakai) {
                setManualError(
                    "Voucher ini sudah pernah digunakan oleh akun Anda.",
                );
                return;
            }

            onApplyVoucher(found);
            setManualCode("");
            onClose();
        } finally {
            setIsLoadingManual(false);
        }
    };

    const handleSelectVoucher = (voucher: VoucherItem) => {
        if (voucher.sudah_dipakai) {
            setManualError(
                "Voucher ini sudah pernah digunakan oleh akun Anda.",
            );
            return;
        }

        const minBelanja = Number(
            voucher.min_belanja ?? voucher.minimal_belanja ?? 0,
        );
        if (subtotal < minBelanja) {
            setManualError(
                `Subtotal belum memenuhi syarat minimal belanja ${formatRupiah(minBelanja)}.`,
            );
            return;
        }

        onApplyVoucher(voucher);
        onClose();
    };

    const handleRemoveVoucher = () => {
        onApplyVoucher(null);
        onClose();
    };

    return (
        <Transition show={isVisible} as={Fragment}>
            <Dialog
                as="div"
                id="modal-pilih-voucher"
                className={cn("relative z-50 select-none", className)}
                onClose={onClose}
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
                            <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white p-5 sm:p-7 text-left align-middle shadow-2xl transition-all border border-slate-200/90 flex flex-col max-h-[calc(100dvh-3rem)]">
                                {/* Header Modal */}
                                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-2xl bg-red-50 text-primary border border-red-100 flex items-center justify-center shrink-0">
                                            <TicketPercent className="w-4 h-4 stroke-[2.2]" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                                                Pilih Voucher Belanja
                                            </DialogTitle>
                                            <p className="text-[11px] text-slate-500">
                                                Gunakan kode promo untuk
                                                potongan ekstra
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        aria-label="Tutup jendela voucher"
                                    >
                                        <X className="w-4 h-4 stroke-[2.2]" />
                                    </button>
                                </div>

                                {/* Form Input Manual Kode Promo */}
                                <form
                                    onSubmit={handleApplyManual}
                                    className="py-3.5 border-b border-slate-100 shrink-0"
                                >
                                    <label
                                        htmlFor="input-manual-voucher-code"
                                        className="block text-xs font-bold text-slate-700 mb-1.5"
                                    >
                                        Punya Kode Promo Khusus?
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            id="input-manual-voucher-code"
                                            type="text"
                                            value={manualCode}
                                            onChange={(e) => {
                                                setManualCode(
                                                    e.target.value.toUpperCase(),
                                                );
                                                setManualError("");
                                            }}
                                            placeholder="CONTOH: CRSLDISC10"
                                            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none uppercase font-mono font-bold text-slate-900 transition-all shadow-2xs placeholder:font-normal placeholder:text-slate-400"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isLoadingManual}
                                            className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover active:scale-[0.99] text-white text-xs font-bold transition-all cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-1.5 shadow-sm hover:shadow-md"
                                        >
                                            {isLoadingManual ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span>Memeriksa...</span>
                                                </>
                                            ) : (
                                                <span>Terapkan</span>
                                            )}
                                        </button>
                                    </div>
                                    {manualError && (
                                        <p
                                            role="alert"
                                            className="mt-2 text-xs text-rose-600 flex items-center gap-1.5 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200 animate-in fade-in"
                                        >
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            <span>{manualError}</span>
                                        </p>
                                    )}
                                </form>

                                {/* Banner Voucher Terpasang */}
                                {appliedVoucher && (
                                    <div className="my-3 p-3.5 bg-emerald-50/80 border border-emerald-300/80 rounded-2xl flex items-center justify-between gap-3 shrink-0 shadow-2xs">
                                        <div className="space-y-0.5 min-w-0 pr-2">
                                            <p className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                <span>Voucher Digunakan:</span>
                                                <span className="font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md text-xs font-bold">
                                                    {appliedVoucher.kode}
                                                </span>
                                            </p>
                                            <p className="text-[11px] text-emerald-800 font-medium truncate">
                                                {appliedVoucher.judul}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveVoucher}
                                            className="text-xs font-bold text-rose-600 hover:text-rose-700 underline shrink-0 cursor-pointer focus:outline-none"
                                        >
                                            Copot Kupon
                                        </button>
                                    </div>
                                )}

                                {/* Daftar Voucher Publik Tersedia */}
                                <div className="py-2 space-y-2.5 overflow-y-auto no-scrollbar overscroll-contain flex-1 pr-0.5">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Voucher Tersedia ({vouchers.length})
                                    </p>

                                    {vouchers.length === 0 ? (
                                        <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                                            <TicketPercent className="w-8 h-8 text-slate-300 mx-auto stroke-[1.5]" />
                                            <p className="text-xs font-bold text-slate-700">
                                                Belum Ada Voucher Terbuka
                                            </p>
                                            <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                                                Gunakan kode promo khusus pada
                                                kolom di atas jika Anda
                                                memilikinya.
                                            </p>
                                        </div>
                                    ) : (
                                        vouchers.map((v) => {
                                            const isSelected =
                                                appliedVoucher?.id === v.id;
                                            const minBelanja = Number(
                                                v.min_belanja ??
                                                    v.minimal_belanja ??
                                                    0,
                                            );
                                            const isEligible =
                                                subtotal >= minBelanja &&
                                                !v.sudah_dipakai;
                                            const estimasiHemat =
                                                hitungEstimasiDiskon(
                                                    v,
                                                    subtotal,
                                                );

                                            return (
                                                <div
                                                    key={v.id}
                                                    role="button"
                                                    tabIndex={
                                                        isEligible ? 0 : -1
                                                    }
                                                    aria-pressed={isSelected}
                                                    aria-disabled={!isEligible}
                                                    onClick={() =>
                                                        isEligible &&
                                                        handleSelectVoucher(v)
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (
                                                            isEligible &&
                                                            (e.key ===
                                                                "Enter" ||
                                                                e.key === " ")
                                                        ) {
                                                            e.preventDefault();
                                                            handleSelectVoucher(
                                                                v,
                                                            );
                                                        }
                                                    }}
                                                    className={cn(
                                                        "p-3.5 sm:p-4 rounded-2xl border transition-all text-left relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                                        isSelected
                                                            ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-2xs"
                                                            : isEligible
                                                              ? "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 cursor-pointer shadow-2xs"
                                                              : "border-slate-100 bg-slate-50/70 opacity-60 cursor-not-allowed",
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="space-y-1 min-w-0 pr-2">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded-md">
                                                                    {v.kode}
                                                                </span>
                                                                <span className="text-xs font-bold text-slate-900 truncate">
                                                                    {v.judul}
                                                                </span>
                                                            </div>

                                                            <div className="text-[11px] text-slate-500 space-y-0.5 font-medium">
                                                                <p>
                                                                    Min. belanja{" "}
                                                                    {formatRupiah(
                                                                        minBelanja,
                                                                    )}
                                                                    {v.maksimal_diskon
                                                                        ? ` • Maks. ${formatRupiah(v.maksimal_diskon)}`
                                                                        : ""}
                                                                </p>
                                                                {isEligible &&
                                                                    estimasiHemat >
                                                                        0 && (
                                                                        <p className="text-emerald-700 font-bold font-mono">
                                                                            Estimasi
                                                                            hemat:
                                                                            -
                                                                            {formatRupiah(
                                                                                estimasiHemat,
                                                                            )}
                                                                        </p>
                                                                    )}
                                                            </div>

                                                            {v.sudah_dipakai && (
                                                                <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold mt-1">
                                                                    <Ban className="w-3 h-3 stroke-[2.5]" />
                                                                    <span>
                                                                        Sudah
                                                                        pernah
                                                                        digunakan
                                                                        akun
                                                                        Anda
                                                                    </span>
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Status Terpasang / Aksi */}
                                                        <div className="shrink-0 pt-0.5">
                                                            {isSelected ? (
                                                                <div className="flex items-center gap-1 text-emerald-800 font-bold text-xs bg-emerald-100/90 px-3 py-1.5 rounded-xl border border-emerald-200 font-mono">
                                                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                                    <span>
                                                                        Terpasang
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span
                                                                    className={cn(
                                                                        "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all inline-block text-center font-mono",
                                                                        v.sudah_dipakai
                                                                            ? "bg-amber-100 text-amber-800"
                                                                            : isEligible
                                                                              ? "bg-slate-900 text-white shadow-2xs group-hover:bg-slate-800"
                                                                              : "bg-slate-200 text-slate-400",
                                                                    )}
                                                                >
                                                                    {v.sudah_dipakai
                                                                        ? "Terpakai"
                                                                        : isEligible
                                                                          ? "Gunakan"
                                                                          : "Belum Cukup"}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
