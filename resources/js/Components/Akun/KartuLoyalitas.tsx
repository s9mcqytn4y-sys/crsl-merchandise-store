import React from 'react';
import { Gift } from 'lucide-react';

interface KartuLoyalitasProps {
    tier?: string;
    progressText?: string;
    onLihatDetail?: () => void;
}

export default function KartuLoyalitas({
    tier = 'Non-Member',
    progressText = 'Spend Rp 200,000 more to reach New Freen',
    onLihatDetail,
}: KartuLoyalitasProps) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-800">
                    Loyalty
                </span>
                <button
                    type="button"
                    onClick={onLihatDetail}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                    See Details
                </button>
            </div>

            <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                    <Gift className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                    <h3 className="font-bold text-sm text-slate-900">
                        {tier}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {progressText}
                    </p>
                </div>
            </div>
        </div>
    );
}
