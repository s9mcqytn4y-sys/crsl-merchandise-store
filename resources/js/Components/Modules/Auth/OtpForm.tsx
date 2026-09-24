import React, { useState } from 'react';
import { KeyRound, CheckCircle } from 'lucide-react';
import Button from '../../Common/Button';
import { toast } from 'sonner';

interface OtpFormProps {
    email: string;
    onSuccessVerify?: () => void;
    onCloseModal: () => void;
}

export default function OtpForm({ email, onSuccessVerify, onCloseModal }: OtpFormProps) {
    const [otpCode, setOtpCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/otp/verifikasi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ email, kode_otp: otpCode }),
            });
            const data = await res.json();
            if (data.sukses) {
                toast.success('🎉 Akun berhasil diverifikasi & diaktifkan!');
                if (onSuccessVerify) onSuccessVerify();
                onCloseModal();
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
        <form onSubmit={handleSubmit} className="space-y-4 text-xs pt-2 text-center">
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

            <Button
                type="submit"
                variant="emerald"
                loading={loading}
                className="w-full uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
                <CheckCircle className="w-4 h-4" />
                Verifikasi & Aktifkan Akun
            </Button>
        </form>
    );
}
