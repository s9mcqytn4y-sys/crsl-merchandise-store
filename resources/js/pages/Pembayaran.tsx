import React, { useState, useMemo, useEffect } from "react";
import { Head, useForm, usePage, Link } from "@inertiajs/react";
import ShippingAreaSelector from "../Components/ShippingAreaSelector";
import AuthModal from "../Components/AuthModal";
import VoucherModal from "../Components/VoucherModal";
import {
    MapPin,
    Truck,
    CreditCard,
    Tag,
    Lock,
    Check,
    CheckCircle2,
    RotateCcw,
    ChevronRight,
    ChevronDown,
    AlertCircle,
    ArrowLeft,
    Gift,
    MessageSquare,
    Search,
    PhoneCall,
} from "lucide-react";
import { toast } from "sonner";

interface CartItem {
    id: string | number;
    produk_id?: number;
    varian_id?: number;
    nama_produk?: string;
    name?: string;
    harga?: number;
    price?: number;
    harga_asli?: number;
    original_price?: number;
    jumlah?: number;
    quantity?: number;
    gambar?: string;
    image?: string;
    ukuran?: string;
    warna?: string;
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
    badge?: string;
}

interface AreaDetail {
    id: string;
    provinsi: string;
    kota: string;
    kecamatan: string;
    kode_pos?: string;
}

