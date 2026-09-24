import React, { useState, useMemo, useEffect } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import StorefrontLayout from "../Layouts/StorefrontLayout";
import ShippingAreaSelector from "../Components/ShippingAreaSelector";
import AuthModal from "../Components/AuthModal";
import {
    User,
    MapPin,
    Truck,
    CreditCard,
    Tag,
    Lock,
    Check,
    CheckCircle2,
    RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

interface CartItem {
    id: string | number;
    nama_produk?: string;
    name?: string;
    harga?: number;
    price?: number;
    jumlah?: number;
    quantity?: number;
    gambar?: string;
    image?: string;
    ukuran?: string;
}

interface CourierOption {
    id?: string;
    kurir_kode: string;
    kurir_nama?: string;
    nama?: string;
    name?: string;
    layanan_nama?: string;
    layanan_kode?: string;
    biaya?: number;
    cost?: number;
    harga?: number;
    logo_url?: string;
}

interface PaymentOption {
    id: string;
    nama?: string;
    name?: string;
    ikon?: string;
    icon?: string;
}

interface AreaDetail {
    id: string;
    provinsi: string;
    kota: string;
    kecamatan: string;
    kode_pos?: string;
}

interface CheckoutProps {
    keranjang?: Record<string, CartItem> | CartItem[];
    cart?: Record<string, CartItem> | CartItem[];
    subtotal?: number;
    kurirList?: CourierOption[];
    couriers?: CourierOption[];
    metodeBayarList?: PaymentOption[];
    paymentMethods?: PaymentOption[];
}

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
});

function formatRupiah(amount: number): string {
    return rupiahFormatter.format(amount || 0);
}

