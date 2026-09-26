import React, { useState, useEffect, useMemo } from "react";
import { Plus, Minus, AlertCircle } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";

export interface VariantItem {
    id: number | string;
    nama_varian?: string;
    variant_name?: string;
    warna?: string;
    warna_hex?: string;
    ukuran?: string;
    harga_tambahan?: number;
    stok?: number;
    sku?: string;
    gambar_varian?: string | null;
    aktif?: boolean;
}

interface VariantSelectorProps {
    variants: VariantItem[];
    selectedVariant: VariantItem | null;
    onSelectVariant: (v: VariantItem) => void;
    selectedSize?: string;
    onSelectSize?: (size: string) => void;
    quantity: number;
    onQuantityChange: (qty: number) => void;
    totalStock: number;
    errorMessage?: string | null;
}

export default function VariantSelector({
    variants = [],
    selectedVariant,
    onSelectVariant,
    selectedSize,
    onSelectSize,
    quantity,
    onQuantityChange,
    totalStock,
    errorMessage,
}: VariantSelectorProps) {
    // 1. Ekstraksi daftar ukuran unik dari varian
    const availableSizes = useMemo(() => {
        return Array.from(
            new Set(variants.map((v) => v.ukuran).filter(Boolean) as string[]),
        );
    }, [variants]);

    const hasMultipleSizes =
        availableSizes.length > 1 &&
        !availableSizes.every((s) => s.toLowerCase() === "all size");

    // Hitung stok aktif
    const currentVariantStock = selectedVariant
        ? (selectedVariant.stok ?? totalStock)
        : totalStock;
    const isOutOfStock = currentVariantStock <= 0;

    // State lokal untuk kuantitas agar pengetikan angka tidak terpental
    const [localQtyStr, setLocalQtyStr] = useState<string>(String(quantity));

    useEffect(() => {
        setLocalQtyStr(String(isOutOfStock ? 0 : quantity));
    }, [quantity, isOutOfStock]);

    // Auto-clamp jika kuantitas melebihi stok varian yang dipilih
    useEffect(() => {
        if (currentVariantStock > 0 && quantity > currentVariantStock) {
            onQuantityChange(currentVariantStock);
        }
    }, [selectedVariant, currentVariantStock, quantity, onQuantityChange]);

    const handleIncrement = () => {
        if (quantity < currentVariantStock) {
            onQuantityChange(quantity + 1);
        }
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            onQuantityChange(quantity - 1);
        }
    };

    const handleQuantityBlur = () => {
        const parsed = parseInt(localQtyStr, 10);
        if (isNaN(parsed) || parsed < 1) {
            onQuantityChange(1);
            setLocalQtyStr("1");
        } else if (parsed > currentVariantStock) {
            onQuantityChange(currentVariantStock);
            setLocalQtyStr(String(currentVariantStock));
        } else {
            onQuantityChange(parsed);
        }
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, "");
        setLocalQtyStr(val);
        if (val) {
            const num = parseInt(val, 10);
            if (num > 0 && num <= currentVariantStock) {
                onQuantityChange(num);
            }
        }
    };

    // Label varian aktif terpilih
    const activeColorName =
        selectedVariant?.warna || selectedVariant?.nama_varian;

    return (
        <div className="space-y-5">
            {/* 1. Pemilih Warna / Varian Utama */}
            {variants.length > 0 && (
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 tracking-tight">
                            Pilihan Varian
                            {activeColorName && (
                                <span className="font-normal text-slate-500 ml-1.5">
                                    :{" "}
                                    <strong className="font-semibold text-slate-800">
                                        {activeColorName}
                                    </strong>
                                </span>
                            )}
                        </span>

                        {currentVariantStock > 0 &&
                            currentVariantStock <= 5 && (
                                <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                                    Sisa {currentVariantStock} item
                                </span>
                            )}
                    </div>

                    <div
                        role="radiogroup"
                        aria-label="Pilihan varian produk"
                        className="flex flex-wrap gap-2 sm:gap-2.5"
                    >
                        {variants.map((v) => {
                            const isSelected = selectedVariant?.id === v.id;
                            const isSoldOut = (v.stok ?? 0) <= 0;

                            const colorPart = v.warna || v.nama_varian || "";
                            const sizePart =
                                v.ukuran &&
                                v.ukuran.toLowerCase() !== "all size"
                                    ? v.ukuran
                                    : "";
                            const label =
                                sizePart && colorPart && !hasMultipleSizes
                                    ? `${colorPart.toUpperCase()} • ${sizePart.toUpperCase()}`
                                    : (
                                          colorPart ||
                                          sizePart ||
                                          v.sku ||
                                          "Varian"
                                      ).toUpperCase();

                            const extraPrice = Number(v.harga_tambahan || 0);

                            return (
                                <button
                                    key={v.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={isSelected}
                                    disabled={isSoldOut}
                                    onClick={() =>
                                        !isSoldOut && onSelectVariant(v)
                                    }
                                    className={`group relative overflow-hidden flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all select-none ${
                                        isSelected
                                            ? "border-slate-900 bg-white text-slate-900 ring-2 ring-slate-900/10 shadow-xs font-bold"
                                            : isSoldOut
                                              ? "border-slate-200 bg-slate-50/80 text-slate-400 cursor-not-allowed"
                                              : "border-slate-200 hover:border-slate-400 bg-white text-slate-700 hover:bg-slate-50/80 cursor-pointer"
                                    }`}
                                    aria-label={`${label} ${isSoldOut ? "(Stok Habis)" : ""}`}
                                >
                                    {/* Thumbnail Bulat / Hex Swatch */}
                                    {v.gambar_varian ? (
                                        <img
                                            src={v.gambar_varian}
                                            alt=""
                                            aria-hidden="true"
                                            className={`w-4 h-4 rounded-full object-cover shrink-0 border border-slate-200 ${
                                                isSoldOut
                                                    ? "opacity-40 grayscale"
                                                    : ""
                                            }`}
                                        />
                                    ) : v.warna_hex ? (
                                        <span
                                            aria-hidden="true"
                                            className={`w-3.5 h-3.5 rounded-full shrink-0 border border-black/15 shadow-2xs ${
                                                isSoldOut ? "opacity-40" : ""
                                            }`}
                                            style={{
                                                backgroundColor: v.warna_hex,
                                            }}
                                        />
                                    ) : null}

                                    <span
                                        className={
                                            isSoldOut
                                                ? "line-through text-slate-400"
                                                : ""
                                        }
                                    >
                                        {label}
                                    </span>

                                    {/* Label Tambahan Biaya Varian */}
                                    {extraPrice > 0 && !isSoldOut && (
                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                            +{formatRupiah(extraPrice)}
                                        </span>
                                    )}

                                    {/* Garis Coret Diagonal untuk Stok Kosong */}
                                    {isSoldOut && (
                                        <svg
                                            className="absolute inset-0 w-full h-full pointer-events-none text-slate-300"
                                            preserveAspectRatio="none"
                                            viewBox="0 0 100 100"
                                            aria-hidden="true"
                                        >
                                            <line
                                                x1="0"
                                                y1="100"
                                                x2="100"
                                                y2="0"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                            />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 2. Pemilih Ukuran (Size Selector Pills) */}
            {hasMultipleSizes && onSelectSize && (
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 tracking-tight">
                            Pilih Ukuran
                            {selectedSize && (
                                <span className="font-normal text-slate-500 ml-1.5">
                                    :{" "}
                                    <strong className="font-semibold text-slate-800">
                                        {selectedSize}
                                    </strong>
                                </span>
                            )}
                        </span>
                    </div>

                    <div
                        role="radiogroup"
                        aria-label="Pilihan ukuran produk"
                        className="flex flex-wrap gap-2"
                    >
                        {availableSizes.map((size) => {
                            const isSizeSelected = selectedSize === size;
                            return (
                                <button
                                    key={size}
                                    type="button"
                                    role="radio"
                                    aria-checked={isSizeSelected}
                                    onClick={() => onSelectSize(size)}
                                    className={`min-w-10 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                        isSizeSelected
                                            ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
                                            : "border-slate-200 bg-white hover:border-slate-400 text-slate-700 hover:bg-slate-50"
                                    }`}
                                >
                                    {size.toUpperCase()}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 3. Stepper Kuantitas & Error Feedback */}
            <div className="pt-1 space-y-2">
                <span className="block text-xs font-bold text-slate-900">
                    Jumlah Pembelian
                </span>

                <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-900/10 w-fit">
                    <button
                        type="button"
                        onClick={handleDecrement}
                        disabled={quantity <= 1 || isOutOfStock}
                        className="px-3.5 py-2.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Kurangi jumlah barang"
                    >
                        <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>

                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={isOutOfStock ? "0" : localQtyStr}
                        disabled={isOutOfStock}
                        onChange={handleQuantityChange}
                        onBlur={handleQuantityBlur}
                        className="w-12 text-center text-xs sm:text-sm font-black text-slate-900 focus:outline-none tabular-nums bg-transparent"
                        aria-label="Kuantitas produk"
                    />

                    <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={
                            quantity >= currentVariantStock || isOutOfStock
                        }
                        className="px-3.5 py-2.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Tambah jumlah barang"
                    >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                </div>

                {errorMessage && (
                    <p
                        role="alert"
                        className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 animate-in fade-in pt-0.5"
                    >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errorMessage}</span>
                    </p>
                )}
            </div>
        </div>
    );
}
