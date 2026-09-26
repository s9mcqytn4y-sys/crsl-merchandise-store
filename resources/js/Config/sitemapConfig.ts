export interface SitemapLink {
    label: string;
    href: string;
    isExternal?: boolean;
    badge?: string;
}

export interface SitemapSection {
    judul: string;
    links: SitemapLink[];
}

export const SITEMAP_CONFIG: SitemapSection[] = [
    {
        judul: "Kategori Populer",
        links: [
            { label: "Backpack Collection", href: "/katalog?kategori=backpack-collection" },
            { label: "Tumbler Series", href: "/katalog?kategori=tumbler-collection" },
            { label: "Outerwears & Hoodie", href: "/katalog?kategori=outerwears-collection" },
            { label: "Wallet & Accessories", href: "/katalog?kategori=wallet-accessories" },
            { label: "BTS Collection", href: "/katalog?kategori=back-to-school-essentials" },
            { label: "Promo & Diskon", href: "/katalog?promo=true", badge: "Sale" },
        ],
    },
    {
        judul: "Bantuan & Layanan",
        links: [
            { label: "Lacak Pesanan", href: "/lacak" },
            { label: "Chat CS WhatsApp", href: "https://wa.me/6281222222775", isExternal: true },
            { label: "Akun & Wishlist", href: "/account" },
            { label: "Semua Produk", href: "/katalog" },
            { label: "Panduan Ukuran (Size Chart)", href: "/panduan-ukuran" },
            { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
            { label: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
        ],
    },
];
