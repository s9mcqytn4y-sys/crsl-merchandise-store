import React, { useState, useEffect, useMemo, useCallback } from "react";
import { X, ChevronDown, ChevronUp, RotateCcw, Check } from "lucide-react";
import { cn } from "../../lib/utils";

export interface FilterValues {
    urutkan: string;
    tipe: string;
    ketersediaan: string;
    min_harga: string | number;
    max_harga: string | number;
    warna: string;
    ukuran: string;
}

interface FilterSortDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterValues;
    onApply: (newFilters: FilterValues) => void;
    priceBounds?: { min: number; max: number };
}

// 18 Warna Palet Resmi CRSL
const CRSL_PALET_WARNA = [
    { nama: "Hitam", hex: "#1e293b", value: "black", isDark: true },
    { nama: "Abu Gelap", hex: "#475569", value: "grey", isDark: true },
    { nama: "Navy", hex: "#1e3a8a", value: "navy", isDark: true },
    { nama: "Olive Green", hex: "#3f4f2c", value: "olive", isDark: true },
    { nama: "Maroon", hex: "#881337", value: "maroon", isDark: true },
    { nama: "Wine", hex: "#9f1239", value: "wine", isDark: true },
    { nama: "Coklat", hex: "#78350f", value: "brown", isDark: true },
    { nama: "Beige Khaki", hex: "#e2d5c3", value: "beige", isDark: false },
    {
        nama: "Lavender Lilac",
        hex: "#818cf8",
        value: "lavender",
        isDark: false,
    },
    { nama: "Abu Muda", hex: "#cbd5e1", value: "light_grey", isDark: false },
    { nama: "Biru", hex: "#2563eb", value: "blue", isDark: true },
    { nama: "Hijau Muda", hex: "#86efac", value: "light_green", isDark: false },
    { nama: "Teal Emerald", hex: "#059669", value: "teal", isDark: true },
    { nama: "Oranye", hex: "#f97316", value: "orange", isDark: false },
    { nama: "Kuning", hex: "#fde047", value: "yellow", isDark: false },
    { nama: "Pink Magenta", hex: "#f43f5e", value: "pink", isDark: true },
    { nama: "Merah", hex: "#dc2626", value: "red", isDark: true },
    { nama: "Putih", hex: "#ffffff", value: "white", isDark: false },
];

const DAFTAR_UKURAN = ["S", "M", "L", "XL", "XXL"];

const DEFAULT_FILTERS: FilterValues = {
    urutkan: "featured",
    tipe: "all_products",
    ketersediaan: "all",
    min_harga: "",
    max_harga: "",
    warna: "",
    ukuran: "",
};

