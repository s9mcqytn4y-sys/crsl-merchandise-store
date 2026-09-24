import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import Button from '../../Common/Button';
import { toast } from 'sonner';

interface LoginFormProps {
    onSuccessLogin?: () => void;
    onCloseModal: () => void;
}

export default function LoginForm({ onSuccessLogin, onCloseModal }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (data.sukses) {
                toast.success(data.pesan || 'Login berhasil!');
                if (onSuccessLogin) onSuccessLogin();
                onCloseModal();
                window.location.reload();
            } else {
                toast.error(data.pesan || 'Email atau password tidak sesuai.');
            }
        } catch (err) {
            toast.error('Gagal terhubung ke server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs pt-2">
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

            <Button type="submit" loading={loading} className="w-full uppercase tracking-wider">
                Masuk Sekarang
            </Button>
        </form>
    );
}
