import React, { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";

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

// 18 Warna Palet CRSL Sesuai Screenshot 2
const CRSL_PALET_WARNA = [
    { nama: "Hitam", hex: "#1e293b", value: "black" },
    { nama: "Abu Gelap", hex: "#475569", value: "grey" },
    { nama: "Navy", hex: "#1e3a8a", value: "navy" },
    { nama: "Olive Green", hex: "#3f4f2c", value: "olive" },
    { nama: "Maroon", hex: "#881337", value: "maroon" },
    { nama: "Wine", hex: "#9f1239", value: "wine" },
    { nama: "Coklat", hex: "#78350f", value: "brown" },
    { nama: "Beige Khaki", hex: "#e2d5c3", value: "beige" },
    { nama: "Lavender Lilac", hex: "#818cf8", value: "lavender" },
    { nama: "Abu Muda", hex: "#cbd5e1", value: "light_grey" },
    { nama: "Biru", hex: "#2563eb", value: "blue" },
    { nama: "Hijau Muda", hex: "#86efac", value: "light_green" },
    { nama: "Teal Emerald", hex: "#059669", value: "teal" },
    { nama: "Oranye", hex: "#f97316", value: "orange" },
    { nama: "Kuning", hex: "#fde047", value: "yellow" },
    { nama: "Pink Magenta", hex: "#f43f5e", value: "pink" },
    { nama: "Merah", hex: "#dc2626", value: "red" },
    { nama: "Putih", hex: "#ffffff", value: "white" },
];

const DAFTAR_UKURAN = ["S", "M", "L", "XL", "XXL"];

export default function FilterSortDrawer({
    isOpen,
    onClose,
    filters,
    onApply,
    priceBounds = { min: 2500, max: 519000 },
}: FilterSortDrawerProps) {
    // State lokal filter sebelum tombol Apply ditekan
    const [localFilters, setLocalFilters] = useState<FilterValues>(filters);

    // State accordion buka-tutup (default semua terbuka sesuai Screenshot 2)
    const [accordionState, setAccordionState] = useState({
        sortBy: true,
        productType: true,
        availability: true,
        price: true,
        color: true,
        size: true,
    });

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters, isOpen]);

    if (!isOpen) return null;

    const toggleAccordion = (key: keyof typeof accordionState) => {
        setAccordionState((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSortChange = (value: string) => {
        setLocalFilters((prev) => ({ ...prev, urutkan: value }));
    };

    const handleTypeChange = (value: string) => {
        setLocalFilters((prev) => ({ ...prev, tipe: value }));
    };

    const handleAvailabilityChange = (value: string) => {
        setLocalFilters((prev) => ({ ...prev, ketersediaan: value }));
    };

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

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-drawer-title"
            onClick={onClose}
        >
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <div
                    className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Drawer Sesuai Screenshot 2 */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                        <h2
                            id="filter-drawer-title"
                            className="text-lg font-bold text-slate-800 tracking-tight"
                        >
                            Filter & Sort
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            aria-label="Tutup Filter"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable Content Body dengan 6 Accordion */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 divide-y divide-slate-100 text-sm">
                        {/* 1. Sort By Accordion */}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => toggleAccordion("sortBy")}
                                className="w-full flex items-center justify-between py-2 text-left font-semibold text-slate-800"
                            >
                                <span>Sort By</span>
                                {accordionState.sortBy ? (
                                    <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                            </button>

                            {accordionState.sortBy && (
                                <div className="mt-3 space-y-3 pl-1">
                                    {[
                                        { id: "featured", label: "Featured" },
                                        { id: "recent", label: "Recent" },
                                        { id: "oldest", label: "Oldest" },
                                        { id: "popular", label: "Most Popular" },
                                        { id: "lowest_price", label: "Lowest Price" },
                                        { id: "highest_price", label: "Highest Price" },
                                        { id: "name_asc", label: "Product Name (A-Z)" },
                                        { id: "name_desc", label: "Product Name (Z-A)" },
                                    ].map((opt) => {
                                        const isSelected = localFilters.urutkan === opt.id;
                                        return (
                                            <label
                                                key={opt.id}
                                                className="flex items-center gap-3 cursor-pointer group select-none"
                                            >
                                                <input
                                                    type="radio"
                                                    name="sort_by"
                                                    value={opt.id}
                                                    checked={isSelected}
                                                    onChange={() => handleSortChange(opt.id)}
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                                        isSelected
                                                            ? "border-[#E52027]"
                                                            : "border-slate-300 group-hover:border-slate-400"
                                                    }`}
                                                >
                                                    {isSelected && (
                                                        <div className="w-2 h-2 rounded-full bg-[#E52027]" />
                                                    )}
                                                </div>
                                                <span
                                                    className={`text-xs sm:text-[13px] ${
                                                        isSelected
                                                            ? "text-slate-900 font-medium"
                                                            : "text-slate-700"
                                                    }`}
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
                                className="w-full flex items-center justify-between py-2 text-left font-semibold text-slate-800"
                            >
                                <span>Product Type</span>
                                {accordionState.productType ? (
                                    <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                            </button>

                            {accordionState.productType && (
                                <div className="mt-3 space-y-3 pl-1">
                                    {[
                                        { id: "all_products", label: "All Products" },
                                        { id: "featured_products", label: "Featured Products" },
                                        { id: "discount", label: "Discount" },
                                        { id: "bundled_products", label: "Bundled Products" },
                                    ].map((opt) => {
                                        const isSelected = localFilters.tipe === opt.id;
                                        return (
                                            <label
                                                key={opt.id}
                                                className="flex items-center gap-3 cursor-pointer group select-none"
                                            >
                                                <input
                                                    type="radio"
                                                    name="product_type"
                                                    value={opt.id}
                                                    checked={isSelected}
                                                    onChange={() => handleTypeChange(opt.id)}
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                                        isSelected
                                                            ? "border-[#E52027]"
                                                            : "border-slate-300 group-hover:border-slate-400"
                                                    }`}
                                                >
                                                    {isSelected && (
                                                        <div className="w-2 h-2 rounded-full bg-[#E52027]" />
                                                    )}
                                                </div>
                                                <span
                                                    className={`text-xs sm:text-[13px] ${
                                                        isSelected
                                                            ? "text-[#E52027] font-semibold"
                                                            : "text-slate-700"
                                                    }`}
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
                                className="w-full flex items-center justify-between py-2 text-left font-semibold text-slate-800"
                            >
                                <span>Availability</span>
                                {accordionState.availability ? (
                                    <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                            </button>

                            {accordionState.availability && (
                                <div className="mt-3 space-y-3 pl-1">
                                    {[
                                        { id: "all", label: "All" },
                                        { id: "in_stock", label: "In Stock" },
                                    ].map((opt) => {
                                        const isSelected = localFilters.ketersediaan === opt.id;
                                        return (
                                            <label
                                                key={opt.id}
                                                className="flex items-center gap-3 cursor-pointer group select-none"
                                            >
                                                <input
                                                    type="radio"
                                                    name="availability"
                                                    value={opt.id}
                                                    checked={isSelected}
                                                    onChange={() => handleAvailabilityChange(opt.id)}
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                                        isSelected
                                                            ? "border-[#E52027]"
                                                            : "border-slate-300 group-hover:border-slate-400"
                                                    }`}
                                                >
                                                    {isSelected && (
                                                        <div className="w-2 h-2 rounded-full bg-[#E52027]" />
                                                    )}
                                                </div>
                                                <span
                                                    className={`text-xs sm:text-[13px] ${
                                                        isSelected
                                                            ? "text-[#E52027] font-semibold"
                                                            : "text-slate-700"
                                                    }`}
                                                >
                                                    {opt.label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 4. Price Dual Slider & Input Boxes Accordion */}
                        <div className="pt-4">
                            <button
                                type="button"
                                onClick={() => toggleAccordion("price")}
                                className="w-full flex items-center justify-between py-2 text-left font-semibold text-slate-800"
                            >
                                <span>Price</span>
                                {accordionState.price ? (
                                    <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                            </button>

                            {accordionState.price && (
                                <div className="mt-4 space-y-4">
                                    {/* Visual Dual Slider Bar */}
                                    <div className="relative pt-1 pb-2">
                                        <div className="h-1.5 bg-slate-300 rounded-full relative">
                                            <div
                                                className="absolute h-full bg-slate-600 rounded-full"
                                                style={{ left: "0%", right: "0%" }}
                                            />
                                            <div className="absolute -top-1.5 left-0 w-4 h-4 bg-slate-600 rounded-full shadow-md cursor-grab active:cursor-grabbing border-2 border-white" />
                                            <div className="absolute -top-1.5 right-0 w-4 h-4 bg-slate-600 rounded-full shadow-md cursor-grab active:cursor-grabbing border-2 border-white" />
                                        </div>
                                    </div>

                                    {/* Input Boxes Sesuai Screenshot 2 */}
                                    <div className="space-y-3">
                                        <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2 bg-white focus-within:border-[#E52027] transition-colors">
                                            <span className="text-xs text-slate-500 font-medium mr-2">
                                                Rp
                                            </span>
                                            <div className="flex-1">
                                                <label className="text-[10px] text-slate-400 block leading-tight">
                                                    Minimum Price
                                                </label>
                                                <input
                                                    type="number"
                                                    value={localFilters.min_harga}
                                                    onChange={(e) =>
                                                        setLocalFilters((prev) => ({
                                                            ...prev,
                                                            min_harga: e.target.value,
                                                        }))
                                                    }
                                                    placeholder={String(priceBounds.min)}
                                                    className="w-full text-xs font-semibold text-slate-800 focus:outline-none p-0 border-0"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2 bg-white focus-within:border-[#E52027] transition-colors">
                                            <span className="text-xs text-slate-500 font-medium mr-2">
                                                Rp
                                            </span>
                                            <div className="flex-1">
                                                <label className="text-[10px] text-slate-400 block leading-tight">
                                                    Maximum Price
                                                </label>
                                                <input
                                                    type="number"
                                                    value={localFilters.max_harga}
                                                    onChange={(e) =>
                                                        setLocalFilters((prev) => ({
                                                            ...prev,
                                                            max_harga: e.target.value,
                                                        }))
                                                    }
                                                    placeholder={String(priceBounds.max)}
                                                    className="w-full text-xs font-semibold text-slate-800 focus:outline-none p-0 border-0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 5. Color Accordion (18 Warna Bulat) */}
                        <div className="pt-4">
                            <button
                                type="button"
                                onClick={() => toggleAccordion("color")}
                                className="w-full flex items-center justify-between py-2 text-left font-semibold text-slate-800"
                            >
                                <span>Color</span>
                                {accordionState.color ? (
                                    <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                            </button>

                            {accordionState.color && (
                                <div className="mt-3 flex flex-wrap gap-2.5">
                                    {CRSL_PALET_WARNA.map((c) => {
                                        const isSelected = localFilters.warna === c.value;
                                        return (
                                            <button
                                                key={c.value}
                                                type="button"
                                                onClick={() => handleColorClick(c.value)}
                                                className={`w-6 h-6 rounded-full transition-transform relative cursor-pointer ${
                                                    c.hex === "#ffffff"
                                                        ? "border border-slate-300"
                                                        : ""
                                                } ${
                                                    isSelected
                                                        ? "ring-2 ring-offset-2 ring-[#E52027] scale-110"
                                                        : "hover:scale-110"
                                                }`}
                                                style={{ backgroundColor: c.hex }}
                                                title={c.nama}
                                                aria-label={c.nama}
                                            />
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
                                className="w-full flex items-center justify-between py-2 text-left font-semibold text-slate-800"
                            >
                                <span>Size</span>
                                {accordionState.size ? (
                                    <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                            </button>

                            {accordionState.size && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {DAFTAR_UKURAN.map((s) => {
                                        const isSelected = localFilters.ukuran === s;
                                        return (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => handleSizeClick(s)}
                                                className={`min-w-[42px] py-1.5 px-3 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                                                    isSelected
                                                        ? "border-[#E52027] bg-red-50 text-[#E52027] font-bold"
                                                        : "border-slate-200 text-slate-700 hover:border-slate-300"
                                                }`}
                                            >
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sticky Footer: Tombol Apply Merah Sesuai Screenshot 2 */}
                    <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0">
                        <button
                            type="button"
                            onClick={handleApply}
                            className="w-full py-3.5 bg-[#E52027] hover:bg-[#CC1C22] active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer text-center"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
