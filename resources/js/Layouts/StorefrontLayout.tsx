import React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Toaster, toast } from 'sonner';
import { Menu, Search, User, ShoppingBag } from 'lucide-react';
import BilahAtas from '../Components/BilahAtas';
import NavigasiUtama from '../Components/NavigasiUtama';
import FloatingActionHub from '../Components/FloatingActionHub';
import PreferensiModal from '../Components/PreferensiModal';
import PencarianModal from '../Components/PencarianModal';
import SideMenuDrawer from '../Components/SideMenuDrawer';
import DrawerKeranjang from '../Components/DrawerKeranjang';
import AuthModal from '../Components/AuthModal';
import AddToCartModal from '../Components/AddToCartModal';
import Footer from '../Components/Footer';
import { useAppStore } from '../Stores/useAppStore';
import { useKeranjangStore } from '../Stores/useKeranjangStore';
import { useAuthStore } from '../Stores/useAuthStore';
import { formatRupiah } from '../Utils/formatters';

interface StorefrontLayoutProps {
    children: React.ReactNode;
    keranjang?: any;
    cart?: any;
}

export default function StorefrontLayout({ children, keranjang = {}, cart = {} }: StorefrontLayoutProps) {
    const { flash, auth } = usePage().props as any;

    const isStoreOpen = useKeranjangStore((state) => state.isOpen);
    const tutupKeranjang = useKeranjangStore((state) => state.tutupKeranjang);
    const bukaKeranjang = useKeranjangStore((state) => state.bukaKeranjang);
    const storeCount = useKeranjangStore((state) => state.hitungJumlahTotal());

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

    const [isCartOpen, setIsCartOpen] = React.useState(false);

    const activeCart = keranjang && Object.keys(keranjang).length > 0 ? keranjang : cart;
    const cartItems = Object.values(activeCart || {}) as any[];
    const cartCount = cartItems.reduce((acc, item) => acc + (item.jumlah ?? item.quantity ?? 1), 0);
    const subtotal = cartItems.reduce((acc, item) => acc + ((item.harga ?? item.price ?? 0) * (item.jumlah ?? item.quantity ?? 1)), 0);

    const handleUpdateQuantity = (cartKey: string, newQty: number) => {
        if (newQty < 1) return;
        router.put(`/keranjang/${cartKey}`, { jumlah: newQty }, { preserveScroll: true });
    };

    const isAuthOpen = useAuthStore((state) => state.isOpen);
    const authTab = useAuthStore((state) => state.activeTab);
    const closeAuthModal = useAuthStore((state) => state.closeAuthModal);

    const handleRemoveItem = (cartKey: string) => {
        router.delete(`/keranjang/${cartKey}`, { preserveScroll: true });
        toast.info('Item dihapus dari keranjang.');
    };

    return (
        <div className="min-h-dvh flex flex-col bg-slate-50 text-slate-800 font-sans relative">
            <Toaster
                position="top-center"
                richColors
                theme="light"
                toastOptions={{
                    style: {
                        fontFamily: "var(--font-heading, 'Roboto', 'Open Sans', sans-serif)",
                        borderRadius: "16px",
                    },
                }}
            />

            {/* Announcement Bar Rotator (Bilah Atas) */}
            <BilahAtas />

            {/* Header Navigasi Utama Resmi */}
            <NavigasiUtama
                isMenuOpen={isMenuOpen}
                onMenuOpen={openMenu}
                onSearchOpen={openSearch}
                onPrefOpen={openPref}
                currency={currency}
                authUser={auth?.user}
            />

            {/* Flash Message */}
            {flash?.sukses && (
                <div className="bg-emerald-500 text-white py-2 px-4 text-center font-bold text-xs shadow-sm flex items-center justify-center gap-2">
                    <span>✨ {flash.sukses}</span>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 pb-28">
                {children}
            </main>

            {/* Floating Sticky Cart Capsule Bar at Bottom (Screenshot 1 & 2) */}
            {(storeCount > 0 || cartCount > 0) && (
                <div
                    onClick={() => {
                        bukaKeranjang();
                        setIsCartOpen(true);
                    }}
                    className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-[#E52027] hover:bg-[#CC1C22] text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center justify-between gap-5 border border-white/20 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer max-w-[92vw] sm:max-w-md w-full"
                >
                    <div className="text-left">
                        <div className="font-extrabold text-xs tracking-wide">
                            {storeCount > 0 ? storeCount : cartCount} Items in My Cart
                        </div>
                        <div className="text-xs font-black text-white">
                            {formatRupiah(storeCount > 0 ? useKeranjangStore.getState().hitungTotal() : subtotal)}
                        </div>
                    </div>
                    <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white text-[#E52027] shadow-sm shrink-0">
                        <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
                        <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                            {storeCount > 0 ? storeCount : cartCount}
                        </span>
                    </div>
                </div>
            )}

            {/* Main Modular Footer */}
            <Footer />

            {/* Drawer Keranjang Belanja Modern Sesuai Screenshot 4 */}
            <DrawerKeranjang
                isOpen={isCartOpen || isStoreOpen}
                onClose={() => {
                    setIsCartOpen(false);
                    tutupKeranjang();
                }}
            />

            {/* Modals & Drawers */}
            <PreferensiModal
                isOpen={isPrefOpen}
                onClose={closePref}
                currentCountry={country}
                currentLanguage={language}
                currentCurrency={currency}
                onSavePreferences={setPreferences}
            />

            <PencarianModal
                isOpen={isSearchOpen}
                onClose={closeSearch}
            />

            <SideMenuDrawer
                isOpen={isMenuOpen}
                onClose={closeMenu}
            />

            {/* Floating Action Hub (WhatsApp Chat Support, Available Voucher, Mascot) */}
            <FloatingActionHub
                cartCount={cartCount}
                onOpenCart={() => setIsCartOpen(true)}
            />

            {/* Global Add-to-Cart Modal with SKU & Color Variant Selector */}
            <AddToCartModal />

            {/* Global Authentication Modal (Login / Register / OTP) */}
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
