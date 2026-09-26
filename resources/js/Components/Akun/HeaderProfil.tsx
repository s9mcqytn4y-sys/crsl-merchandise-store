import React from 'react';
import { Settings, LogOut, UserCheck } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuthStore } from '../../Stores/useAuthStore';

interface HeaderProfilProps {
    nama: string;
    email?: string;
    resellerStatus?: string | null;
    onBukaPengaturan: () => void;
}

export default function HeaderProfil({
    nama,
    email,
    resellerStatus,
    onBukaPengaturan,
}: HeaderProfilProps) {
    const handleLogout = () => {
        router.post('/logout');
    };

    const inisial = (nama || 'U').charAt(0).toUpperCase();

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#E52027] text-white flex items-center justify-center font-black text-lg shadow-sm">
                    {inisial}
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Halo, {nama || 'Sahabat CRSL'}
                    </h1>
                    {email && (
                        <p className="text-xs text-slate-500 font-medium">
                            {email}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
                {resellerStatus && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80">
                        <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                        {resellerStatus}
                    </span>
                )}
                <button
                    type="button"
                    onClick={onBukaPengaturan}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 transition-colors shadow-2xs"
                >
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    Pengaturan
                </button>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200/80 hover:bg-rose-100 text-rose-700 transition-colors shadow-2xs"
                >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    Keluar
                </button>
            </div>
        </div>
    );
}
