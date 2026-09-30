import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Loader2, Check, X, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";

export interface AreaOption {
    id: string; // Biteship Destination Area ID
    nama: string;
    provinsi: string;
    kota: string;
    kecamatan: string;
    kelurahan?: string;
    kode_pos?: string;
}

interface ShippingAreaSelectorProps {
    valueAreaId?: string;
    initialAreaName?: string;
    onSelectArea: (area: AreaOption) => void;
    onClearArea?: () => void;
    label?: string;
    error?: string;
    disabled?: boolean;
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

export default function ShippingAreaSelector({
    valueAreaId = "",
    initialAreaName = "",
    onSelectArea,
    onClearArea,
    label = "Cari Lokasi / Wilayah Pengiriman (Kecamatan / Kota / Kode Pos)",
    error,
    disabled = false,
    className,
}: ShippingAreaSelectorProps) {
    const [query, setQuery] = useState(initialAreaName);
    const [options, setOptions] = useState<AreaOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedArea, setSelectedArea] = useState<AreaOption | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const searchAbortController = useRef<AbortController | null>(null);

    // Sinkronisasi jika initialAreaName atau valueAreaId berubah dari parent (misal saat edit alamat)
    useEffect(() => {
        if (initialAreaName && query !== initialAreaName) {
            setQuery(initialAreaName);
        }
    }, [initialAreaName]);

    // Menutup dropdown saat klik / sentuhan di luar komponen (Mobile Touch Safe)
    useEffect(() => {
        const handleOutsideAction = (e: MouseEvent | TouchEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideAction);
        document.addEventListener("touchstart", handleOutsideAction);
        return () => {
            document.removeEventListener("mousedown", handleOutsideAction);
            document.removeEventListener("touchstart", handleOutsideAction);
        };
    }, []);

    // Pencarian Wilayah dengan Debounce, CSRF Headers & AbortController (Anti Race Condition)
    useEffect(() => {
        const trimmed = query.trim();

        // Jangan cari ulang jika teks cocok dengan area yang baru saja dipilih
        if (
            selectedArea &&
            (trimmed === selectedArea.nama ||
                trimmed === `${selectedArea.kecamatan}, ${selectedArea.kota}`)
        ) {
            return;
        }

        if (trimmed.length < 3) {
            setOptions([]);
            setIsLoading(false);
            setHasSearched(false);
            return;
        }

        if (searchAbortController.current) {
            searchAbortController.current.abort();
        }

        const controller = new AbortController();
        searchAbortController.current = controller;
        setIsLoading(true);

        const timer = setTimeout(async () => {
            try {
                const csrfToken = getCsrfToken();
                const response = await fetch(
                    `/api/wilayah/cari?q=${encodeURIComponent(trimmed)}`,
                    {
                        signal: controller.signal,
                        headers: {
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                            ...(csrfToken
                                ? {
                                      "X-XSRF-TOKEN": csrfToken,
                                      "X-CSRF-TOKEN": csrfToken,
                                  }
                                : {}),
                        },
                    },
                );

                const res = await response.json();
                if (response.ok && res.sukses && Array.isArray(res.data)) {
                    setOptions(res.data);
                    setIsOpen(true);
                } else {
                    setOptions([]);
                }
                setHasSearched(true);
                setHighlightedIndex(-1);
            } catch (err: unknown) {
                if (err instanceof DOMException && err.name === "AbortError") {
                    return;
                }
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

    const handleSelect = useCallback(
        (area: AreaOption) => {
            setSelectedArea(area);
            setQuery(area.nama || `${area.kecamatan}, ${area.kota}`);
            setIsOpen(false);
            setHighlightedIndex(-1);
            onSelectArea(area);
        },
        [onSelectArea],
    );

    const handleClear = () => {
        setQuery("");
        setSelectedArea(null);
        setOptions([]);
        setHasSearched(false);
        setIsOpen(false);
        setHighlightedIndex(-1);
        onClearArea?.();
        inputRef.current?.focus();
    };

    // Navigasi Keyboard WAI-ARIA
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || options.length === 0) {
            if (e.key === "ArrowDown" && options.length > 0) {
                setIsOpen(true);
            }
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev < options.length - 1 ? prev + 1 : 0,
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev > 0 ? prev - 1 : options.length - 1,
            );
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < options.length) {
                handleSelect(options[highlightedIndex]);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative space-y-1.5 text-left select-none",
                className,
            )}
        >
            {label && (
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {label} <span className="text-[#E52027]">*</span>
                </label>
            )}

            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    disabled={disabled}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => {
                        if (options.length > 0 || query.trim().length >= 3) {
                            setIsOpen(true);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ketik min. 3 karakter: Sleman, Kebayoran, atau 55281..."
                    className={cn(
                        "w-full bg-slate-50 border rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none",
                        error
                            ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                            : "border-slate-200 focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/10",
                        disabled &&
                            "opacity-60 cursor-not-allowed bg-slate-100",
                    )}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-autocomplete="list"
                    aria-controls="shipping-area-options-list"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                />

                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {isLoading && (
                        <Loader2 className="w-4 h-4 text-[#E52027] animate-spin" />
                    )}
                    {query && !isLoading && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
                            aria-label="Bersihkan pencarian wilayah"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <span className="text-rose-600 text-[11px] font-semibold flex items-center gap-1 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                </span>
            )}

            {/* Dropdown Options List */}
            {isOpen && (
                <div
                    id="shipping-area-options-list"
                    role="listbox"
                    className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200/90 rounded-2xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100 overscroll-contain no-scrollbar"
                >
                    {options.length > 0 ? (
                        options.map((option, index) => {
                            const isCurrent =
                                selectedArea?.id === option.id ||
                                valueAreaId === option.id;
                            const isHighlighted = highlightedIndex === index;

                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    role="option"
                                    aria-selected={isCurrent}
                                    onClick={() => handleSelect(option)}
                                    onMouseEnter={() =>
                                        setHighlightedIndex(index)
                                    }
                                    className={cn(
                                        "w-full text-left px-4 py-3 transition-colors flex items-start gap-3 group cursor-pointer",
                                        isHighlighted && "bg-red-50/60",
                                        isCurrent &&
                                            !isHighlighted &&
                                            "bg-red-50/40",
                                    )}
                                >
                                    <MapPin
                                        className={cn(
                                            "w-4 h-4 shrink-0 mt-0.5 transition-transform group-hover:scale-110",
                                            isCurrent || isHighlighted
                                                ? "text-[#E52027]"
                                                : "text-slate-400",
                                        )}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug truncate">
                                            {option.nama}
                                        </div>
                                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                            <span>{option.kecamatan}</span>
                                            <span>•</span>
                                            <span>{option.kota}</span>
                                            {option.kode_pos && (
                                                <>
                                                    <span>•</span>
                                                    <span className="font-mono font-semibold text-slate-700">
                                                        Kodepos{" "}
                                                        {option.kode_pos}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {isCurrent && (
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
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
                            <p className="text-[11px] text-slate-500">
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
