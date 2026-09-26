import React, { useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import { Toaster, toast } from "sonner";
import BilahAtas from "../Components/BilahAtas";
import PengingatPesananBelumBayar from "../Components/PengingatPesananBelumBayar";
import NavigasiUtama from "../Components/NavigasiUtama";
import FloatingActionHub from "../Components/FloatingActionHub";
import PreferensiModal from "../Components/PreferensiModal";
import PencarianModal from "../Components/PencarianModal";
import SideMenuDrawer from "../Components/SideMenuDrawer";
import DrawerKeranjang from "../Components/DrawerKeranjang";
import AuthModal from "../Components/AuthModal";
import AddToCartModal from "../Components/AddToCartModal";
import StickyCartBar from "../Components/StickyCartBar";
import Footer from "../Components/Footer";
import { useAppStore } from "../Stores/useAppStore";
import { useKeranjangStore } from "../Stores/useKeranjangStore";
import { useAuthStore } from "../Stores/useAuthStore";
import type { AuthUser, SharedPageProps } from "../types";

interface StorefrontLayoutProps {
    children: React.ReactNode;
}

export default function StorefrontLayout({ children }: StorefrontLayoutProps) {
    const page = usePage<SharedPageProps>();
    const { flash, auth } = page.props;
    const currentUrl = page.url || "";


    // 1. Single Source of Truth: Keranjang dikontrol 100% oleh Zustand
    const isCartOpen = useKeranjangStore((state) => state.isOpen);
    const bukaKeranjang = useKeranjangStore((state) => state.bukaKeranjang);
    const tutupKeranjang = useKeranjangStore((state) => state.tutupKeranjang);

    // Hitung jumlah item secara reaktif langsung dari store aktif
    const totalItemKeranjang = useKeranjangStore((state) => {
        if (typeof state.hitungJumlahTotal === "function") {
            return state.hitungJumlahTotal();
        }
        return (state.items || []).reduce(
            (sum, item) => sum + (item.jumlah || 1),
            0,
        );
    });

    // 2. Granular Selectors untuk useAppStore (Mencegah Unnecessary Re-render)
    const isSearchOpen = useAppStore((state) => state.isSearchOpen);
    const isMenuOpen = useAppStore((state) => state.isMenuOpen);
    const isPrefOpen = useAppStore((state) => state.isPrefOpen);
    const country = useAppStore((state) => state.country);
    const language = useAppStore((state) => state.language);
    const currency = useAppStore((state) => state.currency);

    const openSearch = useAppStore((state) => state.openSearch);
    const closeSearch = useAppStore((state) => state.closeSearch);
    const openMenu = useAppStore((state) => state.openMenu);
    const closeMenu = useAppStore((state) => state.closeMenu);
    const openPref = useAppStore((state) => state.openPref);
    const closePref = useAppStore((state) => state.closePref);
    const setPreferences = useAppStore((state) => state.setPreferences);

    // 3. Auth Modal Store
    const isAuthOpen = useAuthStore((state) => state.isOpen);
    const authTab = useAuthStore((state) => state.activeTab);
    const closeAuthModal = useAuthStore((state) => state.closeAuthModal);
    const openAuthModal = useAuthStore((state) => state.openAuthModal);

    // 4. Handle Flash Messages via Sonner Toast (Anti-CLS)
    useEffect(() => {
        if (flash?.sukses) {
            toast.success(flash.sukses);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.info) {
            toast.info(flash.info);
        }
    }, [flash]);

    return (
        <div className="min-h-dvh flex flex-col bg-slate-50 text-slate-800 font-sans relative antialiased selection:bg-red-500 selection:text-white">
            {/* Toast Notification Container */}
            <Toaster
                position="top-center"
                richColors
                theme="light"
                toastOptions={{
                    style: {
                        borderRadius: "16px",
                    },
                }}
            />

            {/* Aksesibilitas: Skip Link untuk Keyboard Navigation */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-slate-900 focus:text-white focus:rounded-xl focus:shadow-lg focus:outline-none"
            >
                Lewati ke Konten Utama
            </a>

            {/* Pengingat Pesanan Belum Bayar (Screenshot #2) */}
            <PengingatPesananBelumBayar />

            {/* Announcement Bar */}
            <BilahAtas />

            {/* Main Navigation Bar */}
            <NavigasiUtama
                isMenuOpen={isMenuOpen}
                onMenuOpen={openMenu}
                onSearchOpen={openSearch}
                onPrefOpen={openPref}
                currency={currency}
                authUser={auth?.user}
            />

            {/* Main Content Area */}
            <main
                id="main-content"
                className="flex-1 pb-24 md:pb-28 focus:outline-none"
            >
                {children}
            </main>

            {/* Sticky Cart Notification Bar (Mobile / Responsive) - Sembunyikan pada checkout/account */}
            {!currentUrl.startsWith("/account") &&
                !currentUrl.startsWith("/profile") &&
                !currentUrl.startsWith("/pembayaran") &&
                !currentUrl.startsWith("/checkout") && <StickyCartBar />}

            {/* Main Footer */}
            <Footer />

            {/* Drawer Keranjang: Terhubung Murni ke Zustand */}
            <DrawerKeranjang isOpen={isCartOpen} onClose={tutupKeranjang} />

            {/* Modal Preferensi (Mata Uang, Bahasa, Wilayah) */}
            <PreferensiModal
                isOpen={isPrefOpen}
                onClose={closePref}
                currentCountry={country}
                currentLanguage={language}
                currentCurrency={currency}
                onSavePreferences={setPreferences}
            />

            {/* Modal Pencarian Global */}
            <PencarianModal isOpen={isSearchOpen} onClose={closeSearch} />

            {/* Drawer Menu Samping (Mobile) */}
            <SideMenuDrawer
                isOpen={isMenuOpen}
                onClose={closeMenu}
                authUser={auth?.user}
                onOpenAuth={() => openAuthModal("login")}
                onLogout={() => router.post("/logout")}
            />

            {/* Floating Action Hub (CS WhatsApp, Voucher, Shortcut Keranjang) */}
            <FloatingActionHub
                cartCount={totalItemKeranjang}
                onOpenCart={bukaKeranjang}
            />

            {/* Global Quick Add-to-Cart Modal */}
            <AddToCartModal />

            {/* Global Authentication Modal */}
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
