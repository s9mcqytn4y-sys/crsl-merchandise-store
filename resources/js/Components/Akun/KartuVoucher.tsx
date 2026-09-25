import React from 'react';
import { Ticket } from 'lucide-react';

interface VoucherItem {
    id: number | string;
    title?: string;
    judul?: string;
    code?: string;
    kode?: string;
    discount?: string;
    deskripsi?: string;
    timeLeft?: string;
    sisa_waktu?: string;
}

interface KartuVoucherProps {
    vouchers?: VoucherItem[];
}

export default function KartuVoucher({ vouchers = [] }: KartuVoucherProps) {
    const v = vouchers[0] || {
        title: 'PAYDAY MEMBERSHIP',
        code: 'CRSLYAY25',
        discount: '25%',
        timeLeft: '03:12:04 left',
    };

    const title = v.title || v.judul || 'PAYDAY MEMBERSHIP';
    const code = v.code || v.kode || 'CRSLYAY25';
    const discount = v.discount || '25%';
    const timeLeft = v.timeLeft || v.sisa_waktu || '03:12:04 left';

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-800">
                    My Vouchers
                </span>
            </div>

            <div className="border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                        <Ticket className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight">
                            {title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Discount {discount} | <span className="font-mono">{code}</span>
                        </p>
                    </div>
                </div>

                <div className="text-[11px] text-slate-400 font-medium whitespace-nowrap tabular-nums">
                    {timeLeft}
                </div>
            </div>
        </div>
    );
}
