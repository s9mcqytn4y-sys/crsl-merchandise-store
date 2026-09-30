import { useState } from "react";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "@inertiajs/react";
import Button from "../../Common/Button";
import { cn } from "../../../lib/utils";
import {
    loginSchema,
    type LoginFormData,
} from "../../../Validation/authSchema";
import { toastNotifikasi } from "../../../Utils/toastNotifikasi";

interface LoginFormProps {
    onSuccessLogin?: () => void;
    onCloseModal: () => void;
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

export default function LoginForm({
    onSuccessLogin,
    onCloseModal,
}: LoginFormProps) {
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (formData: LoginFormData) => {
        setLoading(true);
        setServerError(null);

        try {
            const csrfToken = getCsrfToken();

            const res = await fetch("/login", {
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

            // Tangani status error HTTP spesifik
            if (res.status === 419) {
                setServerError(
                    "Sesi keamanan Anda telah berakhir. Silakan muat ulang halaman.",
                );
                toastNotifikasi.error(
                    "Sesi CSRF telah kedaluwarsa. Memuat ulang halaman...",
                );
                setTimeout(() => window.location.reload(), 1500);
                return;
            }

            if (res.status === 429) {
                setServerError(
                    "Terlalu banyak percobaan login. Silakan tunggu beberapa saat lagi.",
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
                        "Login berhasil! Selamat datang kembali.",
                );
                if (onSuccessLogin) onSuccessLogin();
                onCloseModal();
                router.reload();
            } else {
                // Ekstraksi pesan validasi Laravel standar
                const validationMsg = data?.errors
                    ? Object.values(data.errors).flat()[0]
                    : null;

                setServerError(
                    (typeof validationMsg === "string"
                        ? validationMsg
                        : null) ||
                        data?.pesan ||
                        data?.message ||
                        "Email atau kata sandi tidak sesuai.",
                );
            }
        } catch {
            setServerError(
                "Terjadi kesalahan koneksi ke server. Pastikan internet Anda stabil.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 text-xs pt-1"
            noValidate
        >
            {/* Alert Banner Server Error */}
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

            {/* Field Email */}
            <div>
                <label
                    htmlFor="login-email"
                    className="font-bold text-slate-700 block mb-1.5"
                >
                    Email <span className="text-[#E52027]">*</span>
                </label>
                <div className="relative">
                    <input
                        id="login-email"
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

            {/* Field Kata Sandi */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label
                        htmlFor="login-password"
                        className="font-bold text-slate-700"
                    >
                        Kata Sandi <span className="text-[#E52027]">*</span>
                    </label>
                </div>
                <div className="relative">
                    <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
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

            {/* Submit Button */}
            <div className="pt-2">
                <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold shadow-xs active:scale-[0.99] transition-all cursor-pointer"
                >
                    {loading ? "Memverifikasi Akun..." : "Masuk Sekarang"}
                </Button>
            </div>
        </form>
    );
}
