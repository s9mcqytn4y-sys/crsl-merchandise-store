import React from "react";
import { Coins } from "lucide-react";

interface LoyaltyPointRowProps {
    loyaltyPoints: number;
    useLoyaltyPoints: boolean;
    onToggle: (checked: boolean) => void;
}

export default function LoyaltyPointRow({
    loyaltyPoints,
    useLoyaltyPoints,
    onToggle,
}: LoyaltyPointRowProps) {
    return (
        <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2.5">
                <Coins className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                    Use Loyalty Point (&#8471; {loyaltyPoints.toLocaleString("id-ID")})
                </span>
            </div>
            <input
                type="checkbox"
                checked={useLoyaltyPoints}
                disabled={loyaltyPoints <= 0}
                onChange={(e) => onToggle(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#E52027] focus:ring-[#E52027] cursor-pointer disabled:cursor-not-allowed"
                aria-label="Gunakan loyalty point"
            />
        </div>
    );
}
