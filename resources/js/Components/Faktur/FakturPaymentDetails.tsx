import {
    Check,
    Clock,
    Copy,
    CreditCard,
    RefreshCw,
    RotateCcw,
    XCircle,
} from "lucide-react";
import HitungMundurKedaluwarsa from "./HitungMundurKedaluwarsa";
import InstruksiQris from "./InstruksiQris";
import InstruksiVirtualAccount from "./InstruksiVirtualAccount";
import InstruksiMandiriBill from "./InstruksiMandiriBill";
import { cn } from "../../lib/utils";

interface PaymentDetail {
    metode_bayar?: string;
    nomor_va?: string;
    qr_code_url?: string;
    qr_string?: string;
    kode_biller?: string;
    bill_key?: string;
    instruksi_bayar?: string[];
    waktu_kedaluwarsa?: string;
    batas_waktu?: string;
    waktu_bayar?: string;
}

interface OrderData {
    nomor_pesanan: string;
    total: number;
    created_at?: string;
}

interface FakturPaymentDetailsProps {
    pembayaran: PaymentDetail;
    activeOrder: OrderData;
    isQris: boolean;
    isMandiriBill: boolean;
    isChecking: boolean;
    isRefreshingQris: boolean;
    copiedTotal: boolean;
    batasWaktuPembayaran?: string;
    onCopyTotal: () => void;
    onManualCheckStatus: () => void;
    onRefreshQris: () => void;
    onChangePayment: () => void;
    onCancelOrder: () => void;
    formatRupiah: (val: number) => string;
}

export default function FakturPaymentDetails({
    pembayaran,
    activeOrder,
    isQris,
    isMandiriBill,
    isChecking,
    isRefreshingQris,
    copiedTotal,
    batasWaktuPembayaran,
    onCopyTotal,
    onManualCheckStatus,
    onRefreshQris,
    onChangePayment,
    onCancelOrder,
    formatRupiah,
}: FakturPaymentDetailsProps) {
    return (
        <section className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50/70">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <CreditCard className="w-4 h-4 text-slate-500 stroke-2" />
                        <span>
                            {pembayaran.metode_bayar || "Saluran Pembayaran"}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight tabular-nums font-mono">
                            {formatRupiah(activeOrder.total || 0)}
                        </span>
                        <button
                            type="button"
                            onClick={onCopyTotal}
                            aria-label="Salin nominal total pembayaran"
                            className="text-xs text-slate-600 hover:text-slate-900 font-bold inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-200/70 transition-colors cursor-pointer"
                        >
                            {copiedTotal ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-3" />
                                    <span className="text-emerald-700">
                                        Tersalin
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5 text-slate-400 stroke-2" />
                                    <span>Salin</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <HitungMundurKedaluwarsa
                        batasWaktu={batasWaktuPembayaran}
                        createdAt={activeOrder.created_at}
                        onExpired={onManualCheckStatus}
                    />

                    <button
                        type="button"
                        onClick={onManualCheckStatus}
                        disabled={isChecking}
                        className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs cursor-pointer active:scale-95"
                    >
                        <RefreshCw
                            className={cn(
                                "w-3.5 h-3.5 stroke-2",
                                isChecking && "animate-spin",
                            )}
                        />
                        <span>
                            {isChecking ? "Memeriksa..." : "Cek Status"}
                        </span>
                    </button>
                </div>
            </div>

            {isQris && (
                <div className="px-5 sm:px-6 py-3 bg-amber-50/80 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-amber-950 font-medium">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0 stroke-2" />
                        <p>
                            Masa aktif kode QRIS adalah{" "}
                            <strong className="font-bold font-mono">
                                15 Menit
                            </strong>
                            . Perbarui barcode jika waktu habis tanpa membatalkan
                            order.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onRefreshQris}
                        disabled={isRefreshingQris}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-950 bg-amber-200/70 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                    >
                        <RotateCcw
                            className={cn(
                                "w-3.5 h-3.5 stroke-2",
                                isRefreshingQris && "animate-spin",
                            )}
                        />
                        <span>
                            {isRefreshingQris
                                ? "Memperbarui..."
                                : "Perbarui QRIS"}
                        </span>
                    </button>
                </div>
            )}

            <div className="p-5 sm:p-6 space-y-6">
                {isQris && (
                    <InstruksiQris
                        qrCodeUrl={pembayaran.qr_code_url}
                        qrString={pembayaran.qr_string}
                        nomorPesanan={activeOrder.nomor_pesanan}
                        instruksiBayar={pembayaran.instruksi_bayar}
                        isDevMode={Boolean(import.meta.env.DEV)}
                        onRefreshQris={onRefreshQris}
                    />
                )}

                {isMandiriBill && (
                    <InstruksiMandiriBill
                        kodeBiller={pembayaran.kode_biller}
                        billKey={pembayaran.bill_key || pembayaran.nomor_va}
                        instruksiBayar={pembayaran.instruksi_bayar}
                    />
                )}

                {!isQris && !isMandiriBill && (
                    <InstruksiVirtualAccount
                        metodeBayar={pembayaran.metode_bayar}
                        nomorVa={pembayaran.nomor_va}
                        instruksiBayar={pembayaran.instruksi_bayar}
                        nomorPesanan={activeOrder.nomor_pesanan}
                        isDevMode={Boolean(import.meta.env.DEV)}
                        onRefreshVa={onManualCheckStatus}
                    />
                )}

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onChangePayment}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-2xl transition-colors cursor-pointer shadow-2xs active:scale-95"
                    >
                        <CreditCard className="w-4 h-4 text-slate-500 stroke-2" />
                        <span>Ganti Metode Pembayaran</span>
                    </button>

                    <button
                        type="button"
                        onClick={onCancelOrder}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-4 py-2.5 rounded-2xl transition-colors cursor-pointer active:scale-95"
                    >
                        <XCircle className="w-4 h-4 stroke-2" />
                        <span>Batalkan Pesanan</span>
                    </button>
                </div>
            </div>
        </section>
    );
}
