import React, { useState } from 'react';
import { User, Mail, Lock } from 'lucide-react';
import Button from '../../Common/Button';
import { toast } from 'sonner';

interface RegisterFormProps {
    onSuccessRegister: (email: string) => void;
}

export default function RegisterForm({ onSuccessRegister }: RegisterFormProps) {
    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== passwordConfirmation) {
            toast.error('Konfirmasi kata sandi tidak cocok.');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ nama, email, password, password_confirmation: passwordConfirmation }),
            });
            const data = await res.json();
            if (data.sukses) {
                toast.success('Pendaftaran berhasil! Periksa email untuk kode OTP.');
                onSuccessRegister(email);
            } else {
                toast.error(data.pesan || 'Gagal mendaftar.');
            }
        } catch (err) {
            toast.error('Terjadi kesalahan pendaftaran.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 text-xs pt-2">
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

            <Button type="submit" loading={loading} className="w-full uppercase tracking-wider">
                Daftar & Minta Kode OTP
            </Button>
        </form>
    );
}
