import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { CourierOption } from "./ShipmentMethodSection";
import { formatRupiah } from "../../Utils/formatters";

interface ShipmentSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    couriers: CourierOption[];
    selectedCourierId: string;
    hasInsurance: boolean;
    onToggleInsurance: (checked: boolean) => void;
    onConfirmCourier: (courier: CourierOption) => void;
}

export default function ShipmentSelectModal({
    isOpen,
    onClose,
    couriers,
    selectedCourierId,
    hasInsurance,
    onToggleInsurance,
    onConfirmCourier,
}: ShipmentSelectModalProps) {
    const [temporarySelectedId, setTemporarySelectedId] =
        useState<string>(selectedCourierId);
    const [tempInsurance, setTempInsurance] = useState<boolean>(hasInsurance);
    const [showAllCouriers, setShowAllCouriers] = useState<boolean>(false);

    // Helper penentu ID unik kurir
    const getCourierKey = useCallback((c: CourierOption) => {
        return String(c.id || `${c.kurir_kode}_${c.layanan || "reguler"}`);
    }, []);

    // Sinkronisasi state internal saat modal terbuka
    useEffect(() => {
        if (isOpen) {
            setTemporarySelectedId(selectedCourierId);
            setTempInsurance(hasInsurance);
            setShowAllCouriers(false);
        }
    }, [isOpen, selectedCourierId, hasInsurance]);

    // Aksesibilitas: Keyboard Escape & Body Scroll Lock
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Evaluasi dinamis kurir termurah dan tercepat
    const { cheapestCourierKey, fastestCourierKey } = useMemo(() => {
        if (!couriers || couriers.length === 0) {
            return { cheapestCourierKey: null, fastestCourierKey: null };
        }

        let minPrice = Infinity;
        let cheapestKey: string | null = null;

        couriers.forEach((c) => {
            const cost = Number(c.biaya) || 0;
            if (cost < minPrice) {
                minPrice = cost;
                cheapestKey = getCourierKey(c);
            }
        });

        // Deteksi tercepat berdasarkan pola ETD (1 hari / Express)
        const fastest = couriers.find((c) => {
            const etd = (c.etd || c.layanan || "").toLowerCase();
            return (
                etd.includes("1 day") ||
                etd.includes("1 hari") ||
                etd.includes("yes") ||
                etd.includes("sameday") ||
                etd.includes("instant")
            );
        });

        return {
            cheapestCourierKey: cheapestKey,
            fastestCourierKey: fastest ? getCourierKey(fastest) : null,
        };
    }, [couriers, getCourierKey]);

    const activeSelectedCourier = useMemo(() => {
        return (
            couriers.find((c) => getCourierKey(c) === temporarySelectedId) ||
            couriers[0] ||
            null
        );
    }, [couriers, temporarySelectedId, getCourierKey]);

    if (!isOpen) return null;

    const recommendedCouriers = couriers.slice(0, 2);
    const otherCouriers = couriers.slice(2);

    const handleConfirm = () => {
        if (activeSelectedCourier) {
            onToggleInsurance(tempInsurance);
            onConfirmCourier(activeSelectedCourier);
        }
        onClose();
    };

    const renderCourierLogo = (courier: CourierOption) => {
        let logoSrc = courier.ikon;
        const code = (courier.kurir_kode || "").toLowerCase();

        if (!logoSrc) {
            if (code.includes("jne")) logoSrc = "/assets/ikon/kurir-jne.svg";
            else if (code.includes("jnt") || code.includes("j&t"))
                logoSrc = "/assets/ikon/kurir-jnt.svg";
            else if (code.includes("sicepat"))
                logoSrc = "/assets/ikon/kurir-sicepat.svg";
            else logoSrc = "/assets/ikon/kurir-jne.svg";
        }

        return (
            <div className="w-12 h-6 sm:w-14 sm:h-7 flex items-center justify-center shrink-0">
                <img
                    src={logoSrc}
                    alt={courier.nama}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = "none";
                    }}
                />
            </div>
        );
    };

    // Reusable Courier Card
    const renderCourierCard = (courier: CourierOption) => {
        const itemKey = getCourierKey(courier);
        const isSelected = itemKey === temporarySelectedId;
        const isCheapest = itemKey === cheapestCourierKey;
        const isFastest = itemKey === fastestCourierKey && !isCheapest;

        return (
            <div
                key={itemKey}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        setTemporarySelectedId(itemKey);
                    }
                }}
                className={`rounded-2xl border p-3.5 transition-all cursor-pointer ${
                    isSelected
                        ? "border-primary bg-red-50/20 ring-1 ring-primary/30"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
                onClick={() => setTemporarySelectedId(itemKey)}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                        <div className="pt-0.5">
                            <span
                                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                    isSelected
                                        ? "border-primary bg-primary"
                                        : "border-slate-300 bg-white"
                                }`}
                            >
                                {isSelected && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                            </span>
                        </div>

                        <div className="flex items-start gap-3 min-w-0">
                            {renderCourierLogo(courier)}
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-slate-900">
                                    {courier.nama}
                                </p>
                                {(() => {
                                    const rawLayanan = (courier.layanan || "Reguler").replace(/undefined/gi, "").trim();
                                    const cleanLayanan = rawLayanan.length > 0 ? rawLayanan : "Reguler";
                                    const cleanEtd = (courier.etd || "").replace(/undefined/gi, "").trim();
                                    const showEtd = cleanEtd.length > 0 && !cleanLayanan.toLowerCase().includes(cleanEtd.toLowerCase());
                                    return (
                                        <p className="text-[11px] sm:text-xs text-slate-500">
                                            {cleanLayanan}{showEtd ? ` (${cleanEtd})` : ""}
                                        </p>
                                    );
                                })()}

                                {isCheapest && (
                                    <span className="inline-block mt-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                                        Termurah
                                    </span>
                                )}
                                {isFastest && (
                                    <span className="inline-block mt-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                                        Tercepat
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-right shrink-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                            {formatRupiah(courier.biaya)}
                        </p>
                    </div>
                </div>

                {/* Checklist Proteksi Asuransi (Muncul pada opsi aktif manapun) */}
                {isSelected && (
                    <div
                        className="mt-3 pt-3 border-t border-red-100 flex items-start gap-2.5 pl-7"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <input
                            type="checkbox"
                            id={`insurance-${itemKey}`}
                            checked={tempInsurance}
                            onChange={(e) => setTempInsurance(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                        />
                        <label
                            htmlFor={`insurance-${itemKey}`}
                            className="text-[11px] sm:text-xs cursor-pointer select-none"
                        >
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>100% Proteksi Asuransi Pengiriman</span>
                                <span className="text-slate-500 font-normal">
                                    + Rp 2.500
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                                Tanpa asuransi, penggantian kehilangan dibatasi
                                maksimal 10x biaya pengiriman ekspedisi.
                            </p>
                        </label>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shipment-modal-title"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 -ml-1 text-slate-700 hover:text-slate-900 rounded-full transition-colors cursor-pointer"
                        aria-label="Kembali"
                    >
                        <ChevronLeft className="w-5 h-5 text-primary" />
                    </button>
                    <h3
                        id="shipment-modal-title"
                        className="text-base sm:text-lg font-bold text-slate-900"
                    >
                        Metode Pengiriman
                    </h3>
                </div>

                {/* Body Content */}
                <div className="p-5 overflow-y-auto space-y-4">
                    <div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-3">
                            Rekomendasi Terbaik
                        </p>

                        <div className="space-y-3" role="radiogroup">
                            {recommendedCouriers.map(renderCourierCard)}
                        </div>
                    </div>

                    {/* Akordeon Layanan Lainnya */}
                    {otherCouriers.length > 0 && (
                        <div>
                            <button
                                type="button"
                                aria-expanded={showAllCouriers}
                                onClick={() =>
                                    setShowAllCouriers((prev) => !prev)
                                }
                                className="w-full py-2 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
                            >
                                <span>
                                    {showAllCouriers
                                        ? "Sembunyikan Opsi"
                                        : "Lihat Opsi Lainnya"}
                                </span>
                                {showAllCouriers ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                            </button>

                            {showAllCouriers && (
                                <div
                                    className="space-y-3 pt-2"
                                    role="radiogroup"
                                >
                                    {otherCouriers.map(renderCourierCard)}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Eksekusi */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="w-full py-3.5 px-6 rounded-lg bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-xs hover:shadow-sm transition-all cursor-pointer"
                    >
                        Pilih Pengiriman
                    </button>
                </div>
            </div>
        </div>
    );
}
