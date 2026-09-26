import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { router } from "@inertiajs/react";
import { X, ArrowLeft } from "lucide-react";
import { toastNotifikasi } from "../Utils/toastNotifikasi";
import LoginIdentifierStep from "./Auth/LoginIdentifierStep";
import LoginPasswordStep from "./Auth/LoginPasswordStep";
import RegisterStep from "./Auth/RegisterStep";
import OtpVerifyStep from "./Auth/OtpVerifyStep";
import ForgotPasswordStep from "./Auth/ForgotPasswordStep";
import ResetPasswordStep from "./Auth/ResetPasswordStep";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccessAuth?: () => void;
    initialTab?: "login" | "register";
}

type AuthStep =
    | "login_identifier"
    | "login_password"
    | "forgot_password"
    | "reset_password"
    | "register"
    | "verify_otp";

export default function AuthModal({
    isOpen,
    onClose,
    onSuccessAuth,
    initialTab = "login",
}: AuthModalProps) {
    const [step, setStep] = useState<AuthStep>(
        initialTab === "register" ? "register" : "login_identifier"
    );
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Form States
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [birthDay, setBirthDay] = useState("14");
    const [birthMonth, setBirthMonth] = useState("09");
    const [birthYear, setBirthYear] = useState("2003");
    const [otpCode, setOtpCode] = useState("");
    const [countdown, setCountdown] = useState(180);

    // Reset Password States
    const [resetIdentifier, setResetIdentifier] = useState("");
    const [resetOtp, setResetOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [resetSuccessMessage, setResetSuccessMessage] = useState("");

    useEffect(() => {
        if (isOpen) {
            setStep(initialTab === "register" ? "register" : "login_identifier");
            setCountdown(180);
            setErrors({});
            setResetSuccessMessage("");
        }
    }, [isOpen, initialTab]);

    // Timer countdown untuk kirim ulang kode OTP
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (isOpen && (step === "verify_otp" || step === "reset_password") && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isOpen, step, countdown]);

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setIdentifier("");
            setPassword("");
            setFullName("");
            setRegEmail("");
            setRegPassword("");
            setOtpCode("");
            setResetIdentifier("");
            setResetOtp("");
            setNewPassword("");
            setConfirmNewPassword("");
            setResetSuccessMessage("");
            setErrors({});
            setLoading(false);
        }, 200);
    };

    const clearFieldError = (fieldName: string) => {
        if (errors[fieldName]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[fieldName];
                return next;
            });
        }
    };

    // ─── 1. Login Identifier Step ───
    const handleNextIdentifier = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = identifier.trim();
        if (!trimmed) {
            setErrors({ identifier: "Mohon masukkan email atau nomor handphone Anda." });
            return;
        }

        const isEmail = trimmed.includes("@") && trimmed.includes(".");
        const isPhone = /^[0-9+\s-]{8,16}$/.test(trimmed);
        if (!isEmail && !isPhone) {
            setErrors({
                identifier:
                    "Format email atau nomor handphone tidak valid. Contoh: bestie@crsl-store.id atau 08123456789",
            });
            return;
        }

        setErrors({});
        setStep("login_password");
    };

    // ─── 2. Login Password Submit ───
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            setErrors({ password: "Kata sandi wajib diisi." });
            return;
        }

        setLoading(true);
        setErrors({});
        try {
            const res = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify({ email: identifier.trim(), password }),
            });
            const data = await res.json();
            if (res.ok && (data.sukses || data.success)) {
                toastNotifikasi.sukses(data.pesan || "Login berhasil! Selamat datang kembali.");
                onSuccessAuth?.();
                handleClose();
                router.reload();
            } else {
                const errMsg =
                    data.pesan || data.message || "Email/Nomor HP atau kata sandi tidak cocok.";
                setErrors({ password: errMsg });
            }
        } catch {
            setErrors({ password: "Gagal terhubung ke server. Silakan coba kembali." });
        } finally {
            setLoading(false);
        }
    };

    // ─── 3. Register Submit ───
    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        const cleanName = fullName.trim();
        const cleanEmail = regEmail.trim().toLowerCase();

        if (!cleanName) newErrors.fullName = "Nama lengkap wajib diisi.";
        else if (cleanName.length < 3) newErrors.fullName = "Nama lengkap minimal 3 karakter.";

        if (!cleanEmail) newErrors.regEmail = "Email wajib diisi.";
        else if (!cleanEmail.includes("@") || !cleanEmail.includes("."))
            newErrors.regEmail = "Alamat email tidak valid.";

        if (!regPassword) newErrors.regPassword = "Kata sandi wajib diisi minimal 8 karakter.";
        else if (regPassword.length < 8)
            newErrors.regPassword = "Kata sandi minimal 8 karakter.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});
        try {
            const res = await fetch("/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify({
                    nama: cleanName,
                    name: cleanName,
                    email: cleanEmail,
                    password: regPassword,
                    password_confirmation: regPassword,
                    birth_day: birthDay,
                    birth_month: birthMonth,
                    birth_year: birthYear,
                }),
            });
            const data = await res.json();
            if (res.ok && (data.sukses || data.success)) {
                setStep("verify_otp");
                setCountdown(180);
            } else {
                const errMsg =
                    data.pesan || data.message || "Pendaftaran gagal. Silakan periksa data Anda.";
                if (errMsg.toLowerCase().includes("email")) {
                    setErrors({ regEmail: errMsg });
                } else {
                    setErrors({ regPassword: errMsg });
                }
            }
        } catch {
            setErrors({ regEmail: "Gagal terhubung ke server. Silakan coba lagi." });
        } finally {
            setLoading(false);
        }
    };

    // ─── 4. OTP Verification Submit ───
    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otpCode || otpCode.length !== 6) {
            setErrors({ otpCode: "Masukkan 6 digit kode verifikasi OTP secara lengkap." });
            return;
        }

        setLoading(true);
        setErrors({});
        try {
            const targetEmail = (regEmail || identifier).trim().toLowerCase();
            const res = await fetch("/otp/verifikasi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify({ email: targetEmail, kode_otp: otpCode }),
            });
            const data = await res.json();
            if (res.ok && (data.sukses || data.success)) {
                toastNotifikasi.sukses("Akun berhasil diverifikasi! Selamat datang.");
                onSuccessAuth?.();
                handleClose();
                router.reload();
            } else {
                setErrors({
                    otpCode:
                        data.pesan ||
                        "Kode OTP 6 digit tidak valid atau sudah kedaluwarsa. Gunakan 123456 untuk testing.",
                });
            }
        } catch {
            setErrors({ otpCode: "Terjadi kesalahan saat memverifikasi OTP. Silakan coba kembali." });
        } finally {
            setLoading(false);
        }
    };

    // ─── 5. Forgot Password: Minta OTP ───
    const handleForgotRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const target = (resetIdentifier || identifier).trim();
        if (!target) {
            setErrors({ resetIdentifier: "Masukkan email atau nomor HP yang terdaftar." });
            return;
        }

        setLoading(true);
        setErrors({});
        try {
            const res = await fetch("/lupa-password/minta-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify({ identitas: target }),
            });
            const data = await res.json();
            if (res.ok && data.sukses) {
                setResetIdentifier(target);
                setResetSuccessMessage(data.pesan || "Kode OTP telah dikirim.");
                setStep("reset_password");
                setCountdown(180);
            } else {
                setErrors({
                    resetIdentifier:
                        data.pesan ||
                        "Akun tidak ditemukan. Periksa kembali email atau nomor HP Anda.",
                });
            }
        } catch {
            setErrors({
                resetIdentifier: "Gagal mengirim permintaan reset password. Coba sesaat lagi.",
            });
        } finally {
            setLoading(false);
        }
    };

    // ─── 6. Reset Password dengan OTP ───
    const handleResetPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrs: Record<string, string> = {};

        if (!resetOtp || resetOtp.length !== 6) {
            newErrs.resetOtp = "Masukkan 6 digit kode OTP verifikasi.";
        }
        if (!newPassword || newPassword.length < 8) {
            newErrs.newPassword = "Kata sandi baru minimal 8 karakter.";
        }
        if (newPassword !== confirmNewPassword) {
            newErrs.confirmNewPassword = "Konfirmasi kata sandi tidak cocok.";
        }

        if (Object.keys(newErrs).length > 0) {
            setErrors(newErrs);
            return;
        }

        setLoading(true);
        setErrors({});
        try {
            const res = await fetch("/lupa-password/reset", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify({
                    identitas: resetIdentifier,
                    kode_otp: resetOtp,
                    password: newPassword,
                    password_confirmation: confirmNewPassword,
                }),
            });
            const data = await res.json();
            if (res.ok && data.sukses) {
                toastNotifikasi.sukses("Kata sandi berhasil diperbarui! Anda telah login otomatis.");
                onSuccessAuth?.();
                handleClose();
                router.reload();
            } else {
                setErrors({
                    resetOtp:
                        data.pesan ||
                        "Kode OTP salah atau reset gagal. Gunakan 123456 untuk testing.",
                });
            }
        } catch {
            setErrors({ resetOtp: "Gagal memperbarui kata sandi. Silakan coba kembali." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-[420px] transform overflow-hidden rounded-[28px] bg-white p-6 sm:p-7 text-left align-middle shadow-2xl transition-all border border-slate-200">
                                {/* Header Modal */}
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        {(step === "login_password" || step === "forgot_password") && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setErrors({});
                                                    setStep("login_identifier");
                                                }}
                                                className="p-1 -ml-1 text-slate-500 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                                                aria-label="Kembali ke langkah sebelumnya"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                            </button>
                                        )}
                                        {step === "reset_password" && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setErrors({});
                                                    setStep("forgot_password");
                                                }}
                                                className="p-1 -ml-1 text-slate-500 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                                                aria-label="Kembali ke lupa password"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                            </button>
                                        )}

                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-bold text-slate-900 tracking-tight"
                                        >
                                            {step === "login_identifier" && "Masuk ke Akun"}
                                            {step === "login_password" && "Masukkan Kata Sandi"}
                                            {step === "forgot_password" && "Lupa Kata Sandi"}
                                            {step === "reset_password" && "Atur Ulang Kata Sandi"}
                                            {step === "register" && "Daftar Akun CRSL"}
                                            {step === "verify_otp" && "Verifikasi Kode OTP"}
                                        </Dialog.Title>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors focus:outline-none cursor-pointer"
                                        aria-label="Tutup dialog"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Step Components */}
                                {step === "login_identifier" && (
                                    <LoginIdentifierStep
                                        identifier={identifier}
                                        onChangeIdentifier={(val) => {
                                            setIdentifier(val);
                                            clearFieldError("identifier");
                                        }}
                                        onSubmit={handleNextIdentifier}
                                        onSwitchToRegister={() => {
                                            setErrors({});
                                            setStep("register");
                                        }}
                                        error={errors.identifier}
                                        loading={loading}
                                    />
                                )}

                                {step === "login_password" && (
                                    <LoginPasswordStep
                                        identifier={identifier}
                                        password={password}
                                        onChangePassword={(val) => {
                                            setPassword(val);
                                            clearFieldError("password");
                                        }}
                                        onSubmit={handleLoginSubmit}
                                        onChangeIdentifierClick={() => {
                                            setErrors({});
                                            setStep("login_identifier");
                                        }}
                                        onForgotPasswordClick={() => {
                                            setErrors({});
                                            setResetIdentifier(identifier);
                                            setStep("forgot_password");
                                        }}
                                        error={errors.password}
                                        loading={loading}
                                    />
                                )}

                                {step === "forgot_password" && (
                                    <ForgotPasswordStep
                                        identifier={resetIdentifier || identifier}
                                        onChangeIdentifier={(val) => {
                                            setResetIdentifier(val);
                                            setIdentifier(val);
                                            clearFieldError("resetIdentifier");
                                        }}
                                        onSubmit={handleForgotRequestOtp}
                                        error={errors.resetIdentifier}
                                        loading={loading}
                                    />
                                )}

                                {step === "reset_password" && (
                                    <ResetPasswordStep
                                        resetSuccessMessage={resetSuccessMessage}
                                        resetOtp={resetOtp}
                                        newPassword={newPassword}
                                        confirmNewPassword={confirmNewPassword}
                                        onChangeResetOtp={(val) => {
                                            setResetOtp(val);
                                            clearFieldError("resetOtp");
                                        }}
                                        onChangeNewPassword={(val) => {
                                            setNewPassword(val);
                                            clearFieldError("newPassword");
                                        }}
                                        onChangeConfirmNewPassword={(val) => {
                                            setConfirmNewPassword(val);
                                            clearFieldError("confirmNewPassword");
                                        }}
                                        onSubmit={handleResetPasswordSubmit}
                                        errors={errors}
                                        loading={loading}
                                    />
                                )}

                                {step === "register" && (
                                    <RegisterStep
                                        fullName={fullName}
                                        regEmail={regEmail}
                                        regPassword={regPassword}
                                        birthDay={birthDay}
                                        birthMonth={birthMonth}
                                        birthYear={birthYear}
                                        onChangeFullName={(val) => {
                                            setFullName(val);
                                            clearFieldError("fullName");
                                        }}
                                        onChangeRegEmail={(val) => {
                                            setRegEmail(val);
                                            clearFieldError("regEmail");
                                        }}
                                        onChangeRegPassword={(val) => {
                                            setRegPassword(val);
                                            clearFieldError("regPassword");
                                        }}
                                        onChangeBirthDay={setBirthDay}
                                        onChangeBirthMonth={setBirthMonth}
                                        onChangeBirthYear={setBirthYear}
                                        onSubmit={handleRegisterSubmit}
                                        onSwitchToLogin={() => {
                                            setErrors({});
                                            setStep("login_identifier");
                                        }}
                                        errors={errors}
                                        loading={loading}
                                    />
                                )}

                                {step === "verify_otp" && (
                                    <OtpVerifyStep
                                        targetEmail={regEmail || identifier}
                                        otpCode={otpCode}
                                        onChangeOtpCode={(val) => {
                                            setOtpCode(val);
                                            clearFieldError("otpCode");
                                        }}
                                        countdown={countdown}
                                        onResendOtp={() => {
                                            setCountdown(180);
                                            toastNotifikasi.sukses("Kode OTP baru telah dikirim.");
                                        }}
                                        onSubmit={handleOtpSubmit}
                                        error={errors.otpCode}
                                        loading={loading}
                                    />
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
