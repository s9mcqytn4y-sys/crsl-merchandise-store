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
    ChevronDown,
    ChevronUp,
    ShieldCheck,
    X,
    Truck,
    Check,
} from "lucide-react";
import { CourierOption } from "./ShipmentMethodSection";
import { formatRupiah } from "../../Utils/formatters";
import { cn } from "../../lib/utils";

interface ShipmentSelectModalProps {
    isOpen?: boolean;
    onClose: () => void;
    couriers: CourierOption[];
    selectedCourierId?: string;
    hasInsurance?: boolean;
    insuranceFee?: number;
    onToggleInsurance: (checked: boolean) => void;
    onConfirmCourier: (courier: CourierOption) => void;
    className?: string;
}

/** Resolver logo kurir ekspedisi resmi terintegrasi */
function resolveCourierLogo(courier: CourierOption): string {
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
}

export default function ShipmentSelectModal({
    isOpen = false,
    onClose,
    couriers = [],
    selectedCourierId = "",
    hasInsurance = false,
    insuranceFee = 2500,
    onToggleInsurance,
    onConfirmCourier,
    className,
}: ShipmentSelectModalProps) {
    const isVisible = Boolean(isOpen);

    const [temporarySelectedId, setTemporarySelectedId] =
        useState<string>(selectedCourierId);
    const [tempInsurance, setTempInsurance] = useState<boolean>(hasInsurance);
    const [showAllCouriers, setShowAllCouriers] = useState<boolean>(false);
    const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});

    // Helper penentu ID unik kurir
    const getCourierKey = useCallback((c: CourierOption) => {
        return String(
            c.id ||
                `${c.kurir_kode}_${c.layanan_kode || c.layanan || "reguler"}`,
        );
    }, []);

    // Sinkronisasi state internal saat modal terbuka
    useEffect(() => {
        if (isVisible) {
            setTemporarySelectedId(selectedCourierId);
            setTempInsurance(hasInsurance);
            setShowAllCouriers(false);
        }
    }, [isVisible, selectedCourierId, hasInsurance]);

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

        // Deteksi kurir tercepat dengan filtering rentang yang tepat
        const fastest = couriers.find((c) => {
            const etd = (c.etd || c.layanan || "").toLowerCase();
            return (
                etd === "1 hari" ||
                etd === "1 day" ||
                etd.includes("yes") ||
                etd.includes("sameday") ||
                etd.includes("instant") ||
                (etd.startsWith("1") && !etd.includes("-"))
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

    const handleConfirm = () => {
        if (activeSelectedCourier) {
            onToggleInsurance(tempInsurance);
            onConfirmCourier(activeSelectedCourier);
        }
        onClose();
    };

    const handleLogoError = (key: string) => {
        setFailedLogos((prev) => ({ ...prev, [key]: true }));
    };

    const recommendedCouriers = couriers.slice(0, 2);
    const otherCouriers = couriers.slice(2);

    const renderCourierCard = (courier: CourierOption) => {
        const itemKey = getCourierKey(courier);
        const isSelected = itemKey === temporarySelectedId;
        const isCheapest = itemKey === cheapestCourierKey;
        const isFastest = itemKey === fastestCourierKey && !isCheapest;
        const logoSrc = resolveCourierLogo(courier);
        const isLogoBroken = failedLogos[itemKey] || !logoSrc;

        const rawLayanan = (courier.layanan || "Reguler")
            .replace(/undefined/gi, "")
            .trim();
        const cleanLayanan = rawLayanan.length > 0 ? rawLayanan : "Reguler";
        const cleanEtd = (courier.etd || "").replace(/undefined/gi, "").trim();
        const showEtd =
            cleanEtd.length > 0 &&
            !cleanLayanan.toLowerCase().includes(cleanEtd.toLowerCase());

        return (
            <div
                key={itemKey}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setTemporarySelectedId(itemKey);
                    }
                }}
                onClick={() => setTemporarySelectedId(itemKey)}
                className={cn(
                    "rounded-2xl border p-3.5 sm:p-4 transition-all cursor-pointer relative select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isSelected
                        ? "border-primary bg-red-50/20 ring-2 ring-primary/20 shadow-2xs"
                        : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60",
                )}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 pr-2">
                        {/* Radio Check Indicator */}
                        <div className="pt-0.5 shrink-0">
                            <span
                                className={cn(
                                    "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                                    isSelected
                                        ? "border-primary bg-primary"
                                        : "border-slate-300 bg-white",
                                )}
                            >
                                {isSelected && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                            </span>
                        </div>

                        {/* Logo Kurir */}
                        <div className="w-12 h-7 sm:w-14 sm:h-8 bg-white border border-slate-200/80 rounded-xl p-1 flex items-center justify-center shrink-0 shadow-2xs">
                            {!isLogoBroken ? (
                                <img
                                    src={logoSrc}
                                    alt={courier.nama}
                                    loading="lazy"
                                    className="max-h-full max-w-full object-contain"
                                    onError={() => handleLogoError(itemKey)}
                                />
                            ) : (
                                <Truck className="w-4 h-4 text-slate-400 stroke-2" />
                            )}
                        </div>

                        {/* Info Kurir & Layanan */}
                        <div className="min-w-0 space-y-0.5">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {courier.nama}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium truncate">
                                {cleanLayanan}
                                {showEtd ? ` (${cleanEtd})` : ""}
                            </p>

                            {/* Badges Opsi */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                {courier.is_mock && (
                                    <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200 font-mono">
                                        Simulasi Sandbox
                                    </span>
                                )}
                                {isCheapest && (
                                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200/80 font-mono">
                                        Termurah
                                    </span>
                                )}
                                {isFastest && (
                                    <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200/80 font-mono">
                                        Tercepat
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Harga Ongkir */}
                    <div className="text-right shrink-0">
                        <p className="text-xs sm:text-sm font-black text-slate-900 font-mono tabular-nums">
                            {Number(courier.biaya) === 0
                                ? "Gratis"
                                : formatRupiah(courier.biaya)}
                        </p>
                    </div>
                </div>

                {/* Checklist Proteksi Asuransi Pengiriman */}
                {isSelected && (
                    <div
                        className="mt-3 pt-3 border-t border-red-100 flex items-start gap-2.5 pl-7 animate-in fade-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <input
                            type="checkbox"
                            id={`insurance-${itemKey}`}
                            checked={tempInsurance}
                            onChange={(e) => setTempInsurance(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded-md border-slate-300 text-primary focus:ring-primary cursor-pointer"
                        />
                        <label
                            htmlFor={`insurance-${itemKey}`}
                            className="text-[11px] sm:text-xs cursor-pointer select-none"
                        >
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>100% Proteksi Asuransi Pengiriman</span>
                                <span className="text-slate-500 font-mono font-semibold">
                                    (+{formatRupiah(insuranceFee)})
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                                Penggantian penuh 100% harga produk jika terjadi
                                kehilangan atau kerusakan dalam perjalanan
                                kurir.
                            </p>
                        </label>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Transition show={isVisible} as={Fragment}>
            <Dialog
                as="div"
                id="modal-pilih-metode-pengiriman"
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
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-200/90 flex flex-col max-h-[calc(100dvh-3rem)]">
                                {/* Header Modal */}
                                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-2xl bg-red-50 text-primary border border-red-100 flex items-center justify-center shrink-0">
                                            <Truck className="w-4 h-4 stroke-[2.2]" />
                                        </div>
                                        <div>
                                            <DialogTitle
                                                as="h3"
                                                className="text-base font-black text-slate-900 tracking-tight"
                                            >
                                                Pilih Ekspedisi Pengiriman
                                            </DialogTitle>
                                            <p className="text-[11px] text-slate-500">
                                                Tarif resmi terhubung langsung
                                                dengan Biteship
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        aria-label="Tutup modal pengiriman"
                                    >
                                        <X className="w-4 h-4 stroke-[2.2]" />
                                    </button>
                                </div>

                                {/* Body Content */}
                                <div className="p-5 sm:p-6 overflow-y-auto space-y-4 no-scrollbar overscroll-contain flex-1">
                                    {couriers.length === 0 ? (
                                        <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                                            <Truck className="w-8 h-8 text-slate-300 mx-auto stroke-[1.5]" />
                                            <p className="text-xs font-bold text-slate-700">
                                                Tidak Ada Layanan Pengiriman
                                                Tersedia
                                            </p>
                                            <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                                                Pastikan alamat pengiriman telah
                                                terisi lengkap dengan kecamatan
                                                dan kota yang valid.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <p className="text-xs font-bold text-slate-700 mb-2.5">
                                                    Rekomendasi Terbaik
                                                </p>

                                                <div
                                                    className="space-y-2.5"
                                                    role="radiogroup"
                                                    aria-label="Rekomendasi Kurir"
                                                >
                                                    {recommendedCouriers.map(
                                                        renderCourierCard,
                                                    )}
                                                </div>
                                            </div>

                                            {/* Akordeon Layanan Lainnya */}
                                            {otherCouriers.length > 0 && (
                                                <div className="pt-1">
                                                    <button
                                                        type="button"
                                                        aria-expanded={
                                                            showAllCouriers
                                                        }
                                                        onClick={() =>
                                                            setShowAllCouriers(
                                                                (prev) => !prev,
                                                            )
                                                        }
                                                        className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer"
                                                    >
                                                        <span>
                                                            {showAllCouriers
                                                                ? "Sembunyikan Opsi Lainnya"
                                                                : `Lihat ${otherCouriers.length} Opsi Lainnya`}
                                                        </span>
                                                        {showAllCouriers ? (
                                                            <ChevronUp className="w-4 h-4 stroke-[2.2]" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4 stroke-[2.2]" />
                                                        )}
                                                    </button>

                                                    {showAllCouriers && (
                                                        <div
                                                            className="space-y-2.5 pt-2 animate-in fade-in zoom-in-95 duration-150"
                                                            role="radiogroup"
                                                            aria-label="Opsi Kurir Lainnya"
                                                        >
                                                            {otherCouriers.map(
                                                                renderCourierCard,
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Footer Eksekusi */}
                                <div className="p-4 sm:p-5 border-t border-slate-100 bg-white shrink-0">
                                    <button
                                        type="button"
                                        onClick={handleConfirm}
                                        disabled={!activeSelectedCourier}
                                        className={cn(
                                            "w-full min-h-11.5 py-3 px-6 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md flex items-center justify-center gap-2",
                                            activeSelectedCourier
                                                ? "bg-primary hover:bg-primary-hover active:scale-[0.99] text-white shadow-sm hover:shadow-md"
                                                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none",
                                        )}
                                    >
                                        <Check className="w-4 h-4 stroke-[2.5]" />
                                        <span>Konfirmasi Pilihan Kurir</span>
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
