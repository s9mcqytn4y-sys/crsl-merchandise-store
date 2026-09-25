import React, { useState } from "react";
import { User, Mail, Phone, Calendar, ShieldCheck, Save } from "lucide-react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

interface MyInfoSectionProps {
    user?: {
        name?: string;
        email?: string;
        phone?: string;
        birth_day?: string;
        birth_month?: string;
        birth_year?: string;
        gender?: string;
    } | null;
    isGuest?: boolean;
    onOpenAuth?: () => void;
}

export default function MyInfoSection({
    user,
    isGuest = false,
    onOpenAuth,
}: MyInfoSectionProps) {
    const [nama, setNama] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState(user?.phone || "081234567890");
    const [birthDay, setBirthDay] = useState(user?.birth_day || "14");
    const [birthMonth, setBirthMonth] = useState(user?.birth_month || "09");
    const [birthYear, setBirthYear] = useState(user?.birth_year || "2000");
    const [gender, setGender] = useState(user?.gender || "female");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isGuest) {
            toast.info("Silakan masuk atau daftar akun terlebih dahulu untuk menyimpan data.");
            onOpenAuth?.();
            return;
        }

        setIsSubmitting(true);
        router.post(
            "/profil/perbarui",
            {
                name: nama,
                phone: phone,
                birth_day: birthDay,
                birth_month: birthMonth,
                birth_year: birthYear,
                gender: gender,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Informasi profil berhasil diperbarui!");
                    setIsSubmitting(false);
                },
                onError: () => {
                    toast.error("Gagal memperbarui profil.");
                    setIsSubmitting(false);
                },
            }
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-8 space-y-6 max-w-2xl">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        Personal Info (My Info)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Kelola informasi akun dan identitas resmi Anda di CRSL Official Store.
                    </p>
                </div>
                {isGuest && (
                    <span className="text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-full">
                        Mode Tamu
                    </span>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nama Lengkap */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nama Lengkap
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <User className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            placeholder="Masukkan nama lengkap Anda"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#E52027] focus:ring-1 focus:ring-[#E52027] focus:outline-none transition-all"
                            required
                        />
                    </div>
                </div>

                {/* Email (Read Only jika Login) */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Alamat Email
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Mail className="w-4 h-4" />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={!isGuest}
                            placeholder="nama@email.com"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-600 disabled:cursor-not-allowed focus:outline-none"
                            required
                        />
                    </div>
                </div>

                {/* Nomor Telepon */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nomor Handphone / WhatsApp
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Phone className="w-4 h-4" />
                        </div>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="08123456789"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#E52027] focus:ring-1 focus:ring-[#E52027] focus:outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Tanggal Lahir (Day, Month, Year) */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Tanggal Lahir (Untuk Kejutan Hadiah Ulang Tahun)</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        <input
                            type="number"
                            min="1"
                            max="31"
                            value={birthDay}
                            onChange={(e) => setBirthDay(e.target.value)}
                            placeholder="Hari (1-31)"
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 text-center focus:bg-white focus:border-[#E52027] focus:ring-1 focus:ring-[#E52027] focus:outline-none"
                        />
                        <input
                            type="number"
                            min="1"
                            max="12"
                            value={birthMonth}
                            onChange={(e) => setBirthMonth(e.target.value)}
                            placeholder="Bulan (1-12)"
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 text-center focus:bg-white focus:border-[#E52027] focus:ring-1 focus:ring-[#E52027] focus:outline-none"
                        />
                        <input
                            type="number"
                            min="1940"
                            max="2026"
                            value={birthYear}
                            onChange={(e) => setBirthYear(e.target.value)}
                            placeholder="Tahun"
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 text-center focus:bg-white focus:border-[#E52027] focus:ring-1 focus:ring-[#E52027] focus:outline-none"
                        />
                    </div>
                </div>

                {/* Jenis Kelamin */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Jenis Kelamin
                    </label>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                            <input
                                type="radio"
                                name="gender"
                                value="female"
                                checked={gender === "female"}
                                onChange={(e) => setGender(e.target.value)}
                                className="accent-[#E52027]"
                            />
                            <span>Perempuan</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                            <input
                                type="radio"
                                name="gender"
                                value="male"
                                checked={gender === "male"}
                                onChange={(e) => setGender(e.target.value)}
                                className="accent-[#E52027]"
                            />
                            <span>Laki-laki</span>
                        </label>
                    </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Data tersimpan aman terenkripsi</span>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2.5 bg-[#E52027] hover:bg-[#CC1C22] active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isGuest ? "Simpan / Masuk" : "Simpan Perubahan"}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
