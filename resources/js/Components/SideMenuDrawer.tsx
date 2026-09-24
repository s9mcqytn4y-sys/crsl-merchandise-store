import React, { Fragment } from "react";
import { Link } from "@inertiajs/react";
import { Transition, Dialog } from "@headlessui/react";
import { X, LogOut, LogIn, User, Sparkles } from "lucide-react";
import { SITUS_CONFIG } from "../Config/situsConfig";

interface NavigasiItem {
    label: string;
    href: string;
    isHighlight?: boolean;
    badgeText?: string;
}

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

interface SideMenuDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    authUser?: AuthUser | null;
    onOpenAuth?: () => void;
    onLogout?: () => void;
}

export default function SideMenuDrawer({
    isOpen,
    onClose,
    authUser,
    onOpenAuth,
    onLogout,
}: SideMenuDrawerProps) {
    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                id="side-menu-drawer"
                className="relative z-50"
                onClose={onClose}
            >
                {/* Backdrop Blur Overlay */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" />
                </Transition.Child>

                {/* Sliding Drawer Container */}
                <div className="fixed inset-0 overflow-hidden">
                    <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
                        <Transition.Child
                            as={Fragment}
                            enter="transform transition ease-out duration-300"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transform transition ease-in duration-250"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="pointer-events-auto w-[85vw] max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col h-full">
                                {/* Header Drawer */}
                                <div className="h-16 px-4 sm:px-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                                    <Dialog.Title className="sr-only">
                                        Menu Navigasi
                                    </Dialog.Title>

                                    <Link
                                        href="/"
                                        onClick={onClose}
                                        className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-[#E52027] focus-visible:outline-none rounded-lg py-1"
                                        aria-label="Beranda CRSL"
                                    >
                                        <img
                                            src="/assets/gambar/logo-crsl.png"
                                            alt="Logo CRSL"
                                            width={32}
                                            height={32}
                                            className="h-8 w-auto object-contain"
                                        />
                                        <span className="font-black text-base text-[#E52027] tracking-wider">
                                            CRSL
                                        </span>
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-2 -mr-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-[#E52027] focus-visible:outline-none"
                                        aria-label="Tutup menu"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Menu List dengan Custom Scrollbar Halus */}
                                <nav
                                    className="flex-1 overflow-y-auto px-3 py-4 space-y-1 overscroll-contain [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]"
                                    aria-label="Menu kategori produk"
                                >
                                    <ul className="space-y-1" role="list">
                                        {SITUS_CONFIG.navigasiKategori.map(
                                            (item: NavigasiItem) => (
                                                <li
                                                    key={
                                                        item.href || item.label
                                                    }
                                                >
                                                    <Link
                                                        href={item.href}
                                                        onClick={onClose}
                                                        className={`group flex items-center justify-between py-2.5 px-3.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                                                            item.isHighlight
                                                                ? "bg-red-50/70 text-[#E52027] font-bold hover:bg-red-100/70"
                                                                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                                        }`}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            {item.isHighlight && (
                                                                <Sparkles className="w-4 h-4 text-[#E52027] shrink-0" />
                                                            )}
                                                            {item.label}
                                                        </span>

                                                        {item.isHighlight && (
                                                            <span className="text-[10px] uppercase tracking-wider font-extrabold bg-[#E52027] text-white px-2 py-0.5 rounded-md">
                                                                Hot
                                                            </span>
                                                        )}
                                                    </Link>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </nav>

                                {/* Footer Drawer (User & Auth Session) */}
                                <div className="border-t border-slate-100 p-4 pb-6 sm:pb-4 space-y-2 bg-slate-50/70 shrink-0">
                                    {authUser ? (
                                        <>
                                            <Link
                                                href="/akun"
                                                onClick={onClose}
                                                className="flex items-center gap-3 p-2.5 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-all shadow-2xs"
                                                aria-label="Ke halaman akun saya"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E52027] flex items-center justify-center font-bold text-xs shrink-0">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-xs font-bold text-slate-900 truncate">
                                                        {authUser.name}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 truncate">
                                                        {authUser.email}
                                                    </div>
                                                </div>
                                            </Link>

                                            {onLogout && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        onClose();
                                                        onLogout();
                                                    }}
                                                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                                                    aria-label="Keluar dari akun"
                                                >
                                                    <LogOut className="w-3.5 h-3.5" />
                                                    Keluar Akun
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose();
                                                onOpenAuth?.();
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#E52027] hover:bg-[#CC1C22] active:scale-[0.99] shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-[#E52027] focus-visible:outline-none"
                                            aria-label="Masuk atau daftar akun"
                                        >
                                            <LogIn
                                                className="w-4 h-4"
                                                strokeWidth={2.5}
                                            />
                                            Masuk / Daftar
                                        </button>
                                    )}

                                    <p className="text-center text-[11px] text-slate-400 font-medium pt-1 select-none">
                                        Animals as your Bestfriends! 🐾
                                    </p>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
