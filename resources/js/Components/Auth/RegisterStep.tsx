import React, { useState, useMemo, useEffect } from "react";
import {
    User,
    Lock,
    Eye,
    EyeOff,
    Check,
    ChevronDown,
    AlertCircle,
    Phone,
    Calendar,
    Loader2,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface RegisterStepProps {
    fullName: string;
    regEmail: string;
    regPassword: string;
    birthDay: string;
    birthMonth: string;
    birthYear: string;
    phone?: string;
    onChangeFullName: (val: string) => void;
    onChangeRegEmail: (val: string) => void;
    onChangeRegPassword: (val: string) => void;
    onChangeBirthDay: (val: string) => void;
    onChangeBirthMonth: (val: string) => void;
    onChangeBirthYear: (val: string) => void;
    onChangePhone?: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onSwitchToLogin: () => void;
    errors: Record<string, string>;
    loading: boolean;
    className?: string;
}

const MONTH_NAMES = [
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
];

export default function RegisterStep({
    fullName,
    regEmail,
    regPassword,
    birthDay,
    birthMonth,
    birthYear,
    phone = "",
    onChangeFullName,
    onChangeRegEmail,
    onChangeRegPassword,
    onChangeBirthDay,
    onChangeBirthMonth,
    onChangeBirthYear,
    onChangePhone,
    onSubmit,
    onSwitchToLogin,
    errors,
    loading,
    className,
}: RegisterStepProps) {
    const [showPassword, setShowPassword] = useState(false);

    // Hitung jumlah hari dinamis berdasarkan bulan dan tahun terpilih
    const maxDaysInMonth = useMemo(() => {
        const year = Number(birthYear) || 2003;
        const month = Number(birthMonth) || 1;
        return new Date(year, month, 0).getDate();
    }, [birthMonth, birthYear]);

    // Auto-clamp jika hari yang dipilih melebihi hari maksimum bulan tersebut
    useEffect(() => {
        if (Number(birthDay) > maxDaysInMonth) {
            onChangeBirthDay(String(maxDaysInMonth).padStart(2, "0"));
        }
    }, [maxDaysInMonth, birthDay, onChangeBirthDay]);

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim());
    const isNameValid = fullName.trim().length >= 3;
    const isPasswordValid = regPassword.length >= 8;
    const isRegisterComplete =
        isNameValid && isEmailValid && isPasswordValid && !loading;

    return (
        <form
            onSubmit={onSubmit}
            className={cn("space-y-3.5 pt-1 select-none", className)}
            noValidate
        >
            <div className="bg-red-50/70 border border-red-100 rounded-2xl p-3 text-xs text-slate-700 leading-relaxed">
                Daftar akun CRSL Member untuk kumpulkan poin belanja, dapatkan
                voucher eksklusif, dan akses koleksi terbaru lebih awal.
            </div>

            {/* Nama Lengkap */}
            <div>
                <label
                    htmlFor="register-fullname"
                    className="block text-xs font-bold text-slate-700 mb-1"
                >
                    Nama Lengkap <span className="text-primary">*</span>
                </label>
                <div
                    className={cn(
                        "border rounded-2xl px-3.5 py-2.5 sm:py-3 bg-white transition-all shadow-2xs flex items-center gap-2.5",
                        errors.fullName
                            ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                            : "border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10",
                    )}
                >
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        id="register-fullname"
                        type="text"
                        disabled={loading}
                        value={fullName}
                        onChange={(e) => onChangeFullName(e.target.value)}
                        placeholder="Contoh: Chiko Maulana"
                        aria-invalid={Boolean(errors.fullName)}
                        aria-describedby={
                            errors.fullName
                                ? "register-fullname-error"
                                : undefined
                        }
                        className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                        required
                    />
                </div>
                {errors.fullName && (
                    <p
                        id="register-fullname-error"
                        role="alert"
                        className="text-xs font-semibold text-rose-600 pl-1 mt-1 flex items-center gap-1 animate-in fade-in"
                    >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.fullName}</span>
                    </p>
                )}
            </div>

            {/* Alamat Email */}
            <div>
                <label
                    htmlFor="register-email"
                    className="block text-xs font-bold text-slate-700 mb-1"
                >
                    Alamat Email <span className="text-primary">*</span>
                </label>
                <div
                    className={cn(
                        "border rounded-2xl px-3.5 py-2.5 sm:py-3 flex items-center gap-2.5 bg-white transition-all shadow-2xs",
                        errors.regEmail
                            ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                            : "border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10",
                    )}
                >
                    <span className="text-slate-400 text-xs font-bold">@</span>
                    <input
                        id="register-email"
                        type="email"
                        disabled={loading}
                        value={regEmail}
                        onChange={(e) => onChangeRegEmail(e.target.value)}
                        placeholder="nama@email.com"
                        aria-invalid={Boolean(errors.regEmail)}
                        aria-describedby={
                            errors.regEmail ? "register-email-error" : undefined
                        }
                        className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck={false}
                        required
                    />
                    {isEmailValid && (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                    )}
                </div>
                {errors.regEmail && (
                    <p
                        id="register-email-error"
                        role="alert"
                        className="text-xs font-semibold text-rose-600 pl-1 mt-1 flex items-center gap-1 animate-in fade-in"
                    >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.regEmail}</span>
                    </p>
                )}
            </div>

            {/* Nomor Handphone / WhatsApp (Opsional / Recommended) */}
            {onChangePhone && (
                <div>
                    <label
                        htmlFor="register-phone"
                        className="block text-xs font-bold text-slate-700 mb-1"
                    >
                        Nomor Handphone / WhatsApp
                    </label>
                    <div
                        className={cn(
                            "border rounded-2xl px-3.5 py-2.5 sm:py-3 flex items-center gap-2.5 bg-white transition-all shadow-2xs",
                            errors.phone
                                ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                                : "border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10",
                        )}
                    >
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                            id="register-phone"
                            type="tel"
                            inputMode="numeric"
                            disabled={loading}
                            value={phone}
                            onChange={(e) =>
                                onChangePhone(e.target.value.replace(/\D/g, ""))
                            }
                            placeholder="Contoh: 081234567890"
                            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium font-mono"
                        />
                    </div>
                </div>
            )}

            {/* Kata Sandi */}
            <div>
                <label
                    htmlFor="register-password"
                    className="block text-xs font-bold text-slate-700 mb-1"
                >
                    Kata Sandi <span className="text-primary">*</span>
                </label>
                <div
                    className={cn(
                        "border rounded-2xl px-3.5 py-2.5 sm:py-3 flex items-center gap-2.5 bg-white transition-all shadow-2xs",
                        errors.regPassword
                            ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                            : "border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10",
                    )}
                >
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        disabled={loading}
                        value={regPassword}
                        onChange={(e) => onChangeRegPassword(e.target.value)}
                        placeholder="Minimal 8 karakter"
                        aria-invalid={Boolean(errors.regPassword)}
                        aria-describedby={
                            errors.regPassword
                                ? "register-password-error"
                                : undefined
                        }
                        className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                        autoComplete="new-password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer focus:outline-none"
                        aria-label={
                            showPassword
                                ? "Sembunyikan kata sandi"
                                : "Tampilkan kata sandi"
                        }
                    >
                        {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                    </button>
                </div>
                {errors.regPassword && (
                    <p
                        id="register-password-error"
                        role="alert"
                        className="text-xs font-semibold text-rose-600 pl-1 mt-1 flex items-center gap-1 animate-in fade-in"
                    >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.regPassword}</span>
                    </p>
                )}
            </div>

            {/* Tanggal Lahir (Dinamis & Bebas Overflow) */}
            <div className="pt-0.5">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tanggal Lahir</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                        (untuk promo ulang tahun)
                    </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {/* Hari */}
                    <div className="relative">
                        <select
                            aria-label="Hari Kelahiran"
                            disabled={loading}
                            value={birthDay}
                            onChange={(e) => onChangeBirthDay(e.target.value)}
                            className="w-full appearance-none bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 pr-7 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer font-bold font-mono"
                        >
                            {Array.from(
                                { length: maxDaysInMonth },
                                (_, i) => i + 1,
                            ).map((d) => {
                                const val = String(d).padStart(2, "0");
                                return (
                                    <option key={d} value={val}>
                                        {val}
                                    </option>
                                );
                            })}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Bulan */}
                    <div className="relative">
                        <select
                            aria-label="Bulan Kelahiran"
                            disabled={loading}
                            value={birthMonth}
                            onChange={(e) => onChangeBirthMonth(e.target.value)}
                            className="w-full appearance-none bg-white border border-slate-300 rounded-xl px-2.5 py-2.5 text-xs text-slate-900 pr-7 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer font-semibold truncate"
                        >
                            {MONTH_NAMES.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Tahun */}
                    <div className="relative">
                        <select
                            aria-label="Tahun Kelahiran"
                            disabled={loading}
                            value={birthYear}
                            onChange={(e) => onChangeBirthYear(e.target.value)}
                            className="w-full appearance-none bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 pr-7 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer font-bold font-mono"
                        >
                            {Array.from({ length: 70 }, (_, i) => 2026 - i).map(
                                (y) => (
                                    <option key={y} value={String(y)}>
                                        {y}
                                    </option>
                                ),
                            )}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Tombol Submit */}
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={!isRegisterComplete}
                    className={cn(
                        "w-full min-h-12 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs",
                        isRegisterComplete
                            ? "bg-primary hover:bg-primary-hover active:scale-[0.99] text-white cursor-pointer"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed select-none",
                    )}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Mendaftarkan Akun...</span>
                        </>
                    ) : (
                        <span>Daftar Sekarang</span>
                    )}
                </button>
            </div>

            <div className="text-center text-xs text-slate-600 pt-1.5">
                Sudah memiliki akun?{" "}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-primary hover:text-primary-hover font-bold hover:underline cursor-pointer"
                >
                    Masuk di sini
                </button>
            </div>
        </form>
    );
}
