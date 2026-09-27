import React, {
    useState,
    useMemo,
    useEffect,
    useCallback,
    useRef,
} from "react";
import { Head, router, Link } from "@inertiajs/react";
import { ArrowLeft, Check, ChevronRight, Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";

import { useCheckoutStore } from "../Stores/useCheckoutStore";
import { useKeranjangStore } from "../Stores/useKeranjangStore";
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

interface UserProfile {
    id: number;
    name: string;
    email: string;
    telepon?: string;
}

export interface ExtendedCartItem extends CartItem {
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

interface AreaSelection {
    id: string;
    provinsi: string;
    kota: string;
    kecamatan: string;
    kode_pos?: string;
}

interface CourierApiResponse {
    sukses: boolean;
    data: Array<{
        kurir_kode: string;
        layanan_kode?: string;
        layanan?: string;
        layanan_nama?: string;
        kurir_layanan?: string;
        kurir_nama?: string;
        nama?: string;
        harga: number | string;
        estimasi_hari?: string;
        estimasi?: string;
        etd?: string;
        ikon?: string;
        logo_url?: string;
    }>;
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

const INSURANCE_FEE = 2500;

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
    // 1. External Store Selectors
    const storeKeranjangItems = useKeranjangStore((state) => state.items);
    const kosongkanKeranjang = useKeranjangStore((state) => state.kosongkan);

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

    // 2. Buy Now Initialization
    const [isBuyNowMode, setIsBuyNowMode] = useState<boolean>(false);
    const [buyNowItem, setBuyNowItem] = useState<ExtendedCartItem | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const isBuyNowQuery = params.get("buy_now") === "1";
        const storedItem = sessionStorage.getItem("crsl_buy_now_item");

        if (storedItem) {
            try {
                const parsed = JSON.parse(storedItem);
                if (parsed?.id || parsed?.produk_id) {
                    setBuyNowItem(parsed);
                    setIsBuyNowMode(true);
                    return;
                }
            } catch {
                sessionStorage.removeItem("crsl_buy_now_item");
            }
        }

        if (isBuyNowQuery) setIsBuyNowMode(true);
    }, []);

    // 3. Normalized Cart Items
    const cartItems: ExtendedCartItem[] = useMemo(() => {
        if (isBuyNowMode && buyNowItem) return [buyNowItem];

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

        if (Array.isArray(keranjang)) return keranjang;
        if (keranjang && typeof keranjang === "object")
            return Object.values(keranjang);

        return [];
    }, [isBuyNowMode, buyNowItem, storeKeranjangItems, keranjang]);

    // 4. Address & Guest State
    const [selectedAddress, setSelectedAddress] = useState<AddressItem | null>(
        () => alamatUtama || (addresses.length > 0 ? addresses[0] : null),
    );

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
    });

    const [selectedAreaText, setSelectedAreaText] = useState<string>("");

    useEffect(() => {
        if (!selectedAddress && addresses.length > 0) {
            setSelectedAddress(alamatUtama || addresses[0]);
        }
    }, [addresses, alamatUtama, selectedAddress]);

    // 5. Courier Dynamic Calculation with AbortController
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
    const [appliedVoucher, setAppliedVoucher] = useState<VoucherItem | null>(
        null,
    );

    // Modals & Submission State
    const [isShipmentModalOpen, setIsShipmentModalOpen] =
        useState<boolean>(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] =
        useState<boolean>(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Keep active courier aligned when available options change
    useEffect(() => {
        if (availableCouriers.length > 0) {
            setSelectedCourier((prev) => {
                const match = availableCouriers.find(
                    (c) => c.id === prev.id || c.kurir_kode === prev.kurir_kode,
                );
                return match || availableCouriers[0];
            });
        }
    }, [availableCouriers]);

    // Shipping Rate Calculation Effect
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const destinationAreaId =
            selectedAddress?.area_id || guestFormData.area_id;
        if (!destinationAreaId || cartItems.length === 0) return;

        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoadingCouriers(true);

        const fetchShippingRates = async () => {
            try {
                const response = await fetch("/api/wilayah/ongkir", {
                    method: "POST",
                    signal: controller.signal,
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

                const resJson: CourierApiResponse = await response.json();
                if (
                    resJson?.sukses &&
                    Array.isArray(resJson.data) &&
                    resJson.data.length > 0
                ) {
                    const mapped: CourierOption[] = resJson.data.map(
                        (item) => ({
                            id: `${item.kurir_kode}_${item.layanan_kode || item.layanan || "reg"}`,
                            kurir_kode: item.kurir_kode,
                            nama: item.kurir_nama || item.nama || "Kurir",
                            layanan:
                                item.layanan_nama ||
                                item.layanan ||
                                item.kurir_layanan ||
                                "Reguler",
                            biaya: Number(item.harga) || 0,
                            etd:
                                item.estimasi_hari ||
                                item.estimasi ||
                                item.etd ||
                                "2 - 3 hari",
                            ikon: item.ikon || item.logo_url,
                        }),
                    );
                    setDynamicCouriers(mapped);
                }
            } catch (err: unknown) {
                if (err instanceof DOMException && err.name === "AbortError")
                    return;
                console.warn("Gagal sinkronisasi ongkir kurir:", err);
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoadingCouriers(false);
                }
            }
        };

        fetchShippingRates();

        return () => controller.abort();
    }, [selectedAddress?.area_id, guestFormData.area_id, cartItems]);

    // 6. Unified Financial Breakdown
    const calculation = useMemo(() => {
        const computedSubtotal =
            cartItems.length > 0
                ? cartItems.reduce(
                      (acc, it) =>
                          acc +
                          (Number(it.harga) || 0) * (Number(it.jumlah) || 1),
                      0,
                  )
                : rawSubtotal;

        const productDiscount = cartItems.reduce((acc, it) => {
            const original = Number(it.harga_asli) || Number(it.harga) || 0;
            const current = Number(it.harga) || 0;
            const qty = Number(it.jumlah) || 1;
            return acc + (original > current ? (original - current) * qty : 0);
        }, 0);

        const totalGrams = cartItems.reduce((acc, it) => {
            const itemWeight = Number(it.berat_gram ?? it.weight ?? 350);
            return acc + itemWeight * (Number(it.jumlah) || 1);
        }, 0);
        const totalWeightKg = Math.max(
            0.1,
            Math.round((totalGrams / 1000) * 100) / 100,
        );

        const voucherDiscount = appliedVoucher
            ? appliedVoucher.tipe === "persen"
                ? (computedSubtotal * Number(appliedVoucher.nilai)) / 100
                : Number(appliedVoucher.nilai) || 0
            : 0;

        const loyaltyDiscount =
            useLoyaltyPoints && loyaltyPoint
                ? Math.min(Number(loyaltyPoint), computedSubtotal)
                : 0;

        const shippingCost = Number(selectedCourier?.biaya) || 0;
        const effectiveInsuranceFee = hasInsurance ? INSURANCE_FEE : 0;

        const totalPayment = Math.max(
            0,
            computedSubtotal +
                shippingCost +
                effectiveInsuranceFee -
                voucherDiscount -
                loyaltyDiscount,
        );

        return {
            subtotal: computedSubtotal,
            productDiscount,
            totalWeightKg,
            voucherDiscount,
            loyaltyDiscount,
            shippingCost,
            effectiveInsuranceFee,
            totalPayment,
        };
    }, [
        cartItems,
        rawSubtotal,
        appliedVoucher,
        useLoyaltyPoints,
        loyaltyPoint,
        selectedCourier?.biaya,
        hasInsurance,
    ]);

    // 7. Navigation & Form Actions
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

    const handleAreaSelect = (area: AreaSelection) => {
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
        if (field === "is_dropship") return setIsDropship(Boolean(value));
        if (field === "dropship_pengirim")
            return setDropshipSender(String(value));
        if (field === "dropship_telepon")
            return setDropshipPhone(String(value));

        setGuestFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleSwitchToNewAddress = (addrToEdit?: AddressItem) => {
        closeAddressModal();
        openNewAddressModal(addrToEdit);
    };

    // 8. Order Submission
    const handleOrderSubmit = () => {
        setErrors({});

        if (cartItems.length === 0) {
            toast.warning("Keranjang belanja Anda masih kosong.");
            router.visit("/katalog");
            return;
        }

        const rawAreaId = selectedAddress
            ? (selectedAddress as Record<string, any>).biteship_area_id ||
              selectedAddress.area_id
            : guestFormData.area_id;

        const resolvedAreaId =
            rawAreaId && String(rawAreaId).trim() !== ""
                ? String(rawAreaId).trim()
                : undefined;

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
            ongkir: calculation.shippingCost,
            metode_pembayaran: selectedPayment.id,
            subtotal: calculation.subtotal,
            total: calculation.totalPayment,
            catatan: deliveryMessage,
            kode_voucher: appliedVoucher?.kode || null,
            use_loyalty_point: useLoyaltyPoints,
            is_dropship: isDropship,
            dropship_pengirim: dropshipSender,
            dropship_telepon: dropshipPhone,
            asuransi_pengiriman: hasInsurance,
            biaya_asuransi: calculation.effectiveInsuranceFee,
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

        const result = checkoutFormSchema.safeParse(payloadData);

        if (!result.success) {
            const formErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const key = String(issue.path[0]);
                if (!formErrors[key]) {
                    formErrors[key] =
                        issue.message || "Wajib diisi dengan benar.";
                }
            });

            setErrors(formErrors);
            const firstErrorMessage = Object.values(formErrors)[0];
            toast.error(
                firstErrorMessage ||
                    "Lengkapi data pengiriman bertanda bintang (*)",
            );
            window.scrollTo({ top: 120, behavior: "smooth" });
            return;
        }

        setIsSubmitting(true);

        router.post(
            "/checkout/proses",
            payloadData as unknown as Record<string, unknown>,
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    const flashError = (page.props as Record<string, any>)
                        ?.flash?.error;
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
                    const firstErr = Object.values(err)[0];
                    toast.error(
                        typeof firstErr === "string"
                            ? firstErr
                            : "Gagal memproses pesanan. Periksa data kembali.",
                    );
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
            <Head title="Checkout Pesanan - CRSL Official Store" />
            <Toaster position="top-center" richColors />

            {/* Banner Promo */}
            <div className="bg-primary text-white text-[11px] sm:text-xs font-bold py-2 text-center tracking-wider px-4">
                GRATIS ONGKIR SELURUH INDONESIA
            </div>

            {/* Header Sticky Navigation */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="inline-flex items-center gap-2 px-3 py-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-all font-bold text-xs cursor-pointer active:scale-95"
                            aria-label="Kembali"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Kembali</span>
                        </button>

                        <Link
                            href="/"
                            className="flex items-center gap-2 pl-2 border-l border-slate-200"
                            aria-label="Beranda CRSL"
                        >
                            <span className="font-black text-xl sm:text-2xl text-slate-950 tracking-tighter">
                                &lt;CRSL&#x2022;
                            </span>
                        </Link>
                    </div>

                    {/* Step Breadcrumbs */}
                    <nav
                        aria-label="Tahapan Checkout"
                        className="flex items-center gap-1.5 sm:gap-3 text-xs"
                    >
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px] font-bold">
                                <Check className="w-3 h-3 stroke-[2.5]" />
                            </span>
                            <span className="hidden md:inline">
                                1. Keranjang
                            </span>
                        </div>

                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                        <div className="flex items-center gap-1.5 bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[11px] font-black">
                                2
                            </span>
                            <span>Checkout &amp; Bayar</span>
                        </div>

                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[11px] font-bold">
                                3
                            </span>
                            <span className="hidden md:inline">Faktur</span>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Layout Grid Utama */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Kolom Kiri: Form & Opsi Logistik */}
                    <div className="lg:col-span-7 space-y-6 sm:space-y-8">
                        <AddressSection
                            user={user}
                            selectedAddress={selectedAddress}
                            onOpenSelectModal={openAddressModal}
                            onOpenAuthModal={() => setIsAuthModalOpen(true)}
                            formData={{
                                nama_penerima: guestFormData.nama_penerima,
                                email: guestFormData.email,
                                telepon: guestFormData.telepon,
                                alamat_lengkap: guestFormData.alamat_lengkap,
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

                    {/* Kolom Kanan: Ringkasan Order & Checkout CTA */}
                    <div className="lg:col-span-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
                        <OrderSummarySection
                            items={cartItems}
                            subtotal={calculation.subtotal}
                            productDiscount={calculation.productDiscount}
                            shippingCost={calculation.shippingCost}
                            totalWeightKg={calculation.totalWeightKg}
                            insuranceFee={INSURANCE_FEE}
                            hasInsurance={hasInsurance}
                            appliedVoucher={appliedVoucher}
                            voucherDiscount={calculation.voucherDiscount}
                            loyaltyPoints={loyaltyPoint}
                            useLoyaltyPoints={useLoyaltyPoints}
                            onToggleLoyaltyPoints={setUseLoyaltyPoints}
                            loyaltyDiscount={calculation.loyaltyDiscount}
                            totalPayment={calculation.totalPayment}
                            deliveryMessage={deliveryMessage}
                            onOpenDeliveryMessageModal={openMessageModal}
                            onOpenVoucherModal={openVoucherModal}
                            onSubmitOrder={handleOrderSubmit}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </div>
            </main>

            {/* Modals & Dialogs */}
            <ShipmentSelectModal
                isOpen={isShipmentModalOpen}
                onClose={() => setIsShipmentModalOpen(false)}
                couriers={availableCouriers}
                selectedCourierId={
                    selectedCourier.id || selectedCourier.kurir_kode
                }
                hasInsurance={hasInsurance}
                onToggleInsurance={setHasInsurance}
                onConfirmCourier={setSelectedCourier}
            />

            <PaymentSelectModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                selectedPaymentId={selectedPayment.id}
                onConfirmPayment={setSelectedPayment}
            />

            <AddressSelectModal
                isOpen={isAddressModalOpen}
                onClose={closeAddressModal}
                addresses={addresses}
                selectedAddressId={selectedAddress?.id || null}
                onSelectAddress={setSelectedAddress}
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
                onSaveMessage={setDeliveryMessage}
            />

            <VoucherSelectModal
                isOpen={isVoucherModalOpen}
                onClose={closeVoucherModal}
                vouchers={vouchers}
                subtotal={calculation.subtotal}
                appliedVoucher={appliedVoucher}
                onApplyVoucher={setAppliedVoucher}
            />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />

            {/* Overlay State Loader */}
            {isSubmitting && (
                <div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-950/70 backdrop-blur-sm text-white text-center"
                    role="alert"
                    aria-live="assertive"
                    aria-busy="true"
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
                                Menghubungkan transaksi Anda ke Midtrans &amp;
                                Biteship. Mohon tidak menutup halaman ini.
                            </p>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-primary h-full w-2/3 animate-pulse rounded-full" />
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
