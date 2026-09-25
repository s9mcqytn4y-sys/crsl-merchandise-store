import React from 'react';
import { Gift, ChevronRight } from 'lucide-react';

interface KartuLoyalitasProps {
    tier?: string;
    progressText?: string;
    onLihatDetail?: () => void;
}

export default function KartuLoyalitas({
    tier = 'Non-Member',
    progressText = 'Belanja Rp 200.000 lagi untuk mencapai New Freen',
    onLihatDetail,
}: KartuLoyalitasProps) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Status Loyalitas
                </span>
                <button
                    type="button"
                    onClick={onLihatDetail}
                    className="text-xs font-bold text-[#E52027] hover:underline inline-flex items-center gap-0.5"
                >
                    Lihat Detail
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E52027] flex items-center justify-center shrink-0 border border-red-100">
                    <Gift className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                        {tier}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {progressText}
                    </p>
                </div>
            </div>
        </div>
    );
}
