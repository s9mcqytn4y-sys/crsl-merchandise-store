import React, { useState, Fragment } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogDescription,
    DialogBackdrop,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import {
    User,
    Truck,
    Settings,
    LogOut,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { Toaster } from "sonner";
import BilahAtas from "../Components/BilahAtas";
import NavigasiUtama from "../Components/NavigasiUtama";
import FloatingActionHub from "../Components/FloatingActionHub";
import PreferensiModal from "../Components/PreferensiModal";
import PencarianModal from "../Components/PencarianModal";
import SideMenuDrawer from "../Components/SideMenuDrawer";
import DrawerKeranjang from "../Components/DrawerKeranjang";
import AuthModal from "../Components/AuthModal";
import AddToCartModal from "../Components/AddToCartModal";
import Footer from "../Components/Footer";
import { useAppStore } from "../Stores/useAppStore";
import { useKeranjangStore } from "../Stores/useKeranjangStore";
import { useAuthStore } from "../Stores/useAuthStore";
import { cn } from "../lib/utils";

interface ProfileLayoutProps {
    children: React.ReactNode;
    activeMenu: "myinfo" | "delivery" | "account";
    className?: string;
}

const MENU_ITEMS = [
    {
        key: "myinfo",
        label: "Informasi Profil",
        href: "/profile/myinfo",
        icon: User,
    },
    {
        key: "delivery",
        label: "Alamat Pengiriman",
        href: "/profile/delivery",
        icon: Truck,
    },
    {
        key: "account",
        label: "Pengaturan Akun",
        href: "/profile/account",
        icon: Settings,
    },
] as const;

export default function ProfileLayout({
    children,
    activeMenu,
    className,
}: ProfileLayoutProps) {
    const { props } = usePage();
    const authUser = (props as any)?.auth?.user;

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isSubmittingLogout, setIsSubmittingLogout] = useState(false);

    const {
        isSearchOpen,
        isMenuOpen,
        isPrefOpen,
        country,
        language,
        currency,
        openSearch,
        closeSearch,
        openMenu,
        closeMenu,
        openPref,
        closePref,
        setPreferences,
    } = useAppStore();

    const isCartOpen = useKeranjangStore((state) => state.isOpen);
    const bukaKeranjang = useKeranjangStore(
        (state) => (state as any).bukaKeranjang || (state as any).openCart,
    );
    const tutupKeranjang = useKeranjangStore((state) => state.tutupKeranjang);
    const storeCount = useKeranjangStore((state) => state.hitungJumlahTotal());

    const isAuthOpen = useAuthStore((state) => state.isOpen);
    const authTab = useAuthStore((state) => state.activeTab);
    const closeAuthModal = useAuthStore((state) => state.closeAuthModal);
    const resetAuth = useAuthStore((state) => (state as any).resetAuth);

    const handleAksiLogout = () => {
        setIsSubmittingLogout(true);
        router.post(
            "/logout",
            {},
            {
                onFinish: () => {
                    setIsSubmittingLogout(false);
                    setIsLogoutModalOpen(false);
                    if (typeof resetAuth === "function") {
                        resetAuth();
                    }
                },
            },
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-slate-800 font-sans relative select-none">
            <Toaster position="top-center" richColors theme="light" />

            {/* Bilah Atas Merah Resmi CRSL */}
            <BilahAtas />

            {/* Header Navigasi Utama */}
            <NavigasiUtama
                isMenuOpen={isMenuOpen}
                onMenuOpen={openMenu}
                onSearchOpen={openSearch}
                onPrefOpen={openPref}
                currency={currency}
                authUser={authUser}
            />

            {/* Main Content Viewport */}
            <main
                className={cn(
                    "flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12",
                    className,
                )}
            >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* Left Sidebar: Navigasi Pengaturan Akun */}
                    <aside
                        aria-label="Navigasi Pengaturan Akun"
                        className="md:col-span-4 lg:col-span-3 bg-white rounded-3xl p-5 sm:p-6 shadow-2xs border border-slate-200/90"
                    >
                        <h2 className="text-base sm:text-lg font-black text-slate-900 mb-5 tracking-tight">
                            Pengaturan Saya
                        </h2>

                        <nav
                            className="space-y-1.5"
                            aria-label="Menu Pengaturan Akun"
                        >
                            {MENU_ITEMS.map((item) => {
                                const isActive = activeMenu === item.key;
                                const IconComponent = item.icon;

                                return (
                                    <Link
                                        key={item.key}
                                        href={item.href}
                                        aria-current={
                                            isActive ? "page" : undefined
                                        }
                                        className={cn(
                                            "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all",
                                            isActive
                                                ? "text-[#E52027] bg-red-50/70 shadow-2xs"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                                        )}
                                    >
                                        <IconComponent
                                            className={cn(
                                                "w-4 h-4 stroke-[2.2] shrink-0",
                                                isActive
                                                    ? "text-[#E52027]"
                                                    : "text-slate-400",
                                            )}
                                        />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}

                            <div className="pt-2 my-1 border-t border-slate-100" />

                            {/* Tombol Logout */}
                            <button
                                type="button"
                                onClick={() => setIsLogoutModalOpen(true)}
                                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all text-left cursor-pointer"
                            >
                                <LogOut className="w-4 h-4 text-slate-400 hover:text-rose-600 stroke-[2.2] shrink-0" />
                                <span>Keluar Akun</span>
                            </button>
                        </nav>
                    </aside>

                    {/* Right Panel: Content Card */}
                    <div className="md:col-span-8 lg:col-span-9 bg-white rounded-3xl p-6 sm:p-8 shadow-2xs border border-slate-200/90">
                        {children}
                    </div>
                </div>
            </main>

            {/* Footer Standar Global CRSL Store */}
            <Footer />

            {/* Modal Dialog Konfirmasi Logout (Headless UI WAI-ARIA) */}
            <Transition show={isLogoutModalOpen} as={Fragment}>
                <Dialog
                    as="div"
                    id="modal-konfirmasi-logout"
                    className="relative z-50 select-none"
                    onClose={() =>
                        !isSubmittingLogout && setIsLogoutModalOpen(false)
                    }
                >
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <DialogBackdrop className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" />
                    </TransitionChild>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-200"
                                enterFrom="opacity-0 scale-95 -translate-y-2"
                                enterTo="opacity-100 scale-100 translate-y-0"
                                leave="ease-in duration-150"
                                leaveFrom="opacity-100 scale-100 translate-y-0"
                                leaveTo="opacity-0 scale-95 -translate-y-2"
                            >
                                <DialogPanel className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 text-left transition-all space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                                            <AlertCircle className="w-5 h-5 stroke-[2.2]" />
                                        </div>
                                        <div>
                                            <DialogTitle
                                                as="h3"
                                                className="text-base font-black text-slate-900 tracking-tight"
                                            >
                                                Konfirmasi Keluar
                                            </DialogTitle>
                                            <DialogDescription className="text-xs text-slate-500 mt-0.5">
                                                Apakah Anda yakin ingin keluar
                                                dari sesi akun CRSL Anda?
                                            </DialogDescription>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsLogoutModalOpen(false)
                                            }
                                            disabled={isSubmittingLogout}
                                            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            Batal
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleAksiLogout}
                                            disabled={isSubmittingLogout}
                                            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#E52027] hover:bg-[#CC1C22] active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            {isSubmittingLogout ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span>Memproses...</span>
                                                </>
                                            ) : (
                                                <span>Ya, Keluar Akun</span>
                                            )}
                                        </button>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Floating Action Hub dengan Handler Buka Keranjang yang Benar */}
            <FloatingActionHub
                cartCount={storeCount}
                onOpenCart={bukaKeranjang}
            />

            {/* Modals Global Toko */}
            <DrawerKeranjang isOpen={isCartOpen} onClose={tutupKeranjang} />
            <PreferensiModal
                isOpen={isPrefOpen}
                onClose={closePref}
                currentCountry={country}
                currentLanguage={language}
                currentCurrency={currency}
                onSavePreferences={setPreferences}
            />
            <PencarianModal isOpen={isSearchOpen} onClose={closeSearch} />
            <SideMenuDrawer isOpen={isMenuOpen} onClose={closeMenu} />
            <AddToCartModal />
            <AuthModal
                isOpen={isAuthOpen}
                initialTab={authTab === "register" ? "register" : "login"}
                onClose={closeAuthModal}
                onSuccessAuth={() => {
                    closeAuthModal();
                    router.reload();
                }}
            />
        </div>
    );
}
