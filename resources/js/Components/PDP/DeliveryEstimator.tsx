import {
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
} from "react";
import {
    Truck,
    MapPin,
    Search,
    Loader2,
    ChevronDown,
    AlertCircle,
    X,
    Check,
} from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

export interface BiteshipAreaItem {
    id: string;
    nama: string;
    kota: string;
    kecamatan: string;
    provinsi: string;
    kode_pos?: string | number;
}

export interface StandardCourierRate {
    kurir: string;
    layanan: string;
    harga: number;
    estimasi: string;
}

interface DeliveryEstimatorProps {
    productWeight?: number; // dalam gram
    totalWeight?: number;
    productPrice?: number;
    productName?: string;
    defaultArea?: BiteshipAreaItem | null;
    className?: string;
}

/**
 * Mengambil token CSRF Laravel secara aman dari Cookie XSRF-TOKEN atau meta tag
 */
function getCsrfToken(): string {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
        const content = metaTag.getAttribute("content");
        if (content) return content;
    }

    const match = document.cookie.match(
        new RegExp("(^|;\\s*)XSRF-TOKEN=([^;]+)"),
    );
    if (match && match[2]) {
        return decodeURIComponent(match[2]);
    }

    return "";
}

export default function DeliveryEstimator({
    productWeight,
    totalWeight,
    productPrice = 100000,
    productName = "Produk CRSL",
    defaultArea = null,
    className,
}: DeliveryEstimatorProps) {
    const effectiveWeight = Math.max(
        100,
        Number(productWeight ?? totalWeight ?? 500),
    );
    const effectivePrice = Math.max(0, Number(productPrice) || 0);

    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<BiteshipAreaItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const [selectedArea, setSelectedArea] = useState<BiteshipAreaItem | null>(
        defaultArea,
    );
    const [rates, setRates] = useState<StandardCourierRate[]>([]);
    const [isLoadingRates, setIsLoadingRates] = useState(false);
    const [ratesError, setRatesError] = useState<string | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchAbortController = useRef<AbortController | null>(null);
    const ratesAbortController = useRef<AbortController | null>(null);

    // 1. Rate Fetcher dengan AbortController & Header CSRF Lengkap
    const fetchShippingRates = useCallback(
        async (area: BiteshipAreaItem) => {
            if (ratesAbortController.current) {
                ratesAbortController.current.abort();
            }

            const abortCtrl = new AbortController();
            ratesAbortController.current = abortCtrl;

            setIsLoadingRates(true);
            setRatesError(null);

            try {
                const csrfToken = getCsrfToken();
                const response = await fetch("/api/wilayah/ongkir", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        ...(csrfToken
                            ? {
                                  "X-XSRF-TOKEN": csrfToken,
                                  "X-CSRF-TOKEN": csrfToken,
                              }
                            : {}),
                    },
                    signal: abortCtrl.signal,
                    body: JSON.stringify({
                        destination_area_id: area.id,
                        area_id: area.id,
                        items: [
                            {
                                name: productName,
                                value: effectivePrice,
                                quantity: 1,
                                weight: effectiveWeight,
                            },
                        ],
                    }),
                });

                const data = await response.json();

                if (
                    response.ok &&
                    data?.sukses &&
                    Array.isArray(data?.data) &&
                    data.data.length > 0
                ) {
                    const normalized: StandardCourierRate[] = data.data.map(
                        (r: any) => ({
                            kurir: String(
                                r.kurir ||
                                    r.courier_name ||
                                    r.company ||
                                    "Kurir",
                            ).toUpperCase(),
                            layanan: String(
                                r.layanan ||
                                    r.courier_service_name ||
                                    r.service ||
                                    "Reguler",
                            ),
                            harga: Number(r.harga ?? r.biaya ?? r.price ?? 0),
                            estimasi: String(
                                r.estimasi || r.duration || r.etd || "1-3 hari",
                            ),
                        }),
                    );

                    // Urutkan tarif termurah di posisi teratas
                    normalized.sort((a, b) => a.harga - b.harga);
                    setRates(normalized);
                } else {
                    setRates([]);
                    setRatesError(
                        data?.pesan ||
                            "Tarif logistik untuk rute wilayah ini belum tersedia.",
                    );
                }
            } catch (err: unknown) {
                if ((err as Error)?.name !== "AbortError") {
                    setRates([]);
                    setRatesError(
                        "Koneksi gagal saat menghubungi layanan kurir.",
                    );
                    toast.error("Gagal memuat opsi ongkir pengiriman");
                }
            } finally {
                setIsLoadingRates(false);
            }
        },
        [effectivePrice, effectiveWeight, productName],
    );

    // Auto-fetch jika ada default area yang valid saat pertama kali dibuka
    useEffect(() => {
        if (defaultArea && !selectedArea) {
            setSelectedArea(defaultArea);
            fetchShippingRates(defaultArea);
        }
    }, [defaultArea, fetchShippingRates, selectedArea]);

    // 2. Debounced Search Wilayah dengan AbortController
    useEffect(() => {
        const trimmed = searchQuery.trim();

        if (trimmed.length < 3) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        // Hindari pencarian ulang jika query sama dengan nama wilayah yang sudah aktif
        if (
            selectedArea &&
            searchQuery ===
                (selectedArea.nama ||
                    `${selectedArea.kecamatan}, ${selectedArea.kota}`)
        ) {
            return;
        }

        setIsSearching(true);
        if (searchAbortController.current) {
            searchAbortController.current.abort();
        }

        const abortCtrl = new AbortController();
        searchAbortController.current = abortCtrl;

        const timer = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/wilayah/cari?q=${encodeURIComponent(trimmed)}`,
                    {
                        signal: abortCtrl.signal,
                        headers: {
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                        },
                    },
                );
                const resData = await res.json();

                if (resData?.sukses && Array.isArray(resData?.data)) {
                    setSearchResults(resData.data);
                    setShowDropdown(true);
                } else {
                    setSearchResults([]);
                }
            } catch (err: unknown) {
                if ((err as Error)?.name !== "AbortError") {
                    setSearchResults([]);
                }
            } finally {
                setIsSearching(false);
            }
        }, 350);

        return () => {
            clearTimeout(timer);
            abortCtrl.abort();
        };
    }, [searchQuery, selectedArea]);

    // 3. Dismiss dropdown on outside click/touch (Mobile Touch Compliant)
    useEffect(() => {
        function handleOutsideAction(e: MouseEvent | TouchEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setShowDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleOutsideAction);
        document.addEventListener("touchstart", handleOutsideAction);
        return () => {
            document.removeEventListener("mousedown", handleOutsideAction);
            document.removeEventListener("touchstart", handleOutsideAction);
        };
    }, []);

    const handleSelectArea = (area: BiteshipAreaItem) => {
        setSelectedArea(area);
        setSearchQuery(area.nama || `${area.kecamatan}, ${area.kota}`);
        setShowDropdown(false);
        fetchShippingRates(area);
    };

    const handleClearSelection = () => {
        setSelectedArea(null);
        setSearchQuery("");
        setRates([]);
        setRatesError(null);
    };

    const cheapestRate = useMemo(() => {
        if (rates.length === 0) return null;
        return rates[0].harga;
    }, [rates]);

    return (
        <div
            className={cn(
                "border border-slate-200/90 rounded-2xl p-4 bg-white space-y-2.5 text-xs shadow-2xs select-none",
                className,
            )}
        >
            {/* Header Delivery */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-primary" />
                    <span>Estimasi Pengiriman</span>
                </h4>
            </div>

            {/* Deliver To Row */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
                <span className="text-slate-500 font-medium">Kirim ke:</span>
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-primary hover:text-primary-hover font-bold inline-flex items-center gap-1 hover:underline cursor-pointer text-right min-w-0"
                >
                    <span className="truncate max-w-[200px] sm:max-w-[260px]">
                        {selectedArea
                            ? `${selectedArea.kota}, ${selectedArea.kecamatan}`
                            : "Pilih wilayah tujuan"}
                    </span>
                    <ChevronDown
                        className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                        }`}
                    />
                </button>
            </div>

            {/* Estimated Delivery Cost Row */}
            <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 font-medium">
                    Perkiraan Ongkir:
                </span>
                <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    className="text-primary hover:text-primary-hover font-black hover:underline cursor-pointer tabular-nums font-mono"
                >
                    {isLoadingRates ? (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-sans font-normal text-[11px]">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Menghitung...</span>
                        </span>
                    ) : cheapestRate !== null ? (
                        `Mulai ${formatRupiah(cheapestRate)}`
                    ) : (
                        "Cek Tarif Ongkir"
                    )}
                </button>
            </div>

            {/* Weight Row */}
            <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Berat Paket:</span>
                <span className="font-mono font-bold text-slate-800 tabular-nums">
                    {effectiveWeight}g
                </span>
            </div>

            {/* Shipping Guarantee Note */}
            <p className="text-[11px] text-slate-500 pt-0.5 leading-relaxed">
                Diproses & dikirim dalam 24 jam setelah pembayaran pesanan
                terverifikasi.
            </p>

            {/* Expandable Section */}
            {isExpanded && (
                <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                    {/* Search Input Box */}
                    <div className="relative" ref={dropdownRef}>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowDropdown(true);
                                }}
                                onFocus={() => {
                                    if (searchResults.length > 0)
                                        setShowDropdown(true);
                                }}
                                placeholder="Ketik nama kecamatan, kota, atau kodepos..."
                                autoComplete="off"
                                autoCapitalize="off"
                                autoCorrect="off"
                                spellCheck={false}
                                className="w-full pl-8.5 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-400 font-medium"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                {isSearching && (
                                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                                )}
                                {searchQuery.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleClearSelection}
                                        className="p-0.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                                        title="Hapus pencarian"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Dropdown Hasil Pencarian Area */}
                        {showDropdown && searchQuery.trim().length >= 3 && (
                            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100 overscroll-contain">
                                {searchResults.length === 0 ? (
                                    <div className="p-3.5 text-xs text-slate-500 text-center">
                                        {isSearching
                                            ? "Mencari data wilayah..."
                                            : "Wilayah tidak ditemukan. Coba gunakan nama kecamatan lain."}
                                    </div>
                                ) : (
                                    searchResults.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() =>
                                                handleSelectArea(item)
                                            }
                                            className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-red-50/50 transition-colors flex items-start gap-2.5 cursor-pointer group"
                                        >
                                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                            <div className="min-w-0 flex-1">
                                                <span className="font-bold text-slate-800 block truncate group-hover:text-primary">
                                                    {item.nama ||
                                                        `${item.kecamatan}, ${item.kota}`}
                                                </span>
                                                <span className="text-[10px] text-slate-500 block truncate">
                                                    {item.provinsi}{" "}
                                                    {item.kode_pos
                                                        ? `• Kodepos ${item.kode_pos}`
                                                        : ""}
                                                </span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Loader Tarif */}
                    {isLoadingRates && (
                        <div className="p-3.5 flex items-center justify-center gap-2.5 text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span>Menghitung ongkir logistik terupdate...</span>
                        </div>
                    )}

                    {/* Alert Error Tarif */}
                    {!isLoadingRates && ratesError && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900">
                            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                            <span className="leading-snug">{ratesError}</span>
                        </div>
                    )}

                    {/* List Pilihan Tarif Kurir */}
                    {!isLoadingRates && rates.length > 0 && (
                        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                            {rates.map((rate, idx) => {
                                const isBestPrice = idx === 0;
                                return (
                                    <div
                                        key={`${rate.kurir}-${rate.layanan}-${idx}`}
                                        className={cn(
                                            "p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors",
                                            isBestPrice
                                                ? "bg-red-50/40 border-red-200"
                                                : "bg-white border-slate-200/80",
                                        )}
                                    >
                                        <div className="space-y-0.5 min-w-0 pr-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-black text-slate-900 tracking-wider">
                                                    {rate.kurir}
                                                </span>
                                                <span className="text-[11px] text-slate-500">
                                                    {rate.layanan}
                                                </span>
                                                {isBestPrice && (
                                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                        <span>Termurah</span>
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-slate-400 block">
                                                Estimasi tiba: {rate.estimasi}
                                            </span>
                                        </div>

                                        <span className="font-mono font-bold text-slate-900 tabular-nums shrink-0 text-xs sm:text-sm">
                                            {formatRupiah(rate.harga)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Catatan Kaki Akurat */}
                    <p className="text-[10px] text-slate-400 leading-tight">
                        *Dihitung otomatis untuk estimasi berat total{" "}
                        {effectiveWeight}g. Tarif final ditentukan pada formulir
                        checkout berdasarkan alamat spesifik Anda.
                    </p>
                </div>
            )}
        </div>
    );
}
