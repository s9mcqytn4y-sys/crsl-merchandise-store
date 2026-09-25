import React, { useState } from 'react';
import { Ticket, Copy, Check, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface VoucherItem {
    id: number | string;
    judul: string;
    kode: string;
    deskripsi?: string;
    sisa_waktu?: string;
}

interface KartuVoucherProps {
    vouchers?: VoucherItem[];
}

export default function KartuVoucher({ vouchers = [] }: KartuVoucherProps) {
    const [copiedKode, setCopiedKode] = useState<string | null>(null);

    const voucherUtama = vouchers[0] || {
        id: 1,
        judul: 'PAYDAY MEMBERSHIP',
        kode: 'CRSLYAY25',
        deskripsi: 'Diskon 25% Spesial Anggota',
        sisa_waktu: '04:25:00',
    };

    const handleCopy = async (kode: string) => {
        try {
            await navigator.clipboard.writeText(kode);
            setCopiedKode(kode);
            toast.success(`Kode voucher ${kode} berhasil disalin!`);
            setTimeout(() => setCopiedKode(null), 2000);
        } catch {
            toast.error('Gagal menyalin kode voucher');
        }
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Voucher Saya
                </span>
                {voucherUtama.sisa_waktu && (
                    <span className="text-[11px] font-semibold text-slate-400 inline-flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Sisa {voucherUtama.sisa_waktu}
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                        <Ticket className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                            {voucherUtama.judul}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {voucherUtama.deskripsi || `Gunakan kode ${voucherUtama.kode}`}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => handleCopy(voucherUtama.kode)}
                    className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#E52027] hover:text-white text-slate-700 transition-colors shrink-0"
                    title="Salin Kode Voucher"
                >
                    {copiedKode === voucherUtama.kode ? (
                        <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Tersalin</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="font-mono">{voucherUtama.kode}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
