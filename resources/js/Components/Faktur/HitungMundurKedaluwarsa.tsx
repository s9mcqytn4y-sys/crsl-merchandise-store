import {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface HitungMundurKedaluwarsaProps {
    batasWaktu?: string;
    createdAt?: string;
    onExpired?: () => void;
}

/**
 * Normalisasi parser tanggal kebal lintas peramban (termasuk Safari WebKit & zona WIB UTC+7)
 */
function parseTargetTimestamp(batasWaktu?: string, createdAt?: string): number {
    const rawString = batasWaktu || createdAt;
    if (!rawString) {
        // Fallback terkunci ke sesi 15 menit jika props tidak terdefinisi
        return Date.now() + 15 * 60 * 1000;
    }

    try {
        let str = String(rawString).trim();

        // 1. Ganti spasi pemisah SQL dengan 'T'
        if (str.includes(" ") && !str.includes("T")) {
            str = str.replace(" ", "T");
        }

        // 2. Koreksi offset timezone tunggal "+07" menjadi "+07:00" khusus Safari iOS
        if (/([+-]\d{2})$/.test(str)) {
            str = str.replace(/([+-]\d{2})$/, "$1:00");
        }

        // 3. Jika tanpa penanda timezone, kunci ke WIB (UTC+7)
        if (!str.includes("Z") && !/[+-]\d{2}:?\d{2}/.test(str)) {
            str += "+07:00";
        }

        const parsed = new Date(str).getTime();
        if (!isNaN(parsed)) {
            // Jika membaca createdAt tanpa batasWaktu eksplisit, default adalah 24 jam
            if (!batasWaktu && createdAt) {
                return parsed + 24 * 60 * 60 * 1000;
            }
            return parsed;
        }
    } catch {
        // Abaikan dan gunakan fallback
    }

    return Date.now() + 15 * 60 * 1000;
}

export default function HitungMundurKedaluwarsa({
    batasWaktu,
    createdAt,
    onExpired,
}: HitungMundurKedaluwarsaProps) {
    // 1. Memoize target timestamp agar kebal infinite re-render loop
    const targetTimestamp = useMemo(() => {
        return parseTargetTimestamp(batasWaktu, createdAt);
    }, [batasWaktu, createdAt]);

    const hitungSisaDetik = useCallback(() => {
        const diff = Math.floor((targetTimestamp - Date.now()) / 1000);
        return Math.max(0, diff);
    }, [targetTimestamp]);

    const [sisaDetik, setSisaDetik] = useState<number>(hitungSisaDetik);

    const onExpiredRef = useRef(onExpired);
    const hasTriggeredRef = useRef(false);

    useEffect(() => {
        onExpiredRef.current = onExpired;
    }, [onExpired]);

    // 2. Sinkronisasi instan jika targetTimestamp berubah dari props
    useEffect(() => {
        const detikBaru = hitungSisaDetik();
        setSisaDetik(detikBaru);
        hasTriggeredRef.current = detikBaru <= 0;
    }, [hitungSisaDetik]);

    // 3. Lifecycle Timer Presisi (Tanpa sisaDetik di dependency array)
    useEffect(() => {
        if (targetTimestamp <= Date.now()) {
            if (!hasTriggeredRef.current) {
                hasTriggeredRef.current = true;
                onExpiredRef.current?.();
            }
            return;
        }

        const handleTick = () => {
            const detikSekarang = Math.max(
                0,
                Math.floor((targetTimestamp - Date.now()) / 1000),
            );
            setSisaDetik(detikSekarang);

            if (detikSekarang <= 0) {
                if (!hasTriggeredRef.current) {
                    hasTriggeredRef.current = true;
                    onExpiredRef.current?.();
                }
            }
        };

        // Eksekusi tick pertama
        handleTick();

        const timer = setInterval(handleTick, 1000);

        // Rekalkulasi saat layar kembali aktif dari background sleep (mobile tab switching)
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                handleTick();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearInterval(timer);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
        };
    }, [targetTimestamp]);

    const jam = Math.floor(sisaDetik / 3600);
    const menit = Math.floor((sisaDetik % 3600) / 60);
    const detik = sisaDetik % 60;

    const formatWaktu =
        jam > 0
            ? `${String(jam).padStart(2, "0")}:${String(menit).padStart(2, "0")}:${String(detik).padStart(2, "0")}`
            : `${String(menit).padStart(2, "0")}:${String(detik).padStart(2, "0")}`;

    const isUrgent = sisaDetik < 180 && sisaDetik > 0; // Di bawah 3 menit
    const isExpired = sisaDetik === 0;

    if (isExpired) {
        return (
            <div
                role="alert"
                aria-live="assertive"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-2xs select-none"
            >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                <span className="hidden sm:inline">
                    Batas waktu pembayaran kedaluwarsa
                </span>
                <span className="sm:hidden">Waktu Habis</span>
            </div>
        );
    }

    return (
        <div
            role="timer"
            aria-live="polite"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs select-none ${
                isUrgent
                    ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse"
                    : "bg-amber-50/90 border-amber-200 text-amber-950"
            }`}
        >
            <Clock
                className={`w-3.5 h-3.5 shrink-0 ${isUrgent ? "text-rose-600" : "text-amber-600"}`}
                aria-hidden="true"
            />
            <span className="text-slate-500 font-semibold hidden sm:inline">
                Sisa Waktu:
            </span>
            <span className="font-mono text-xs sm:text-sm tracking-wider tabular-nums font-bold">
                {formatWaktu}
            </span>
        </div>
    );
}