interface PembayaranProps {
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

export default function Pembayaran({
    keranjang = {},
    cart = {},
    subtotal = 0,
    kurirList = [],
    couriers = [],
    metodeBayarList = [],
    paymentMethods = [],
}: PembayaranProps) {
    const { auth } = usePage<{
        auth?: {
            user?: {
                id?: number;
                name?: string;
                email?: string;
                phone?: string;
                telepon?: string;
                poin?: number;
            } | null;
        };
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
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(!auth?.user);
    const [showMessageInput, setShowMessageInput] = useState(false);
    const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);

    // Default address for abdul music if logged in
    const defaultAddress = {
        name: auth?.user?.name || "abdul music",
        phone: auth?.user?.phone || auth?.user?.telepon || "+628567060477",
        addressText:
            "Jalan Kebon Sirih Barat Dalam No 22, RT 003, RW 002, Kel. Kebon Sirih, Kec. Menteng, Kota Jakarta Pusat, DKI Jakarta 10340",
    };

    // Active courier
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

    // Hitung diskon produk bawaan (misal Cassie Wallet diskon dari 199.000 ke 179.100)
    const productDiscountTotal = useMemo(() => {
        return cartItems.reduce((acc, item) => {
            const normalPrice = item.harga_asli || item.original_price || item.harga || item.price || 0;
            const salePrice = item.harga || item.price || 0;
            const diff = Math.max(0, normalPrice - salePrice);
            return acc + diff * (item.jumlah || item.quantity || 1);
        }, 0);
    }, [cartItems]);

    const pointsDeduction = useLoyaltyPoints ? 0 : 0; // P 0
    const grandTotal = Math.max(
        0,
        subtotal + courierCost - diskonAmount - pointsDeduction,
    );

    const { data, setData, post, processing, errors } = useForm({
        nama_lengkap: auth?.user?.name || "",
        email: auth?.user?.email || "",
        telepon: auth?.user?.phone || auth?.user?.telepon || "",
        country: "Indonesia",
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

    useEffect(() => {
        if (auth?.user) {
            setData((prev) => ({
                ...prev,
                nama_lengkap: prev.nama_lengkap || auth.user?.name || "abdul music",
                email: prev.email || auth.user?.email || "abdul@crsl-store.id",
                telepon: prev.telepon || auth.user?.phone || auth.user?.telepon || "+628567060477",
                alamat_lengkap: prev.alamat_lengkap || defaultAddress.addressText,
                kota: prev.kota || "Jakarta Pusat",
                kode_pos: prev.kode_pos || "10340",
            }));
            setIsEditingAddress(false);
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
                toast.success(res.pesan || "Voucher diskon berhasil digunakan!");
            } else {
                setDiskonAmount(0);
                setData("kode_voucher", "");
                toast.error(res.pesan || "Voucher tidak valid atau sudah kadaluarsa.");
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

        toast.info(`Lokasi ${area.kota} terpilih. Menghitung tarif pengiriman...`);

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
            toast.error("Gagal memperbarui tarif ongkir. Menggunakan opsi standar.");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!auth?.user) {
            toast.info("Silakan login atau daftar akun terlebih dahulu untuk melanjutkan pesanan.");
            setIsAuthModalOpen(true);
            return;
        }

        post("/pembayaran");
    };

    return (
        <div className="min-h-screen bg-[#FBFBFC] text-slate-800">
            <Head title="Checkout Pesanan - CRSL Official Store" />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccessAuth={() => {
                    setIsAuthModalOpen(false);
                    toast.success("Berhasil masuk! Melanjutkan pesanan...");
                }}
            />

            <VoucherModal
                isOpen={isVoucherModalOpen}
                onClose={() => setIsVoucherModalOpen(false)}
                onContinueShopping={() => {
                    setVoucherCode("FREEONGKIR10K");
                    setDiskonAmount(10000);
                    setData("kode_voucher", "FREEONGKIR10K");
                    setIsVoucherModalOpen(false);
                    toast.success("Voucher FREEONGKIR10K berhasil diterapkan!");
                }}
            />

            {/* Minimal Header Sesuai Screenshot 5: Tombol Kembali + Logo CRSL Ditengah */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
                        aria-label="Kembali ke halaman sebelumnya"
                    >
                        <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
                    </button>

                    <Link href="/" className="inline-flex items-center justify-center">
                        <img
                            src="/assets/gambar/logo-crsl-bw.webp"
                            alt="CRSL Official"
                            className="h-7 w-auto object-contain"
                        />
                    </Link>

                    {/* Spacer agar logo persis di tengah */}
                    <div className="w-10 h-10 -mr-2" />
                </div>
            </header>

            {/* Konten Utama */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                >
                    {/* Kolom Kiri: Address Details, Shipment Method, Payment Method */}
                    <div className="lg:col-span-7 space-y-7">
                        {/* 1. Address Details Section */}
                        <section aria-labelledby="heading-address-details" className="space-y-4">
                            <h2
                                id="heading-address-details"
                                className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight"
                            >
                                Address Details
                            </h2>

                            {/* Guest Promo Banner Sesuai Screenshot 5 */}
                            {!auth?.user && (
                                <div className="border border-slate-200 bg-white rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-2xs">
                                    <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                                        <Gift className="w-4 h-4 text-rose-500 shrink-0" />
                                        <span>Exclusive rewards are waiting for you!</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsAuthModalOpen(true)}
                                        className="text-xs font-bold text-rose-600 hover:text-rose-700 underline underline-offset-2 shrink-0 transition-colors focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none rounded"
                                    >
                                        Login
                                    </button>
                                </div>
                            )}

                            {/* Logged in Card Sesuai Screenshot 3 / 5 */}
                            {auth?.user && !isEditingAddress ? (
                                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-2 relative">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm text-slate-900">
                                            {data.nama_lengkap || defaultAddress.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingAddress(true)}
                                            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-0.5 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none rounded"
                                        >
                                            Edit <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="text-xs text-slate-600 font-medium">
                                        {data.telepon || defaultAddress.phone}
                                    </div>
                                    <div className="text-xs text-slate-500 leading-relaxed pt-1">
                                        {data.alamat_lengkap || defaultAddress.addressText}
                                    </div>
                                </div>
                            ) : (
                                /* Formulir Input Alamat */
                                <div className="space-y-3.5 text-xs">
                                    <div>
                                        <label
                                            htmlFor="checkout-email"
                                            className="block font-semibold text-slate-700 mb-1"
                                        >
                                            Email Address (Optional)
                                        </label>
                                        <input
                                            id="checkout-email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData("email", e.target.value)}
                                            placeholder="Enter your email"
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                        />
                                        <span className="text-[11px] text-slate-400 mt-1 block">
                                            We will send your order detail to your email
                                        </span>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="checkout-name"
                                            className="block font-semibold text-slate-700 mb-1"
                                        >
                                            Recipient Full Name
                                        </label>
                                        <input
                                            id="checkout-name"
                                            type="text"
                                            value={data.nama_lengkap}
                                            onChange={(e) => setData("nama_lengkap", e.target.value)}
                                            placeholder="Recipient Full Name"
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all font-medium"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="checkout-phone"
                                            className="block font-semibold text-slate-700 mb-1"
                                        >
                                            Recipient Phone Number
                                        </label>
                                        <input
                                            id="checkout-phone"
                                            type="tel"
                                            value={data.telepon}
                                            onChange={(e) => setData("telepon", e.target.value)}
                                            placeholder="+62 812..."
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all font-medium"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="checkout-country"
                                            className="block font-semibold text-slate-700 mb-1"
                                        >
                                            Country
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="checkout-country"
                                                value={data.country}
                                                onChange={(e) => setData("country", e.target.value)}
                                                className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 pr-10"
                                            >
                                                <option value="Indonesia">Indonesia</option>
                                                <option value="Malaysia">Malaysia</option>
                                                <option value="Singapore">Singapore</option>
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Sub-district, District, City
                                        </label>
                                        <ShippingAreaSelector
                                            valueAreaId={data.biteship_area_id}
                                            onSelectArea={handleSelectArea}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="checkout-address-detail"
                                            className="block font-semibold text-slate-700 mb-1"
                                        >
                                            Address Details
                                        </label>
                                        <textarea
                                            id="checkout-address-detail"
                                            value={data.alamat_lengkap}
                                            onChange={(e) => setData("alamat_lengkap", e.target.value)}
                                            placeholder="Street name, house number, landmarks..."
                                            rows={3}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>

                                    {auth?.user && isEditingAddress && (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingAddress(false)}
                                            className="text-xs font-bold text-slate-700 hover:text-slate-900 py-1.5 px-3 rounded-lg border border-slate-300 bg-white"
                                        >
                                            Simpan Alamat Ini
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Dropship Checkbox Sesuai Screenshot 5 */}
                            <div className="pt-2">
                                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.is_dropship}
                                        onChange={(e) => setData("is_dropship", e.target.checked)}
                                        className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                                    />
                                    <span className="text-xs text-slate-700 font-medium">
                                        Make as a dropship order
                                    </span>
                                </label>

                                {data.is_dropship && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-3 mt-2 border-t border-slate-200">
                                        <div>
                                            <label
                                                htmlFor="input-sender-name"
                                                className="block font-semibold text-slate-700 mb-1"
                                            >
                                                Sender Name
                                            </label>
                                            <input
                                                id="input-sender-name"
                                                type="text"
                                                value={data.dropship_pengirim}
                                                onChange={(e) => setData("dropship_pengirim", e.target.value)}
                                                placeholder="Your Store Name"
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                                                required={data.is_dropship}
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="input-sender-phone"
                                                className="block font-semibold text-slate-700 mb-1"
                                            >
                                                Sender Phone Number
                                            </label>
                                            <input
                                                id="input-sender-phone"
                                                type="tel"
                                                value={data.dropship_telepon}
                                                onChange={(e) => setData("dropship_telepon", e.target.value)}
                                                placeholder="0812..."
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                                                required={data.is_dropship}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 2. Shipment Method Section */}
                        <section aria-labelledby="heading-shipment-method" className="space-y-3 pt-2">
                            <h2
                                id="heading-shipment-method"
                                className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight"
                            >
                                Shipment Method
                            </h2>

                            {/* Alert Box Sesuai Screenshot 5: Shipping is unavailable to this location */}
                            <div className="bg-slate-100/90 border border-slate-200 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
                                <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                                <div className="text-xs text-slate-700 leading-relaxed">
                                    <span>Shipping is unavailable to this location. </span>
                                    <a
                                        href="https://wa.me/6281234567890?text=Halo%20CRSL%20CS,%20saya%20membutuhkan%20bantuan%20pengiriman%20pesanan"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-bold text-rose-600 hover:text-rose-700 underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none rounded inline-flex items-center gap-1"
                                    >
                                        Contact us for help.
                                    </a>
                                </div>
                            </div>

                            {/* Pilihan Kurir Ekspedisi Alternatif (Simulasi) */}
                            <div className="pt-2 space-y-2">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Atau pilih kurir reguler:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {dynamicCouriers.map((courier) => {
                                        const cId = courier.kurir_kode || courier.id || "jne";
                                        const cNama = courier.nama || courier.kurir_nama || courier.name || "JNE";
                                        const cHarga = courier.biaya ?? courier.cost ?? courier.harga ?? 18000;
                                        const isSelected = selectedCourier === cId;

                                        return (
                                            <button
                                                type="button"
                                                key={cId}
                                                onClick={() => {
                                                    setSelectedCourier(cId);
                                                    setData("kurir", cId);
                                                }}
                                                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                                                    isSelected
                                                        ? "border-slate-900 bg-white ring-2 ring-slate-900 shadow-xs"
                                                        : "border-slate-200 bg-white hover:border-slate-300"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-1 mb-1">
                                                    <span className="font-bold text-xs text-slate-900">
                                                        {cNama}
                                                    </span>
                                                    {isSelected && (
                                                        <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
                                                    )}
                                                </div>
                                                <div className="text-slate-900 font-extrabold text-xs mt-2">
                                                    {formatRupiah(cHarga)}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        {/* 3. Payment Method Section */}
                        <section aria-labelledby="heading-payment-method" className="space-y-3 pt-2">
                            <h2
                                id="heading-payment-method"
                                className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight"
                            >
                                Payment Method
                            </h2>

                            <div className="space-y-3">
                                {initialPayments.map((method) => {
                                    const isSelected = selectedPayment === method.id;
                                    const isQris = method.id === "qris";

                                    return (
                                        <button
                                            type="button"
                                            key={method.id}
                                            onClick={() => {
                                                setSelectedPayment(method.id);
                                                setData("metode_pembayaran", method.id);
                                            }}
                                            className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                                                isSelected
                                                    ? "border-slate-900 bg-white ring-2 ring-slate-900 shadow-xs"
                                                    : "border-slate-200 bg-white hover:border-slate-300"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm shrink-0">
                                                    {method.ikon || "💳"}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-xs text-slate-900">
                                                            {method.nama || method.name}
                                                        </span>
                                                        {isQris && (
                                                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                                                Automated confirmation
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isQris && (
                                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                                            Scan instan menggunakan GoPay, OVO, ShopeePay, Dana, atau Mobile Banking
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* Kolom Kanan: Order Summary Sesuai Screenshot 5 */}
                    <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
                            {/* List Item Keranjang Sesuai Screenshot 5 */}
                            <div className="space-y-4">
                                {cartItems.map((item, idx) => {
                                    const nama =
                                        item.nama_produk ||
                                        item.name ||
                                        "CRSL Cassie Wallet | Dompet Lipat Canvas Wanita Pattern Plaid | Compact & Stylish";
                                    const qty = item.jumlah ?? item.quantity ?? 1;
                                    const hargaSatuan = item.harga || item.price || 179100;
                                    const hargaCoret =
                                        item.harga_asli ||
                                        item.original_price ||
                                        199000;
                                    const warna = item.warna || item.ukuran || "CHILO PINK";
                                    const gambar =
                                        item.gambar ||
                                        item.image ||
                                        "/assets/gambar/cassie-wallet.webp";

                                    return (
                                        <div
                                            key={item.id ? `${item.id}-${idx}` : idx}
                                            className="flex gap-3 text-xs items-start"
                                        >
                                            <img
                                                src={gambar}
                                                alt={nama}
                                                className="w-14 h-14 object-cover rounded-xl bg-slate-50 shrink-0 border border-slate-200"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-slate-800 line-clamp-2 leading-snug">
                                                    {nama}
                                                </h3>
                                                <p className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold mt-1">
                                                    {warna}
                                                </p>
                                                <p className="text-slate-500 text-[11px] mt-0.5">
                                                    Quantity: {qty}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                {hargaCoret > hargaSatuan && (
                                                    <span className="block text-[11px] text-slate-400 line-through">
                                                        {formatRupiah(hargaCoret)}
                                                    </span>
                                                )}
                                                <span className="font-bold text-slate-900 text-xs">
                                                    {formatRupiah(hargaSatuan)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Clickable Actions Sesuai Screenshot 5 */}
                            <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
                                {/* 1. Leave a message for delivery (Optional) > */}
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setShowMessageInput(!showMessageInput)}
                                        className="w-full border border-slate-200 rounded-xl p-3 flex items-center justify-between text-slate-700 hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
                                    >
                                        <span className="font-medium">
                                            Leave a message for delivery (Optional)
                                        </span>
                                        <ChevronRight
                                            className={`w-4 h-4 text-slate-400 transition-transform ${
                                                showMessageInput ? "rotate-90" : ""
                                            }`}
                                        />
                                    </button>
                                    {showMessageInput && (
                                        <textarea
                                            value={data.catatan}
                                            onChange={(e) => setData("catatan", e.target.value)}
                                            placeholder="Contoh: Titip di satpam jika tidak ada orang di rumah"
                                            rows={2}
                                            className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                                        />
                                    )}
                                </div>

                                {/* 2. Vouchers > Sesuai Screenshot 5 */}
                                <button
                                    type="button"
                                    onClick={() => setIsVoucherModalOpen(true)}
                                    className="w-full border border-slate-200 rounded-xl p-3 flex items-center justify-between text-slate-700 hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
                                >
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-slate-500" />
                                        <span className="font-medium">
                                            {diskonAmount > 0
                                                ? `Voucher: ${data.kode_voucher} (-${formatRupiah(diskonAmount)})`
                                                : "Vouchers"}
                                        </span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                </button>

                                {/* 3. Use Loyalty Point (P 0) Sesuai Screenshot 5 */}
                                <div className="border border-slate-200 rounded-xl p-3 flex items-center justify-between text-slate-700">
                                    <span className="font-medium">
                                        Use Loyalty Point (℗ 0)
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={useLoyaltyPoints}
                                        onChange={(e) => {
                                            if (!auth?.user) {
                                                toast.info("Silakan login untuk menggunakan poin loyalitas.");
                                                setIsAuthModalOpen(true);
                                                return;
                                            }
                                            setUseLoyaltyPoints(e.target.checked);
                                            toast.info("Poin loyalitas Anda saat ini: 0 poin.");
                                        }}
                                        className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Rincian Biaya Sesuai Screenshot 5 */}
                            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                                <div className="flex justify-between">
                                    <span>Subtotal • {cartItems.length} items</span>
                                    <span className="font-semibold text-slate-800 tabular-nums">
                                        {formatRupiah(
                                            productDiscountTotal > 0
                                                ? subtotal + productDiscountTotal
                                                : subtotal,
                                        )}
                                    </span>
                                </div>

                                {productDiscountTotal > 0 && (
                                    <div className="flex justify-between text-rose-600 font-semibold">
                                        <span>Product Discount</span>
                                        <span className="tabular-nums">
                                            - {formatRupiah(productDiscountTotal)}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-slate-800 tabular-nums">
                                        {formatRupiah(courierCost)}
                                    </span>
                                </div>

                                {diskonAmount > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-semibold">
                                        <span>Voucher Discount</span>
                                        <span className="tabular-nums">
                                            - {formatRupiah(diskonAmount)}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between items-baseline pt-3 border-t border-slate-200 text-sm">
                                    <span className="font-bold text-slate-900">Total Payment</span>
                                    <span className="text-lg font-black text-slate-900 tabular-nums">
                                        {formatRupiah(grandTotal)}
                                    </span>
                                </div>
                            </div>

                            {/* Secure Payment Note Sesuai Screenshot 5 */}
                            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium pt-1">
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                                <span>Secure Payment | Your payment is encrypted.</span>
                            </div>

                            {/* Import duty notice Sesuai Screenshot 5 */}
                            <div className="bg-slate-100/70 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-500 leading-relaxed">
                                Import duty or tax might be charged depending on your delivery country.
                            </div>

                            {/* CTA Button: Dark Slate Button 'Order Now' Sesuai Screenshot 5 */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 bg-[#1e293b] hover:bg-[#0f172a] disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
                            >
                                <Lock className="w-4 h-4" />
                                {processing ? "Processing Order..." : "Order Now"}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
