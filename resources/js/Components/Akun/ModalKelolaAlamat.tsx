import React from 'react';
import { X, MapPin, Plus } from 'lucide-react';

export interface DeliveryAddress {
    id: number | string;
    nama_penerima: string;
    telepon: string;
    email: string;
    alamat_lengkap: string;
}

interface ModalKelolaAlamatProps {
    isOpen: boolean;
    onClose: () => void;
    addresses?: DeliveryAddress[];
}

export default function ModalKelolaAlamat({
    isOpen,
    onClose,
    addresses = [],
}: ModalKelolaAlamatProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#E52027]" />
                        Daftar Alamat Pengiriman
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {addresses.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl">
                            <p className="text-xs text-slate-500 font-medium">
                                Belum ada alamat tersimpan. Alamat akan otomatis tersimpan saat Anda melakukan checkout pesanan.
                            </p>
                        </div>
                    ) : (
                        addresses.map((addr) => (
                            <div
                                key={addr.id}
                                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs text-slate-700"
                            >
                                <div className="flex items-center justify-between">
                                    <strong className="font-extrabold text-slate-900 text-sm">
                                        {addr.nama_penerima}
                                    </strong>
                                    <span className="text-[11px] text-slate-500 font-mono">
                                        {addr.telepon}
                                    </span>
                                </div>
                                <p className="leading-relaxed text-slate-600">
                                    {addr.alamat_lengkap}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-2 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
