import { useState, useMemo } from "react";
import {
    Truck,
    MapPin,
    ShieldCheck,
    UserCheck,
    Copy,
    Check,
    Edit3,
    Phone,
    Mail,
    FileText,
    Package,
    Coins,
    TicketPercent,
    AlertCircle,
    ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
    id: number | string;
    nama_produk: string;
    harga: number;
    jumlah: number;
    ukuran?: string;
    warna?: string;
    gambar?: string;
}

interface ShippingDetail {
    kurir?: string;
    layanan?: string;
    nomor_resi?: string;
    penerima?: string;
    alamat_lengkap?: string;
    json_payload?:
        | string
        | {
              nama_penerima?: string;
              telepon?: string;
              email?: string;
              alamat_lengkap?: string;
              catatan?: string;
              kota?: string;
              kecamatan?: string;
              provinsi?: string;
              kode_pos?: string;
          };
}

interface RincianFakturProps {
    nomorPesanan?: string;
    status?: string;
    catatan?: string;
    items: OrderItem[];
    subtotal: number;
    ongkir: number;
    diskon?: number;
    total: number;
    kodeVoucher?: string | null;
    poinDigunakan?: number;
    pengiriman?: ShippingDetail;
    isDropship?: boolean;
    dropshipPengirim?: string;
    dropshipTelepon?: string;
    asuransiPengiriman?: boolean;
    biayaAsuransi?: number;
    formatRupiah: (val: number | string | undefined | null) => string;
    onOpenEditRecipient?: () => void;
}

/**
 * Normalisasi format nama kurir & layanan agar ramah dibaca pembeli
 */
function formatKurirLayanan(kurir?: string, layanan?: string): string {
    if (!kurir) return "Ekspedisi Pengiriman";
    const k = kurir.toLowerCase().trim();
    let namaKurir = kurir.toUpperCase();

    if (k === "pos") namaKurir = "POS Indonesia";
    else if (k === "jne") namaKurir = "JNE Express";
    else if (k === "jnt") namaKurir = "J&T Express";
    else if (k === "sicepat") namaKurir = "SiCepat Ekspres";
    else if (k === "tiki") namaKurir = "TIKI";

    if (!layanan) return namaKurir;
    const cleanLayanan = layanan.replace(/_/g, " ").trim();
    const namaLayanan = cleanLayanan.toLowerCase().includes("reg")
        ? cleanLayanan.replace(/reg/i, "Reguler")
        : cleanLayanan.toUpperCase();

    return `${namaKurir} (${namaLayanan})`;
}

