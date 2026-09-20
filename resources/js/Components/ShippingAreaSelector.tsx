import React, { useState, useEffect } from 'react';
import { Search, MapPin, Loader2, Check } from 'lucide-react';

interface AreaOption {
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
}

export default function ShippingAreaSelector({
    valueAreaId = '',
    onSelectArea,
    label = 'Cari Lokasi / Wilayah Pengiriman (Kecamatan / Kota / Kode Pos)'
}: ShippingAreaSelectorProps) {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<AreaOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedArea, setSelectedArea] = useState<AreaOption | null>(null);

    useEffect(() => {
        if (!query || query.length < 3) {
            setOptions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/wilayah/cari?q=${encodeURIComponent(query)}`);
                const res = await response.json();
                if (res.sukses && Array.isArray(res.data)) {
                    setOptions(res.data);
                }
            } catch (err) {
                console.error("Gagal memuat wilayah:", err);
            } finally {
                setIsLoading(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (area: AreaOption) => {
        setSelectedArea(area);
        setQuery(area.nama);
        setIsOpen(false);
        onSelectArea(area);
    };

    return (
        <div className="relative space-y-1">
            {label && (
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {label} <span className="text-red-500">*</span>
                </label>
            )}

            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Ketik min. 3 karakter, misal: Sleman, Kebayoran, 55281..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E52027] focus:bg-white text-slate-900 transition-all font-medium"
                />
                <MapPin className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                {isLoading && (
                    <Loader2 className="w-5 h-5 text-[#E52027] animate-spin absolute right-3 top-3.5" />
                )}
            </div>

            {/* Dropdown Options */}
            {isOpen && options.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => handleSelect(option)}
                            className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-start gap-3 group"
                        >
                            <MapPin className="w-4 h-4 text-[#E52027] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-slate-900 leading-tight">
                                    {option.nama}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                    ID Area: {option.id}
                                </div>
                            </div>
                            {selectedArea?.id === option.id && (
                                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
