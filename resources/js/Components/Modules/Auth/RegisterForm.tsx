import React, { useState } from 'react';
import { User, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../../Common/Button';
import { cn } from '../../../lib/utils';
import { registerSchema, type RegisterFormData } from '../../../Validation/authSchema';
import { toastNotifikasi } from '../../../Utils/toastNotifikasi';

interface RegisterFormProps {
    onSuccessRegister: (email: string) => void;
}

export default function RegisterForm({ onSuccessRegister }: RegisterFormProps) {
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            nama: '',
            email: '',
            password: '',
            password_confirmation: '',
        },
    });

    const onSubmit = async (formData: RegisterFormData) => {
        setLoading(true);
        setServerError(null);

        try {
            const res = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.sukses) {
                toastNotifikasi.sukses('Pendaftaran berhasil! Periksa email untuk kode OTP.');
                onSuccessRegister(formData.email);
            } else {
                setServerError(data.pesan || 'Gagal mendaftar.');
            }
        } catch {
            setServerError('Terjadi kesalahan koneksi ke server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-xs pt-2">
            {serverError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{serverError}</span>
                </div>
            )}

            <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap *</label>
                <div className="relative">
                    <input
                        type="text"
                        {...register('nama')}
                        placeholder="CRSL Bestie"
                        className={cn(
                            "w-full bg-slate-50 border rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none transition-all",
                            errors.nama
                                ? "border-red-500 bg-red-50/20"
                                : "border-slate-300 focus:border-[#E52027]"
                        )}
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                {errors.nama && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.nama.message}
                    </p>
                )}
            </div>

            <div>
                <label className="font-bold text-slate-700 block mb-1">Email *</label>
                <div className="relative">
                    <input
                        type="email"
                        {...register('email')}
                        placeholder="bestie@crslstore.com"
                        className={cn(
                            "w-full bg-slate-50 border rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none transition-all",
                            errors.email
                                ? "border-red-500 bg-red-50/20"
                                : "border-slate-300 focus:border-[#E52027]"
                        )}
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                {errors.email && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.email.message}
                    </p>
                )}
            </div>

            <div>
                <label className="font-bold text-slate-700 block mb-1">Kata Sandi (Min 8 Karakter) *</label>
                <div className="relative">
                    <input
                        type="password"
                        {...register('password')}
                        placeholder="••••••••"
                        className={cn(
                            "w-full bg-slate-50 border rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none transition-all",
                            errors.password
                                ? "border-red-500 bg-red-50/20"
                                : "border-slate-300 focus:border-[#E52027]"
                        )}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                {errors.password && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.password.message}
                    </p>
                )}
            </div>

            <div>
                <label className="font-bold text-slate-700 block mb-1">Konfirmasi Kata Sandi *</label>
                <div className="relative">
                    <input
                        type="password"
                        {...register('password_confirmation')}
                        placeholder="••••••••"
                        className={cn(
                            "w-full bg-slate-50 border rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none transition-all",
                            errors.password_confirmation
                                ? "border-red-500 bg-red-50/20"
                                : "border-slate-300 focus:border-[#E52027]"
                        )}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                {errors.password_confirmation && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.password_confirmation.message}
                    </p>
                )}
            </div>

            <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full py-3 mt-2 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
                Daftar & Minta Kode OTP
            </Button>
        </form>
    );
}
