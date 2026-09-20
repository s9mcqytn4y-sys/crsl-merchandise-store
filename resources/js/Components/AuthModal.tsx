import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, Lock, Mail, User, KeyRound, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccessAuth?: () => void;
    initialTab?: 'login' | 'register';
}

export default function AuthModal({
    isOpen,
    onClose,
    onSuccessAuth,
    initialTab = 'login'
}: AuthModalProps) {
    const [tab, setTab] = useState<'login' | 'register' | 'otp'>(initialTab);
    const [loading, setLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [nama, setNama] = useState('');
    const [otpCode, setOtpCode] = useState('');

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.sukses) {
                toast.success(data.pesan || 'Login berhasil!');
                if (onSuccessAuth) onSuccessAuth();
                onClose();
                window.location.reload();
            } else {
                toast.error(data.pesan || 'Gagal login.');
            }
        } catch (err) {
            toast.error('Terjadi kesalahan koneksi.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== passwordConfirmation) {
            toast.error('Konfirmasi kata sandi tidak cocok.');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ nama, email, password, password_confirmation: passwordConfirmation })
            });
            const data = await res.json();
            if (data.sukses) {
                toast.success('Pendaftaran berhasil! Silakan periksa email untuk kode OTP.');
                setTab('otp');
            } else {
                toast.error(data.pesan || 'Gagal mendaftar.');
            }
        } catch (err) {
            toast.error('Terjadi kesalahan pendaftaran.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/otp/verifikasi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email, kode_otp: otpCode })
            });
            const data = await res.json();
            if (data.sukses) {
                toast.success('🎉 Akun berhasil diverifikasi & diaktifkan!');
                if (onSuccessAuth) onSuccessAuth();
                onClose();
                window.location.reload();
            } else {
                toast.error(data.pesan || 'Kode OTP 6 digit tidak valid. Gunakan 123456.');
            }
        } catch (err) {
            toast.error('Gagal memverifikasi OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-2xl transition-all border border-slate-100">
                                {/* Header */}
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-[#E52027] text-white flex items-center justify-center font-black text-sm">
                                            CRSL
                                        </div>
                                        <Dialog.Title as="h3" className="text-base font-extrabold text-slate-900">
                                            {tab === 'login' && 'Masuk Akun Bestie'}
                                            {tab === 'register' && 'Daftar Akun Sahabat CRSL'}
                                            {tab === 'otp' && 'Verifikasi OTP 6 Digit'}
                                        </Dialog.Title>
                                    </div>
                                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-full">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Tab Selector (Login / Register) */}
                                {tab !== 'otp' && (
                                    <div className="flex border-b border-slate-100 my-4 text-xs font-bold text-slate-500">
                                        <button
                                            type="button"
                                            onClick={() => setTab('login')}
                                            className={`flex-1 py-2 text-center border-b-2 transition-all ${
                                                tab === 'login' ? 'border-[#E52027] text-[#E52027] font-black' : 'border-transparent'
                                            }`}
                                        >
                                            Masuk (Login)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTab('register')}
                                            className={`flex-1 py-2 text-center border-b-2 transition-all ${
                                                tab === 'register' ? 'border-[#E52027] text-[#E52027] font-black' : 'border-transparent'
                                            }`}
                                        >
                                            Daftar Baru
                                        </button>
                                    </div>
                                )}

                                {/* LOGIN FORM */}
                                {tab === 'login' && (
                                    <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs pt-2">
                                        <div>
                                            <label className="font-bold text-slate-700 block mb-1">Email *</label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="bestie@crslstore.com"
                                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-[#E52027]"
                                                    required
                                                />
                                                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="font-bold text-slate-700 block mb-1">Kata Sandi *</label>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-[#E52027]"
                                                    required
                                                />
                                                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3 bg-[#E52027] hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition-all uppercase tracking-wider"
                                        >
                                            {loading ? 'Memproses...' : 'Masuk Sekarang'}
                                        </button>
                                    </form>
                                )}

                                {/* REGISTER FORM */}
                                {tab === 'register' && (
                                    <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs pt-2">
                                        <div>
                                            <label className="font-bold text-slate-700 block mb-1">Nama Lengkap *</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={nama}
                                                    onChange={(e) => setNama(e.target.value)}
                                                    placeholder="CRSL Bestie"
                                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-[#E52027]"
                                                    required
                                                />
                                                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="font-bold text-slate-700 block mb-1">Email *</label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="bestie@crslstore.com"
                                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-[#E52027]"
                                                    required
                                                />
                                                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="font-bold text-slate-700 block mb-1">Kata Sandi (Min 8 Karakter) *</label>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-[#E52027]"
                                                    required
                                                />
                                                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="font-bold text-slate-700 block mb-1">Konfirmasi Kata Sandi *</label>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    value={passwordConfirmation}
                                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-[#E52027]"
                                                    required
                                                />
                                                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3 bg-[#E52027] hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition-all uppercase tracking-wider"
                                        >
                                            {loading ? 'Mengirim OTP...' : 'Daftar & Minta Kode OTP'}
                                        </button>
                                    </form>
                                )}

                                {/* OTP VERIFICATION FORM */}
                                {tab === 'otp' && (
                                    <form onSubmit={handleOtpSubmit} className="space-y-4 text-xs pt-2 text-center">
                                        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200">
                                            <p className="font-semibold text-[11px]">
                                                Kode OTP 6 digit dikirim ke <strong className="font-bold">{email}</strong>. (Gunakan <code className="font-bold bg-white px-1 py-0.5 rounded">123456</code> untuk pengujian).
                                            </p>
                                        </div>

                                        <div>
                                            <label className="font-bold text-slate-700 block mb-2">Masukkan Kode OTP 6 Digit *</label>
                                            <div className="relative max-w-xs mx-auto">
                                                <input
                                                    type="text"
                                                    maxLength={6}
                                                    value={otpCode}
                                                    onChange={(e) => setOtpCode(e.target.value)}
                                                    placeholder="123456"
                                                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl text-center font-mono text-2xl font-black tracking-widest py-3 focus:outline-none focus:border-[#E52027]"
                                                    required
                                                    autoFocus
                                                />
                                                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3 top-4" />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            {loading ? 'Memverifikasi...' : 'Verifikasi & Aktifkan Akun'}
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
