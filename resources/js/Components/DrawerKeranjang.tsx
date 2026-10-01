import React, { useMemo } from "react";
import { Link } from "@inertiajs/react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogBackdrop,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import {
    X,
    ShoppingBag,
    ArrowRight,
    ShieldCheck,
    CreditCard,
} from "lucide-react";
import { useKeranjangStore } from "../Stores/useKeranjangStore";
import DrawerItemRow from "./Keranjang/DrawerItemRow";
import RecommendedProducts, {
    RecommendedProduct,
} from "./Keranjang/RecommendedProducts";
import DrawerFooter from "./Keranjang/DrawerFooter";
import { cn } from "../lib/utils";

interface DrawerKeranjangProps {
    isOpen?: boolean;
    onClose: () => void;
    rekomendasi?: RecommendedProduct[];
    className?: string;
}

const DEFAULT_RECOMMENDATIONS: RecommendedProduct[] = [
    {
        id: "rec_1",
        nama_produk: "CRSL Drinke Tumbler Series | Botol Minum Stainless",
        harga: 289000,
        harga_asli: 339000,
        gambar: "/assets/gambar/banner-tumbler.webp",
        warna: "Dark Grey",
        slug: "crsl-drinke-tumblr-series",
    },
    {
        id: "rec_2",
        nama_produk: "CRSL Mini Daysic Backpack | Ransel Karakter Hewan",
        harga: 224100,
        harga_asli: 279000,
        gambar: "/assets/gambar/banner-hero-main.webp",
        warna: "Odin Cream",
        slug: "crsl-mini-daysic-backpack",
    },
    {
        id: "rec_3",
        nama_produk: "CRSL Chilo Pouch Slingbag | Tas Selempang",
        harga: 159000,
        gambar: "/assets/gambar/banner-2.webp",
        warna: "Black",
        slug: "crsl-chilo-pouch-slingbag",
    },
];

