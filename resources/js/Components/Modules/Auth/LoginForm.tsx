import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import Button from '../../Common/Button';
import { cn } from '../../../lib/utils';
import { loginSchema, type LoginFormData } from '../../../Validation/authSchema';
import { toastNotifikasi } from '../../../Utils/toastNotifikasi';

interface LoginFormProps {
    onSuccessLogin?: () => void;
    onCloseModal: () => void;
}

export default function LoginForm({ onSuccessLogin, onCloseModal }: LoginFormProps) {
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (formData: LoginFormData) => {
        setLoading(true);
        setServerError(null);

        try {
            const res = await fetch('/login', {
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
                toastNotifikasi.sukses(data.pesan || 'Login berhasil!');
                if (onSuccessLogin) onSuccessLogin();
                onCloseModal();
                router.reload();
            } else {
                setServerError(data.pesan || 'Email atau password tidak sesuai.');
            }
        } catch {
            setServerError('Terjadi kesalahan koneksi ke server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs pt-2">
            {serverError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{serverError}</span>
                </div>
            )}

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
                <label className="font-bold text-slate-700 block mb-1">Kata Sandi *</label>
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

            <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full py-3 mt-2 rounded-xl text-xs font-bold"
            >
                Masuk Sekarang
            </Button>
        </form>
    );
}
