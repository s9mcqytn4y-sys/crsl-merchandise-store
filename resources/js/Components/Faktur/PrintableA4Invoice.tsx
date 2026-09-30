import { useMemo } from "react";

interface OrderItem {
    id: number | string;
    nama_produk: string;
    harga: number;
    jumlah: number;
    ukuran?: string;
    warna?: string;
    sku?: string;
}

interface ShippingPayload {
    nama_penerima?: string;
    telepon?: string;
    email?: string;
    alamat_lengkap?: string;
    catatan?: string;
    kota?: string;
    kecamatan?: string;
    provinsi?: string;
    kode_pos?: string;
    is_dropship?: boolean;
    dropship_pengirim?: string;
    dropship_telepon?: string;
}

interface ShippingDetail {
    kurir?: string;
    layanan?: string;
    nomor_resi?: string;
    penerima?: string;
    alamat_lengkap?: string;
    telepon?: string;
    email?: string;
    catatan?: string;
    json_payload?: ShippingPayload | string;
}

interface PaymentDetail {
    metode_bayar?: string;
    nomor_va?: string;
    kode_biller?: string;
    bill_key?: string;
    waktu_bayar?: string;
}

interface OrderData {
    id?: string | number;
    nomor_pesanan: string;
    status: string;
    subtotal: number;
    ongkir: number;
    diskon?: number;
    kode_voucher?: string | null;
    poin_digunakan?: number;
    total: number;
    catatan?: string;
    created_at?: string;
    pembayaran?: PaymentDetail;
    pengiriman?: ShippingDetail;
    items?: OrderItem[];
    is_dropship?: boolean;
    dropship_pengirim?: string;
    dropship_telepon?: string;
    asuransi_pengiriman?: boolean;
    biaya_asuransi?: number;
}

interface PrintableA4InvoiceProps {
    pesanan: OrderData;
    statusPesanan: string;
    formatRupiah: (val: number | string | undefined | null) => string;
    formatTanggalIndo: (val?: string) => string;
    companyInfo?: {
        name: string;
        legalName: string;
        address: string;
        contact: string;
        taxId?: string;
    };
}

const DEFAULT_COMPANY = {
    name: "CRSL OFFICIAL STORE",
    legalName: "PT KREASI SAHABAT SEJATI",
    address:
        "Jl. Affandi No. 20, Condongcatur, Depok, Sleman, D.I. Yogyakarta 55281",
    contact:
        "Email: hello@crslstore.com | CS WA: +62 812-3456-7890 | www.crsl-store.id",
    taxId: "NPWP: 02.894.218.4-542.000",
};

