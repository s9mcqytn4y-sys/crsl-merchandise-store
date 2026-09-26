import React, { useState } from "react";
import { ChevronRight, Truck, AlertCircle } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";
import { cn } from "../../lib/utils";

export interface CourierOption {
    id?: string;
    kurir_kode: string;
    nama: string;
    layanan?: string;
    biaya: number;
    etd?: string;
    ikon?: string;
    is_mock?: boolean;
    sumber?: string;
}

interface ShipmentMethodSectionProps {
    selectedCourier: CourierOption | null;
    onOpenModal: () => void;
    error?: string;
    isLoading?: boolean;
}

// Helper resolver logo kurir ekspedisi (bisa diekspor ke utils jika diperlukan)
export const resolveCourierLogo = (courier?: CourierOption | null): string => {
    if (!courier) return "";
    if (courier.ikon) return courier.ikon;

    const code = (courier.kurir_kode || "").toLowerCase();
    if (code.includes("jne")) return "/assets/ikon/kurir-jne.svg";
    if (code.includes("jnt") || code.includes("j&t"))
        return "/assets/ikon/kurir-jnt.svg";
    if (code.includes("sicepat")) return "/assets/ikon/kurir-sicepat.svg";

    return "";
};

export default function ShipmentMethodSection({
    selectedCourier,
    onOpenModal,
    error,
    isLoading = false,
}: ShipmentMethodSectionProps) {
    const [imageError, setImageError] = useState<boolean>(false);
    const logoUrl = resolveCourierLogo(selectedCourier);

    const renderCourierBadge = () => {
        if (!selectedCourier || !logoUrl || imageError) {
            return (
                <div className="w-10 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <Truck className="w-4 h-4" />
                </div>
            );
        }

        return (
            <div className="w-12 h-7 sm:w-14 sm:h-8 bg-slate-50 border border-slate-200/80 rounded-lg p-1 flex items-center justify-center shrink-0">
                <img
                    src={logoUrl}
                    alt={selectedCourier.nama}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain"
                    onError={() => setImageError(true)}
                />
            </div>
        );
    };

    // Penanganan tampilan nominal ongkir yang tepat (termasuk gratis ongkir 0 rupiah)
    const renderCourierPriceText = () => {
        if (!selectedCourier) return "Pilih Layanan";
        if (Number(selectedCourier.biaya) === 0) {
            return (
                <span className="text-emerald-600 font-bold">
                    Gratis Ongkir
                </span>
            );
        }
        return formatRupiah(selectedCourier.biaya);
    };

    return (
        <section aria-labelledby="shipment-heading" className="space-y-3">
            <h2
                id="shipment-heading"
                className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900"
            >
                Metode Pengiriman
            </h2>

            {/* Pemicu Modal Pemilihan Kurir Native Button */}
            <button
                type="button"
                onClick={onOpenModal}
                aria-haspopup="dialog"
                className={cn(
                    "w-full text-left rounded-xl border bg-white p-4 shadow-xs transition-all cursor-pointer hover:border-slate-300 flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-primary/20",
                    error
                        ? "border-red-400 ring-1 ring-red-400"
                        : "border-slate-200",
                )}
            >
                <div className="flex items-center gap-3.5 min-w-0">
                    {renderCourierBadge()}

                    <div className="min-w-0">
                        {selectedCourier ? (
                            <>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                    {selectedCourier.nama}
                                </p>
                                {selectedCourier.layanan && (
                                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                                        {selectedCourier.layanan}{" "}
                                        {selectedCourier.etd
                                            ? `(${selectedCourier.etd})`
                                            : ""}
                                    </p>
                                )}
                                {selectedCourier.is_mock && (
                                    <span className="inline-block mt-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-200">
                                        Sandbox Simulasi
                                    </span>
                                )}
                            </>
                        ) : (
                            <p className="text-xs sm:text-sm text-slate-400 font-medium">
                                Pilih kurir pengiriman
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {isLoading ? (
                        <span className="text-[11px] font-medium text-slate-400 animate-pulse flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            Memperbarui tarif...
                        </span>
                    ) : (
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 tabular-nums">
                            {renderCourierPriceText()}
                        </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
            </button>

            {error && (
                <p className="text-[11px] text-red-600 flex items-center gap-1 font-medium pl-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                </p>
            )}
        </section>
    );
}
