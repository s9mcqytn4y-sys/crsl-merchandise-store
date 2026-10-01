import { ShieldCheck, RefreshCw, Truck, CreditCard } from "lucide-react";
import { cn } from "../../lib/utils";

interface ProductTrustSectionProps {
    className?: string;
}

export default function ProductTrustSection({ className }: ProductTrustSectionProps) {
    const trustItems = [
        {
            icon: ShieldCheck,
            title: "100% Original CRSL",
            desc: "Merchandise resmi berlisensi langsung dari studio CRSL.",
        },
        {
            icon: RefreshCw,
            title: "Garansi Tukar 7 Hari",
            desc: "Ukuran tidak pas? Tukar mudah dalam 7 hari setelah barang tiba.",
        },
        {
            icon: Truck,
            title: "Kirim Seluruh Nusantara",
            desc: "Pilihan kurir terlengkap dengan lacak resi langsung realtime.",
        },
        {
            icon: CreditCard,
            title: "Pembayaran Terverifikasi",
            desc: "Dukungan QRIS instan & Bank VA dengan enkripsi aman.",
        },
    ];

    return (
        <section
            aria-label="Jaminan & Keamanan Belanja"
            className={cn(
                "grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs",
                className
            )}
        >
            {trustItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                    <div key={idx} className="flex items-start gap-2.5">
                        <div className="p-2 rounded-xl bg-primary-subtle text-primary shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-800 leading-tight">
                                {item.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                {item.desc}
                            </p>
                        </div>
                    </div>
                );
            })}
        </section>
    );
}
