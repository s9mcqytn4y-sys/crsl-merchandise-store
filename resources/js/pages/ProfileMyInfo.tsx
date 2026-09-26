import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import ProfileLayout from "../Layouts/ProfileLayout";
import { toastNotifikasi } from "../Utils/toastNotifikasi";

interface UserProfile {
    name?: string;
    email?: string;
    phone?: string;
    birth_day?: string;
    birth_month?: string;
    birth_year?: string;
}

interface ProfileMyInfoProps {
    user: UserProfile;
}

export default function ProfileMyInfo({ user }: ProfileMyInfoProps) {
    const [nama, setNama] = useState(user?.name || "");
    const birthDay = user?.birth_day || "14";
    const birthMonth = user?.birth_month || "09";
    const birthYear = user?.birth_year || "2003";
    const [sedangMenyimpan, setSedangMenyimpan] = useState(false);
    const [namaError, setNamaError] = useState("");

    const bulanMap: Record<string, string> = {
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

    const handleSimpanProfil = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nama.trim()) {
            setNamaError("Name cannot be empty");
            return;
        }

        setSedangMenyimpan(true);
        setNamaError("");

        router.post(
            "/profile/myinfo",
            {
                name: nama.trim(),
            },
            {
                onSuccess: () => {
                    toastNotifikasi.sukses("Profil berhasil diperbarui!");
                    setSedangMenyimpan(false);
                },
                onError: () => {
                    toastNotifikasi.error("Gagal menyimpan profil. Silakan periksa kembali.");
                    setSedangMenyimpan(false);
                },
                onFinish: () => setSedangMenyimpan(false),
            }
        );
    };

    return (
        <ProfileLayout activeMenu="myinfo">
            <Head title="My Info - CRSL Official Store" />

            <div className="space-y-6">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    My Profile Info
                </h1>

                <form onSubmit={handleSimpanProfil} className="space-y-6 max-w-xl">
                    {/* Name Field (Hanya field ini yang dapat diedit) */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="input-name"
                            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                        >
                            Name
                        </label>
                        <input
                            id="input-name"
                            type="text"
                            value={nama}
                            onChange={(e) => {
                                setNama(e.target.value);
                                if (namaError) setNamaError("");
                            }}
                            required
                            className={`w-full px-4 py-3 bg-white border rounded-xl text-sm text-slate-800 transition-all ${
                                namaError
                                    ? "border-red-400 ring-1 ring-red-200"
                                    : "border-slate-200/90 focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                            }`}
                            placeholder="Your full name"
                        />
                        {namaError && (
                            <p className="text-[11px] font-medium text-red-500 pl-1">
                                {namaError}
                            </p>
                        )}
                    </div>

                    {/* Email Field (Read-only + Mute) */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="input-email"
                                className="block text-xs font-semibold text-slate-400 uppercase tracking-wider"
                            >
                                Email
                            </label>
                            <span className="text-[11px] text-slate-400 italic font-normal">
                                Read-only
                            </span>
                        </div>
                        <input
                            id="input-email"
                            type="email"
                            value={user?.email || ""}
                            readOnly
                            disabled
                            tabIndex={-1}
                            className="w-full px-4 py-3 bg-slate-100/80 border border-slate-200 rounded-xl text-sm text-slate-400 cursor-not-allowed select-none opacity-80"
                        />
                    </div>

                    {/* My Birthday Field (Read-only + Mute) */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                My Birthday
                            </label>
                            <span className="text-[11px] text-slate-400 italic font-normal">
                                Read-only
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {/* Day */}
                            <div className="space-y-1">
                                <span className="text-[11px] text-slate-400">Day</span>
                                <input
                                    type="text"
                                    value={birthDay}
                                    readOnly
                                    disabled
                                    tabIndex={-1}
                                    className="w-full px-3 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-sm text-slate-400 cursor-not-allowed select-none opacity-80 text-center font-medium"
                                />
                            </div>

                            {/* Month */}
                            <div className="space-y-1">
                                <span className="text-[11px] text-slate-400">Month</span>
                                <input
                                    type="text"
                                    value={bulanMap[birthMonth] || birthMonth}
                                    readOnly
                                    disabled
                                    tabIndex={-1}
                                    className="w-full px-3 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-sm text-slate-400 cursor-not-allowed select-none opacity-80 text-center font-medium"
                                />
                            </div>

                            {/* Year */}
                            <div className="space-y-1">
                                <span className="text-[11px] text-slate-400">Year</span>
                                <input
                                    type="text"
                                    value={birthYear}
                                    readOnly
                                    disabled
                                    tabIndex={-1}
                                    className="w-full px-3 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-sm text-slate-400 cursor-not-allowed select-none opacity-80 text-center font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Save Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={sedangMenyimpan}
                            className="px-7 py-3 bg-[#E52027] hover:bg-[#CC1C22] active:scale-95 text-white font-bold text-sm rounded-full shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sedangMenyimpan ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </ProfileLayout>
    );
}
