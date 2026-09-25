import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import ProfileLayout from "../Layouts/ProfileLayout";
import { toast } from "sonner";

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
    const [birthDay, setBirthDay] = useState(user?.birth_day || "14");
    const [birthMonth, setBirthMonth] = useState(user?.birth_month || "09");
    const [birthYear, setBirthYear] = useState(user?.birth_year || "2003");
    const [sedangMenyimpan, setSedangMenyimpan] = useState(false);

    const hariOptions = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
    const bulanOptions = [
        { val: "01", label: "01 - Januari" },
        { val: "02", label: "02 - Februari" },
        { val: "03", label: "03 - Maret" },
        { val: "04", label: "04 - April" },
        { val: "05", label: "05 - Mei" },
        { val: "06", label: "06 - Juni" },
        { val: "07", label: "07 - Juli" },
        { val: "08", label: "08 - Agustus" },
        { val: "09", label: "09 - September" },
        { val: "10", label: "10 - Oktober" },
        { val: "11", label: "11 - November" },
        { val: "12", label: "12 - Desember" },
    ];
    const currentYear = new Date().getFullYear();
    const tahunOptions = Array.from({ length: 90 }, (_, i) => String(currentYear - i));

    const handleSimpanProfil = (e: React.FormEvent) => {
        e.preventDefault();
        setSedangMenyimpan(true);

        router.post(
            "/profile/myinfo",
            {
                name: nama,
                birth_day: birthDay,
                birth_month: birthMonth,
                birth_year: birthYear,
            },
            {
                onSuccess: () => {
                    toast.success("Profil berhasil diperbarui!");
                    setSedangMenyimpan(false);
                },
                onError: () => {
                    toast.error("Gagal menyimpan profil. Silakan periksa formulir.");
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
                    {/* Name Field */}
                    <div className="space-y-2">
                        <label
                            htmlFor="input-name"
                            className="block text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                            Name
                        </label>
                        <input
                            id="input-name"
                            type="text"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="Your full name"
                        />
                    </div>

                    {/* Email Field (Disabled) */}
                    <div className="space-y-2">
                        <label
                            htmlFor="input-email"
                            className="block text-xs font-semibold text-slate-400 uppercase tracking-wider"
                        >
                            Email
                        </label>
                        <input
                            id="input-email"
                            type="email"
                            value={user?.email || ""}
                            readOnly
                            disabled
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-500 cursor-not-allowed select-none"
                        />
                    </div>

                    {/* My Birthday Field (3 dropdowns) */}
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            My Birthday
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {/* Day */}
                            <div className="space-y-1">
                                <span className="text-[11px] text-slate-400">Day</span>
                                <select
                                    aria-label="Hari Kelahiran"
                                    value={birthDay}
                                    onChange={(e) => setBirthDay(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                                >
                                    {hariOptions.map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Month */}
                            <div className="space-y-1">
                                <span className="text-[11px] text-slate-400">Month</span>
                                <select
                                    aria-label="Bulan Kelahiran"
                                    value={birthMonth}
                                    onChange={(e) => setBirthMonth(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                                >
                                    {bulanOptions.map((m) => (
                                        <option key={m.val} value={m.val}>
                                            {m.val}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Year */}
                            <div className="space-y-1">
                                <span className="text-[11px] text-slate-400">Year</span>
                                <select
                                    aria-label="Tahun Kelahiran"
                                    value={birthYear}
                                    onChange={(e) => setBirthYear(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                                >
                                    {tahunOptions.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Action Save Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={sedangMenyimpan}
                            className="px-6 py-2.5 bg-primary hover:bg-primary-hover active:scale-95 text-white font-bold text-sm rounded-full shadow-md transition-all cursor-pointer disabled:opacity-50"
                        >
                            {sedangMenyimpan ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </ProfileLayout>
    );
}