export default function RincianFaktur({
    status = "belum_bayar",
    catatan,
    items = [],
    subtotal,
    ongkir,
    diskon = 0,
    total,
    kodeVoucher = null,
    poinDigunakan = 0,
    pengiriman = {},
    isDropship = false,
    dropshipPengirim,
    dropshipTelepon,
    asuransiPengiriman = false,
    biayaAsuransi = 0,
    formatRupiah,
    onOpenEditRecipient,
}: RincianFakturProps) {
    const [copiedResi, setCopiedResi] = useState(false);

    const handleCopyResi = async (resiText: string) => {
        try {
            await navigator.clipboard.writeText(resiText);
            setCopiedResi(true);
            toast.success("Nomor resi berhasil disalin!");
            setTimeout(() => setCopiedResi(false), 2000);
        } catch {
            toast.error("Gagal menyalin nomor resi.");
        }
    };

    // Safe parser untuk json_payload jika bertipe string
    const parsedPayload = useMemo(() => {
        const raw = pengiriman.json_payload;
        if (!raw) return {};
        if (typeof raw === "object") return raw;
        try {
            return JSON.parse(raw);
        } catch {
            return {};
        }
    }, [pengiriman.json_payload]);

    const recipientName =
        parsedPayload.nama_penerima || pengiriman.penerima || "Pelanggan";
    const recipientPhone = parsedPayload.telepon;
    const recipientEmail = parsedPayload.email;
    const recipientAddress =
        parsedPayload.alamat_lengkap ||
        pengiriman.alamat_lengkap ||
        "Alamat pengiriman belum ditentukan.";
    const orderNotes = catatan || parsedPayload.catatan;

    // Alamat hanya boleh diubah jika belum lunas dan resi kurir belum terbit
    const hasWaybill = Boolean(pengiriman.nomor_resi);
    const canEditAddress = status === "belum_bayar" && !hasWaybill;

    // Pemisahan transparan diskon voucher vs poin loyalitas
    const nominalPoin = Math.max(0, Number(poinDigunakan) || 0);
    const nominalVoucher = Math.max(0, (Number(diskon) || 0) - nominalPoin);

    const isHoldVerification =
        status === "menunggu_verifikasi_manual" || status === "challenge";

    const labelKurirLayanan = formatKurirLayanan(
        pengiriman.kurir,
        pengiriman.layanan,
    );

    return (
        <aside className="space-y-4" aria-label="Rincian Transaksi Faktur">
            {/* Banner Transparansi: Penahanan Verifikasi Manual */}
            {isHoldVerification && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-950 shadow-2xs">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="font-bold">
                            Pembayaran Dalam Tinjauan Tim CS
                        </p>
                        <p className="text-[11px] leading-relaxed text-amber-800">
                            Sistem mendeteksi transaksi memerlukan verifikasi
                            manual (seperti selisih nominal transfer). Tim CS
                            kami sedang memeriksa data pembayaran Anda.
                        </p>
                    </div>
                </div>
            )}

            {/* 1. Informasi Pengiriman & Penerima */}
            <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#E52027]" />
                        <span>Informasi Pengiriman</span>
                    </h2>

                    <div className="flex items-center gap-2">
                        {pengiriman.kurir && (
                            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                {labelKurirLayanan}
                            </span>
                        )}
                        {canEditAddress && onOpenEditRecipient && (
                            <button
                                type="button"
                                onClick={onOpenEditRecipient}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#E52027] hover:underline transition-colors cursor-pointer"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Ubah</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-3 text-xs">
                    {/* Kartu Nomor Resi Kurir (Jika sudah terbit) */}
                    {pengiriman.nomor_resi && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                                    No. Resi Kurir
                                </span>
                                <span className="font-mono font-bold text-slate-900 select-all truncate block text-sm pt-0.5">
                                    {pengiriman.nomor_resi}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    handleCopyResi(pengiriman.nomor_resi!)
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 shadow-2xs transition-colors cursor-pointer shrink-0"
                                title="Salin nomor resi"
                            >
                                {copiedResi ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="text-emerald-700">
                                            Tersalin
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Salin</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Data Alamat Tujuan */}
                    <div className="space-y-2">
                        <div className="flex items-start gap-2.5">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5 min-w-0">
                                <p className="font-bold text-slate-900">
                                    {recipientName}
                                </p>
                                <p className="text-slate-600 leading-relaxed">
                                    {recipientAddress}
                                </p>
                            </div>
                        </div>

                        {(recipientPhone || recipientEmail) && (
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 pl-6.5">
                                {recipientPhone && (
                                    <a
                                        href={`tel:${recipientPhone}`}
                                        className="inline-flex items-center gap-1 hover:text-slate-900 font-mono transition-colors"
                                    >
                                        <Phone className="w-3 h-3 text-slate-400" />
                                        <span>{recipientPhone}</span>
                                    </a>
                                )}
                                {recipientEmail && (
                                    <a
                                        href={`mailto:${recipientEmail}`}
                                        className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
                                    >
                                        <Mail className="w-3 h-3 text-slate-400" />
                                        <span>{recipientEmail}</span>
                                    </a>
                                )}
                            </div>
                        )}

                        {orderNotes && (
                            <div className="flex items-start gap-2 text-[11px] text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 mt-2">
                                <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="font-bold">
                                        Catatan:
                                    </strong>{" "}
                                    <span>{orderNotes}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Informasi Dropship */}
                    {isDropship && (
                        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-0.5">
                            <div className="flex items-center gap-1.5 font-bold text-amber-900">
                                <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                                <span>Pengiriman Dropship</span>
                            </div>
                            <p className="text-amber-800 text-[11px]">
                                Pengirim: {dropshipPengirim || "-"}{" "}
                                {dropshipTelepon ? `(${dropshipTelepon})` : ""}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* 2. Rincian Item Pesanan */}
            <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-700" />
                        <span>Item Pesanan</span>
                    </h2>
                    <span className="text-xs font-semibold text-slate-500">
                        ({items.length} produk)
                    </span>
                </div>

                {items.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 space-y-1">
                        <ShoppingBag className="w-6 h-6 mx-auto opacity-50" />
                        <p className="text-xs">Tidak ada data item pesanan.</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-slate-100">
                        {items.map((it, idx) => {
                            const subtotalItem = it.harga * it.jumlah;
                            const gambarSrc = it.gambar
                                ? it.gambar.startsWith("http") ||
                                  it.gambar.startsWith("/")
                                    ? it.gambar
                                    : `/storage/${it.gambar}`
                                : "/assets/gambar/placeholder.webp";

                            return (
                                <div
                                    key={it.id || idx}
                                    className="flex items-center justify-between gap-3 text-xs pt-3 first:pt-0"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-12 h-12 rounded-xl border border-slate-200 shrink-0 overflow-hidden bg-slate-50 flex items-center justify-center p-0.5">
                                            <img
                                                src={gambarSrc}
                                                alt={it.nama_produk}
                                                className="w-full h-full object-cover rounded-lg"
                                                loading="lazy"
                                                onError={(e) => {
                                                    const target =
                                                        e.currentTarget;
                                                    target.onerror = null;
                                                    target.src =
                                                        "/assets/gambar/placeholder.webp";
                                                }}
                                            />
                                        </div>

                                        <div className="min-w-0 space-y-0.5">
                                            <p className="font-bold text-slate-900 truncate leading-snug">
                                                {it.nama_produk}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                                                <span className="font-semibold text-slate-700">
                                                    {it.jumlah}x
                                                </span>
                                                {it.jumlah > 1 && (
                                                    <span>
                                                        (@{" "}
                                                        {formatRupiah(it.harga)}
                                                        )
                                                    </span>
                                                )}
                                                {it.ukuran && (
                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-600">
                                                        {it.ukuran}
                                                    </span>
                                                )}
                                                {it.warna && (
                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-600">
                                                        {it.warna}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <span className="font-bold text-slate-900 shrink-0 tabular-nums font-mono text-xs">
                                        {formatRupiah(subtotalItem)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 3. Rincian Biaya Riil & Transparan */}
                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex justify-between">
                        <span>Subtotal Produk</span>
                        <span className="font-mono font-semibold text-slate-900 tabular-nums">
                            {formatRupiah(subtotal)}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span>Biaya Pengiriman</span>
                        <span className="font-mono font-semibold text-slate-900 tabular-nums">
                            {formatRupiah(ongkir)}
                        </span>
                    </div>

                    {asuransiPengiriman && (
                        <div className="flex justify-between text-slate-700">
                            <span className="flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Asuransi Pengiriman</span>
                            </span>
                            <span className="font-mono font-semibold tabular-nums text-slate-900">
                                +{formatRupiah(biayaAsuransi)}
                            </span>
                        </div>
                    )}

                    {/* Diskon Voucher Belanja */}
                    {nominalVoucher > 0 && (
                        <div className="flex justify-between text-emerald-700 font-semibold">
                            <span className="flex items-center gap-1">
                                <TicketPercent className="w-3.5 h-3.5 text-emerald-600" />
                                <span>
                                    Diskon Voucher{" "}
                                    {kodeVoucher ? `(${kodeVoucher})` : ""}
                                </span>
                            </span>
                            <span className="font-mono tabular-nums">
                                -{formatRupiah(nominalVoucher)}
                            </span>
                        </div>
                    )}

                    {/* Pemotongan Koin Loyalitas */}
                    {nominalPoin > 0 && (
                        <div className="flex justify-between text-amber-700 font-semibold">
                            <span className="flex items-center gap-1">
                                <Coins className="w-3.5 h-3.5 text-amber-600" />
                                <span>Potongan Koin Loyalitas</span>
                            </span>
                            <span className="font-mono tabular-nums">
                                -{formatRupiah(nominalPoin)}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between items-baseline pt-3 border-t border-slate-200 text-sm">
                        <span className="font-bold text-slate-900">
                            Total Tagihan
                        </span>
                        <span className="text-lg font-black text-slate-900 font-mono tabular-nums tracking-tight">
                            {formatRupiah(total)}
                        </span>
                    </div>
                </div>
            </section>
        </aside>
    );
}
