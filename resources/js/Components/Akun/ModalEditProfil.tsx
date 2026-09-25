import React, { useState } from 'react';
import { X, User, Mail, ShieldAlert, Check } from 'lucide-react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface ModalEditProfilProps {
    isOpen: boolean;
    onClose: () => void;
    user?: {
        name?: string;
        email?: string;
    } | null;
}

export default function ModalEditProfil({
    isOpen,
    onClose,
    user,
}: ModalEditProfilProps) {
    const [nama, setNama] = useState(user?.name || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isKonfirmasiHapus, setIsKonfirmasiHapus] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nama.trim()) {
            toast.error('Nama tidak boleh kosong');
            return;
        }

        setIsSubmitting(true);
        router.post('/profil/perbarui', { name: nama.trim() }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profil berhasil diperbarui!');
                setIsSubmitting(false);
                onClose();
            },
            onError: () => {
                toast.error('Gagal memperbarui profil.');
                setIsSubmitting(false);
            },
        });
    };

    const handleHapusAkun = () => {
        if (!confirm('Apakah Anda yakin ingin menghapus akun? Semua data pesanan dan loyalitas akan dihapus permanen.')) {
            return;
        }

        router.post('/profil/hapus-akun', {}, {
            onSuccess: () => {
                toast.success('Akun Anda telah berhasil dihapus.');
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <User className="w-4 h-4 text-[#E52027]" />
                        Pengaturan Profil
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="font-bold text-slate-700 block mb-1.5">
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#E52027] focus:ring-1 focus:ring-[#E52027] text-slate-800 font-medium"
                            placeholder="Nama Lengkap Anda"
                            required
                        />
                    </div>

                    <div>
                        <label className="font-bold text-slate-700 block mb-1.5">
                            Alamat Email
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed font-medium"
                            />
                            <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                            Email terhubung dengan sistem autentikasi dan tidak dapat diubah sembarangan.
                        </span>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-xl bg-[#E52027] hover:bg-[#CC1C22] text-white font-bold transition-all shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                            <Check className="w-4 h-4" />
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>

                {/* Zona Bahaya */}
                <div className="pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={handleHapusAkun}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1.5"
                    >
                        <ShieldAlert className="w-4 h-4" />
                        Hapus Akun Permanen
                    </button>
                </div>
            </div>
        </div>
    );
}
