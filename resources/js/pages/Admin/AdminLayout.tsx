import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    TicketPercent,
    Store,
    Menu,
    X,
    LogOut,
    UserCircle,
    Bell,
    ChevronRight,
} from "lucide-react";
import { Toaster } from "sonner";
import { cn } from "../../lib/utils";

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
}

interface SharedAuthUser {
    id: number;
    name: string;
    email: string;
    peran?: string;
    avatar?: string | null;
}

export default function AdminLayout({
    children,
    title = "Admin Portal",
}: AdminLayoutProps) {
    const { url, props } = usePage<{
        auth?: { user?: SharedAuthUser };
        flash?: { sukses?: string; error?: string; info?: string };
    }>();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const user = props.auth?.user;

    const navItems = [
        {
            name: "Dashboard",
            href: "/admin",
            icon: LayoutDashboard,
            active: url === "/admin",
        },
        {
            name: "Kelola Pesanan",
            href: "/admin/pesanan",
            icon: ShoppingBag,
            active: url.startsWith("/admin/pesanan"),
        },
        {
            name: "Katalog & Stok",
            href: "/admin/produk",
            icon: Package,
            active: url.startsWith("/admin/produk"),
        },
        {
            name: "Voucher Diskon",
            href: "/admin/voucher",
            icon: TicketPercent,
            active: url.startsWith("/admin/voucher"),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased font-sans">
            <Toaster position="top-right" richColors />

            {/* Mobile Top Header */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5">
                    <img
                        src="/favicon.webp"
                        alt="Logo CRSL"
                        className="w-7 h-7 object-contain"
                    />
                    <span className="font-black text-sm tracking-wider text-white">
                        CRSL <span className="text-red-500">ADMIN</span>
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    aria-label="Toggle menu navigasi"
                >
                    {isSidebarOpen ? (
                        <X className="w-5 h-5" />
                    ) : (
                        <Menu className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Sidebar Navigation */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div>
                    {/* Brand Header */}
                    <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
                        <Link
                            href="/admin"
                            className="flex items-center gap-3 group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform">
                                <img
                                    src="/favicon.webp"
                                    alt="CRSL"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="font-black text-sm tracking-wide text-white flex items-center gap-1.5">
                                    CRSL STUDIO
                                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                                        CMS
                                    </span>
                                </h1>
                                <p className="text-[11px] text-slate-400 font-medium">
                                    Control Management System
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <nav className="p-4 space-y-1.5">
                        <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Menu Utama
                        </p>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={cn(
                                        "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all",
                                        item.active
                                            ? "bg-red-600 text-white shadow-md shadow-red-600/20 font-extrabold"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800/60",
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="w-4 h-4 stroke-[2.2]" />
                                        <span>{item.name}</span>
                                    </div>
                                    {item.active && (
                                        <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                                    )}
                                </Link>
                            );
                        })}

                        <div className="pt-4 mt-4 border-t border-slate-800/60">
                            <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                Tautan Cepat
                            </p>
                            <Link
                                href="/"
                                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
                            >
                                <Store className="w-4 h-4" />
                                <span>Lihat Storefront Toko</span>
                            </Link>
                        </div>
                    </nav>
                </div>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-slate-800/60 bg-slate-900/50">
                    <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-800/50 border border-slate-800">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs shrink-0">
                                {user?.name?.charAt(0) || "A"}
                            </div>
                            <div className="truncate">
                                <p className="text-xs font-bold text-white truncate">
                                    {user?.name || "Administrator"}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono capitalize">
                                    {user?.peran || "Owner"}
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Keluar dari Admin"
                        >
                            <LogOut className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Backdrop for Mobile Sidebar */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden"
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
                {/* Desktop Top Navbar */}
                <header className="hidden md:flex items-center justify-between px-8 py-4 bg-slate-900/50 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-20">
                    <div>
                        <h2 className="text-base font-extrabold text-white tracking-tight">
                            {title}
                        </h2>
                        <p className="text-xs text-slate-400">
                            Pusat Operasional E-Commerce Resmi CRSL
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Sistem Online
                        </span>
                        <Link
                            href="/"
                            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5"
                        >
                            <Store className="w-3.5 h-3.5" />
                            <span>Buka Toko</span>
                        </Link>
                    </div>
                </header>

                {/* Page Body */}
                <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
