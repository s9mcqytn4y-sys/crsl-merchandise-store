import React, { useEffect, useRef, useMemo } from "react";
import { Head, router, usePage } from "@inertiajs/react";
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
import type { SharedPageProps } from "../types";

interface StorefrontLayoutProps {
    children: React.ReactNode;
}

export default function StorefrontLayout({ children }: StorefrontLayoutProps) {
    const page = usePage<SharedPageProps>();
    const { flash, auth } = page.props;
    const currentUrl = page.url || "";
    const pageComponent = page.component || "";

    // 1. Selector Keranjang (Zustand)
    const isCartOpen = useKeranjangStore((state) => state.isOpen);
    const bukaKeranjang = useKeranjangStore((state) => state.bukaKeranjang);
    const tutupKeranjang = useKeranjangStore((state) => state.tutupKeranjang);

    const totalItemKeranjang = useKeranjangStore((state) => {
        if (typeof state.hitungJumlahTotal === "function") {
            return state.hitungJumlahTotal();
        }
        return (state.items || []).reduce(
            (sum, item) => sum + (item.jumlah || 1),
            0,
        );
    });

    // 2. Selector UI Store (Granular)
    const isSearchOpen = useAppStore((state) => state.isSearchOpen);
    const isMenuOpen = useAppStore((state) => state.isMobileMenuOpen);
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

    // 3. Selector Auth Store
    const isAuthOpen = useAuthStore((state) => state.isOpen);
    const authTab = useAuthStore((state) => state.activeTab);
    const closeAuthModal = useAuthStore((state) => state.closeAuthModal);
    const openAuthModal = useAuthStore((state) => state.openAuthModal);

    // 4. Deteksi Halaman Bersih dari StickyCartBar (Pencegahan Tumpang Tindih UI)
    const shouldShowStickyCart = useMemo(() => {
        const blacklistRoutes = [
            "/account",
            "/profile",
            "/pembayaran",
            "/checkout",
            "/faktur",
            "/invoice",
            "/lacak",
            "/track",
        ];

        const isBlacklistedUrl = blacklistRoutes.some((route) =>
            currentUrl.toLowerCase().startsWith(route),
        );

        const blacklistComponents = [
            "Checkout",
            "Pembayaran",
            "Faktur",
            "LacakPesanan",
            "TrackOrder",
            "Akun",
            "Account",
            "ProfileAccount",
            "ProfileDelivery",
            "ProfileMyInfo",
        ];

        const isBlacklistedComponent =
            blacklistComponents.includes(pageComponent);

        return !isBlacklistedUrl && !isBlacklistedComponent;
    }, [currentUrl, pageComponent]);

    // 5. Penanganan Flash Toast Anti-Duplikasi
    const lastToastRef = useRef<string | null>(null);

    useEffect(() => {
        const flashMessage = flash?.sukses || flash?.error || flash?.info;
        if (!flashMessage || lastToastRef.current === flashMessage) return;

        lastToastRef.current = flashMessage;

        if (flash?.sukses) {
            toast.success(flash.sukses);
        } else if (flash?.error) {
            toast.error(flash.error);
        } else if (flash?.info) {
            toast.info(flash.info);
        }

        const timer = setTimeout(() => {
            lastToastRef.current = null;
        }, 1500);

        return () => clearTimeout(timer);
    }, [flash]);

    // 6. Handler Logout Aman (Menutup Drawer Sebelum Request)
    const handleLogout = () => {
        closeMenu();
        router.post("/logout");
    };

    return (
        <div className="min-h-dvh flex flex-col bg-slate-50 text-slate-800 font-sans relative antialiased selection:bg-primary selection:text-white">
            {/* Konfigurasi Global Head Meta */}
            <Head>
                <meta name="theme-color" content="#E52027" />
            </Head>

            {/* Sonner Toast Notification */}
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

            {/* Aksesibilitas: Skip Link ke Konten Utama */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-primary focus:text-white focus:font-bold focus:text-xs focus:rounded-xl focus:shadow-lg focus:outline-none"
            >
                Lewati ke Konten Utama
            </a>

            {/* Pengingat Pesanan Menunggu Pembayaran */}
            <PengingatPesananBelumBayar />

            {/* Announcement Banner */}
            <BilahAtas />

            {/* Navigasi Utama */}
            <NavigasiUtama
                isMenuOpen={isMenuOpen}
                onMenuOpen={openMenu}
                onSearchOpen={openSearch}
                onPrefOpen={openPref}
                currency={currency}
                authUser={auth?.user}
            />

            {/* Area Konten Dinamis */}
            <main
                id="main-content"
                tabIndex={-1}
                className={`flex-1 focus:outline-none ${
                    shouldShowStickyCart ? "pb-24 md:pb-28" : "pb-12 md:pb-16"
                }`}
            >
                {children}
            </main>

            {/* Sticky Cart Notification Bar (Mobile) */}
            {shouldShowStickyCart && <StickyCartBar />}

            {/* Footer Global Storefront */}
            <Footer />

            {/* Drawer Keranjang Belanja */}
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

            {/* Modal Pencarian Produk Global */}
            <PencarianModal isOpen={isSearchOpen} onClose={closeSearch} />

            {/* Drawer Navigasi Mobile */}
            <SideMenuDrawer
                isOpen={isMenuOpen}
                onClose={closeMenu}
                authUser={auth?.user}
                onOpenAuth={() => openAuthModal("login")}
                onLogout={handleLogout}
            />

            {/* Floating Action Hub (CS WhatsApp, Voucher, Shortcut Keranjang) */}
            <FloatingActionHub
                cartCount={totalItemKeranjang}
                onOpenCart={bukaKeranjang}
            />

            {/* Modal Konfigurasi Varian Cepat (Quick Add) */}
            <AddToCartModal />

            {/* Modal Autentikasi Global */}
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
