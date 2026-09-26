import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Head, router, Link } from "@inertiajs/react";
import { ArrowLeft, Check, ChevronRight, Loader2 } from "lucide-react";
import { useCheckoutStore } from "../Stores/useCheckoutStore";
import { checkoutFormSchema } from "../Validation/checkoutSchema";
import AddressSection from "../Components/Checkout/AddressSection";
import AddressSelectModal, {
    AddressItem,
} from "../Components/Checkout/AddressSelectModal";
import AddressFormModal from "../Components/Checkout/AddressFormModal";
import ShipmentMethodSection, {
    CourierOption,
} from "../Components/Checkout/ShipmentMethodSection";
import ShipmentSelectModal from "../Components/Checkout/ShipmentSelectModal";
import PaymentMethodSection, {
    PaymentOption,
} from "../Components/Checkout/PaymentMethodSection";
import PaymentSelectModal from "../Components/Checkout/PaymentSelectModal";
import OrderSummarySection, {
    CartItem,
} from "../Components/Checkout/OrderSummarySection";
import DeliveryMessageModal from "../Components/Checkout/DeliveryMessageModal";
import VoucherSelectModal, {
    VoucherItem,
} from "../Components/Checkout/VoucherSelectModal";
import AuthModal from "../Components/AuthModal";
import Footer from "../Components/Footer";
import { useKeranjangStore } from "../Stores/useKeranjangStore";
import { Toaster, toast } from "sonner";

interface UserProfile {
    id: number;
    name: string;
    email: string;
    telepon?: string;
}

interface ExtendedCartItem extends CartItem {
    berat_gram?: number;
    weight?: number;
}

interface PembayaranProps {
    keranjang?: Record<string, ExtendedCartItem> | ExtendedCartItem[];
    subtotal?: number;
    user?: UserProfile | null;
    alamatUtama?: AddressItem | null;
    addresses?: AddressItem[];
    loyaltyPoint?: number;
    vouchers?: VoucherItem[];
    kurirList?: CourierOption[];
    metodeBayarList?: PaymentOption[];
}

const DEFAULT_COURIERS: CourierOption[] = [
    {
        id: "jne_reg",
        kurir_kode: "jne",
        nama: "JNE",
        layanan: "Reguler (2 - 3 days)",
        biaya: 48000,
        etd: "2 - 3 days",
        ikon: "/assets/ikon/kurir-jne.svg",
    },
    {
        id: "jne_yes",
        kurir_kode: "jne",
        nama: "JNE",
        layanan: "YES (Yakin Esok Sampai) (1 days)",
        biaya: 117000,
        etd: "1 days",
        ikon: "/assets/ikon/kurir-jne.svg",
    },
    {
        id: "jnt_ez",
        kurir_kode: "jnt",
        nama: "J&T Express",
        layanan: "EZ (Regular Service)",
        biaya: 52000,
        etd: "2 - 3 days",
        ikon: "/assets/ikon/kurir-jnt.svg",
    },
    {
        id: "sicepat_reg",
        kurir_kode: "sicepat",
        nama: "SiCepat",
        layanan: "REG (Reguler)",
        biaya: 50000,
        etd: "2 - 3 days",
        ikon: "/assets/ikon/kurir-sicepat.svg",
    },
];

const DEFAULT_PAYMENT: PaymentOption = {
    id: "midtrans_snap",
    nama: "Pembayaran Instan (Midtrans)",
    subjudul: "QRIS, GoPay, Virtual Account & Kartu Kredit",
    tipe: "qris",
    ikon: "/assets/ikon/payment-qris.svg",
};