export default function Checkout({
    keranjang = {},
    cart = {},
    subtotal = 0,
    kurirList = [],
    couriers = [],
    metodeBayarList = [],
    paymentMethods = [],
}: CheckoutProps) {
    const { auth } = usePage<{
        auth?: { user?: { name?: string; email?: string } | null };
    }>().props;

    // Normalisasi Cart Items
    const cartItems: CartItem[] = useMemo(() => {
        const source = Object.keys(keranjang).length > 0 ? keranjang : cart;
        if (Array.isArray(source)) return source;
        if (typeof source === "object" && source !== null) {
            return Object.values(source);
        }
        return [];
    }, [keranjang, cart]);

    const initialCouriers = kurirList.length > 0 ? kurirList : couriers;
    const initialPayments =
        metodeBayarList.length > 0 ? metodeBayarList : paymentMethods;

    const [dynamicCouriers, setDynamicCouriers] =
        useState<CourierOption[]>(initialCouriers);
    const [selectedCourier, setSelectedCourier] = useState<string>(
        initialCouriers[0]?.kurir_kode || initialCouriers[0]?.id || "jne",
    );
    const [selectedPayment, setSelectedPayment] = useState<string>(
        initialPayments[0]?.id || "qris",
    );
    const [voucherCode, setVoucherCode] = useState("");
    const [diskonAmount, setDiskonAmount] = useState(0);
    const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Cari kurir terpilih secara efisien
    const activeCourierData = useMemo(() => {
        return dynamicCouriers.find(
            (c) => (c.kurir_kode || c.id) === selectedCourier,
        );
    }, [dynamicCouriers, selectedCourier]);

    const courierCost =
        activeCourierData?.biaya ??
        activeCourierData?.cost ??
        activeCourierData?.harga ??
        18000;
    const grandTotal = Math.max(0, subtotal + courierCost - diskonAmount);

    const { data, setData, post, processing, errors } = useForm({
        nama_lengkap: auth?.user?.name || "",
        email: auth?.user?.email || "",
        telepon: "",
        alamat_lengkap: "",
        biteship_area_id: "",
        provinsi: "",
        kota: "",
        kecamatan: "",
        kode_pos: "",
        kurir: selectedCourier,
        metode_pembayaran: selectedPayment,
        kode_voucher: "",
        is_dropship: false,
        dropship_pengirim: "",
        dropship_telepon: "",
        catatan: "",
    });

    // Isi otomatis data jika user login belakangan
    useEffect(() => {
        if (auth?.user) {
            if (!data.nama_lengkap && auth.user.name)
                setData("nama_lengkap", auth.user.name);
            if (!data.email && auth.user.email)
                setData("email", auth.user.email);
        }
    }, [auth?.user]);

    const handleApplyVoucher = async () => {
        if (!voucherCode.trim() || isValidatingVoucher) return;
        setIsValidatingVoucher(true);
        try {
            const response = await fetch("/api/voucher/validasi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ kode: voucherCode.trim(), subtotal }),
            });
            const res = await response.json();
            if (res.sukses) {
                setDiskonAmount(res.nilai_diskon || 0);
                setData("kode_voucher", res.kode);
                toast.success(
                    res.pesan || "Voucher diskon berhasil digunakan!",
                );
            } else {
                setDiskonAmount(0);
                setData("kode_voucher", "");
                toast.error(
                    res.pesan || "Voucher tidak valid atau sudah kadaluarsa.",
                );
            }
        } catch {
            toast.error("Gagal memverifikasi kode voucher.");
        } finally {
            setIsValidatingVoucher(false);
        }
    };

    const handleRemoveVoucher = () => {
        setVoucherCode("");
        setDiskonAmount(0);
        setData("kode_voucher", "");
        toast.info("Kupon diskon dibatalkan.");
    };

    const handleSelectArea = async (area: AreaDetail) => {
        setData((prev) => ({
            ...prev,
            biteship_area_id: area.id,
            provinsi: area.provinsi,
            kota: area.kota,
            kecamatan: area.kecamatan,
            kode_pos: area.kode_pos || prev.kode_pos,
        }));

        toast.info(
            `Lokasi ${area.kota} terpilih. Menghitung tarif pengiriman...`,
        );

        try {
            const response = await fetch("/api/wilayah/ongkir", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    area_id: area.id,
                    items: cartItems.map((item) => ({
                        nama: item.nama_produk || item.name,
                        harga: item.harga || item.price,
                        jumlah: item.jumlah || item.quantity || 1,
                        berat_gram: 250,
                    })),
                }),
            });
            const res = await response.json();
            if (res.sukses && Array.isArray(res.data) && res.data.length > 0) {
                setDynamicCouriers(res.data);
                const firstCourier = res.data[0].kurir_kode || res.data[0].id;
                setSelectedCourier(firstCourier);
                setData("kurir", firstCourier);
                toast.success("Pilihan ongkir kurir berhasil diperbarui!");
            }
        } catch (err) {
            console.error("Gagal mengambil ongkir:", err);
            toast.error(
                "Gagal memperbarui tarif ongkir. Menggunakan estimasi standar.",
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validasi login sebelum memproses pembayaran
        if (!auth?.user) {
            toast.info(
                "Silakan masuk atau daftar akun terlebih dahulu untuk menyelesaikan pesanan.",
            );
            setIsAuthModalOpen(true);
            return;
        }

        post("/pembayaran");
    };

    return (
        <StorefrontLayout>
            <Head title="Checkout Pesanan — CRSL Official Store" />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccessAuth={() => post("/pembayaran")}
            />

            {/* Header Title */}
            <div className="bg-slate-50 border-b border-slate-200/80 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Checkout Pesanan
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Lengkapi informasi penerima dan pilih metode pembayaran
                        favoritmu.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                >
                    {/* Kolom Kiri: Formulir Pengiriman & Pembayaran */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* 1. Informasi Penerima */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                                <User className="w-4 h-4 text-[#E52027]" />
                                Informasi Penerima
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <label
                                        htmlFor="input-nama-lengkap"
                                        className="font-bold text-slate-700 block mb-1.5"
                                    >
                                        Nama Lengkap *
                                    </label>
                                    <input
                                        id="input-nama-lengkap"
                                        type="text"
                                        value={data.nama_lengkap}
                                        onChange={(e) =>
                                            setData(
                                                "nama_lengkap",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Nama penerima paket"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#E52027] focus:bg-white transition-all font-medium"
                                        required
                                    />
                                    {errors.nama_lengkap && (
                                        <span className="text-rose-600 text-[11px] mt-1 block">
                                            {errors.nama_lengkap}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="input-telepon"
                                        className="font-bold text-slate-700 block mb-1.5"
                                    >
                                        No. WhatsApp / Telepon *
                                    </label>
                                    <input
                                        id="input-telepon"
                                        type="tel"
                                        value={data.telepon}
                                        onChange={(e) =>
                                            setData("telepon", e.target.value)
                                        }
                                        placeholder="081234567890"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#E52027] focus:bg-white transition-all font-medium"
                                        required
                                    />
                                    {errors.telepon && (
                                        <span className="text-rose-600 text-[11px] mt-1 block">
                                            {errors.telepon}
                                        </span>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="input-email"
                                        className="font-bold text-slate-700 block mb-1.5"
                                    >
                                        Alamat Email (Untuk Bukti Faktur) *
                                    </label>
                                    <input
                                        id="input-email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        placeholder="nama@email.com"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#E52027] focus:bg-white transition-all font-medium"
                                        required
                                    />
                                    {errors.email && (
                                        <span className="text-rose-600 text-[11px] mt-1 block">
                                            {errors.email}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. Alamat Pengiriman */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#E52027]" />
                                Alamat Pengiriman
                            </h3>

                            <div className="space-y-4 text-xs">
                                <ShippingAreaSelector
                                    valueAreaId={data.biteship_area_id}
                                    onSelectArea={handleSelectArea}
                                />

                                <div>
                                    <label
                                        htmlFor="input-alamat-lengkap"
                                        className="font-bold text-slate-700 block mb-1.5"
                                    >
                                        Detail Alamat (Nama Jalan, No. Rumah,
                                        RT/RW, Patokan) *
                                    </label>
                                    <textarea
                                        id="input-alamat-lengkap"
                                        value={data.alamat_lengkap}
                                        onChange={(e) =>
                                            setData(
                                                "alamat_lengkap",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Contoh: Jl. Kaliurang KM 5, Gg. Megatruh No. 12, Sleman"
                                        rows={3}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#E52027] focus:bg-white transition-all font-medium"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="input-kota"
                                            className="font-bold text-slate-700 block mb-1.5"
                                        >
                                            Kota / Kabupaten *
                                        </label>
                                        <input
                                            id="input-kota"
                                            type="text"
                                            value={data.kota}
                                            onChange={(e) =>
                                                setData("kota", e.target.value)
                                            }
                                            placeholder="Sleman / Yogyakarta"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#E52027] focus:bg-white transition-all font-medium"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="input-kode-pos"
                                            className="font-bold text-slate-700 block mb-1.5"
                                        >
                                            Kode Pos *
                                        </label>
                                        <input
                                            id="input-kode-pos"
                                            type="text"
                                            value={data.kode_pos}
                                            onChange={(e) =>
                                                setData(
                                                    "kode_pos",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="55281"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#E52027] focus:bg-white transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Opsi Dropshipper */}
                        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/80 shadow-2xs space-y-3">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={data.is_dropship}
                                    onChange={(e) =>
                                        setData("is_dropship", e.target.checked)
                                    }
                                    className="w-4 h-4 text-[#E52027] rounded border-slate-300 focus:ring-[#E52027]"
                                />
                                <span className="font-bold text-xs text-slate-900">
                                    Kirim sebagai Dropshipper (Nama Toko Anda)
                                </span>
                            </label>

                            {data.is_dropship && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-amber-200/60">
                                    <div>
                                        <label
                                            htmlFor="input-dropship-pengirim"
                                            className="font-bold text-slate-700 block mb-1"
                                        >
                                            Nama Pengirim / Toko *
                                        </label>
                                        <input
                                            id="input-dropship-pengirim"
                                            type="text"
                                            value={data.dropship_pengirim}
                                            onChange={(e) =>
                                                setData(
                                                    "dropship_pengirim",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Contoh: CRSL Fanbase Store"
                                            className="w-full bg-white border border-amber-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#E52027]"
                                            required={data.is_dropship}
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="input-dropship-telepon"
                                            className="font-bold text-slate-700 block mb-1"
                                        >
                                            No. Telepon Pengirim *
                                        </label>
                                        <input
                                            id="input-dropship-telepon"
                                            type="tel"
                                            value={data.dropship_telepon}
                                            onChange={(e) =>
                                                setData(
                                                    "dropship_telepon",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="081299998888"
                                            className="w-full bg-white border border-amber-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#E52027]"
                                            required={data.is_dropship}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. Pilihan Kurir Ekspedisi */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-[#E52027]" />
                                Opsi Ekspedisi & Ongkir
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {dynamicCouriers.map((courier) => {
                                    const cId =
                                        courier.kurir_kode ||
                                        courier.id ||
                                        "reg";
                                    const cNama =
                                        courier.nama ||
                                        courier.kurir_nama ||
                                        courier.name ||
                                        "JNE";
                                    const cLayanan =
                                        courier.layanan_nama ||
                                        courier.layanan_kode ||
                                        "";
                                    const cHarga =
                                        courier.biaya ??
                                        courier.cost ??
                                        courier.harga ??
                                        0;
                                    const isSelected = selectedCourier === cId;

                                    return (
                                        <button
                                            type="button"
                                            key={cId + cLayanan}
                                            onClick={() => {
                                                setSelectedCourier(cId);
                                                setData("kurir", cId);
                                            }}
                                            className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                                                isSelected
                                                    ? "border-[#E52027] bg-red-50/60 ring-2 ring-[#E52027]"
                                                    : "border-slate-200 bg-white hover:border-slate-300"
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-1 mb-1">
                                                    <span className="font-bold text-xs text-slate-900">
                                                        {cNama}
                                                    </span>
                                                    {isSelected && (
                                                        <CheckCircle2 className="w-4 h-4 text-[#E52027]" />
                                                    )}
                                                </div>
                                                {cLayanan && (
                                                    <div className="text-[10px] text-slate-500 font-medium">
                                                        {cLayanan}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-[#E52027] font-extrabold text-xs mt-2">
                                                {formatRupiah(cHarga)}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 5. Metode Pembayaran */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[#E52027]" />
                                Metode Pembayaran (Midtrans)
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {initialPayments.map((method) => {
                                    const isSelected =
                                        selectedPayment === method.id;
                                    return (
                                        <button
                                            type="button"
                                            key={method.id}
                                            onClick={() => {
                                                setSelectedPayment(method.id);
                                                setData(
                                                    "metode_pembayaran",
                                                    method.id,
                                                );
                                            }}
                                            className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                                                isSelected
                                                    ? "border-[#E52027] bg-red-50/60 ring-2 ring-[#E52027]"
                                                    : "border-slate-200 bg-white hover:border-slate-300"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-lg">
                                                    {method.ikon ||
                                                        method.icon ||
                                                        "💳"}
                                                </span>
                                                <span className="font-bold text-xs text-slate-800">
                                                    {method.nama || method.name}
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <CheckCircle2 className="w-4 h-4 text-[#E52027]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Kolom Kanan: Ringkasan Pesanan & Voucher */}
                    <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6 lg:sticky lg:top-24">
                        <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-3">
                            Ringkasan Pesanan ({cartItems.length} Item)
                        </h3>

                        {/* List Item Keranjang */}
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 overscroll-contain [scrollbar-width:thin]">
                            {cartItems.map((item, idx) => {
                                const nama =
                                    item.nama_produk ||
                                    item.name ||
                                    "Produk CRSL";
                                const qty = item.jumlah ?? item.quantity ?? 1;
                                const hargaSatuan =
                                    item.harga || item.price || 0;

                                return (
                                    <div
                                        key={
                                            item.id ? `${item.id}-${idx}` : idx
                                        }
                                        className="flex gap-3 text-xs items-center bg-slate-50/80 p-2.5 rounded-xl border border-slate-100"
                                    >
                                        <img
                                            src={
                                                item.gambar ||
                                                item.image ||
                                                "/assets/gambar/placeholder.webp"
                                            }
                                            alt={nama}
                                            className="w-12 h-12 object-cover rounded-lg bg-white shrink-0 border border-slate-200"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-900 truncate">
                                                {nama}
                                            </h4>
                                            <p className="text-slate-400 text-[11px] mt-0.5">
                                                {qty} ×{" "}
                                                {formatRupiah(hargaSatuan)}
                                            </p>
                                        </div>
                                        <div className="font-black text-slate-900 shrink-0 tabular-nums">
                                            {formatRupiah(hargaSatuan * qty)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Voucher Form */}
                        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                            <label
                                htmlFor="input-voucher"
                                className="font-bold text-slate-800 flex items-center gap-1.5"
                            >
                                <Tag className="w-3.5 h-3.5 text-[#E52027]" />{" "}
                                Punya Kode Voucher?
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="input-voucher"
                                    type="text"
                                    value={voucherCode}
                                    onChange={(e) =>
                                        setVoucherCode(
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    placeholder="Misal: NEWADOPTER10"
                                    disabled={diskonAmount > 0}
                                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#E52027] uppercase disabled:bg-slate-100"
                                />
                                {diskonAmount > 0 ? (
                                    <button
                                        type="button"
                                        onClick={handleRemoveVoucher}
                                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />{" "}
                                        Batal
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleApplyVoucher}
                                        disabled={
                                            isValidatingVoucher ||
                                            !voucherCode.trim()
                                        }
                                        className="bg-[#E52027] hover:bg-[#CC1C22] disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                                    >
                                        {isValidatingVoucher
                                            ? "Cek..."
                                            : "Gunakan"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Rincian Biaya */}
                        <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                            <div className="flex justify-between">
                                <span>Subtotal Produk</span>
                                <span className="font-bold text-slate-900 tabular-nums">
                                    {formatRupiah(subtotal)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>
                                    Biaya Pengiriman (
                                    {activeCourierData?.nama || "Kurir"})
                                </span>
                                <span className="font-bold text-slate-900 tabular-nums">
                                    {formatRupiah(courierCost)}
                                </span>
                            </div>
                            {diskonAmount > 0 && (
                                <div className="flex justify-between text-emerald-600 font-bold">
                                    <span>Diskon Voucher</span>
                                    <span className="tabular-nums">
                                        - {formatRupiah(diskonAmount)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm font-black text-slate-900 pt-3 border-t border-slate-200">
                                <span>Total Pembayaran</span>
                                <span className="text-[#E52027] text-base tabular-nums">
                                    {formatRupiah(grandTotal)}
                                </span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-4 bg-[#E52027] hover:bg-[#CC1C22] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                        >
                            <Lock className="w-4 h-4" />
                            {processing
                                ? "Memproses Pesanan..."
                                : "Bayar Sekarang"}
                        </button>
                    </div>
                </form>
            </div>
        </StorefrontLayout>
    );
}