export default function PrintableA4Invoice({
    pesanan,
    statusPesanan,
    formatRupiah,
    formatTanggalIndo,
    companyInfo = DEFAULT_COMPANY,
}: PrintableA4InvoiceProps) {
    const pembayaran = pesanan.pembayaran ?? {};
    const pengiriman = pesanan.pengiriman ?? {};
    const items = pesanan.items ?? [];

    // Safe parser json_payload (mencegah bug string JSON mentah)
    const payload = useMemo<ShippingPayload>(() => {
        const raw = pengiriman.json_payload;
        if (!raw) return {};
        if (typeof raw === "object") return raw;
        try {
            return JSON.parse(raw);
        } catch {
            return {};
        }
    }, [pengiriman.json_payload]);

    // Format alamat lengkap dengan kelurahan/kecamatan
    const recipient = useMemo(() => {
        const name =
            payload.nama_penerima || pengiriman.penerima || "Pelanggan";
        const phone = payload.telepon || pengiriman.telepon || "-";
        const address =
            payload.alamat_lengkap || pengiriman.alamat_lengkap || "-";
        const regionDetails = [
            payload.kecamatan,
            payload.kota,
            payload.provinsi,
            payload.kode_pos,
        ]
            .filter(Boolean)
            .join(", ");

        return {
            name,
            phone,
            address:
                regionDetails && !address.includes(payload.kota || "")
                    ? `${address}\n${regionDetails}`
                    : address,
            notes: pesanan.catatan || payload.catatan || null,
            isDropship: pesanan.is_dropship || payload.is_dropship || false,
            dropshipSender:
                pesanan.dropship_pengirim || payload.dropship_pengirim || "-",
            dropshipPhone:
                pesanan.dropship_telepon || payload.dropship_telepon || "-",
        };
    }, [payload, pengiriman, pesanan]);

    // Status Label & Formatting
    const statusKey = (statusPesanan || pesanan.status || "")
        .toLowerCase()
        .trim();
    const isPaid = ["akan_dikirim", "dikirim", "selesai"].includes(statusKey);
    const isCancelled = ["dibatalkan", "expired"].includes(statusKey);
    const isHoldManual = [
        "menunggu_verifikasi_manual",
        "challenge",
        "suspect_underpaid",
    ].includes(statusKey);

    const statusBadgeText = isPaid
        ? "LUNAS (PAID)"
        : isCancelled
          ? "DIBATALKAN"
          : isHoldManual
            ? "VERIFIKASI MANUAL"
            : "MENUNGGU PEMBAYARAN";

    const statusBadgeClass = isPaid
        ? "border-emerald-800 bg-emerald-50 text-emerald-900"
        : isCancelled
          ? "border-rose-800 bg-rose-50 text-rose-900"
          : isHoldManual
            ? "border-amber-800 bg-amber-50 text-amber-950 font-black"
            : "border-slate-800 bg-slate-50 text-slate-900";

    // Itemized Deductions
    const poinDigunakan = Math.max(0, Number(pesanan.poin_digunakan) || 0);
    const diskonVoucher = Math.max(
        0,
        (Number(pesanan.diskon) || 0) - poinDigunakan,
    );

    return (
        <div
            id="printable-a4-invoice"
            className="hidden print:block w-full max-w-none mx-0 p-0 text-neutral-900 text-xs font-sans bg-white leading-normal"
        >
            {/* Header Faktur & Dokumen Legal */}
            <header className="flex justify-between items-start border-b-2 border-neutral-900 pb-4 mb-4">
                <div className="space-y-1 max-w-md">
                    <h1 className="text-xl font-black tracking-tight text-neutral-950 uppercase">
                        {companyInfo.name}
                    </h1>
                    <p className="text-[11px] font-semibold text-neutral-800">
                        {companyInfo.legalName}
                    </p>
                    <p className="text-[10px] text-neutral-600 leading-relaxed">
                        {companyInfo.address}
                    </p>
                    <p className="text-[10px] text-neutral-600">
                        {companyInfo.contact}
                    </p>
                    {companyInfo.taxId && (
                        <p className="text-[9px] text-neutral-500 font-mono pt-0.5">
                            {companyInfo.taxId}
                        </p>
                    )}
                </div>

                <div className="text-right space-y-1.5 shrink-0">
                    <div className="inline-block bg-neutral-900 text-white font-bold text-xs px-3 py-1 uppercase tracking-wider">
                        FAKTUR PENJUALAN
                    </div>
                    <p className="text-xs font-mono font-bold text-neutral-900">
                        #{pesanan.nomor_pesanan}
                    </p>
                    <p className="text-[11px] text-neutral-600">
                        Waktu Terbit: {formatTanggalIndo(pesanan.created_at)}
                    </p>
                    <div className="pt-0.5">
                        <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 border uppercase tracking-wide ${statusBadgeClass}`}
                        >
                            {statusBadgeText}
                        </span>
                    </div>
                </div>
            </header>

            {/* Rincian Logistik & Pembayaran */}
            <section className="grid grid-cols-2 gap-6 pb-4 mb-4 border-b border-neutral-300">
                {/* Kolom Kiri: Alamat Tujuan */}
                <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                        Tujuan Pengiriman
                    </span>
                    <p className="font-bold text-neutral-900 text-xs">
                        {recipient.name}
                    </p>
                    <p className="text-[11px] text-neutral-700 font-mono">
                        {recipient.phone}
                    </p>
                    <p className="text-[11px] text-neutral-700 leading-relaxed whitespace-pre-line">
                        {recipient.address}
                    </p>
                    {recipient.notes && (
                        <p className="text-[10px] text-neutral-600 bg-neutral-50 border border-neutral-200 p-1.5 rounded mt-1.5">
                            <strong className="text-neutral-800">
                                Catatan:
                            </strong>{" "}
                            {recipient.notes}
                        </p>
                    )}
                </div>

                {/* Kolom Kanan: Kurir & Transaksi */}
                <div className="space-y-1.5 pl-4 border-l border-neutral-300">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                        Informasi Ekspedisi & Pembayaran
                    </span>
                    <div className="space-y-1 text-[11px] text-neutral-700">
                        <div className="flex justify-between">
                            <span className="text-neutral-500">
                                Jasa Ekspedisi:
                            </span>
                            <span className="font-bold text-neutral-900 uppercase">
                                {pengiriman.kurir || "Kurir"}{" "}
                                {pengiriman.layanan
                                    ? `(${pengiriman.layanan})`
                                    : ""}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">
                                Nomor Resi:
                            </span>
                            <span className="font-mono font-bold text-neutral-900">
                                {pengiriman.nomor_resi ||
                                    "Menunggu Penjemputan Kurir"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">
                                Metode Bayar:
                            </span>
                            <span className="font-bold text-neutral-900">
                                {pembayaran.metode_bayar ||
                                    "Payment Gateway (Midtrans)"}
                            </span>
                        </div>
                        {pembayaran.nomor_va && (
                            <div className="flex justify-between">
                                <span className="text-neutral-500">
                                    Nomor VA / Rek:
                                </span>
                                <span className="font-mono font-bold text-neutral-900">
                                    {pembayaran.nomor_va}
                                </span>
                            </div>
                        )}
                        {pembayaran.waktu_bayar && (
                            <div className="flex justify-between">
                                <span className="text-neutral-500">
                                    Waktu Bayar:
                                </span>
                                <span className="font-mono text-neutral-800">
                                    {formatTanggalIndo(pembayaran.waktu_bayar)}
                                </span>
                            </div>
                        )}
                    </div>

                    {recipient.isDropship && (
                        <div className="mt-2 pt-2 border-t border-neutral-200 text-[10px] text-neutral-700">
                            <span className="font-bold text-neutral-900 block">
                                Pengirim Dropship:
                            </span>
                            <span>
                                {recipient.dropshipSender} (
                                {recipient.dropshipPhone})
                            </span>
                        </div>
                    )}
                </div>
            </section>

            {/* Tabel Item Pesanan */}
            <table className="w-full border-collapse border border-neutral-400 text-left mb-4">
                <thead className="print:table-header-group">
                    <tr className="bg-neutral-100 text-neutral-900 text-[10px] font-bold uppercase tracking-wider">
                        <th className="border border-neutral-300 px-2 py-1.5 text-center w-8">
                            No
                        </th>
                        <th className="border border-neutral-300 px-3 py-1.5 w-28">
                            SKU
                        </th>
                        <th className="border border-neutral-300 px-3 py-1.5">
                            Nama Produk
                        </th>
                        <th className="border border-neutral-300 px-3 py-1.5 w-28">
                            Varian
                        </th>
                        <th className="border border-neutral-300 px-2 py-1.5 text-center w-12">
                            Qty
                        </th>
                        <th className="border border-neutral-300 px-3 py-1.5 text-right w-24">
                            Harga
                        </th>
                        <th className="border border-neutral-300 px-3 py-1.5 text-right w-28">
                            Subtotal
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                    {items.map((item, idx) => (
                        <tr
                            key={item.id ?? idx}
                            className="text-[11px] break-inside-avoid"
                        >
                            <td className="border border-neutral-300 px-2 py-1.5 text-center font-mono text-neutral-500">
                                {idx + 1}
                            </td>
                            <td className="border border-neutral-300 px-3 py-1.5 font-mono text-[10px] text-neutral-700">
                                {item.sku || `CRSL-${item.id}`}
                            </td>
                            <td className="border border-neutral-300 px-3 py-1.5 font-semibold text-neutral-900">
                                {item.nama_produk}
                            </td>
                            <td className="border border-neutral-300 px-3 py-1.5 text-neutral-600 text-[10px]">
                                {[item.warna, item.ukuran]
                                    .filter(Boolean)
                                    .join(" / ") || "-"}
                            </td>
                            <td className="border border-neutral-300 px-2 py-1.5 text-center font-mono font-bold">
                                {item.jumlah}
                            </td>
                            <td className="border border-neutral-300 px-3 py-1.5 text-right font-mono text-neutral-700">
                                {formatRupiah(item.harga)}
                            </td>
                            <td className="border border-neutral-300 px-3 py-1.5 text-right font-mono font-bold text-neutral-900">
                                {formatRupiah(item.harga * item.jumlah)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Ringkasan Biaya & Kebijakan */}
            <section className="flex justify-between items-start gap-8 mb-6 break-inside-avoid">
                <div className="flex-1 space-y-1.5 text-[10px] text-neutral-600">
                    <p className="font-bold text-neutral-800 uppercase tracking-wide">
                        Ketentuan & Kebijakan Toko:
                    </p>
                    <ul className="list-disc pl-4 space-y-0.5">
                        <li>
                            Faktur ini adalah bukti transaksi resmi dan sah dari
                            CRSL Official Store.
                        </li>
                        <li>
                            Klaim retur/garansi cacat produk wajib menyertakan
                            video unboxing utuh tanpa jeda maksimal 7 hari sejak
                            status paket diterima.
                        </li>
                        <li>
                            Barang yang sudah diproses pengiriman tidak dapat
                            ditukar varian ukuran atau warna.
                        </li>
                    </ul>
                </div>

                <div className="w-72 border border-neutral-400 divide-y divide-neutral-200 text-xs">
                    <div className="p-2 space-y-1">
                        <div className="flex justify-between text-neutral-600">
                            <span>Subtotal Produk</span>
                            <span className="font-mono">
                                {formatRupiah(pesanan.subtotal)}
                            </span>
                        </div>
                        <div className="flex justify-between text-neutral-600">
                            <span>Biaya Pengiriman</span>
                            <span className="font-mono">
                                {formatRupiah(pesanan.ongkir)}
                            </span>
                        </div>
                        {Boolean(pesanan.biaya_asuransi) && (
                            <div className="flex justify-between text-neutral-600">
                                <span>Asuransi Pengiriman</span>
                                <span className="font-mono">
                                    +{formatRupiah(pesanan.biaya_asuransi)}
                                </span>
                            </div>
                        )}
                        {diskonVoucher > 0 && (
                            <div className="flex justify-between text-emerald-800 font-semibold">
                                <span>
                                    Diskon Voucher{" "}
                                    {pesanan.kode_voucher
                                        ? `(${pesanan.kode_voucher})`
                                        : ""}
                                </span>
                                <span className="font-mono">
                                    -{formatRupiah(diskonVoucher)}
                                </span>
                            </div>
                        )}
                        {poinDigunakan > 0 && (
                            <div className="flex justify-between text-amber-800 font-semibold">
                                <span>Potongan Poin Loyalitas</span>
                                <span className="font-mono">
                                    -{formatRupiah(poinDigunakan)}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="p-2 bg-neutral-100 flex justify-between items-center font-black text-neutral-950">
                        <span>TOTAL PEMBAYARAN</span>
                        <span className="font-mono text-sm">
                            {formatRupiah(pesanan.total)}
                        </span>
                    </div>
                </div>
            </section>

            {/* Validasi & Tanda Tangan */}
            <footer className="pt-3 border-t border-neutral-300 grid grid-cols-2 gap-8 items-end break-inside-avoid">
                <div className="text-[10px] text-neutral-500 space-y-0.5">
                    <p>
                        Faktur dicetak otomatis melalui CRSL Commerce Management
                        System.
                    </p>
                    <p className="font-mono text-[9px]">
                        ID Order: {pesanan.nomor_pesanan} | Cetak:{" "}
                        {new Date().toLocaleDateString("id-ID")} WIB
                    </p>
                </div>

                <div className="text-right space-y-1">
                    <p className="text-[10px] text-neutral-600 font-semibold">
                        CRSL Fulfillment & Finance
                    </p>
                    <div className="h-12 flex items-center justify-end">
                        <span className="text-[9px] font-mono text-neutral-400 border border-dashed border-neutral-300 px-2 py-0.5 rounded">
                            Dokumen Sah Elektronik
                        </span>
                    </div>
                    <p className="text-[10px] text-neutral-900 font-bold">
                        Gudang Sleman, D.I. Yogyakarta
                    </p>
                </div>
            </footer>
        </div>
    );
}
