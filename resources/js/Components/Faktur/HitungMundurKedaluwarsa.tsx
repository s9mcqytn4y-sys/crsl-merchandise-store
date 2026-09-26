import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface HitungMundurKedaluwarsaProps {
    batasWaktu?: string;
    createdAt?: string;
    onExpired?: () => void;
}

export default function HitungMundurKedaluwarsa({
    batasWaktu,
    createdAt,
    onExpired,
}: HitungMundurKedaluwarsaProps) {
    const [sisaDetik, setSisaDetik] = useState<number>(() => {
        const targetDate = batasWaktu
            ? new Date(batasWaktu).getTime()
            : createdAt
              ? new Date(createdAt).getTime() + 15 * 60 * 1000
              : Date.now() + 15 * 60 * 1000;
        const diff = Math.floor((targetDate - Date.now()) / 1000);
        return Math.max(0, isNaN(diff) ? 15 * 60 : diff);
    });

    useEffect(() => {
        if (sisaDetik <= 0) {
            onExpired?.();
            return;
        }

        const timer = setInterval(() => {
            setSisaDetik((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onExpired?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [sisaDetik, onExpired]);

    const menit = Math.floor(sisaDetik / 60);
    const detik = sisaDetik % 60;
    const formatWaktu = `${String(menit).padStart(2, "0")}:${String(detik).padStart(2, "0")}`;

    const isUrgent = sisaDetik < 180 && sisaDetik > 0;
    const isExpired = sisaDetik === 0;

    if (isExpired) {
        return (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Batas waktu pembayaran telah kedaluwarsa.</span>
            </div>
        );
    }

    return (
        <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                isUrgent
                    ? "bg-rose-50 border-rose-200 text-rose-700 animate-pulse"
                    : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
        >
            <Clock
                className={`w-3.5 h-3.5 shrink-0 ${isUrgent ? "text-rose-600" : "text-amber-600"}`}
            />
            <span>Sisa Waktu:</span>
            <span className="font-mono text-sm tracking-wider font-extrabold">
                {formatWaktu}
            </span>
        </div>
    );
}
