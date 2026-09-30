import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    KeyRound,
    CheckCircle,
    RefreshCw,
    AlertCircle,
    ArrowRight,
} from "lucide-react";
import { router } from "@inertiajs/react";
import Button from "../../Common/Button";
import { toast } from "sonner";

interface OtpFormProps {
    email: string;
    onSuccessVerify?: () => void;
    onCloseModal: () => void;
}

/**
 * Ekstraksi token CSRF dari cookie XSRF-TOKEN atau meta tag Laravel
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

export default function OtpForm({
    email,
    onSuccessVerify,
    onCloseModal,
}: OtpFormProps) {
    const [otpCode, setOtpCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [serverError, setServerError] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const isDevMode = Boolean(import.meta.env.DEV);

    // Countdown timer untuk kirim ulang OTP
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    // Fokus otomatis pada input saat pertama kali dibuka
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const executeVerify = useCallback(
        async (codeToVerify: string) => {
            if (codeToVerify.length !== 6 || loading) return;

            setLoading(true);
            setServerError(null);

            try {
                const csrfToken = getCsrfToken();
                const res = await fetch("/otp/verifikasi", {
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
                    body: JSON.stringify({ email, kode_otp: codeToVerify }),
                });

                if (res.status === 419) {
                    setServerError(
                        "Sesi Anda telah berakhir. Halaman akan dimuat ulang.",
                    );
                    setTimeout(() => window.location.reload(), 1500);
                    return;
                }

                const data = await res.json();

                if (res.ok && data?.sukses) {
                    toast.success(
                        "🎉 Akun berhasil diverifikasi & diaktifkan!",
                    );
                    onSuccessVerify?.();
                    onCloseModal();
                    router.reload();
                } else {
                    setServerError(
                        data?.pesan ||
                            "Kode OTP tidak valid atau telah kedaluwarsa.",
                    );
                    inputRef.current?.select();
                }
            } catch {
                setServerError(
                    "Gagal menghubungi server verifikasi. Periksa koneksi internet Anda.",
                );
            } finally {
                setLoading(false);
            }
        },
        [email, loading, onCloseModal, onSuccessVerify],
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        executeVerify(otpCode);
    };

    // Auto-sanitasi dan auto-submit saat 6 digit terpenuhi
    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cleaned = e.target.value.replace(/\D/g, "").slice(0, 6);
        setOtpCode(cleaned);

        if (cleaned.length === 6) {
            executeVerify(cleaned);
        }
    };

    // Aksi Kirim Ulang OTP
    const handleResendOtp = async () => {
        if (countdown > 0 || resending) return;

        setResending(true);
        setServerError(null);

        try {
            const csrfToken = getCsrfToken();
            const res = await fetch("/otp/kirim-ulang", {
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
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok && data?.sukses) {
                toast.success("Kode OTP baru telah dikirimkan ke email Anda!");
                setCountdown(60);
                setOtpCode("");
                inputRef.current?.focus();
            } else {
                toast.error(
                    data?.pesan ||
                        "Gagal mengirim ulang OTP. Coba beberapa saat lagi.",
                );
            }
        } catch {
            toast.error("Terjadi gangguan jaringan saat meminta kode baru.");
        } finally {
            setResending(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 text-xs pt-1 text-center"
            noValidate
        >
            {/* Banner Informasi Pengiriman Email */}
            <div className="bg-emerald-50/80 text-emerald-950 p-3.5 rounded-2xl border border-emerald-200/90 text-left space-y-1">
                <p className="font-medium text-xs leading-relaxed text-emerald-900">
                    Masukkan 6 digit kode verifikasi yang telah dikirimkan ke
                    alamat email:
                </p>
                <p className="font-bold text-xs text-slate-900 font-mono truncate">
                    {email}
                </p>

                {isDevMode && (
                    <p className="text-[11px] text-amber-800 bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-md inline-block mt-1">
                        Mode Dev Sandbox: Gunakan kode{" "}
                        <code className="font-bold">123456</code>
                    </p>
                )}
            </div>

            {/* Alert Error Server */}
            {serverError && (
                <div
                    role="alert"
                    className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-center gap-2 animate-in fade-in duration-150 text-left"
                >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span className="font-medium leading-relaxed">
                        {serverError}
                    </span>
                </div>
            )}

            {/* Input PIN OTP */}
            <div>
                <label
                    htmlFor="otp-input"
                    className="font-bold text-slate-700 block mb-2"
                >
                    Kode Verifikasi (OTP){" "}
                    <span className="text-[#E52027]">*</span>
                </label>
                <div className="relative max-w-xs mx-auto">
                    <input
                        ref={inputRef}
                        id="otp-input"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="one-time-code"
                        maxLength={6}
                        disabled={loading}
                        value={otpCode}
                        onChange={handleOtpChange}
                        placeholder="••••••"
                        className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl text-center font-mono text-2xl font-bold tracking-[0.4em] py-3 text-slate-900 focus:bg-white focus:outline-none focus:border-[#E52027] focus:ring-4 focus:ring-[#E52027]/10 transition-all disabled:opacity-50"
                        required
                    />
                    <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
            </div>

            {/* Tombol Submit Verifikasi */}
            <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={otpCode.length !== 6 || loading}
                className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] transition-all disabled:opacity-50"
            >
                <CheckCircle className="w-4 h-4" />
                <span>
                    {loading
                        ? "Memverifikasi..."
                        : "Verifikasi & Aktifkan Akun"}
                </span>
            </Button>

            {/* Area Kirim Ulang OTP */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Tidak menerima kode?</span>
                {countdown > 0 ? (
                    <span className="font-semibold text-slate-400 tabular-nums">
                        Kirim ulang dalam ({countdown}d)
                    </span>
                ) : (
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resending}
                        className="font-bold text-[#E52027] hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                        {resending ? (
                            <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                <span>Mengirim...</span>
                            </>
                        ) : (
                            <>
                                <span>Kirim Ulang</span>
                                <ArrowRight className="w-3 h-3" />
                            </>
                        )}
                    </button>
                )}
            </div>
        </form>
    );
}
