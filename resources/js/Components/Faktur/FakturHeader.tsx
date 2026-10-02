import { Link } from "@inertiajs/react";
import {
    ArrowLeft,
    Check,
    Copy,
    Printer,
    Clock,
    AlertCircle,
    ShieldAlert,
    CheckCircle2,
    Truck,
    XCircle,
    type LucideIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface StatusConfig {
    label: string;
    icon: LucideIcon;
    variant: string;
    iconColor: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
    belum_bayar: {
        label: "Menunggu Pembayaran",
        icon: Clock,
        variant: "bg-amber-50 text-amber-900 border-amber-200/90 font-bold",
        iconColor: "text-amber-600",
    },
    menunggu_verifikasi_manual: {
        label: "Verifikasi Manual CS",
        icon: AlertCircle,
        variant: "bg-amber-100 text-amber-950 border-amber-300 font-bold",
        iconColor: "text-amber-700",
    },
    challenge: {
        label: "Tinjauan Keamanan",
        icon: ShieldAlert,
        variant: "bg-amber-100 text-amber-950 border-amber-300 font-bold",
        iconColor: "text-amber-700",
    },
    akan_dikirim: {
        label: "Diproses Penjual",
        icon: CheckCircle2,
        variant: "bg-emerald-50 text-emerald-900 border-emerald-200/90 font-bold",
        iconColor: "text-emerald-600",
    },
    dikirim: {
        label: "Dalam Pengiriman",
        icon: Truck,
        variant: "bg-indigo-50 text-indigo-900 border-indigo-200/90 font-bold",
        iconColor: "text-indigo-600",
    },
    selesai: {
        label: "Pesanan Selesai",
        icon: CheckCircle2,
        variant: "bg-emerald-50 text-emerald-900 border-emerald-200/90 font-bold",
        iconColor: "text-emerald-600",
    },
    dibatalkan: {
        label: "Pesanan Dibatalkan",
        icon: XCircle,
        variant: "bg-rose-50 text-rose-900 border-rose-200/90 font-bold",
        iconColor: "text-rose-600",
    },
    expired: {
        label: "Tagihan Kedaluwarsa",
        icon: XCircle,
        variant: "bg-slate-100 text-slate-700 border-slate-200 font-bold",
        iconColor: "text-slate-500",
    },
};

export function StatusBadge({ status }: { status: string }) {
    const key = status?.toLowerCase().trim();
    const current = STATUS_CONFIG[key] ?? {
        label: status || "Status Tidak Diketahui",
        icon: AlertCircle,
        variant: "bg-slate-100 text-slate-700 border-slate-200 font-bold",
        iconColor: "text-slate-500",
    };

    const Icon = current.icon;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border shadow-2xs select-none",
                current.variant,
            )}
        >
            <Icon
                className={cn("w-3.5 h-3.5 shrink-0 stroke-2", current.iconColor)}
                aria-hidden="true"
            />
            <span>{current.label}</span>
        </span>
    );
}

interface FakturHeaderProps {
    nomorPesanan: string;
    createdAt?: string;
    status: string;
    copiedInvoice: boolean;
    onCopyInvoice: () => void;
    onPrint: () => void;
    formatTanggalIndo: (dateStr?: string) => string;
}

export default function FakturHeader({
    nomorPesanan,
    createdAt,
    status,
    copiedInvoice,
    onCopyInvoice,
    onPrint,
    formatTanggalIndo,
}: FakturHeaderProps) {
    return (
        <header className="bg-white border-b border-slate-200/90 py-4 sm:py-5 shadow-2xs">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-3 sm:space-y-4">
                <div>
                    <Link
                        href="/katalog"
                        className="group inline-flex items-center gap-1.5 -ml-1 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 ease-out group-hover:-translate-x-0.5 stroke-2" />
                        <span>Kembali ke Belanja</span>
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <span className="font-bold text-slate-800">
                                Faktur Tagihan
                            </span>
                            <span className="text-slate-300" aria-hidden="true">
                                •
                            </span>
                            <time dateTime={createdAt}>
                                {formatTanggalIndo(createdAt)}
                            </time>
                        </div>

                        <div className="flex items-center gap-2 min-w-0">
                            <h1 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 font-mono break-all sm:break-normal">
                                <span className="text-primary select-none">
                                    #
                                </span>
                                <span>{nomorPesanan}</span>
                            </h1>

                            <button
                                type="button"
                                onClick={onCopyInvoice}
                                title={
                                    copiedInvoice
                                        ? "Tersalin!"
                                        : "Salin nomor pesanan"
                                }
                                aria-label="Salin nomor pesanan"
                                className={cn(
                                    "inline-flex items-center justify-center p-1.5 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shrink-0 cursor-pointer shadow-2xs",
                                    copiedInvoice
                                        ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300"
                                        : "text-slate-400 hover:text-slate-700 hover:bg-slate-100",
                                )}
                            >
                                {copiedInvoice ? (
                                    <Check className="w-4 h-4 text-emerald-600 stroke-3" />
                                ) : (
                                    <Copy className="w-4 h-4 stroke-2" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                        <StatusBadge status={status} />

                        <button
                            type="button"
                            onClick={onPrint}
                            className="group inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-2xl shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                        >
                            <Printer className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800 stroke-2" />
                            <span>Cetak Faktur</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
