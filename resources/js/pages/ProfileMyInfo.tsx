import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import ProfileLayout from "../Layouts/ProfileLayout";
import { toastNotifikasi } from "../Utils/toastNotifikasi";
import {
    User,
    Mail,
    Phone,
    Calendar,
    AlertCircle,
    Loader2,
    Lock,
} from "lucide-react";
import { cn } from "../lib/utils";

export interface UserProfile {
    name?: string;
    email?: string;
    phone?: string;
    birth_day?: string;
    birth_month?: string;
    birth_year?: string;
}

interface ProfileMyInfoProps {
    user: UserProfile;
    className?: string;
}

const BULAN_MAP: Record<string, string> = {
    "01": "Januari",
    "02": "Februari",
    "03": "Maret",
    "04": "April",
    "05": "Mei",
    "06": "Juni",
    "07": "Juli",
    "08": "Agustus",
    "09": "September",
    "10": "Oktober",
    "11": "November",
    "12": "Desember",
};

export default function ProfileMyInfo({ user, className }: ProfileMyInfoProps) {
    const [nama, setNama] = useState(user?.name || "");
    const [sedangMenyimpan, setSedangMenyimpan] = useState(false);
    const [namaError, setNamaError] = useState("");

    const birthDay = user?.birth_day || "";
    const birthMonth = user?.birth_month || "";
    const birthYear = user?.birth_year || "";
    const hasBirthdayData = Boolean(birthDay && birthMonth && birthYear);

    const handleSimpanProfil = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanName = nama.trim();

        if (!cleanName) {
            setNamaError("Nama lengkap tidak boleh kosong.");
            return;
        }

        if (cleanName.length < 3) {
            setNamaError("Nama lengkap minimal terdiri dari 3 karakter.");
            return;
        }

        setSedangMenyimpan(true);
        setNamaError("");

        router.post(
            "/profile/myinfo",
            {
                name: cleanName,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toastNotifikasi.sukses(
                        "Informasi profil Anda berhasil diperbarui!",
                    );
                    setSedangMenyimpan(false);
                },
                onError: (errors: Record<string, string>) => {
                    const serverError = errors?.name || errors?.error;
                    if (serverError) {
                        setNamaError(serverError);
                    }
                    toastNotifikasi.error(
                        serverError || "Gagal menyimpan perubahan profil.",
                    );
                    setSedangMenyimpan(false);
                },
                onFinish: () => setSedangMenyimpan(false),
            },
        );
    };

    return (
        <ProfileLayout activeMenu="myinfo">
            <Head title="Informasi Profil - CRSL Official Store" />

            <div className={cn("space-y-6 select-none", className)}>
                {/* Header Profil */}
                <div className="pb-4 border-b border-slate-100">
                    <span className="text-xs font-black text-primary uppercase tracking-wider">
                        Data Pengguna
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                        Informasi Profil Saya
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Kelola nama tampilan profil akun CRSL Anda. Data kontak
                        dan tanggal lahir terlindungi demi keamanan akun.
                    </p>
                </div>

                <form
                    onSubmit={handleSimpanProfil}
                    className="space-y-5 max-w-xl"
                >
                    {/* Nama Lengkap (Editable) */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="input-profile-name"
                            className="block text-xs font-bold text-slate-700"
                        >
                            Nama Lengkap{" "}
                            <span className="text-primary">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="input-profile-name"
                                type="text"
                                value={nama}
                                onChange={(e) => {
                                    setNama(e.target.value);
                                    if (namaError) setNamaError("");
                                }}
                                required
                                aria-invalid={Boolean(namaError)}
                                aria-describedby={
                                    namaError ? "profile-name-error" : undefined
                                }
                                placeholder="Masukkan nama lengkap Anda"
                                className={cn(
                                    "w-full pl-10 pr-4 py-2.5 bg-white border rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none transition-all shadow-2xs font-medium",
                                    namaError
                                        ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                                        : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10",
                                )}
                            />
                            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2]" />
                        </div>
                        {namaError && (
                            <p
                                id="profile-name-error"
                                role="alert"
                                className="text-xs text-rose-600 flex items-center gap-1.5 font-semibold pt-0.5 animate-in fade-in"
                            >
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>{namaError}</span>
                            </p>
                        )}
                    </div>

                    {/* Email Akun (Read-only) */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="input-profile-email"
                                className="block text-xs font-bold text-slate-500"
                            >
                                Alamat Email Terdaftar
                            </label>
                            <span className="text-[11px] text-slate-400 font-medium inline-flex items-center gap-1">
                                <Lock className="w-3 h-3 stroke-[2.2]" />
                                Terkunci
                            </span>
                        </div>
                        <div className="relative">
                            <input
                                id="input-profile-email"
                                type="email"
                                value={user?.email || "-"}
                                readOnly
                                disabled
                                tabIndex={-1}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-500 cursor-not-allowed select-none font-medium"
                            />
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-2" />
                        </div>
                    </div>

                    {/* Nomor Telepon Akun (Read-only) */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="input-profile-phone"
                                className="block text-xs font-bold text-slate-500"
                            >
                                Nomor Telepon / WhatsApp
                            </label>
                            <span className="text-[11px] text-slate-400 font-medium inline-flex items-center gap-1">
                                <Lock className="w-3 h-3 stroke-[2.2]" />
                                Terkunci
                            </span>
                        </div>
                        <div className="relative">
                            <input
                                id="input-profile-phone"
                                type="tel"
                                value={user?.phone || "-"}
                                readOnly
                                disabled
                                tabIndex={-1}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-500 cursor-not-allowed select-none font-mono font-medium"
                            />
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-2" />
                        </div>
                    </div>

                    {/* Tanggal Lahir (Read-only) */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-500">
                                Tanggal Lahir (Reward Member)
                            </label>
                            <span className="text-[11px] text-slate-400 font-medium inline-flex items-center gap-1">
                                <Lock className="w-3 h-3 stroke-[2.2]" />
                                Terkunci
                            </span>
                        </div>

                        {hasBirthdayData ? (
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400">
                                        Hari
                                    </span>
                                    <input
                                        type="text"
                                        value={birthDay}
                                        readOnly
                                        disabled
                                        tabIndex={-1}
                                        className="w-full px-3 py-2 bg-slate-100/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-600 text-center font-mono font-bold cursor-not-allowed select-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400">
                                        Bulan
                                    </span>
                                    <input
                                        type="text"
                                        value={
                                            BULAN_MAP[birthMonth] || birthMonth
                                        }
                                        readOnly
                                        disabled
                                        tabIndex={-1}
                                        className="w-full px-3 py-2 bg-slate-100/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-600 text-center font-bold cursor-not-allowed select-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400">
                                        Tahun
                                    </span>
                                    <input
                                        type="text"
                                        value={birthYear}
                                        readOnly
                                        disabled
                                        tabIndex={-1}
                                        className="w-full px-3 py-2 bg-slate-100/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-600 text-center font-mono font-bold cursor-not-allowed select-none"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="p-3 bg-slate-100/80 border border-slate-200/90 rounded-2xl flex items-center gap-2 text-xs text-slate-500 font-medium">
                                <Calendar className="w-4 h-4 text-slate-400 shrink-0 stroke-2" />
                                <span>
                                    Tanggal lahir belum diatur pada akun Anda.
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Tombol Simpan Perubahan */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={sedangMenyimpan}
                            className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-primary hover:bg-primary-hover active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sedangMenyimpan ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Menyimpan Perubahan...</span>
                                </>
                            ) : (
                                <span>Simpan Perubahan</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </ProfileLayout>
    );
}
