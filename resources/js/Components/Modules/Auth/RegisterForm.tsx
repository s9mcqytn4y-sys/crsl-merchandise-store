import { useState } from "react";
import { User, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../../Common/Button";
import { cn } from "../../../lib/utils";
import {
    registerSchema,
    type RegisterFormData,
} from "../../../Validation/authSchema";
import { toastNotifikasi } from "../../../Utils/toastNotifikasi";

interface RegisterFormProps {
    onSuccessRegister: (email: string) => void;
}

/**
 * Mengambil token CSRF Laravel secara aman dari Cookie XSRF-TOKEN atau meta tag
 */
function getCsrfToken(): string {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
        const content = metaTag.getAttribute("content");
        if (content) return content;
    }

    const match = document.cookie.match(
        new RegExp("(^|;\\s*)XSRF-TOKEN=([^;]+)"),
    );
    if (match && match[2]) {
        return decodeURIComponent(match[2]);
    }

    return "";
}

export default function RegisterForm({ onSuccessRegister }: RegisterFormProps) {
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            nama: "",
            email: "",
            password: "",
            password_confirmation: "",
        },
    });

    const onSubmit = async (formData: RegisterFormData) => {
        setLoading(true);
        setServerError(null);

        try {
            const csrfToken = getCsrfToken();

            const res = await fetch("/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    ...(csrfToken
                        ? {
                              "X-XSRF-TOKEN": csrfToken,
                              "X-CSRF-TOKEN": csrfToken,
                          }
                        : {}),
                },
                body: JSON.stringify(formData),
            });

            if (res.status === 419) {
                setServerError(
                    "Sesi pendaftaran Anda telah kedaluwarsa. Silakan muat ulang halaman.",
                );
                toastNotifikasi.error(
                    "Sesi keamanan kedaluwarsa. Memuat ulang...",
                );
                setTimeout(() => window.location.reload(), 1500);
                return;
            }

            if (res.status === 429) {
                setServerError(
                    "Terlalu banyak permintaan pendaftaran. Silakan tunggu beberapa saat.",
                );
                return;
            }

            const isJson = res.headers
                .get("content-type")
                ?.includes("application/json");
            const data = isJson ? await res.json() : null;

            if (res.ok && (data?.sukses ?? true)) {
                toastNotifikasi.sukses(
                    data?.pesan ||
                        data?.message ||
                        "Pendaftaran berhasil! Periksa email untuk kode OTP.",
                );
                onSuccessRegister(formData.email);
            } else {
                // Pemetaan otomatis error validasi Laravel (HTTP 422) ke field form
                if (data?.errors && typeof data.errors === "object") {
                    let firstErrorMsg: string | null = null;

                    Object.entries(data.errors).forEach(([field, messages]) => {
                        const msg = Array.isArray(messages)
                            ? messages[0]
                            : (messages as string);
                        if (!firstErrorMsg) firstErrorMsg = msg;

                        if (
                            [
                                "nama",
                                "email",
                                "password",
                                "password_confirmation",
                            ].includes(field)
                        ) {
                            setError(field as keyof RegisterFormData, {
                                type: "server",
                                message: msg,
                            });
                        }
                    });

                    if (firstErrorMsg) {
                        setServerError(firstErrorMsg);
                        return;
                    }
                }

                setServerError(
                    data?.pesan ||
                        data?.message ||
                        "Gagal melakukan pendaftaran. Periksa kembali data Anda.",
                );
            }
        } catch {
            setServerError(
                "Terjadi gangguan jaringan saat menghubungi server. Pastikan koneksi internet stabil.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3.5 text-xs pt-1"
            noValidate
        >
            {/* Banner Error Server */}
            {serverError && (
                <div
                    role="alert"
                    className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-150"
                >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span className="leading-relaxed font-medium">
                        {serverError}
                    </span>
                </div>
            )}

            {/* Nama Lengkap */}
            <div>
                <label
                    htmlFor="register-nama"
                    className="font-bold text-slate-700 block mb-1.5"
                >
                    Nama Lengkap <span className="text-[#E52027]">*</span>
                </label>
                <div className="relative">
                    <input
                        id="register-nama"
                        type="text"
                        autoComplete="name"
                        disabled={loading}
                        {...register("nama")}
                        placeholder="CRSL Bestie"
                        className={cn(
                            "w-full bg-slate-50 border rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 transition-all focus:bg-white disabled:opacity-60",
                            errors.nama
                                ? "border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20"
                                : "border-slate-300 focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/20",
                        )}
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.nama && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.nama.message}</span>
                    </p>
                )}
            </div>

            {/* Email */}
            <div>
                <label
                    htmlFor="register-email"
                    className="font-bold text-slate-700 block mb-1.5"
                >
                    Email <span className="text-[#E52027]">*</span>
                </label>
                <div className="relative">
                    <input
                        id="register-email"
                        type="email"
                        autoComplete="email"
                        disabled={loading}
                        {...register("email")}
                        placeholder="bestie@crslstore.com"
                        className={cn(
                            "w-full bg-slate-50 border rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 transition-all focus:bg-white disabled:opacity-60",
                            errors.email
                                ? "border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20"
                                : "border-slate-300 focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/20",
                        )}
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.email && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.email.message}</span>
                    </p>
                )}
            </div>

            {/* Kata Sandi */}
            <div>
                <label
                    htmlFor="register-password"
                    className="font-bold text-slate-700 block mb-1.5"
                >
                    Kata Sandi (Min. 8 Karakter){" "}
                    <span className="text-[#E52027]">*</span>
                </label>
                <div className="relative">
                    <input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        disabled={loading}
                        {...register("password")}
                        placeholder="••••••••"
                        className={cn(
                            "w-full bg-slate-50 border rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 transition-all focus:bg-white disabled:opacity-60",
                            errors.password
                                ? "border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20"
                                : "border-slate-300 focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/20",
                        )}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1}
                        aria-label={
                            showPassword
                                ? "Sembunyikan kata sandi"
                                : "Tampilkan kata sandi"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors cursor-pointer"
                    >
                        {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.password.message}</span>
                    </p>
                )}
            </div>

            {/* Konfirmasi Kata Sandi */}
            <div>
                <label
                    htmlFor="register-password-confirmation"
                    className="font-bold text-slate-700 block mb-1.5"
                >
                    Konfirmasi Kata Sandi{" "}
                    <span className="text-[#E52027]">*</span>
                </label>
                <div className="relative">
                    <input
                        id="register-password-confirmation"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        disabled={loading}
                        {...register("password_confirmation")}
                        placeholder="••••••••"
                        className={cn(
                            "w-full bg-slate-50 border rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 transition-all focus:bg-white disabled:opacity-60",
                            errors.password_confirmation
                                ? "border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20"
                                : "border-slate-300 focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/20",
                        )}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        tabIndex={-1}
                        aria-label={
                            showConfirmPassword
                                ? "Sembunyikan konfirmasi kata sandi"
                                : "Tampilkan konfirmasi kata sandi"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors cursor-pointer"
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                    </button>
                </div>
                {errors.password_confirmation && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.password_confirmation.message}</span>
                    </p>
                )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
                <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide shadow-xs active:scale-[0.99] transition-all cursor-pointer"
                >
                    {loading
                        ? "Mendaftarkan Akun..."
                        : "Daftar & Minta Kode OTP"}
                </Button>
            </div>
        </form>
    );
}
