export interface NavigasiItem {
    label: string;
    href: string;
    isHighlight?: boolean;
    badge?: string;
    emoji?: string;
}

export interface HeroSlideCMS {
    gambar: string;
    tag: string;
    judul: string;
    subjudul: string;
    tombol: string;
    tautan: string;
    alt: string;
}

export interface NegaraOption {
    kode: "ID" | "MY" | "SG" | string;
    nama: string;
}

export interface MataUangOption {
    kode: "IDR" | "USD" | "SGD" | "MYR" | string;
    label: string;
}

export const SITUS_CONFIG = {
    nama: "CRSL Official Store",
    tagline: "Animals as your Bestfriends!",
    domain: "crsl-store.id",
    lokasi: "Sleman, D.I. Yogyakarta, Indonesia",
    whatsappCS: "6281234567890",
    pesanPromoBilahAtas: [
        "GRATIS ONGKIR SELURUH INDONESIA",
        "DISKON 10% ALL ITEM UNTUK NEW ADOPTER",
        "BELANJA DI WEBSITE LEBIH MURAH & CEPAT",
        "FREE EXCLUSIVE STICKER PACK DI SETIAP PEMBELIAN",
    ],
    navigasiUtama: [
        { label: "BERANDA", href: "/", isHighlight: false },
        { label: "KATALOG PRODUK", href: "/katalog", isHighlight: false },
        {
            label: "🎒 BTS COLLECTION",
            href: "/katalog?kategori=back-to-school-essentials",
            isHighlight: true,
        },
        { label: "LACAK PESANAN", href: "/lacak", isHighlight: false },
    ],
    pencarianPopuler: [
        "slingbag",
        "topi",
        "monie",
        "mosko",
        "ruby",
        "wallet",
        "yori",
        "helm",
    ],
    opsiNegara: [
        { kode: "ID", nama: "Indonesia" },
        { kode: "MY", nama: "Malaysia" },
        { kode: "SG", nama: "Singapore" },
    ],
    opsiMataUang: [
        { kode: "IDR", label: "IDR - Indonesian Rupiah" },
        { kode: "USD", label: "USD - United States Dollar" },
        { kode: "SGD", label: "SGD - Singapore Dollar" },
        { kode: "MYR", label: "MYR - Malaysian Ringgit" },
    ],
    heroSlidesCMS: [
        {
            gambar: "/assets/gambar/banner-1.webp",
            tag: "NEW SEASON",
            judul: "Animals as your Bestfriends!",
            subjudul:
                "Merchandise karakter hewan lucu & fungsional untuk menemani hari-harimu.",
            tombol: "Adopt Now",
            tautan: "/katalog",
            alt: "CRSL Koleksi Terbaru",
        },
        {
            gambar: "/assets/gambar/banner-hero-main.webp",
            tag: "BTS ESSENTIALS",
            judul: "Back to School with Odin & Friends",
            subjudul:
                "Ransel water-repellent, kapasitas laptop 14 inci, dan kompartemen lengkap.",
            tombol: "Lihat Ransel",
            tautan: "/katalog?kategori=backpack-collection",
            alt: "CRSL Back to School Essentials",
        },
        {
            gambar: "/assets/gambar/banner-tumbler.webp",
            tag: "EVERYDAY HYDRATION",
            judul: "Tumbler Termos 12 Jam Dingin",
            subjudul:
                "Stainless steel food-grade anti tumpah dengan karakter imut Popo si Panda.",
            tombol: "Pilih Tumbler",
            tautan: "/katalog?kategori=tumbler-collection",
            alt: "CRSL Tumbler Collection",
        },
        {
            gambar: "/assets/gambar/banner-cassie.webp",
            tag: "BEST SELLER",
            judul: "Compact & Stylish Cassie Wallet",
            subjudul:
                "Dompet kanvas lipat wanita dengan motif plaid ikonik dan slot kartu lengkap.",
            tombol: "Beli Cassie Wallet",
            tautan: "/katalog?kategori=wallet-accessories",
            alt: "CRSL Cassie Wallet",
        },
        {
            gambar: "/assets/gambar/banner-2.webp",
            tag: "SPECIAL EDITION",
            judul: "Meet The 5 Bestfriends Squad",
            subjudul:
                "Temukan kepribadianmu bersama Odin, Chilo, Pigko, Popo, dan Choco.",
            tombol: "Kenali Karakter",
            tautan: "/katalog",
            alt: "CRSL Animal Characters",
        },
    ],
    navigasiKategori: [
        {
            label: "BTS Collection",
            href: "/katalog?kategori=back-to-school-essentials",
            isHighlight: true,
            badge: "Hot",
        },
        { label: "All Products", href: "/katalog", isHighlight: false },
        {
            label: "All Day Promo",
            href: "/katalog?promo=true",
            isHighlight: true,
            badge: "Sale",
        },
        {
            label: "Backpacks",
            href: "/katalog?kategori=backpack-collection",
            isHighlight: false,
        },
        {
            label: "Slingbags",
            href: "/katalog?kategori=slingbag-collection",
            isHighlight: false,
        },
        {
            label: "Tumbler Collection",
            href: "/katalog?kategori=tumbler-collection",
            isHighlight: false,
        },
        {
            label: "Tops",
            href: "/katalog?kategori=tops-collection",
            isHighlight: false,
        },
        {
            label: "Bottoms",
            href: "/katalog?kategori=bottoms-collection",
            isHighlight: false,
        },
        {
            label: "Outerwears",
            href: "/katalog?kategori=outerwears-collection",
            isHighlight: false,
        },
        {
            label: "Footwears",
            href: "/katalog?kategori=footwear-collection",
            isHighlight: false,
        },
        {
            label: "Headwears",
            href: "/katalog?kategori=headwear-collection",
            isHighlight: false,
        },
        {
            label: "Wallet & Accessories",
            href: "/katalog?kategori=wallet-accessories",
            isHighlight: false,
        },
        {
            label: "What's Poppin'",
            href: "/katalog?kategori=whats-poppin",
            isHighlight: false,
        },
    ],
} as const;

export const THEME_TOKENS = {
    colors: {
        primary: "#E52027",
        primaryHover: "#CC1C22",
        primaryActive: "#B3181E",
        primarySubtle: "#FEF2F2", // red-50
        secondary: "#64748B",
        darkBg: "#020617", // slate-950
        darkCard: "#0F172A", // slate-900
        emerald: "#059669", // emerald-600
        amber: "#D97706", // amber-600
        rose: "#E11D48", // rose-600
    },
    motion: {
        rotatorDuration: 4,
        rotatorEaseOut: "power2.out",
        rotatorEaseIn: "power2.in",
        transitionDuration: 0.3,
    },
    typography: {
        fontBody: "'Open Sans', system-ui, -apple-system, sans-serif",
        fontHeading: "'Roboto', system-ui, -apple-system, sans-serif",
        fontMono: "'JetBrains Mono', Consolas, monospace",
        headingWeight: 700,
        subheadingWeight: 600,
        bodyWeight: 400,
    },
    layout: {
        bilahAtasHeight: "36px",
        navigasiHeight: "64px",
        maxWidth: "1280px",
    },
} as const;
