import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    Truck,
    MapPin,
    Search,
    Loader2,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    X,
} from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";
import { toast } from "sonner";

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
    productWeight?: number; // in grams
    productPrice?: number;
    productName?: string;
    totalWeight?: number;
}

export default function DeliveryEstimator({
    productWeight,
    totalWeight,
    productPrice = 100000,
    productName = "Produk CRSL",
}: DeliveryEstimatorProps) {
    const effectiveWeight = productWeight ?? totalWeight ?? 500;
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<BiteshipAreaItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const [selectedArea, setSelectedArea] = useState<BiteshipAreaItem | null>(
        null,
    );
    const [rates, setRates] = useState<StandardCourierRate[]>([]);
    const [isLoadingRates, setIsLoadingRates] = useState(false);
    const [ratesError, setRatesError] = useState<string | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchAbortController = useRef<AbortController | null>(null);

    // 1. Debounced Search dengan Race Condition Prevention (AbortController)
    useEffect(() => {
        const trimmed = searchQuery.trim();

        if (trimmed.length < 3) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        // Jangan cari ulang jika query sama dengan area yang baru saja dipilih
        if (selectedArea && searchQuery === selectedArea.nama) {
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

    // 2. Dismiss dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 3. Rate Fetcher dengan normalisasi payload Biteship
    const fetchShippingRates = async (area: BiteshipAreaItem) => {
        setIsLoadingRates(true);
        setRatesError(null);

        try {
            const response = await fetch("/api/wilayah/ongkir", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    area_id: area.id,
                    destination_area_id: area.id,
                    items: [
                        {
                            name: productName,
                            value: productPrice,
                            quantity: 1,
                            weight: Math.max(effectiveWeight, 100),
                        },
                    ],
                }),
            });

            const data = await response.json();

            if (
                data?.sukses &&
                Array.isArray(data?.data) &&
                data.data.length > 0
            ) {
                // Normalisasi format respons kurir
                const normalized: StandardCourierRate[] = data.data.map(
                    (r: any) => ({
                        kurir:
                            r.kurir || r.courier_name || r.company || "Kurir",
                        layanan:
                            r.layanan ||
                            r.courier_service_name ||
                            r.service ||
                            "Standard",
                        harga: Number(r.harga ?? r.biaya ?? r.price ?? 0),
                        estimasi:
                            r.estimasi || r.duration || r.etd || "1-3 hari",
                    }),
                );

                // Sortir otomatis: tarif termurah di posisi paling atas
                normalized.sort((a, b) => a.harga - b.harga);
                setRates(normalized);
            } else {
                setRates([]);
                setRatesError(
                    "Layanan kurir online sedang dalam pemeliharaan.",
                );
            }
        } catch {
            toast.error("Gagal memuat opsi ongkir pengiriman");
            setRates([]);
            setRatesError("Koneksi gagal saat menghitung tarif pengiriman.");
        } finally {
            setIsLoadingRates(false);
        }
    };

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
        return rates[0].harga; // Karena sudah disortir ascending
    }, [rates]);

    return (
        <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-2 text-xs">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <h4 className="font-bold text-sm text-slate-900">Delivery</h4>
            </div>

            {/* Deliver to row */}
            <div className="flex items-center justify-between">
                <span className="text-slate-500">Deliver to:</span>
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-[#E52027] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                    <span>
                        {selectedArea
                            ? `${selectedArea.kota}, ${selectedArea.kecamatan}`
                            : "Jakarta Pusat, Johar Baru"}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>
            </div>

            {/* Estimated delivery cost row */}
            <div className="flex items-center justify-between">
                <span className="text-slate-500">Estimated Delivery Cost:</span>
                <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    className="text-[#E52027] font-semibold hover:underline cursor-pointer"
                >
                    {cheapestRate !== null
                        ? `Mulai ${formatRupiah(cheapestRate)}`
                        : "Check Delivery Cost"}
                </button>
            </div>

            {/* Weight row */}
            <div className="flex items-center justify-between">
                <span className="text-slate-500">Weight:</span>
                <span className="font-medium text-slate-800">{effectiveWeight}g</span>
            </div>

            {/* Shipping note */}
            <p className="text-[11px] text-slate-500 pt-0.5">
                Shipped within 24 hours, (Upon confirmation of payment)
            </p>

            {/* Expandable Section */}
            {isExpanded && (
                <div className="pt-3 border-t border-slate-200 space-y-3 animate-in fade-in duration-150">
                    {/* Search Box with Native Autocomplete Suppression */}
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
                                placeholder="Cari kecamatan, kota, atau kodepos..."
                                // Penonaktifan autocomplete browser bawaan (Chrome/Edge fix)
                                autoComplete="one-time-code"
                                autoCapitalize="off"
                                autoCorrect="off"
                                spellCheck={false}
                                className="w-full pl-8 pr-16 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-slate-400"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />

                            <div className="absolute right-2.5 top-2 flex items-center gap-1.5">
                                {isSearching && (
                                    <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin" />
                                )}
                                {searchQuery.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleClearSelection}
                                        className="p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
                                        title="Hapus pencarian"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Dropdown Hasil Pencarian Area */}
                        {showDropdown && searchQuery.trim().length >= 3 && (
                            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100">
                                {searchResults.length === 0 ? (
                                    <div className="p-3 text-xs text-slate-500 text-center">
                                        {isSearching
                                            ? "Mencari data wilayah..."
                                            : "Wilayah tidak ditemukan."}
                                    </div>
                                ) : (
                                    searchResults.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() =>
                                                handleSelectArea(item)
                                            }
                                            className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-red-50/40 transition-colors flex items-start gap-2.5 cursor-pointer"
                                        >
                                            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-semibold text-slate-800 block">
                                                    {item.nama ||
                                                        `${item.kecamatan}, ${item.kota}`}
                                                </span>
                                                <span className="text-[10px] text-slate-500">
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
                        <div className="p-4 flex items-center justify-center gap-2.5 text-xs text-slate-500 bg-white rounded-xl border border-slate-100 shadow-2xs">
                            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                            <span>Menghitung ongkir logistik terupdate...</span>
                        </div>
                    )}

                    {/* Empty / Error State */}
                    {!isLoadingRates && ratesError && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
                            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                            <span>{ratesError}</span>
                        </div>
                    )}

                    {/* List Tarif Kurir Terurut */}
                    {!isLoadingRates && rates.length > 0 && (
                        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                            {rates.map((rate, idx) => {
                                const isBestPrice = idx === 0;
                                return (
                                    <div
                                        key={`${rate.kurir}-${rate.layanan}-${idx}`}
                                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                                            isBestPrice
                                                ? "bg-red-50/30 border-red-200"
                                                : "bg-white border-slate-200/80"
                                        }`}
                                    >
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-800 uppercase tracking-wider">
                                                    {rate.kurir}
                                                </span>
                                                <span className="text-[11px] text-slate-500">
                                                    {rate.layanan}
                                                </span>
                                                {isBestPrice && (
                                                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-red-100 text-red-700 rounded">
                                                        Termurah
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-slate-400 block">
                                                Estimasi tiba: {rate.estimasi}
                                            </span>
                                        </div>

                                        <span className="font-black text-slate-900 tabular-nums">
                                            {formatRupiah(rate.harga)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Footnote */}
                    <p className="text-[10px] text-slate-400 leading-tight">
                        *Dihitung otomatis untuk berat {productWeight}g. Tarif final ditentukan pada formulir checkout.
                    </p>
                </div>
            )}
        </div>
    );
}
