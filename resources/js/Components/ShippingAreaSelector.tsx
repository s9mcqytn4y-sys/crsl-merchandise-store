import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, Check, X, AlertCircle } from "lucide-react";

export interface AreaOption {
    id: string;
    nama: string;
    provinsi: string;
    kota: string;
    kecamatan: string;
    kelurahan?: string;
    kode_pos?: string;
}

interface ShippingAreaSelectorProps {
    valueAreaId?: string;
    onSelectArea: (area: AreaOption) => void;
    label?: string;
    error?: string;
}

export default function ShippingAreaSelector({
    valueAreaId = "",
    onSelectArea,
    label = "Cari Lokasi / Wilayah Pengiriman (Kecamatan / Kota / Kode Pos)",
    error,
}: ShippingAreaSelectorProps) {
    const [query, setQuery] = useState("");
    const [options, setOptions] = useState<AreaOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedArea, setSelectedArea] = useState<AreaOption | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Menutup dropdown saat mengklik di luar komponen
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Pencarian dengan Debounce & AbortController (Mencegah Race Condition)
    useEffect(() => {
        const trimmed = query.trim();

        // Jika teks cocok dengan area yang baru saja dipilih, jangan cari ulang
        if (selectedArea && trimmed === selectedArea.nama) {
            return;
        }

        if (trimmed.length < 3) {
            setOptions([]);
            setIsLoading(false);
            setHasSearched(false);
            return;
        }

        const controller = new AbortController();
        setIsLoading(true);

        const timer = setTimeout(async () => {
            try {
                const response = await fetch(
                    `/api/wilayah/cari?q=${encodeURIComponent(trimmed)}`,
                    { signal: controller.signal },
                );
                const res = await response.json();
                if (res.sukses && Array.isArray(res.data)) {
                    setOptions(res.data);
                } else {
                    setOptions([]);
                }
                setHasSearched(true);
            } catch (err: unknown) {
                if (err instanceof DOMException && err.name === "AbortError")
                    return;
                setOptions([]);
            } finally {
                setIsLoading(false);
            }
        }, 350);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query, selectedArea]);

    const handleSelect = (area: AreaOption) => {
        setSelectedArea(area);
        setQuery(area.nama);
        setIsOpen(false);
        onSelectArea(area);
    };

    const handleClear = () => {
        setQuery("");
        setSelectedArea(null);
        setOptions([]);
        setHasSearched(false);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    return (
        <div ref={containerRef} className="relative space-y-1.5">
            {label && (
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {label} <span className="text-primary">*</span>
                </label>
            )}

            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => {
                        if (options.length > 0 || query.length >= 3) {
                            setIsOpen(true);
                        }
                    }}
                    placeholder="Ketik min. 3 karakter: Sleman, Kebayoran, atau 55281..."
                    className={`w-full bg-slate-50 border rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all ${
                        error
                            ? "border-rose-400 bg-rose-50/30"
                            : "border-slate-200"
                    }`}
                    role="combobox"
                    aria-expanded={isOpen}
                    autoComplete="off"
                />

                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {isLoading && (
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    )}
                    {query && !isLoading && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                            aria-label="Bersihkan pencarian"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <span className="text-rose-600 text-[11px] font-medium block">
                    {error}
                </span>
            )}

            {/* Dropdown Options Box */}
            {isOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100 overscroll-contain scrollbar-thin">
                    {options.length > 0 ? (
                        options.map((option) => {
                            const isCurrent =
                                selectedArea?.id === option.id ||
                                valueAreaId === option.id;
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className={`w-full text-left px-4 py-3 hover:bg-red-50/70 transition-colors flex items-start gap-3 group ${
                                        isCurrent ? "bg-red-50/50" : ""
                                    }`}
                                >
                                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                                            {option.nama}
                                        </div>
                                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 flex-wrap">
                                            <span>{option.kecamatan}</span>
                                            <span>•</span>
                                            <span>{option.kota}</span>
                                            {option.kode_pos && (
                                                <>
                                                    <span>•</span>
                                                    <span className="font-mono">
                                                        {option.kode_pos}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {isCurrent && (
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    )}
                                </button>
                            );
                        })
                    ) : hasSearched && !isLoading ? (
                        <div className="p-5 text-center space-y-1 text-slate-500">
                            <AlertCircle className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                            <p className="text-xs font-bold text-slate-700">
                                Wilayah Tidak Ditemukan
                            </p>
                            <p className="text-[11px]">
                                Coba masukkan nama kecamatan atau kode pos yang
                                lebih spesifik.
                            </p>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