export default function Pembayaran({
    keranjang = [],
    subtotal: rawSubtotal = 0,
    user = null,
    alamatUtama = null,
    addresses = [],
    loyaltyPoint = 0,
    vouchers = [],
    kurirList = [],
    metodeBayarList = [],
}: PembayaranProps) {
    // 1. Reactive Zustand Subscription (Bukan imperatif getState di useMemo)
    const storeKeranjangItems = useKeranjangStore((state) => state.items);
    const kosongkanKeranjang = useKeranjangStore((state) => state.kosongkan);

    // 2. Buy Now State Initialization
    const [isBuyNowMode, setIsBuyNowMode] = useState<boolean>(false);
    const [buyNowItem, setBuyNowItem] = useState<ExtendedCartItem | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const params = new URLSearchParams(window.location.search);
        const isBuyNowQuery = params.get("buy_now") === "1";
        const rawStored = sessionStorage.getItem("crsl_buy_now_item");

        if (rawStored) {
            try {
                const parsed = JSON.parse(rawStored);
                if (parsed && (parsed.produk_id || parsed.id)) {
                    setBuyNowItem(parsed);
                    setIsBuyNowMode(true);
                    return;
                }
            } catch {
                // Invalid JSON
            }
        }

        if (isBuyNowQuery) {
            setIsBuyNowMode(true);
        }
    }, []);

    // 3. Normalisasi Cart Items Reaktif
    const cartItems: ExtendedCartItem[] = useMemo(() => {
        if (isBuyNowMode && buyNowItem) {
            return [buyNowItem];
        }

        if (storeKeranjangItems && storeKeranjangItems.length > 0) {
            return storeKeranjangItems.map((item) => ({
                id: item.id,
                produk_id: item.produk_id,
                slug: item.slug,
                varian_id: item.varian_id ? Number(item.varian_id) : undefined,
                nama_produk: item.nama_produk,
                harga: Number(item.harga) || 0,
                harga_asli: Number(item.harga_asli) || Number(item.harga) || 0,
                jumlah: Number(item.jumlah) || 1,
                warna: item.warna,
                ukuran: item.ukuran,
                gambar: item.gambar,
                sku: item.sku,
            }));
        }

        if (Array.isArray(keranjang) && keranjang.length > 0) {
            return keranjang;
        }

        if (
            typeof keranjang === "object" &&
            keranjang !== null &&
            Object.keys(keranjang).length > 0
        ) {
            return Object.values(keranjang);
        }

        return buyNowItem ? [buyNowItem] : [];
    }, [isBuyNowMode, buyNowItem, storeKeranjangItems, keranjang]);

    // 4. Perhitungan Finansial & Parameter Pengiriman
    const subtotal = useMemo(() => {
        if (rawSubtotal > 0 && !isBuyNowMode && cartItems.length === 0)
            return rawSubtotal;
        return cartItems.reduce(
            (acc, it) =>
                acc + (Number(it.harga) || 0) * (Number(it.jumlah) || 1),
            0,
        );
    }, [cartItems, rawSubtotal, isBuyNowMode]);

    const productDiscount = useMemo(() => {
        return cartItems.reduce((acc, it) => {
            const original = Number(it.harga_asli) || Number(it.harga) || 0;
            const current = Number(it.harga) || 0;
            const qty = Number(it.jumlah) || 1;
            return acc + (original > current ? (original - current) * qty : 0);
        }, 0);
    }, [cartItems]);

    // Total berat aktual untuk kurir Biteship
    const totalWeightKg = useMemo(() => {
        const totalGrams = cartItems.reduce((acc, it) => {
            const itemWeight = Number(it.berat_gram ?? it.weight ?? 350);
            return acc + itemWeight * (Number(it.jumlah) || 1);
        }, 0);

        return Math.max(0.1, Math.round((totalGrams / 1000) * 100) / 100);
    }, [cartItems]);

    // 5. Global Checkout Store
    const {
        isAddressModalOpen,
        isNewAddressModalOpen,
        isVoucherModalOpen,
        isMessageModalOpen,
        editingAddress,
        openAddressModal,
        closeAddressModal,
        openNewAddressModal,
        closeNewAddressModal,
        openVoucherModal,
        closeVoucherModal,
        openMessageModal,
        closeMessageModal,
        isDropship,
        dropshipSender,
        dropshipPhone,
        setIsDropship,
        setDropshipSender,
        setDropshipPhone,
        deliveryMessage,
        setDeliveryMessage,
        useLoyaltyPoints,
        setUseLoyaltyPoints,
    } = useCheckoutStore();

    // 2b. Navigasi kembali pintar ke PDP atau Bundle asal
    const handleBack = useCallback(() => {
        if (isBuyNowMode && buyNowItem) {
            if (buyNowItem.slug) {
                router.visit(`/produk/${buyNowItem.slug}`);
                return;
            }
            if (buyNowItem.id && String(buyNowItem.id).startsWith("bundle-")) {
                const bundleId = String(buyNowItem.id).replace("bundle-", "");
                router.visit(`/bundles/${bundleId}`);
                return;
            }
        }

        if (cartItems.length > 0 && cartItems[0].slug) {
            router.visit(`/produk/${cartItems[0].slug}`);
            return;
        }

        if (typeof window !== "undefined" && window.history.length > 1) {
            window.history.back();
            return;
        }

        router.visit("/katalog");
    }, [isBuyNowMode, buyNowItem, cartItems]);

    // 6. State Lokal Pengiriman, Pembayaran & Form Alamat Manual
    const [selectedAddress, setSelectedAddress] = useState<AddressItem | null>(
        () => {
            return alamatUtama || (addresses.length > 0 ? addresses[0] : null);
        },
    );

    const [isLoadingCouriers, setIsLoadingCouriers] = useState<boolean>(false);
    const [dynamicCouriers, setDynamicCouriers] = useState<CourierOption[]>([]);

    const availableCouriers = useMemo(() => {
        if (dynamicCouriers.length > 0) return dynamicCouriers;
        return kurirList.length > 0 ? kurirList : DEFAULT_COURIERS;
    }, [dynamicCouriers, kurirList]);

    const [selectedCourier, setSelectedCourier] = useState<CourierOption>(
        availableCouriers[0],
    );

    const [selectedPayment, setSelectedPayment] = useState<PaymentOption>(
        metodeBayarList[0] || DEFAULT_PAYMENT,
    );

    const [hasInsurance, setHasInsurance] = useState<boolean>(true);
    const insuranceFee = 2500;

    const [isShipmentModalOpen, setIsShipmentModalOpen] =
        useState<boolean>(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] =
        useState<boolean>(false);
    const [appliedVoucher, setAppliedVoucher] = useState<VoucherItem | null>(
        null,
    );
    const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [guestFormData, setGuestFormData] = useState({
        nama_penerima: user?.name || "",
        email: user?.email || "",
        telepon: user?.telepon || "",
        alamat_lengkap: "",
        kode_pos: "",
        area_id: "",
        provinsi: "",
        kota: "",
        kecamatan: "",
        kelurahan: "",
    });

    const [selectedAreaText, setSelectedAreaText] = useState<string>("");

    // Sinkronisasi data alamat prop saat update
    useEffect(() => {
        if (!selectedAddress && addresses.length > 0) {
            setSelectedAddress(alamatUtama || addresses[0]);
        }
    }, [addresses, alamatUtama, selectedAddress]);

    // Kalkulasi tarif kurir dinamis real-time saat alamat / area_id berubah
    useEffect(() => {
        const destinationAreaId =
            selectedAddress?.area_id || guestFormData.area_id;
        if (!destinationAreaId || cartItems.length === 0) return;

        let isSubscribed = true;
        setIsLoadingCouriers(true);

        const fetchShippingRates = async () => {
            try {
                const response = await fetch("/api/wilayah/ongkir", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    body: JSON.stringify({
                        area_id: destinationAreaId,
                        items: cartItems.map((item) => ({
                            nama: item.nama_produk,
                            harga: item.harga,
                            jumlah: item.jumlah,
                            berat_gram: item.berat_gram ?? item.weight ?? 350,
                        })),
                    }),
                });

                if (!response.ok) return;

                const resJson = await response.json();
                if (
                    isSubscribed &&
                    resJson?.sukses &&
                    Array.isArray(resJson.data) &&
                    resJson.data.length > 0
                ) {
                    const mapped: CourierOption[] = resJson.data.map(
                        (item: any) => {
                            const namaLayanan =
                                item.layanan_nama ||
                                item.layanan ||
                                item.kurir_layanan ||
                                "Reguler";
                            const estimasi =
                                item.estimasi_hari ||
                                item.estimasi ||
                                item.etd ||
                                "2 - 3 hari";
                            return {
                                id: `${item.kurir_kode || "kurir"}_${item.layanan_kode || item.layanan || "reg"}`,
                                kurir_kode: item.kurir_kode,
                                nama: item.kurir_nama || item.nama || "Kurir",
                                layanan: namaLayanan,
                                biaya: Number(item.harga) || 0,
                                etd: estimasi,
                                ikon: item.ikon || item.logo_url,
                            };
                        },
                    );

                    setDynamicCouriers(mapped);
                    setSelectedCourier((prev) => {
                        const match = mapped.find(
                            (m) =>
                                m.id === prev.id ||
                                m.kurir_kode === prev.kurir_kode,
                        );
                        return match || mapped[0];
                    });
                }
            } catch (err) {
                console.warn("Gagal memuat tarif kurir real-time:", err);
            } finally {
                if (isSubscribed) {
                    setIsLoadingCouriers(false);
                }
            }
        };

        fetchShippingRates();

        return () => {
            isSubscribed = false;
        };
    }, [selectedAddress?.area_id, guestFormData.area_id, cartItems]);

    // Kalkulasi Diskon Kupon & Poin
    const voucherDiscount = useMemo(() => {
        if (!appliedVoucher) return 0;
        if (appliedVoucher.tipe === "persen") {
            return (subtotal * Number(appliedVoucher.nilai)) / 100;
        }
        return Number(appliedVoucher.nilai) || 0;
    }, [appliedVoucher, subtotal]);

    const loyaltyDiscount = useMemo(() => {
        if (!useLoyaltyPoints || !loyaltyPoint) return 0;
        return Math.min(Number(loyaltyPoint), subtotal);
    }, [useLoyaltyPoints, loyaltyPoint, subtotal]);

    const shippingCost = Number(selectedCourier?.biaya) || 0;
    const effectiveInsuranceFee = hasInsurance ? insuranceFee : 0;

    const totalPayment = Math.max(
        0,
        subtotal +
            shippingCost +
            effectiveInsuranceFee -
            voucherDiscount -
            loyaltyDiscount,
    );

    // Form Handlers
    const handleAreaSelect = (area: {
        id: string;
        provinsi: string;
        kota: string;
        kecamatan: string;
        kode_pos?: string;
    }) => {
        setGuestFormData((prev) => ({
            ...prev,
            area_id: area.id,
            provinsi: area.provinsi,
            kota: area.kota,
            kecamatan: area.kecamatan,
            kode_pos: area.kode_pos || prev.kode_pos,
        }));
        setSelectedAreaText(
            `${area.kecamatan}, ${area.kota}, ${area.provinsi}`,
        );
        setErrors((prev) => {
            const next = { ...prev };
            delete next.area_id;
            delete next.kota;
            return next;
        });
    };

    const handleFieldChange = (field: string, value: unknown) => {
        if (field === "is_dropship") {
            setIsDropship(Boolean(value));
            return;
        }
        if (field === "dropship_pengirim") {
            setDropshipSender(String(value));
            return;
        }
        if (field === "dropship_telepon") {
            setDropshipPhone(String(value));
            return;
        }

        setGuestFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    // Transisi Modal Aman
    const handleSwitchToNewAddress = (addrToEdit?: AddressItem) => {
        closeAddressModal();
        requestAnimationFrame(() => {
            openNewAddressModal(addrToEdit);
        });
    };

    // Eksekusi Submit Checkout
    const handleOrderSubmit = () => {
        setErrors({});

        if (cartItems.length === 0) {
            toast.warning("Keranjang belanja Anda masih kosong.");
            router.visit("/katalog");
            return;
        }

        // 1. Ekstraksi area ID dengan fallback fleksibel dan konversi string kosong ke undefined
        const rawAreaId = selectedAddress
            ? (selectedAddress as any).biteship_area_id ||
              selectedAddress.area_id
            : guestFormData.area_id;

        const resolvedAreaId =
            rawAreaId && String(rawAreaId).trim() !== ""
                ? String(rawAreaId).trim()
                : undefined;

        // 2. Susun payload data yang bersih
        const payloadData = {
            nama_lengkap: selectedAddress
                ? selectedAddress.nama_penerima
                : guestFormData.nama_penerima,
            email: selectedAddress
                ? selectedAddress.email || user?.email || guestFormData.email
                : guestFormData.email,
            telepon: selectedAddress
                ? selectedAddress.telepon
                : guestFormData.telepon,
            alamat_lengkap: selectedAddress
                ? selectedAddress.alamat_lengkap
                : guestFormData.alamat_lengkap,
            biteship_area_id: resolvedAreaId,
            provinsi: selectedAddress
                ? selectedAddress.provinsi || ""
                : guestFormData.provinsi,
            kota: selectedAddress
                ? selectedAddress.kota || ""
                : guestFormData.kota,
            kecamatan: selectedAddress
                ? selectedAddress.kecamatan || ""
                : guestFormData.kecamatan,
            kode_pos: selectedAddress
                ? selectedAddress.kode_pos || ""
                : guestFormData.kode_pos,
            kurir: selectedCourier.kurir_kode,
            layanan_kurir: selectedCourier.layanan || "reguler",
            ongkir: shippingCost,
            metode_pembayaran: selectedPayment.id,
            subtotal,
            total: totalPayment,
            catatan: deliveryMessage,
            kode_voucher: appliedVoucher?.kode || null,
            use_loyalty_point: useLoyaltyPoints,
            is_dropship: isDropship,
            dropship_pengirim: dropshipSender,
            dropship_telepon: dropshipPhone,
            asuransi_pengiriman: hasInsurance,
            biaya_asuransi: effectiveInsuranceFee,
            items: cartItems.map((item) => ({
                id: item.produk_id || item.id,
                produk_id: item.produk_id || item.id,
                varian_id: item.varian_id || null,
                nama: item.nama_produk || "",
                harga: item.harga || 0,
                jumlah: item.jumlah || 1,
                ukuran: item.ukuran || null,
                warna: item.warna || null,
                sku: item.sku || null,
            })),
            buy_now_item: isBuyNowMode && buyNowItem ? buyNowItem : null,
        };

        // 3. Validasi dengan Zod
        const result = checkoutFormSchema.safeParse(payloadData);

        if (!result.success) {
            const formErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const key = String(issue.path[0]);
                if (!formErrors[key]) {
                    formErrors[key] =
                        issue.message ||
                        "Data pengiriman ini wajib diisi dengan benar.";
                }
            });

            setErrors(formErrors);
            const firstErrorMessage = Object.values(formErrors)[0];
            toast.error(
                firstErrorMessage ||
                    "Mohon lengkapi seluruh field pengiriman bertanda bintang (*)",
            );

            window.scrollTo({ top: 100, behavior: "smooth" });
            return;
        }

        setIsSubmitting(true);

        // 4. Kirim data ke backend
        router.post(
            "/checkout/proses",
            payloadData as Record<string, unknown>,
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    const flashError = (page.props as any)?.flash?.error;
                    if (flashError) {
                        toast.error(flashError);
                        return;
                    }
                    useCheckoutStore.getState().resetCheckoutState();
                    if (isBuyNowMode) {
                        sessionStorage.removeItem("crsl_buy_now_item");
                    } else {
                        kosongkanKeranjang();
                    }
                    toast.success("Pesanan berhasil dibuat!");
                },
                onError: (err) => {
                    setErrors(err as Record<string, string>);
                    setIsSubmitting(false);
                    const firstErr = Object.values(err)[0];
                    toast.error(
                        typeof firstErr === "string"
                            ? firstErr
                            : "Gagal memproses pesanan. Periksa kembali kelengkapan data.",
                    );
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            },
        );
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans flex flex-col justify-between">
            <Head title="Checkout Pesanan - CRSL Official Store" />

            <Toaster position="top-center" richColors />

            <div>
                {/* Banner Pengumuman */}
                <div className="bg-primary text-white text-[11px] sm:text-xs font-bold py-2 text-center tracking-wide px-4">
                    GRATIS ONGKIR SELURUH INDONESIA
                </div>

                {/* Header Navbar dengan Step Indicator & Logo Resmi */}
                <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
                        {/* Tombol Kembali Relevan */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="inline-flex items-center gap-2 px-3 py-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-all font-bold text-xs cursor-pointer active:scale-95"
                                aria-label="Kembali ke halaman sebelumnya"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Kembali</span>
                            </button>

                            <Link
                                href="/"
                                className="flex items-center gap-2 focus:outline-none pl-2 border-l border-slate-200"
                                aria-label="Beranda CRSL"
                            >
                                <span className="font-black text-xl sm:text-2xl text-slate-950 tracking-tighter">
                                    &lt;CRSL&#x2022;
                                </span>
                            </Link>
                        </div>

                        {/* Step Indicator Sesuai Preferensi Pengguna */}
                        <nav
                            aria-label="Tahapan Checkout"
                            className="flex items-center gap-1.5 sm:gap-3 text-xs"
                        >
                            {/* Step 1: Keranjang / Pilih Produk */}
                            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px] font-bold">
                                    <Check className="w-3 h-3 stroke-3" />
                                </span>
                                <span className="hidden md:inline">1. Keranjang</span>
                            </div>

                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                            {/* Step 2: Checkout & Bayar (Aktif) */}
                            <div className="flex items-center gap-1.5 bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full">
                                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[11px] font-black shadow-xs">
                                    2
                                </span>
                                <span>Checkout & Bayar</span>
                            </div>

                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                            {/* Step 3: Faktur Selesai */}
                            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[11px] font-bold">
                                    3
                                </span>
                                <span className="hidden md:inline">Faktur</span>
                            </div>
                        </nav>
                    </div>
                </header>

                {/* Konten Utama */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Formulir Data Penerima & Pilihan Logistik */}
                        <div className="lg:col-span-7 space-y-8">
                            <AddressSection
                                user={user}
                                selectedAddress={selectedAddress}
                                onOpenSelectModal={openAddressModal}
                                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                                formData={{
                                    nama_penerima: guestFormData.nama_penerima,
                                    email: guestFormData.email,
                                    telepon: guestFormData.telepon,
                                    alamat_lengkap:
                                        guestFormData.alamat_lengkap,
                                    kode_pos: guestFormData.kode_pos,
                                    area_id: guestFormData.area_id,
                                    is_dropship: isDropship,
                                    dropship_pengirim: dropshipSender,
                                    dropship_telepon: dropshipPhone,
                                }}
                                onFieldChange={handleFieldChange}
                                errors={errors}
                                selectedAreaText={selectedAreaText}
                                onAreaSelect={handleAreaSelect}
                            />

                            <ShipmentMethodSection
                                selectedCourier={selectedCourier}
                                onOpenModal={() => setIsShipmentModalOpen(true)}
                                error={errors.kurir}
                                isLoading={isLoadingCouriers}
                            />

                            <PaymentMethodSection
                                selectedPayment={selectedPayment}
                                onOpenModal={() => setIsPaymentModalOpen(true)}
                                error={errors.metode_pembayaran}
                            />
                        </div>

                        {/* Ringkasan Biaya Belanja */}
                        <div className="lg:col-span-5 sticky top-24">
                            <OrderSummarySection
                                items={cartItems}
                                subtotal={subtotal}
                                productDiscount={productDiscount}
                                shippingCost={shippingCost}
                                totalWeightKg={totalWeightKg}
                                insuranceFee={insuranceFee}
                                hasInsurance={hasInsurance}
                                appliedVoucher={appliedVoucher}
                                voucherDiscount={voucherDiscount}
                                loyaltyPoints={loyaltyPoint}
                                useLoyaltyPoints={useLoyaltyPoints}
                                onToggleLoyaltyPoints={setUseLoyaltyPoints}
                                loyaltyDiscount={loyaltyDiscount}
                                totalPayment={totalPayment}
                                deliveryMessage={deliveryMessage}
                                onOpenDeliveryMessageModal={openMessageModal}
                                onOpenVoucherModal={openVoucherModal}
                                onSubmitOrder={handleOrderSubmit}
                                isSubmitting={isSubmitting}
                            />
                        </div>
                    </div>
                </main>

                {/* Modals */}
                <ShipmentSelectModal
                    isOpen={isShipmentModalOpen}
                    onClose={() => setIsShipmentModalOpen(false)}
                    couriers={availableCouriers}
                    selectedCourierId={
                        selectedCourier.id || selectedCourier.kurir_kode
                    }
                    hasInsurance={hasInsurance}
                    onToggleInsurance={(checked) => setHasInsurance(checked)}
                    onConfirmCourier={(c) => setSelectedCourier(c)}
                />

                <PaymentSelectModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    selectedPaymentId={selectedPayment.id}
                    onConfirmPayment={(p) => setSelectedPayment(p)}
                />

                <AddressSelectModal
                    isOpen={isAddressModalOpen}
                    onClose={closeAddressModal}
                    addresses={addresses}
                    selectedAddressId={selectedAddress?.id || null}
                    onSelectAddress={(addr) => setSelectedAddress(addr)}
                    onOpenAddModal={() => handleSwitchToNewAddress()}
                    onOpenEditModal={(addr) => handleSwitchToNewAddress(addr)}
                />

                <AddressFormModal
                    isOpen={isNewAddressModalOpen}
                    onClose={closeNewAddressModal}
                    editingAddress={editingAddress}
                    onAddressSaved={(newAddr: AddressItem) => {
                        setSelectedAddress(newAddr);
                        closeNewAddressModal();
                    }}
                />

                <DeliveryMessageModal
                    isOpen={isMessageModalOpen}
                    onClose={closeMessageModal}
                    initialMessage={deliveryMessage}
                    onSaveMessage={(msg) => setDeliveryMessage(msg)}
                />

                <VoucherSelectModal
                    isOpen={isVoucherModalOpen}
                    onClose={closeVoucherModal}
                    vouchers={vouchers}
                    subtotal={subtotal}
                    appliedVoucher={appliedVoucher}
                    onApplyVoucher={(v) => setAppliedVoucher(v)}
                />

                <AuthModal
                    isOpen={isAuthModalOpen}
                    onClose={() => setIsAuthModalOpen(false)}
                />

                {/* Fullscreen Loading Overlay saat Memproses Pembayaran */}
                {isSubmitting && (
                    <div
                        className="fixed inset-0 z-100 flex flex-col items-center justify-center p-6 bg-slate-950/70 backdrop-blur-xs text-white text-center animate-fadeIn"
                        role="alert"
                        aria-live="assertive"
                    >
                        <div className="bg-white text-slate-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center space-y-4 border border-slate-100">
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-primary">
                                <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="text-base font-black text-slate-900">
                                    Menyiapkan Pesanan...
                                </h3>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Sedang menghubungkan transaksi Anda ke Midtrans &amp; Biteship secara aman. Mohon jangan menutup atau me-refresh halaman ini.
                                </p>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-primary h-full w-2/3 animate-pulse rounded-full" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
