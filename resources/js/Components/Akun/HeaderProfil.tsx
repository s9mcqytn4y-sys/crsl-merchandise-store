import { useState } from "react";
import { Settings, LogOut, UserCheck, Loader2 } from "lucide-react";
import { router } from "@inertiajs/react";
import { useAuthStore } from "../../Stores/useAuthStore";
import { cn } from "../../lib/utils";

interface HeaderProfilProps {
    nama: string;
    email?: string;
    resellerStatus?: string | null;
    onBukaPengaturan: () => void;
    className?: string;
}

export default function HeaderProfil({
    nama,
    email,
    resellerStatus,
    onBukaPengaturan,
    className,
}: HeaderProfilProps) {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const resetAuth = useAuthStore((state) => (state as any).resetAuth);

    const handleLogout = () => {
        if (!window.confirm("Apakah Anda yakin ingin keluar dari akun CRSL?")) {
            return;
        }

        setIsLoggingOut(true);
        router.post(
            "/logout",
            {},
            {
                onFinish: () => {
                    setIsLoggingOut(false);
                    if (typeof resetAuth === "function") {
                        resetAuth();
                    }
                },
            },
        );
    };

    const inisial = (nama?.trim() || "C").charAt(0).toUpperCase();

    return (
        <div
            className={cn(
                "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 select-none",
                className,
            )}
        >
            {/* Informasi Pengguna & Avatar */}
            <div className="flex items-center gap-3.5 min-w-0">
                <div
                    aria-hidden="true"
                    className="w-12 h-12 rounded-2xl bg-[#E52027] text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0 select-none"
                >
                    {inisial}
                </div>
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                        Halo, {nama?.trim() || "Sahabat CRSL"}
                    </h1>
                    {email && (
                        <p className="text-xs text-slate-500 font-medium font-mono truncate">
                            {email}
                        </p>
                    )}
                </div>
            </div>

            {/* Aksi & Status Member */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
                {resellerStatus && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
                        <UserCheck className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
                        <span>{resellerStatus}</span>
                    </span>
                )}

                <button
                    type="button"
                    onClick={onBukaPengaturan}
                    disabled={isLoggingOut}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
                >
                    <Settings className="w-3.5 h-3.5 text-slate-500 stroke-[2.2]" />
                    <span>Pengaturan</span>
                </button>

                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200/80 hover:bg-rose-100 text-rose-700 transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
                >
                    {isLoggingOut ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Keluar...</span>
                        </>
                    ) : (
                        <>
                            <LogOut className="w-3.5 h-3.5 text-rose-600 stroke-[2.2]" />
                            <span>Keluar</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
