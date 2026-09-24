import React, { useState, useEffect, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import StorefrontLayout from "../Layouts/StorefrontLayout";
import { useAuthStore } from "../Stores/useAuthStore";
import {
    Gift,
    Ticket,
    ChevronDown,
    User,
    Truck,
    Settings,
    LogOut,
    Plus,
    Trash2,
    Edit2,
    X,
} from "lucide-react";
import { toast } from "sonner";

interface OrderProductItem {
    id: number | string;
    nama: string;
    varian?: string;
    gambar?: string;
    harga: number;
    jumlah: number;
}

interface OrderItem {
    id: number | string;
    order_number: string;
    created_at: string;
    status:
        | "Cancelled"
        | "Completed"
        | "Processing"
        | "Pending Payment"
        | string;
    total: number;
    item_count: number;
    items: OrderProductItem[];
}

interface WishlistItem {
    id: number | string;
    nama: string;
    gambar?: string;
    harga: number;
    slug?: string;
}

interface DeliveryAddress {
    id: number | string;
    nama_penerima: string;
    telepon: string;
    email: string;
    alamat_lengkap: string;
}

interface AccountProps {
    user?: {
        name?: string;
        email?: string;
        birth_day?: string;
        birth_month?: string;
        birth_year?: string;
    } | null;
    orders?: OrderItem[];
    wishlists?: WishlistItem[];
    loyalty?: {
        tier?: string;
        progress_text?: string;
    };
    addresses?: DeliveryAddress[];
    initialView?: "dashboard" | "profile" | "delivery" | "account_info";
}

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
});

function formatRupiah(amount: number): string {
    return rupiahFormatter.format(amount || 0);
}

function EmptyBoxIcon() {
    return (
        <svg
            className="w-16 h-16 mx-auto text-slate-300 stroke-[1.2]"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M32 6L8 18V46L32 58L56 46V18L32 6Z" />
            <path d="M32 58V32" />
            <path d="M56 18L32 32L8 18" />
            <path d="M44 12L20 25" />
        </svg>
    );
}