export default function DrawerKeranjang({
    isOpen = false,
    onClose,
    rekomendasi = DEFAULT_RECOMMENDATIONS,
    className,
}: DrawerKeranjangProps) {
    const isShowing = Boolean(isOpen);

    const items = useKeranjangStore((state) => state.items ?? []);
    const ubahJumlah = useKeranjangStore((state) => state.ubahJumlah);
    const hapus = useKeranjangStore((state) => state.hapus);
    const tambah = useKeranjangStore((state) => state.tambah);
    const hitungJumlahTotal = useKeranjangStore(
        (state) => state.hitungJumlahTotal,
    );

    // Kalkulasi subtotal reaktif dari items
    const totalHarga = useMemo(() => {
        return items.reduce(
            (acc, item) =>
                acc + (Number(item.harga) || 0) * (Number(item.jumlah) || 1),
            0,
        );
    }, [items]);

    // Kalkulasi total kuantitas
    const totalItem = useMemo(() => {
        if (typeof hitungJumlahTotal === "function") {
            return hitungJumlahTotal();
        }
        return items.reduce((acc, item) => acc + (Number(item.jumlah) || 1), 0);
    }, [items, hitungJumlahTotal]);

    // Kalkulasi nominal hemat diskon
    const totalHemat = useMemo(() => {
        return items.reduce((acc, item) => {
            const hargaAsli = Number(item.harga_asli || item.harga_dasar || 0);
            const hargaJual = Number(item.harga || 0);
            if (hargaAsli > hargaJual) {
                return (
                    acc + (hargaAsli - hargaJual) * (Number(item.jumlah) || 1)
                );
            }
            return acc;
        }, 0);
    }, [items]);

    const handleAddRecentlyOrdered = (prod: RecommendedProduct) => {
        tambah({
            id: `rec_item_${prod.id}_${Date.now()}`,
            produk_id: typeof prod.id === "number" ? prod.id : 0,
            nama_produk: prod.nama_produk,
            harga: prod.harga,
            harga_asli: prod.harga_asli,
            gambar: prod.gambar,
            jumlah: 1,
            warna: prod.warna || "Default",
            ukuran: prod.ukuran || "All Size",
        });
    };

    return (
        <Transition show={isShowing} as={React.Fragment}>
            <Dialog
                as="div"
                id="drawer-keranjang-belanja"
                className={cn("relative z-50 select-none", className)}
                onClose={onClose}
            >
                {/* Backdrop Blur Overlay */}
                <TransitionChild
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <DialogBackdrop className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" />
                </TransitionChild>

                {/* Sliding Drawer Container */}
                <div className="fixed inset-0 overflow-hidden">
                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <TransitionChild
                            as={React.Fragment}
                            enter="transform transition ease-out duration-300"
                            enterFrom="translate-x-full"
                            enterTo="translate-x-0"
                            leave="transform transition ease-in duration-250"
                            leaveFrom="translate-x-0"
                            leaveTo="translate-x-full"
                        >
                            <DialogPanel className="pointer-events-auto w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-slate-200/90">
                                {/* Header Drawer */}
                                <div className="h-16 px-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-red-50 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                            <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                                        </div>
                                        <DialogTitle
                                            as="h2"
                                            className="text-base sm:text-lg font-black text-slate-900 tracking-tight"
                                        >
                                            Keranjang Belanja
                                            {totalItem > 0 && (
                                                <span className="ml-2 text-xs font-bold text-slate-500 font-mono">
                                                    ({totalItem})
                                                </span>
                                            )}
                                        </DialogTitle>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-2 -mr-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                                        aria-label="Tutup keranjang belanja"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Body Content */}
                                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 no-scrollbar overscroll-contain">
                                    {items.length === 0 ? (
                                        <div className="text-center py-16 sm:py-20 space-y-4">
                                            <div className="w-16 h-16 mx-auto rounded-3xl bg-red-50 text-primary flex items-center justify-center border border-red-100 shadow-2xs">
                                                <ShoppingBag className="w-8 h-8 stroke-[1.8]" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-base font-bold text-slate-900">
                                                    Keranjang Masih Kosong
                                                </h3>
                                                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                                                    Jelajahi koleksi apparel,
                                                    ransel, dan merchandise
                                                    karakter unik CRSL sekarang.
                                                </p>
                                            </div>
                                            <div className="pt-2">
                                                <Link
                                                    href="/katalog"
                                                    onClick={onClose}
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover active:scale-95 text-white text-xs font-bold rounded-2xl shadow-lg shadow-red-500/20 transition-all cursor-pointer"
                                                >
                                                    <span>Mulai Belanja</span>
                                                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 divide-y divide-slate-100">
                                            {items.map((item) => (
                                                <DrawerItemRow
                                                    key={item.id}
                                                    item={item}
                                                    onHapus={hapus}
                                                    onUbahJumlah={ubahJumlah}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Jaminan Pembayaran & Keamanan Toko */}
                                    <div className="pt-3 border-t border-slate-100">
                                        <div className="grid grid-cols-2 divide-x divide-slate-200 bg-slate-50/80 rounded-2xl py-2.5 text-center text-slate-600 text-[11px] font-semibold border border-slate-200/70 shadow-2xs">
                                            <div className="flex items-center justify-center gap-1.5 px-2">
                                                <CreditCard className="w-3.5 h-3.5 text-primary" />
                                                <span>Pembayaran Aman</span>
                                            </div>
                                            <div className="flex items-center justify-center gap-1.5 px-2">
                                                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                                                <span>100% Original CRSL</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rekomendasi Produk Pelengkap */}
                                    {rekomendasi.length > 0 && (
                                        <div className="pt-2">
                                            <RecommendedProducts
                                                items={rekomendasi}
                                                onAdd={handleAddRecentlyOrdered}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Sticky Footer Checkout */}
                                {items.length > 0 && (
                                    <div
                                        className="border-t border-slate-100 bg-white shadow-xl"
                                        style={{
                                            paddingBottom:
                                                "max(0.5rem, env(safe-area-inset-bottom))",
                                        }}
                                    >
                                        <DrawerFooter
                                            totalItem={totalItem}
                                            totalHarga={totalHarga}
                                            totalHemat={totalHemat}
                                            onClose={onClose}
                                        />
                                    </div>
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
