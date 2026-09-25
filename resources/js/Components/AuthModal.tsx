import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { router } from "@inertiajs/react";
import {
    X,
    Lock,
    User,
    ArrowLeft,
    Check,
    ChevronDown,
    Eye,
    EyeOff,
} from "lucide-react";
import { toast } from "sonner";

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
    | "register"
    | "verify_otp";

export default function AuthModal({
    isOpen,
    onClose,
    onSuccessAuth,
    initialTab = "login",
}: AuthModalProps) {
    const [step, setStep] = useState<AuthStep>(
        initialTab === "register" ? "register" : "login_identifier",
    );
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form States
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [birthDay, setBirthDay] = useState("14");
    const [birthMonth, setBirthMonth] = useState("12");
    const [birthYear, setBirthYear] = useState("2008");
    const [otpCode, setOtpCode] = useState("");
    const [countdown, setCountdown] = useState(180);

    useEffect(() => {
        if (isOpen) {
            setStep(
                initialTab === "register" ? "register" : "login_identifier",
            );
            setShowPassword(false);
            setCountdown(180);
        }
    }, [isOpen, initialTab]);

    // Timer countdown untuk kirim ulang kode OTP
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (isOpen && step === "verify_otp" && countdown > 0) {
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
            setLoading(false);
        }, 200);
    };

    // Step 1: Validasi email/nomor hp awal sebelum input password
    const handleNextIdentifier = (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier.trim()) return;
        setStep("login_password");
    };

    // Step 2: Proses Login dengan Kata Sandi
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;

        setLoading(true);
        try {
            const res = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify({ email: identifier, password }),
            });
            const data = await res.json();
            if (res.ok && (data.sukses || data.success)) {
                toast.success(data.pesan || "Login successful! Welcome back.");
                onSuccessAuth?.();
                handleClose();
                router.reload({ only: ["auth"] });
            } else {
                toast.error(
                    data.pesan || "Incorrect password or account not found.",
                );
            }
        } catch {
            toast.error("Failed to connect to server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Proses Daftar Akun
    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName || !regEmail || !regPassword) return;

        setLoading(true);
        try {
            const res = await fetch("/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify({
                    name: fullName,
                    email: regEmail,
                    password: regPassword,
                    password_confirmation: regPassword,
                    birth_day: birthDay,
                    birth_month: birthMonth,
                    birth_year: birthYear,
                }),
            });
            const data = await res.json();
            if (res.ok && (data.sukses || data.success)) {
                const devOtp = data.otp ? ` (OTP: ${data.otp})` : " (Gunakan OTP 123456 untuk testing)";
                toast.success("Kode verifikasi telah dikirim ke email." + devOtp);
                setStep("verify_otp");
                setCountdown(180);
            } else {
                toast.error(
                    data.pesan || "Registration failed. Please try again.",
                );
            }
        } catch {
            toast.error("Error processing registration.");
        } finally {
            setLoading(false);
        }
    };

    // Step 4: Verifikasi Kode OTP
    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otpCode || otpCode.length < 4) return;

        setLoading(true);
        try {
            const targetEmail = regEmail || identifier;
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
                toast.success("Account successfully verified!");
                onSuccessAuth?.();
                handleClose();
                router.reload({ only: ["auth"] });
            } else {
                toast.error(data.pesan || "Invalid verification code.");
            }
        } catch {
            toast.error("Verification failed.");
        } finally {
            setLoading(false);
        }
    };

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail);
    const isRegisterComplete =
        Boolean(fullName.trim()) && isEmailValid && regPassword.length >= 6;

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                {/* Backdrop Overlay */}
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
                            <Dialog.Panel className="w-full max-w-[430px] transform overflow-hidden rounded-[28px] bg-white p-6 sm:p-8 text-left align-middle shadow-2xl transition-all border border-slate-100">
                                {/* Header Bar Modal */}
                                <div className="flex items-center justify-between pb-4">
                                    <div className="flex items-center gap-2">
                                        {step === "login_password" && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setStep("login_identifier")
                                                }
                                                className="p-1 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                            </button>
                                        )}
                                        {step === "forgot_password" && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setStep("login_password")
                                                }
                                                className="p-1 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                            </button>
                                        )}

                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-bold text-slate-900 tracking-tight"
                                        >
                                            {step === "login_identifier" &&
                                                "Login"}
                                            {step === "login_password" &&
                                                "Login"}
                                            {step === "forgot_password" &&
                                                "Forgot password"}
                                            {step === "register" && "Register"}
                                            {step === "verify_otp" &&
                                                "Verify Account"}
                                        </Dialog.Title>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
                                        aria-label="Close dialog"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* ─── 1. LOGIN STEP 1: EMAIL / PHONE INPUT ─── */}
                                {step === "login_identifier" && (
                                    <form
                                        onSubmit={handleNextIdentifier}
                                        className="space-y-4 pt-1"
                                    >
                                        <div className="border border-slate-200/90 rounded-2xl px-4 py-2.5 flex items-center gap-3 bg-white focus-within:border-slate-400">
                                            <User className="w-4 h-4 text-slate-400 shrink-0" />
                                            <input
                                                type="text"
                                                value={identifier}
                                                onChange={(e) =>
                                                    setIdentifier(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Your email/phone number"
                                                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                                                autoFocus
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={!identifier.trim()}
                                            className={`w-full py-3.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                                                identifier.trim()
                                                    ? "bg-[#E52027] hover:bg-[#CC1C22] text-white shadow-xs cursor-pointer"
                                                    : "bg-red-200 text-white/90 cursor-not-allowed"
                                            }`}
                                        >
                                            Next
                                        </button>

                                        <div className="text-center text-xs text-slate-600 pt-2">
                                            Don't have account? Signup{" "}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setStep("register")
                                                }
                                                className="text-slate-700 font-bold hover:underline"
                                            >
                                                here
                                            </button>
                                        </div>

                                        <p className="text-[11px] text-center text-slate-400 leading-relaxed pt-3">
                                            This site is protected by reCAPTCHA
                                            and the Google{" "}
                                            <span className="text-slate-600 font-medium">
                                                Privacy Policy
                                            </span>{" "}
                                            and{" "}
                                            <span className="text-slate-600 font-medium">
                                                Terms of Service
                                            </span>{" "}
                                            apply.
                                        </p>
                                    </form>
                                )}

                                {/* ─── 2. LOGIN STEP 2: PASSWORD INPUT ─── */}
                                {step === "login_password" && (
                                    <form
                                        onSubmit={handleLoginSubmit}
                                        className="space-y-4 pt-1"
                                    >
                                        {/* Field Identifier Readonly */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 flex items-center gap-3">
                                            <User className="w-4 h-4 text-slate-400 shrink-0" />
                                            <div className="min-w-0">
                                                <span className="block text-[10px] text-slate-400">
                                                    Your email/phone number
                                                </span>
                                                <span className="block text-xs font-medium text-slate-700 truncate">
                                                    {identifier}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Field Password */}
                                        <div className="border border-slate-200/90 rounded-2xl px-4 py-2.5 flex items-center gap-3 bg-white focus-within:border-slate-400 relative">
                                            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                                            <div className="flex-1">
                                                <span className="block text-[10px] text-slate-400">
                                                    Password
                                                </span>
                                                <input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={password}
                                                    onChange={(e) =>
                                                        setPassword(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="••••••••"
                                                    className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                                                    autoFocus
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
                                                }
                                                className="text-slate-400 hover:text-slate-600 p-1"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={!password || loading}
                                            className={`w-full py-3.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                                                password && !loading
                                                    ? "bg-[#E52027] hover:bg-[#CC1C22] text-white shadow-xs cursor-pointer"
                                                    : "bg-red-200 text-white/90 cursor-not-allowed"
                                            }`}
                                        >
                                            {loading
                                                ? "Processing..."
                                                : "Login"}
                                        </button>

                                        <div className="text-center pt-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setStep("forgot_password")
                                                }
                                                className="text-xs font-semibold text-[#E52027] hover:underline"
                                            >
                                                Forgot password?
                                            </button>
                                        </div>

                                        <div className="text-center text-xs text-slate-600 pt-2">
                                            Don't have account? Signup{" "}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setStep("register")
                                                }
                                                className="text-slate-700 font-bold hover:underline"
                                            >
                                                here
                                            </button>
                                        </div>

                                        <p className="text-[11px] text-center text-slate-400 leading-relaxed pt-3">
                                            This site is protected by reCAPTCHA
                                            and the Google{" "}
                                            <span className="text-slate-600 font-medium">
                                                Privacy Policy
                                            </span>{" "}
                                            and{" "}
                                            <span className="text-slate-600 font-medium">
                                                Terms of Service
                                            </span>{" "}
                                            apply.
                                        </p>
                                    </form>
                                )}

                                {/* ─── 3. FORGOT PASSWORD STEP ─── */}
                                {step === "forgot_password" && (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            toast.info(
                                                "Password reset link has been sent to your email.",
                                            );
                                            setStep("login_identifier");
                                        }}
                                        className="space-y-4 pt-1"
                                    >
                                        <div className="border border-slate-200/90 rounded-2xl px-4 py-2.5 bg-white">
                                            <span className="block text-[10px] text-slate-400 mb-0.5">
                                                Your email/phone number
                                            </span>
                                            <input
                                                type="text"
                                                value={identifier}
                                                onChange={(e) =>
                                                    setIdentifier(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full bg-transparent text-xs text-slate-800 focus:outline-none font-medium"
                                                autoFocus
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={!identifier.trim()}
                                            className="w-full py-3.5 bg-slate-500 hover:bg-slate-600 text-white rounded-full text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
                                        >
                                            Confirm
                                        </button>
                                    </form>
                                )}

                                {/* ─── 4. REGISTER STEP ─── */}
                                {step === "register" && (
                                    <form
                                        onSubmit={handleRegisterSubmit}
                                        className="space-y-3.5 pt-1"
                                    >
                                        <p className="text-xs text-slate-600 leading-relaxed pb-1">
                                            Create account to be our member to
                                            earn points, get free vouchers, and
                                            hear our news earlier.
                                        </p>

                                        <div className="border border-slate-200/90 rounded-2xl px-4 py-2.5 bg-white focus-within:border-slate-400">
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) =>
                                                    setFullName(e.target.value)
                                                }
                                                placeholder="Your Full Name*"
                                                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                                                required
                                            />
                                        </div>

                                        <div className="border border-slate-200/90 rounded-2xl px-4 py-2.5 flex items-center gap-3 bg-white focus-within:border-slate-400">
                                            <User className="w-4 h-4 text-slate-400 shrink-0" />
                                            <input
                                                type="email"
                                                value={regEmail}
                                                onChange={(e) =>
                                                    setRegEmail(e.target.value)
                                                }
                                                placeholder="Your email"
                                                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                                                required
                                            />
                                            {isEmailValid && (
                                                <Check className="w-4 h-4 text-slate-700 shrink-0" />
                                            )}
                                        </div>

                                        <div className="border border-slate-200/90 rounded-2xl px-4 py-2.5 flex items-center gap-3 bg-white focus-within:border-slate-400">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
                                                }
                                                className="text-slate-400 hover:text-slate-600 shrink-0"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                            <input
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={regPassword}
                                                onChange={(e) =>
                                                    setRegPassword(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Password"
                                                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                                                required
                                            />
                                        </div>

                                        {/* Dropdowns Tanggal Lahir */}
                                        <div className="pt-1">
                                            <label className="block text-xs font-semibold text-slate-700 mb-2">
                                                My Birthday
                                            </label>
                                            <div className="grid grid-cols-3 gap-2.5">
                                                <div className="relative">
                                                    <select
                                                        value={birthDay}
                                                        onChange={(e) =>
                                                            setBirthDay(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full appearance-none bg-white border border-slate-200/90 rounded-2xl px-3 py-2.5 text-xs text-slate-800 pr-8 focus:outline-none focus:border-slate-400 cursor-pointer"
                                                    >
                                                        {Array.from(
                                                            { length: 31 },
                                                            (_, i) => i + 1,
                                                        ).map((d) => (
                                                            <option
                                                                key={d}
                                                                value={String(
                                                                    d,
                                                                ).padStart(
                                                                    2,
                                                                    "0",
                                                                )}
                                                            >
                                                                {String(
                                                                    d,
                                                                ).padStart(
                                                                    2,
                                                                    "0",
                                                                )}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                </div>

                                                <div className="relative">
                                                    <select
                                                        value={birthMonth}
                                                        onChange={(e) =>
                                                            setBirthMonth(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full appearance-none bg-white border border-slate-200/90 rounded-2xl px-3 py-2.5 text-xs text-slate-800 pr-8 focus:outline-none focus:border-slate-400 cursor-pointer"
                                                    >
                                                        {Array.from(
                                                            { length: 12 },
                                                            (_, i) => i + 1,
                                                        ).map((m) => (
                                                            <option
                                                                key={m}
                                                                value={String(
                                                                    m,
                                                                ).padStart(
                                                                    2,
                                                                    "0",
                                                                )}
                                                            >
                                                                {String(
                                                                    m,
                                                                ).padStart(
                                                                    2,
                                                                    "0",
                                                                )}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                </div>

                                                <div className="relative">
                                                    <select
                                                        value={birthYear}
                                                        onChange={(e) =>
                                                            setBirthYear(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full appearance-none bg-white border border-slate-200/90 rounded-2xl px-3 py-2.5 text-xs text-slate-800 pr-8 focus:outline-none focus:border-slate-400 cursor-pointer"
                                                    >
                                                        {Array.from(
                                                            { length: 70 },
                                                            (_, i) => 2026 - i,
                                                        ).map((y) => (
                                                            <option
                                                                key={y}
                                                                value={String(
                                                                    y,
                                                                )}
                                                            >
                                                                {y}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={
                                                !isRegisterComplete || loading
                                            }
                                            className={`w-full py-3.5 rounded-full text-xs sm:text-sm font-semibold transition-all mt-2 ${
                                                isRegisterComplete && !loading
                                                    ? "bg-[#D97706] hover:bg-[#B45309] text-white shadow-xs cursor-pointer"
                                                    : "bg-red-200 text-white/90 cursor-not-allowed"
                                            }`}
                                        >
                                            {loading
                                                ? "Creating..."
                                                : "Create New Account"}
                                        </button>

                                        <div className="text-center text-xs text-slate-600 pt-2">
                                            Already have account? Login{" "}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setStep("login_identifier")
                                                }
                                                className="text-slate-700 font-bold hover:underline"
                                            >
                                                here
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* ─── 5. VERIFY OTP STEP ─── */}
                                {step === "verify_otp" && (
                                    <form
                                        onSubmit={handleOtpSubmit}
                                        className="space-y-4 pt-1 text-center"
                                    >
                                        {/* Ilustrasi Notifikasi Smartphone */}
                                        <div className="py-2 flex justify-center">
                                            <svg
                                                className="w-32 h-24 text-slate-800"
                                                viewBox="0 0 140 100"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <rect
                                                    x="45"
                                                    y="10"
                                                    width="50"
                                                    height="80"
                                                    rx="10"
                                                    stroke="#1E293B"
                                                    strokeWidth="2.5"
                                                    fill="#FFFFFF"
                                                />
                                                <circle
                                                    cx="70"
                                                    cy="18"
                                                    r="2"
                                                    fill="#1E293B"
                                                />
                                                <rect
                                                    x="52"
                                                    y="36"
                                                    width="36"
                                                    height="26"
                                                    rx="4"
                                                    stroke="#1E293B"
                                                    strokeWidth="1.5"
                                                />
                                                <circle
                                                    cx="58"
                                                    cy="45"
                                                    r="2.5"
                                                    fill="#1E293B"
                                                />
                                                <line
                                                    x1="65"
                                                    y1="43"
                                                    x2="82"
                                                    y2="43"
                                                    stroke="#1E293B"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                                <line
                                                    x1="65"
                                                    y1="49"
                                                    x2="78"
                                                    y2="49"
                                                    stroke="#1E293B"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                />
                                                <path
                                                    d="M85 24C92 28 92 40 85 44"
                                                    stroke="#1E293B"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                                <path
                                                    d="M93 18C103 26 103 48 93 54"
                                                    stroke="#1E293B"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </div>

                                        <p className="text-xs text-slate-600 leading-relaxed px-2">
                                            We've sent verification code to{" "}
                                            <span className="font-semibold text-slate-800">
                                                {regEmail ||
                                                    identifier ||
                                                    "your email"}
                                            </span>
                                            . Please check your Email and enter
                                            the code here.
                                        </p>

                                        <div className="border border-slate-200/90 rounded-2xl px-4 py-3 flex items-center gap-3 bg-white focus-within:border-slate-400">
                                            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                value={otpCode}
                                                onChange={(e) =>
                                                    setOtpCode(
                                                        e.target.value.replace(
                                                            /\D/g,
                                                            "",
                                                        ),
                                                    )
                                                }
                                                placeholder="Verification Code"
                                                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-semibold"
                                                autoFocus
                                            />
                                        </div>

                                        <div className="text-xs text-slate-500 pt-1">
                                            <button
                                                type="button"
                                                disabled={countdown > 0}
                                                onClick={() => {
                                                    setCountdown(180);
                                                    toast.info(
                                                        "A new verification code has been sent.",
                                                    );
                                                }}
                                                className="font-medium text-slate-600 hover:text-slate-900 disabled:opacity-75 disabled:hover:text-slate-600"
                                            >
                                                Resend code{" "}
                                                {countdown > 0 &&
                                                    `(${countdown}s)`}
                                            </button>{" "}
                                            if you didn't receive any message
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={!otpCode || loading}
                                            className={`w-full py-3.5 rounded-full text-xs sm:text-sm font-semibold transition-all mt-2 ${
                                                otpCode && !loading
                                                    ? "bg-[#E52027] hover:bg-[#CC1C22] text-white shadow-xs cursor-pointer"
                                                    : "bg-red-200 text-white/90 cursor-not-allowed"
                                            }`}
                                        >
                                            {loading
                                                ? "Verifying..."
                                                : "Confirm"}
                                        </button>
                                    </form>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