export default function Account({
    user = null,
    orders = [],
    wishlists = [],
    loyalty = {
        tier: "Non-Member",
        progress_text: "Spend Rp 200,000 more to reach New Freen",
    },
    addresses = [
        {
            id: 1,
            nama_penerima: user?.name || "abdul music",
            telepon: "08567060477",
            email: user?.email || "abdulmusic543@gmail.com",
            alamat_lengkap:
                "johar baru johar baru, Jakarta Pusat, Johar Baru, Indonesia",
        },
    ],
    initialView = "dashboard",
}: AccountProps) {
    const isGuest = !user;
    const bukaAuth = useAuthStore((state) => state.bukaModal);

    const [viewMode, setViewMode] = useState<
        "dashboard" | "profile" | "delivery" | "account_info"
    >(initialView);

    const [activeTab, setActiveTab] = useState<"orders" | "wishlist">("orders");
    const [statusFilter, setStatusFilter] = useState("All status");

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [profileName, setProfileName] = useState(user?.name || "abdul music");
    const [profileEmail] = useState(user?.email || "abdulmusic543@gmail.com");
    const [bDay, setBDay] = useState(user?.birth_day || "14");
    const [bMonth, setBMonth] = useState(user?.birth_month || "09");
    const [bYear, setBYear] = useState(user?.birth_year || "2003");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get("tab");
            if (tabParam === "wishlist" || tabParam === "orders") {
                setActiveTab(tabParam);
            }
        }
    }, []);

    const handleTabChange = (tab: "orders" | "wishlist") => {
        setActiveTab(tab);
        const url = new URL(window.location.href);
        if (tab === "wishlist") {
            url.searchParams.set("tab", "wishlist");
        } else {
            url.searchParams.delete("tab");
        }
        window.history.replaceState({}, "", url.toString());
    };

    const filteredOrders = useMemo(() => {
        if (statusFilter === "All status") return orders;
        return orders.filter(
            (o) => o.status.toLowerCase() === statusFilter.toLowerCase(),
        );
    }, [orders, statusFilter]);

    const handleLogout = () => {
        router.post(
            "/logout",
            {},
            {
                onSuccess: () => {
                    toast.success("Berhasil keluar dari akun.");
                    setIsLogoutModalOpen(false);
                },
            },
        );
    };

    const handleDeleteAccount = () => {
        router.post(
            "/profil/hapus-akun",
            {},
            {
                onSuccess: () => {
                    toast.success("Akun Anda telah berhasil dihapus.");
                    setIsDeleteModalOpen(false);
                },
            },
        );
    };

    return (
        <StorefrontLayout>
            <Head title="Account — CRSL Official Store" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* ─── TAMPILAN 1: SUB-PENGATURAN / PROFILE SETTINGS ─── */}
                {viewMode !== "dashboard" ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                        {/* Navigasi Kiri: My Settings */}
                        <div className="md:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
                            <h3 className="font-bold text-base text-slate-900 mb-4 px-3">
                                My Settings
                            </h3>
                            <nav className="space-y-1 text-xs sm:text-sm font-semibold text-slate-600">
                                <button
                                    type="button"
                                    onClick={() => setViewMode("profile")}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                                        viewMode === "profile"
                                            ? "text-[#E52027] font-bold bg-red-50/60"
                                            : "hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                                >
                                    <User className="w-4 h-4" />
                                    My Profile Info
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode("delivery")}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                                        viewMode === "delivery"
                                            ? "text-[#E52027] font-bold bg-red-50/60"
                                            : "hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                                >
                                    <Truck className="w-4 h-4" />
                                    Delivery info
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode("account_info")}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                                        viewMode === "account_info"
                                            ? "text-[#E52027] font-bold bg-red-50/60"
                                            : "hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                                >
                                    <Settings className="w-4 h-4" />
                                    Account Information
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsLogoutModalOpen(true)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </nav>

                            <div className="pt-6 mt-6 border-t border-slate-100 px-3">
                                <button
                                    type="button"
                                    onClick={() => setViewMode("dashboard")}
                                    className="text-xs font-bold text-slate-500 hover:text-slate-900"
                                >
                                    ← Back to My Account
                                </button>
                            </div>
                        </div>

                        {/* Konten Kanan */}
                        <div className="md:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs">
                            {viewMode === "profile" && (
                                <div className="space-y-6 max-w-lg">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        My Profile Info
                                    </h2>

                                    <div className="space-y-4 text-xs sm:text-sm">
                                        <div>
                                            <label className="block text-[11px] text-slate-400 font-medium mb-1">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profileName}
                                                onChange={(e) =>
                                                    setProfileName(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#E52027]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] text-slate-400 font-medium mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={profileEmail}
                                                disabled
                                                className="w-full bg-slate-100/60 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] text-slate-400 font-medium mb-1">
                                                My Birthday
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="relative">
                                                    <span className="text-[10px] text-slate-400 block mb-0.5">
                                                        Day
                                                    </span>
                                                    <select
                                                        value={bDay}
                                                        onChange={(e) =>
                                                            setBDay(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full appearance-none bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 pr-8 focus:outline-none focus:border-[#E52027]"
                                                    >
                                                        {Array.from(
                                                            { length: 31 },
                                                            (_, i) => i + 1,
                                                        ).map((d) => (
                                                            <option
                                                                key={d}
                                                                value={String(
                                                                    d,
                                                                ).padStart(
                                                                    2,
                                                                    "0",
                                                                )}
                                                            >
                                                                {String(
                                                                    d,
                                                                ).padStart(
                                                                    2,
                                                                    "0",
                                                                )}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 bottom-3 pointer-events-none" />
                                                </div>

                                                <div className="relative">
                                                    <span className="text-[10px] text-slate-400 block mb-0.5">
                                                        Month
                                                    </span>
                                                    <select
                                                        value={bMonth}
                                                        onChange={(e) =>
                                                            setBMonth(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full appearance-none bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 pr-8 focus:outline-none focus:border-[#E52027]"
                                                    >
                                                        {Array.from(
                                                            { length: 12 },
                                                            (_, i) => i + 1,
                                                        ).map((m) => (
                                                            <option
                                                                key={m}
                                                                value={String(
                                                                    m,
                                                                ).padStart(
                                                                    2,
                                                                    "0",
                                                                )}
                                                            >
                                                                {String(
                                                                    m,
                                                                ).padStart(
                                                                    2,
                                                                    "0",
                                                                )}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 bottom-3 pointer-events-none" />
                                                </div>

                                                <div className="relative">
                                                    <span className="text-[10px] text-slate-400 block mb-0.5">
                                                        Year
                                                    </span>
                                                    <select
                                                        value={bYear}
                                                        onChange={(e) =>
                                                            setBYear(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full appearance-none bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 pr-8 focus:outline-none focus:border-[#E52027]"
                                                    >
                                                        {Array.from(
                                                            { length: 70 },
                                                            (_, i) => 2026 - i,
                                                        ).map((y) => (
                                                            <option
                                                                key={y}
                                                                value={String(
                                                                    y,
                                                                )}
                                                            >
                                                                {y}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 bottom-3 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {viewMode === "delivery" && (
                                <div className="space-y-6">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Buyer - Delivery info
                                    </h2>

                                    <div className="space-y-4">
                                        {addresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                className="border border-slate-200 rounded-2xl p-5 relative bg-slate-50/30 flex flex-col justify-between"
                                            >
                                                <div className="space-y-1 pr-16 text-xs sm:text-sm">
                                                    <h4 className="font-bold text-slate-900">
                                                        {addr.nama_penerima}
                                                    </h4>
                                                    <p className="text-slate-500 text-xs">
                                                        {addr.telepon} •{" "}
                                                        {addr.email}
                                                    </p>
                                                    <p className="text-slate-700 text-xs leading-relaxed pt-1">
                                                        {addr.alamat_lengkap}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 self-end mt-4">
                                                    <button
                                                        type="button"
                                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                        aria-label="Delete address"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                                        aria-label="Edit address"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                toast.info(
                                                    "Fitur tambah alamat pengiriman.",
                                                )
                                            }
                                            className="text-xs font-bold text-[#E52027] hover:underline inline-flex items-center gap-1 mt-2"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Add
                                            New
                                        </button>
                                    </div>
                                </div>
                            )}

                            {viewMode === "account_info" && (
                                <div className="space-y-4 max-w-lg">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Buyer - Account Information
                                    </h2>

                                    <div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsDeleteModalOpen(true)
                                            }
                                            className="px-5 py-2.5 border border-[#E52027] text-[#E52027] hover:bg-red-50 rounded-full text-xs font-bold transition-colors"
                                        >
                                            Delete My Account
                                        </button>
                                    </div>

                                    <div className="space-y-2 text-xs text-slate-500 leading-relaxed pt-2">
                                        <p>
                                            You will lose all your data in our
                                            webstore and will not be able to
                                            retrieve any content, such as
                                            personal informations, purchase
                                            history, points, and loyalty.
                                        </p>
                                        <p className="text-[#E52027] font-semibold">
                                            This action can't be undone.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* ─── TAMPILAN 2: DASHBOARD UTAMA ─── */
                    <div className="space-y-8">
                        {/* Greeting & Header Actions */}
                        {isGuest ? (
                            <div className="space-y-4">
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                                    My Account
                                </h1>
                                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-900">
                                            Join as a member to get more
                                            benefits
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            As a CRSL member, enjoy exclusive
                                            benefits, discounts, and earn points
                                            effortlessly with our free loyalty
                                            program.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2.5 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => bukaAuth("login")}
                                            className="px-5 py-2 border border-[#E52027] text-[#E52027] hover:bg-red-50 text-xs font-bold rounded-full transition-colors cursor-pointer"
                                        >
                                            Login
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => bukaAuth("register")}
                                            className="px-5 py-2 bg-[#E52027] hover:bg-[#CC1C22] text-white text-xs font-bold rounded-full transition-colors shadow-xs cursor-pointer"
                                        >
                                            Signup
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                                    Hi {user?.name || "abdul music"}
                                </h1>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-3.5 py-1.5 rounded-lg border border-slate-200">
                                        Reseller Access is Requested
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode("profile")}
                                        className="text-xs font-bold text-[#E52027] border border-[#E52027] hover:bg-red-50 px-4 py-1.5 rounded-full transition-colors"
                                    >
                                        Settings
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Kartu Informasi Loyalty & Vouchers */}
                        {!isGuest && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                {/* Loyalty Card */}
                                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between min-h-[140px]">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs sm:text-sm font-bold text-slate-800">
                                            Loyalty
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toast.info(
                                                    "Detail Loyalty Rewards",
                                                )
                                            }
                                            className="text-xs font-bold text-[#E52027] hover:underline"
                                        >
                                            See Details
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3.5 mt-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                                            <Gift className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                                                {loyalty.tier || "Non-Member"}
                                            </h4>
                                            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                                                {loyalty.progress_text ||
                                                    "Spend Rp 200,000 more to reach New Freen"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* My Vouchers Card */}
                                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between min-h-[140px]">
                                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                                        My Vouchers
                                    </span>
                                    <div className="text-center py-2 space-y-1">
                                        <Ticket className="w-7 h-7 mx-auto text-slate-300" />
                                        <h5 className="font-bold text-xs text-slate-800">
                                            No vouchers available
                                        </h5>
                                        <p className="text-[11px] text-slate-400">
                                            You don't have any vouchers at the
                                            moment
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Switcher: Orders vs Wishlist */}
                        <div className="border-b border-slate-200">
                            <div className="flex justify-center max-w-md mx-auto text-xs sm:text-sm font-bold">
                                <button
                                    type="button"
                                    onClick={() => handleTabChange("orders")}
                                    className={`flex-1 py-3 text-center transition-all relative ${
                                        activeTab === "orders"
                                            ? "text-slate-900 font-extrabold"
                                            : "text-slate-400 hover:text-slate-700"
                                    }`}
                                >
                                    Orders
                                    {activeTab === "orders" && (
                                        <span className="absolute bottom-0 inset-x-0 h-0.5 bg-slate-900" />
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTabChange("wishlist")}
                                    className={`flex-1 py-3 text-center transition-all relative ${
                                        activeTab === "wishlist"
                                            ? "text-slate-900 font-extrabold"
                                            : "text-slate-400 hover:text-slate-700"
                                    }`}
                                >
                                    Wishlist
                                    {activeTab === "wishlist" && (
                                        <span className="absolute bottom-0 inset-x-0 h-0.5 bg-slate-900" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Tab 1: Orders */}
                        {activeTab === "orders" && (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                                        My Orders ({orders.length})
                                    </h3>

                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                        <Link
                                            href="/lacak"
                                            className="text-xs font-bold text-[#E52027] hover:underline"
                                        >
                                            Find your Orders
                                        </Link>

                                        <div className="relative">
                                            <select
                                                value={statusFilter}
                                                onChange={(e) =>
                                                    setStatusFilter(
                                                        e.target.value,
                                                    )
                                                }
                                                className="appearance-none bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 pr-8 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-400 shadow-2xs cursor-pointer"
                                            >
                                                <option value="All status">
                                                    All status
                                                </option>
                                                <option value="Pending Payment">
                                                    Pending Payment
                                                </option>
                                                <option value="Processing">
                                                    Processing
                                                </option>
                                                <option value="Completed">
                                                    Completed
                                                </option>
                                                <option value="Cancelled">
                                                    Cancelled
                                                </option>
                                            </select>
                                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {filteredOrders.length === 0 ? (
                                    <div className="py-20 text-center space-y-2">
                                        <EmptyBoxIcon />
                                        <h4 className="font-bold text-sm text-slate-800 pt-2">
                                            No Orders Found
                                        </h4>
                                        <p className="text-xs text-slate-400">
                                            Place an order to see it listed
                                            here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredOrders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4"
                                            >
                                                <div className="flex justify-between items-start text-xs sm:text-sm">
                                                    <div>
                                                        <span className="font-bold text-slate-900 block">
                                                            Order #
                                                            {order.order_number}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                                                            {order.created_at}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs font-semibold text-slate-500">
                                                        {order.status}
                                                    </span>
                                                </div>

                                                <div className="divide-y divide-slate-100">
                                                    {order.items?.map(
                                                        (item) => (
                                                            <div
                                                                key={item.id}
                                                                className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                                                            >
                                                                <div className="flex items-center gap-3.5 min-w-0">
                                                                    <img
                                                                        src={
                                                                            item.gambar ||
                                                                            "/assets/gambar/placeholder.webp"
                                                                        }
                                                                        alt={
                                                                            item.nama
                                                                        }
                                                                        className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0"
                                                                    />
                                                                    <div className="min-w-0">
                                                                        <h5 className="font-medium text-xs text-slate-800 truncate">
                                                                            {
                                                                                item.nama
                                                                            }
                                                                        </h5>
                                                                        {item.varian && (
                                                                            <span className="text-[10px] text-slate-400 uppercase font-semibold block mt-0.5">
                                                                                {
                                                                                    item.varian
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right shrink-0">
                                                                    <span className="text-xs font-bold text-slate-900 block">
                                                                        {formatRupiah(
                                                                            item.harga,
                                                                        )}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                                                        x
                                                                        {
                                                                            item.jumlah
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>

                                                <div className="border-t border-slate-100 pt-3 text-right text-xs">
                                                    <span className="text-slate-400 mr-1.5">
                                                        {order.item_count || 1}{" "}
                                                        items:
                                                    </span>
                                                    <span className="font-bold text-slate-900">
                                                        {formatRupiah(
                                                            order.total,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab 2: Wishlist */}
                        {activeTab === "wishlist" && (
                            <div>
                                {wishlists.length === 0 ? (
                                    <div className="py-20 text-center space-y-2">
                                        <EmptyBoxIcon />
                                        <h4 className="font-bold text-sm text-slate-800 pt-2">
                                            Your Wishlist is Empty
                                        </h4>
                                        <p className="text-xs text-slate-400">
                                            Please check back later for updates.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {wishlists.map((prod) => (
                                            <Link
                                                key={prod.id}
                                                href={`/produk/${prod.slug || prod.id}`}
                                                className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
                                            >
                                                <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 mb-2">
                                                    <img
                                                        src={
                                                            prod.gambar ||
                                                            "/assets/gambar/placeholder.webp"
                                                        }
                                                        alt={prod.nama}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <h5 className="font-medium text-xs text-slate-800 truncate">
                                                        {prod.nama}
                                                    </h5>
                                                    <span className="font-bold text-xs text-[#E52027] block">
                                                        {formatRupiah(
                                                            prod.harga,
                                                        )}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Logout */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 text-left space-y-6">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                            Are you sure you want to logout?
                        </h3>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsLogoutModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="px-6 py-2 bg-[#E52027] hover:bg-[#CC1C22] text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Delete Account */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <h3 className="font-bold text-base text-slate-900">
                                Delete Account
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Apakah Anda benar-benar yakin ingin menghapus akun
                            ini secara permanen? Seluruh data riwayat transaksi,
                            loyalty reward, dan alamat Anda akan dihapus
                            selamanya.
                        </p>
                        <div className="flex justify-end gap-2.5 pt-3">
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Batalkan
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                className="px-5 py-2 text-xs font-bold text-white bg-[#E52027] hover:bg-[#CC1C22] rounded-xl transition-colors shadow-xs"
                            >
                                Ya, Hapus Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </StorefrontLayout>
    );
}
