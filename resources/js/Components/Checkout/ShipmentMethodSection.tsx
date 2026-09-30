import { useState, useEffect } from "react";
import {
    ChevronRight,
    Truck,
    AlertCircle,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";
import { cn } from "../../lib/utils";

export interface CourierOption {
    id?: string;
    kurir_kode: string;
    layanan_kode?: string;
    nama: string;
    layanan?: string;
    biaya: number;
    etd?: string;
    ikon?: string;
    is_mock?: boolean;
    sumber?: string;
}

interface ShipmentMethodSectionProps {
    selectedCourier?: CourierOption | null;
    onOpenModal: () => void;
    error?: string;
    isLoading?: boolean;
    isModalOpen?: boolean;
    className?: string;
}

/** Resolver logo ekspedisi terintegrasi Biteship & Storage */
export const resolveCourierLogo = (courier?: CourierOption | null): string => {
    if (!courier) return "";
    if (courier.ikon) {
        const clean = courier.ikon.trim();
        if (
            clean.startsWith("http://") ||
            clean.startsWith("https://") ||
            clean.startsWith("data:")
        ) {
            return clean;
        }
        if (clean.startsWith("/")) return clean;
        return `/storage/${clean}`;
    }

    const code = (courier.kurir_kode || "").toLowerCase();
    if (code.includes("jne")) return "/assets/ikon/kurir-jne.svg";
    if (code.includes("jnt") || code.includes("j&t"))
        return "/assets/ikon/kurir-jnt.svg";
    if (code.includes("sicepat")) return "/assets/ikon/kurir-sicepat.svg";
    if (code.includes("anteraja")) return "/assets/ikon/kurir-anteraja.svg";
    if (code.includes("idexpress") || code.includes("ide"))
        return "/assets/ikon/kurir-idexpress.svg";
    if (code.includes("gosend")) return "/assets/ikon/kurir-gosend.svg";
    if (code.includes("grab")) return "/assets/ikon/kurir-grab.svg";

    return "";
};

export default function ShipmentMethodSection({
    selectedCourier = null,
    onOpenModal,
    error,
    isLoading = false,
    isModalOpen = false,
    className,
}: ShipmentMethodSectionProps) {
    const [imageError, setImageError] = useState<boolean>(false);
    const logoUrl = resolveCourierLogo(selectedCourier);

    // Reset error gambar saat kurir atau layanannya berganti
    useEffect(() => {
        setImageError(false);
    }, [
        selectedCourier?.kurir_kode,
        selectedCourier?.layanan_kode,
        selectedCourier?.id,
    ]);

    const renderCourierBadge = () => {
        if (!selectedCourier || !logoUrl || imageError) {
            return (
                <div className="w-12 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200/60 shadow-2xs">
                    <Truck className="w-4 h-4 stroke-[2.2]" />
                </div>
            );
        }

        return (
            <div className="w-12 h-8 sm:w-14 sm:h-9 bg-white border border-slate-200/80 rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
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

    const renderCourierPriceText = () => {
        if (!selectedCourier) return "Pilih Layanan";
        if (Number(selectedCourier.biaya) === 0) {
            return (
                <span className="text-emerald-600 font-bold font-mono">
                    Gratis Ongkir
                </span>
            );
        }
        return (
            <span className="font-mono font-bold text-slate-900 tabular-nums">
                {formatRupiah(selectedCourier.biaya)}
            </span>
        );
    };

    return (
        <section
            aria-labelledby="shipment-heading"
            className={cn("space-y-3 select-none", className)}
        >
            <div className="flex items-center justify-between">
                <h2
                    id="shipment-heading"
                    className="text-base sm:text-lg font-black tracking-tight text-slate-900"
                >
                    Metode Pengiriman
                </h2>
                {selectedCourier && (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70 inline-flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                        <span>Terpilih</span>
                    </span>
                )}
            </div>

            {/* Pemicu Modal Kurir WAI-ARIA */}
            <button
                type="button"
                onClick={onOpenModal}
                role="button"
                aria-haspopup="dialog"
                aria-expanded={isModalOpen}
                aria-controls="modal-pilih-metode-pengiriman"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "shipment-method-error" : undefined}
                className={cn(
                    "w-full text-left rounded-2xl border p-4 shadow-2xs transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027] focus-visible:ring-offset-1 group",
                    error
                        ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                        : selectedCourier
                          ? "border-slate-300 bg-white hover:border-slate-400 hover:shadow-xs"
                          : "border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300",
                )}
            >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                    {renderCourierBadge()}

                    <div className="min-w-0 space-y-0.5">
                        {selectedCourier ? (
                            <>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                    {selectedCourier.nama}
                                </p>
                                {selectedCourier.layanan && (
                                    <p className="text-[11px] text-slate-500 font-medium truncate">
                                        {selectedCourier.layanan}{" "}
                                        {selectedCourier.etd
                                            ? `(${selectedCourier.etd})`
                                            : ""}
                                    </p>
                                )}
                                {selectedCourier.is_mock && (
                                    <span className="inline-block mt-0.5 bg-amber-50 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200 font-mono">
                                        Simulasi Sandbox
                                    </span>
                                )}
                            </>
                        ) : (
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                Pilih kurir ekspedisi (J&T, JNE, SiCepat,
                                Anteraja)
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {isLoading ? (
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 text-[#E52027] animate-spin" />
                            <span>Memperbarui tarif...</span>
                        </span>
                    ) : (
                        <div className="text-right">
                            <span className="text-xs sm:text-sm block">
                                {renderCourierPriceText()}
                            </span>
                        </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-700 transition-all" />
                </div>
            </button>

            {/* Teks Galat Validasi */}
            {error && (
                <p
                    id="shipment-method-error"
                    role="alert"
                    className="text-xs text-rose-600 flex items-center gap-1.5 font-semibold pl-1 animate-in fade-in"
                >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                </p>
            )}
        </section>
    );
}
