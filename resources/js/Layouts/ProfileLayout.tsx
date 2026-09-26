import React, { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { User, Truck, Settings, LogOut, X } from "lucide-react";
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
import { Toaster } from "sonner";

interface ProfileLayoutProps {
    children: React.ReactNode;
    activeMenu: "myinfo" | "delivery" | "account";
}

export default function ProfileLayout({ children, activeMenu }: ProfileLayoutProps) {
    const { url, props } = usePage();
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
    const tutupKeranjang = useKeranjangStore((state) => state.tutupKeranjang);
    const storeCount = useKeranjangStore((state) => state.hitungJumlahTotal());

    const isAuthOpen = useAuthStore((state) => state.isOpen);
    const authTab = useAuthStore((state) => state.activeTab);
    const closeAuthModal = useAuthStore((state) => state.closeAuthModal);

    const handleAksiLogout = () => {
        setIsSubmittingLogout(true);
        router.post(
            "/logout",
            {},
            {
                onFinish: () => {
                    setIsSubmittingLogout(false);
                    setIsLogoutModalOpen(false);
                },
            }
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-slate-800 font-sans relative">
            <Toaster position="top-center" richColors theme="light" />

            {/* Bilah Atas Merah Resmi */}
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

            {/* Main Content Area */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* Left Sidebar: My Settings (Sesuai Screenshot 3, 4, 5) */}
                    <aside
                        aria-label="Pengaturan Profil"
                        className="md:col-span-4 lg:col-span-3 bg-white rounded-2xl p-6 shadow-xs border border-slate-100"
                    >
                        <h2 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">
                            My Settings
                        </h2>

                        <nav className="space-y-1" aria-label="Navigasi Pengaturan Akun">
                            {/* 1. My Profile Info */}
                            <Link
                                href="/profile/myinfo"
                                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    activeMenu === "myinfo"
                                        ? "text-primary font-bold bg-red-50/70"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                }`}
                            >
                                <User className={`w-5 h-5 ${activeMenu === "myinfo" ? "text-primary" : "text-slate-400"}`} />
                                <span>My Profile Info</span>
                            </Link>

                            {/* 2. Delivery info */}
                            <Link
                                href="/profile/delivery"
                                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    activeMenu === "delivery"
                                        ? "text-primary font-bold bg-red-50/70"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                }`}
                            >
                                <Truck className={`w-5 h-5 ${activeMenu === "delivery" ? "text-primary" : "text-slate-400"}`} />
                                <span>Delivery info</span>
                            </Link>

                            {/* 3. Account Information */}
                            <Link
                                href="/profile/account"
                                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    activeMenu === "account"
                                        ? "text-primary font-bold bg-red-50/70"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                }`}
                            >
                                <Settings className={`w-5 h-5 ${activeMenu === "account" ? "text-primary" : "text-slate-400"}`} />
                                <span>Account Information</span>
                            </Link>

                            {/* 4. Logout Action */}
                            <button
                                type="button"
                                onClick={() => setIsLogoutModalOpen(true)}
                                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50/50 transition-all text-left cursor-pointer"
                            >
                                <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-600" />
                                <span>Logout</span>
                            </button>
                        </nav>
                    </aside>

                    {/* Right Panel: Content Card */}
                    <div className="md:col-span-8 lg:col-span-9 bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-100">
                        {children}
                    </div>
                </div>
            </main>

            {/* Footer Standar Global CRSL Store */}
            <Footer />

            {/* Modal Logout Konfirmasi (Sesuai Screenshot 4) */}
            {isLogoutModalOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-logout-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
                >
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 transform animate-in zoom-in-95 duration-200 space-y-6">
                        <h3 id="modal-logout-title" className="text-xl font-bold text-slate-900">
                            Are you sure you want to logout?
                        </h3>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsLogoutModalOpen(false)}
                                disabled={isSubmittingLogout}
                                className="px-5 py-2.5 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50/50 rounded-full transition-colors cursor-pointer"
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                onClick={handleAksiLogout}
                                disabled={isSubmittingLogout}
                                className="px-7 py-2.5 bg-primary hover:bg-primary-hover active:scale-95 text-white text-sm font-bold rounded-full shadow-md transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isSubmittingLogout ? "Logging out..." : "Logout"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Hub (WhatsApp Chat Support, Available Voucher, Mascot) */}
            <FloatingActionHub cartCount={storeCount} onOpenCart={tutupKeranjang} />

            {/* Modals Global */}
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