export default function FilterSortDrawer({
    isOpen,
    onClose,
    filters,
    onApply,
    priceBounds = { min: 2500, max: 519000 },
}: FilterSortDrawerProps) {
    const [localFilters, setLocalFilters] = useState<FilterValues>(filters);

    // State accordion buka-tutup
    const [accordionState, setAccordionState] = useState({
        sortBy: true,
        productType: true,
        availability: true,
        price: true,
        color: true,
        size: true,
    });

    // Sinkronisasi data filter saat drawer dibuka
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters, isOpen]);

    // Body Scroll Lock & Escape Key Handler
    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Hitung berapa banyak filter yang aktif di luar default
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (localFilters.urutkan && localFilters.urutkan !== "featured")
            count++;
        if (localFilters.tipe && localFilters.tipe !== "all_products") count++;
        if (localFilters.ketersediaan && localFilters.ketersediaan !== "all")
            count++;
        if (
            localFilters.min_harga !== "" &&
            Number(localFilters.min_harga) > priceBounds.min
        )
            count++;
        if (
            localFilters.max_harga !== "" &&
            Number(localFilters.max_harga) < priceBounds.max
        )
            count++;
        if (localFilters.warna) count++;
        if (localFilters.ukuran) count++;
        return count;
    }, [localFilters, priceBounds]);

    const toggleAccordion = (key: keyof typeof accordionState) => {
        setAccordionState((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleResetAll = useCallback(() => {
        setLocalFilters({
            ...DEFAULT_FILTERS,
            min_harga: "",
            max_harga: "",
        });
    }, []);

    const handleColorClick = (colorVal: string) => {
        setLocalFilters((prev) => ({
            ...prev,
            warna: prev.warna === colorVal ? "" : colorVal,
        }));
    };

    const handleSizeClick = (sizeVal: string) => {
        setLocalFilters((prev) => ({
            ...prev,
            ukuran: prev.ukuran === sizeVal ? "" : sizeVal,
        }));
    };

    // Sinkronisasi Dual Range Slider Fungsional
    const currentMin =
        localFilters.min_harga !== ""
            ? Number(localFilters.min_harga)
            : priceBounds.min;
    const currentMax =
        localFilters.max_harga !== ""
            ? Number(localFilters.max_harga)
            : priceBounds.max;

    const minPercent = Math.max(
        0,
        Math.min(
            100,
            Math.round(
                ((currentMin - priceBounds.min) /
                    (priceBounds.max - priceBounds.min)) *
                    100,
            ),
        ),
    );
    const maxPercent = Math.max(
        0,
        Math.min(
            100,
            Math.round(
                ((currentMax - priceBounds.min) /
                    (priceBounds.max - priceBounds.min)) *
                    100,
            ),
        ),
    );

    const handleRangeSliderChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: "min" | "max",
    ) => {
        const val = Number(e.target.value);
        if (type === "min") {
            const nextMin = Math.min(val, currentMax);
            setLocalFilters((prev) => ({ ...prev, min_harga: nextMin }));
        } else {
            const nextMax = Math.max(val, currentMin);
            setLocalFilters((prev) => ({ ...prev, max_harga: nextMax }));
        }
    };

    const handleApply = () => {
        // Validasi & auto-swap jika min melebihi max
        let finalMin = localFilters.min_harga;
        let finalMax = localFilters.max_harga;

        if (
            finalMin !== "" &&
            finalMax !== "" &&
            Number(finalMin) > Number(finalMax)
        ) {
            const temp = finalMin;
            finalMin = finalMax;
            finalMax = temp;
        }

        onApply({
            ...localFilters,
            min_harga: finalMin,
            max_harga: finalMax,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs select-none transition-opacity duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-drawer-title"
            onClick={onClose}
        >
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
                <div
                    className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full max-h-dvh border-l border-slate-200/80 focus:outline-none animate-in slide-in-from-right duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Drawer */}
                    <div className="flex items-center justify-between px-5 sm:px-6 py-4.5 border-b border-slate-100 bg-white shrink-0">
                        <div className="flex items-center gap-2.5">
                            <h2
                                id="filter-drawer-title"
                                className="text-base sm:text-lg font-bold text-slate-900 tracking-tight"
                            >
                                Filter & Sort
                            </h2>
                            {activeFiltersCount > 0 && (
                                <span className="bg-[#E52027] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            {activeFiltersCount > 0 && (
                                <button
                                    type="button"
                                    onClick={handleResetAll}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:text-[#E52027] hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                    title="Kembalikan semua filter ke bawaan"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Reset</span>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 -mr-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                aria-label="Tutup jendela filter"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content Body dengan 6 Accordion */}
                    <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6 py-3 space-y-5 divide-y divide-slate-100 text-xs sm:text-sm">
                        {/* 1. Sort By Accordion */}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => toggleAccordion("sortBy")}
                                className="w-full flex items-center justify-between py-2 text-left font-bold text-slate-900 cursor-pointer"
                            >
                                <span>Urutkan Berdasarkan</span>
                                {accordionState.sortBy ? (
                                    <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                            </button>

                            {accordionState.sortBy && (
                                <div className="mt-2.5 space-y-2.5 pl-1">
                                    {[
                                        {
                                            id: "featured",
                                            label: "Paling Populer (Featured)",
                                        },
                                        {
                                            id: "recent",
                                            label: "Produk Terbaru",
                                        },
                                        {
                                            id: "lowest_price",
                                            label: "Harga: Terendah ke Tertinggi",
                                        },
                                        {
                                            id: "highest_price",
                                            label: "Harga: Tertinggi ke Terendah",
                                        },
                                        {
                                            id: "name_asc",
                                            label: "Nama Produk (A-Z)",
                                        },
                                        {
                                            id: "name_desc",
                                            label: "Nama Produk (Z-A)",
                                        },
                                    ].map((opt) => {
                                        const isSelected =
                                            localFilters.urutkan === opt.id;
                                        return (
                                            <label
                                                key={opt.id}
                                                className="flex items-center gap-3 cursor-pointer group select-none py-1"
                                            >
                                                <input
                                                    type="radio"
                                                    name="sort_by"
                                                    value={opt.id}
                                                    checked={isSelected}
                                                    onChange={() =>
                                                        setLocalFilters(
                                                            (prev) => ({
                                                                ...prev,
                                                                urutkan: opt.id,
                                                            }),
                                                        )
                                                    }
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={cn(
                                                        "w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0",
                                                        isSelected
                                                            ? "border-[#E52027]"
                                                            : "border-slate-300 group-hover:border-slate-400",
                                                    )}
                                                >
                                                    {isSelected && (
                                                        <div className="w-2 h-2 rounded-full bg-[#E52027]" />
                                                    )}
                                                </div>
                                                <span
                                                    className={cn(
                                                        "text-xs transition-colors",
                                                        isSelected
                                                            ? "text-[#E52027] font-bold"
                                                            : "text-slate-700 group-hover:text-slate-900 font-medium",
                                                    )}
                                                >
                                                    {opt.label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 2. Product Type Accordion */}
                        <div className="pt-4">
                            <button
                                type="button"
                                onClick={() => toggleAccordion("productType")}
                                className="w-full flex items-center justify-between py-2 text-left font-bold text-slate-900 cursor-pointer"
                            >
                                <span>Tipe Produk</span>
                                {accordionState.productType ? (
                                    <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                            </button>

                            {accordionState.productType && (
                                <div className="mt-2.5 space-y-2.5 pl-1">
                                    {[
                                        {
                                            id: "all_products",
                                            label: "Semua Produk",
                                        },
                                        {
                                            id: "featured_products",
                                            label: "Produk Unggulan",
                                        },
                                        {
                                            id: "discount",
                                            label: "Diskon / Promo Spesial",
                                        },
                                        {
                                            id: "bundled_products",
                                            label: "Paket Bundle Hemat",
                                        },
                                    ].map((opt) => {
                                        const isSelected =
                                            localFilters.tipe === opt.id;
                                        return (
                                            <label
                                                key={opt.id}
                                                className="flex items-center gap-3 cursor-pointer group select-none py-1"
                                            >
                                                <input
                                                    type="radio"
                                                    name="product_type"
                                                    value={opt.id}
                                                    checked={isSelected}
                                                    onChange={() =>
                                                        setLocalFilters(
                                                            (prev) => ({
                                                                ...prev,
                                                                tipe: opt.id,
                                                            }),
                                                        )
                                                    }
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={cn(
                                                        "w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0",
                                                        isSelected
                                                            ? "border-[#E52027]"
                                                            : "border-slate-300 group-hover:border-slate-400",
                                                    )}
                                                >
                                                    {isSelected && (
                                                        <div className="w-2 h-2 rounded-full bg-[#E52027]" />
                                                    )}
                                                </div>
                                                <span
                                                    className={cn(
                                                        "text-xs transition-colors",
                                                        isSelected
                                                            ? "text-[#E52027] font-bold"
                                                            : "text-slate-700 group-hover:text-slate-900 font-medium",
                                                    )}
                                                >
                                                    {opt.label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 3. Availability Accordion */}
                        <div className="pt-4">
                            <button
                                type="button"
                                onClick={() => toggleAccordion("availability")}
                                className="w-full flex items-center justify-between py-2 text-left font-bold text-slate-900 cursor-pointer"
                            >
                                <span>Ketersediaan Stok</span>
                                {accordionState.availability ? (
                                    <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                            </button>

                            {accordionState.availability && (
                                <div className="mt-2.5 space-y-2.5 pl-1">
                                    {[
                                        { id: "all", label: "Tampilkan Semua" },
                                        {
                                            id: "in_stock",
                                            label: "Hanya Stok Tersedia",
                                        },
                                    ].map((opt) => {
                                        const isSelected =
                                            localFilters.ketersediaan ===
                                            opt.id;
                                        return (
                                            <label
                                                key={opt.id}
                                                className="flex items-center gap-3 cursor-pointer group select-none py-1"
                                            >
                                                <input
                                                    type="radio"
                                                    name="availability"
                                                    value={opt.id}
                                                    checked={isSelected}
                                                    onChange={() =>
                                                        setLocalFilters(
                                                            (prev) => ({
                                                                ...prev,
                                                                ketersediaan:
                                                                    opt.id,
                                                            }),
                                                        )
                                                    }
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={cn(
                                                        "w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0",
                                                        isSelected
                                                            ? "border-[#E52027]"
                                                            : "border-slate-300 group-hover:border-slate-400",
                                                    )}
                                                >
                                                    {isSelected && (
                                                        <div className="w-2 h-2 rounded-full bg-[#E52027]" />
                                                    )}
                                                </div>
                                                <span
                                                    className={cn(
                                                        "text-xs transition-colors",
                                                        isSelected
                                                            ? "text-[#E52027] font-bold"
                                                            : "text-slate-700 group-hover:text-slate-900 font-medium",
                                                    )}
                                                >
                                                    {opt.label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 4. Price Dual Slider & Input Boxes Accordion (Fungsional) */}
                        <div className="pt-4">
                            <button
                                type="button"
                                onClick={() => toggleAccordion("price")}
                                className="w-full flex items-center justify-between py-2 text-left font-bold text-slate-900 cursor-pointer"
                            >
                                <span>Rentang Harga</span>
                                {accordionState.price ? (
                                    <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                            </button>

                            {accordionState.price && (
                                <div className="mt-4 space-y-4">
                                    {/* Visual Dual Interactive Slider Track */}
                                    <div className="relative pt-2 pb-3 px-1">
                                        <div className="h-1.5 bg-slate-200 rounded-full relative">
                                            <div
                                                className="absolute h-full bg-[#E52027] rounded-full"
                                                style={{
                                                    left: `${minPercent}%`,
                                                    right: `${100 - maxPercent}%`,
                                                }}
                                            />
                                        </div>

                                        {/* Slider Input Ganda Berselaras */}
                                        <input
                                            type="range"
                                            min={priceBounds.min}
                                            max={priceBounds.max}
                                            step={5000}
                                            value={currentMin}
                                            onChange={(e) =>
                                                handleRangeSliderChange(
                                                    e,
                                                    "min",
                                                )
                                            }
                                            className="absolute inset-x-0 -top-0.5 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#E52027] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none"
                                            aria-label="Harga Minimum"
                                        />
                                        <input
                                            type="range"
                                            min={priceBounds.min}
                                            max={priceBounds.max}
                                            step={5000}
                                            value={currentMax}
                                            onChange={(e) =>
                                                handleRangeSliderChange(
                                                    e,
                                                    "max",
                                                )
                                            }
                                            className="absolute inset-x-0 -top-0.5 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#E52027] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none"
                                            aria-label="Harga Maksimum"
                                        />
                                    </div>

                                    {/* Kolom Input Angka Presisi */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col border border-slate-200/90 rounded-xl p-2.5 bg-slate-50/50 focus-within:bg-white focus-within:border-[#E52027] focus-within:ring-2 focus-within:ring-[#E52027]/10 transition-all">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                Minimum
                                            </span>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <span className="text-xs text-slate-500 font-bold">
                                                    Rp
                                                </span>
                                                <input
                                                    type="number"
                                                    value={
                                                        localFilters.min_harga
                                                    }
                                                    onChange={(e) =>
                                                        setLocalFilters(
                                                            (prev) => ({
                                                                ...prev,
                                                                min_harga:
                                                                    e.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    placeholder={String(
                                                        priceBounds.min,
                                                    )}
                                                    className="w-full text-xs font-mono font-bold text-slate-900 bg-transparent focus:outline-none p-0 border-0"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col border border-slate-200/90 rounded-xl p-2.5 bg-slate-50/50 focus-within:bg-white focus-within:border-[#E52027] focus-within:ring-2 focus-within:ring-[#E52027]/10 transition-all">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                Maksimum
                                            </span>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <span className="text-xs text-slate-500 font-bold">
                                                    Rp
                                                </span>
                                                <input
                                                    type="number"
                                                    value={
                                                        localFilters.max_harga
                                                    }
                                                    onChange={(e) =>
                                                        setLocalFilters(
                                                            (prev) => ({
                                                                ...prev,
                                                                max_harga:
                                                                    e.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    placeholder={String(
                                                        priceBounds.max,
                                                    )}
                                                    className="w-full text-xs font-mono font-bold text-slate-900 bg-transparent focus:outline-none p-0 border-0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 5. Color Accordion (18 Warna Bulat dengan Checkmark) */}
                        <div className="pt-4">
                            <button
                                type="button"
                                onClick={() => toggleAccordion("color")}
                                className="w-full flex items-center justify-between py-2 text-left font-bold text-slate-900 cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <span>Pilihan Warna</span>
                                    {localFilters.warna && (
                                        <span className="text-[11px] font-bold text-[#E52027] uppercase">
                                            •{" "}
                                            {
                                                CRSL_PALET_WARNA.find(
                                                    (c) =>
                                                        c.value ===
                                                        localFilters.warna,
                                                )?.nama
                                            }
                                        </span>
                                    )}
                                </div>
                                {accordionState.color ? (
                                    <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                            </button>

                            {accordionState.color && (
                                <div className="mt-3 flex flex-wrap gap-2.5">
                                    {CRSL_PALET_WARNA.map((c) => {
                                        const isSelected =
                                            localFilters.warna === c.value;
                                        return (
                                            <button
                                                key={c.value}
                                                type="button"
                                                onClick={() =>
                                                    handleColorClick(c.value)
                                                }
                                                className={cn(
                                                    "w-7 h-7 rounded-full transition-transform flex items-center justify-center relative cursor-pointer shadow-2xs",
                                                    c.hex === "#ffffff" &&
                                                        "border border-slate-300",
                                                    isSelected
                                                        ? "ring-2 ring-offset-2 ring-[#E52027] scale-110"
                                                        : "hover:scale-110",
                                                )}
                                                style={{
                                                    backgroundColor: c.hex,
                                                }}
                                                title={c.nama}
                                                aria-label={c.nama}
                                            >
                                                {isSelected && (
                                                    <Check
                                                        className={cn(
                                                            "w-3.5 h-3.5 stroke-[3]",
                                                            c.isDark
                                                                ? "text-white"
                                                                : "text-slate-900",
                                                        )}
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 6. Size Accordion (Pills S, M, L, XL, XXL) */}
                        <div className="pt-4 pb-6">
                            <button
                                type="button"
                                onClick={() => toggleAccordion("size")}
                                className="w-full flex items-center justify-between py-2 text-left font-bold text-slate-900 cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <span>Ukuran Pakaian</span>
                                    {localFilters.ukuran && (
                                        <span className="text-[11px] font-bold text-[#E52027]">
                                            • {localFilters.ukuran}
                                        </span>
                                    )}
                                </div>
                                {accordionState.size ? (
                                    <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                            </button>

                            {accordionState.size && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {DAFTAR_UKURAN.map((s) => {
                                        const isSelected =
                                            localFilters.ukuran === s;
                                        return (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() =>
                                                    handleSizeClick(s)
                                                }
                                                className={cn(
                                                    "min-w-[44px] py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs",
                                                    isSelected
                                                        ? "border-[#E52027] bg-red-50 text-[#E52027] ring-1 ring-[#E52027]"
                                                        : "border-slate-200 text-slate-700 bg-white hover:border-slate-300 hover:bg-slate-50",
                                                )}
                                            >
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sticky Footer: Aksi Terapkan */}
                    <div className="p-4 sm:p-5 border-t border-slate-100 bg-white sticky bottom-0 shrink-0 shadow-lg pb-[calc(1rem+env(safe-area-inset-bottom))]">
                        <button
                            type="button"
                            onClick={handleApply}
                            className="w-full py-3.5 bg-[#E52027] hover:bg-[#CC1C22] active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer text-center"
                        >
                            Terapkan Filter{" "}
                            {activeFiltersCount > 0
                                ? `(${activeFiltersCount})`
                                : ""}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
