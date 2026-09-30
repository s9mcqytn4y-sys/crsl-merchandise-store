/**
 * Konfigurasi Global Toko Online CRSL Official Store
 * Digunakan secara luas oleh komponen Storefront, SEO Head, Faktur, PDP, dan Beranda.
 */

export interface HeroSlideCMS {
    id: string | number;
    judul: string;
    subjudul?: string;
    gambar_desktop: string;
    gambar_mobile: string;
    tautan: string;
    tombol_label?: string;
    alt_teks: string;
}

export interface MascotCharacter {
    nama: string;
    karakter: string;
    deskripsi: string;
    warnaHex: string;
    gambar: string;
}

export interface SitusConfig {
    namaToko: string;
    tagline: string;
    deskripsiSingkat: string;
    domain: string;
    urlSitus: string;
    whatsappCS: string;
    whatsappCSFormatted: string;
    emailSupport: string;
    jamOperasional: string;
    alamatToko: string;
    mediaSosial: {
        instagram: string;
        tiktok: string;
        youtube: string;
        shopee: string;
        tokopedia: string;
    };
    warnaBrand: {
        primer: string;
        primerHover: string;
        aksen: string;
        gelap: string;
    };
    heroSlidesCMS: HeroSlideCMS[];
    maskot: MascotCharacter[];
    /** Kata kunci populer untuk modal pencarian cepat */
    pencarianPopuler?: string[];
}

/** Helper sanitasi nomor WhatsApp agar menghasilkan format numerik internasional bersih */
function sanitizePhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
        return `62${cleaned.slice(1)}`;
    }
    return cleaned;
}

const rawWhatsapp =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_WHATSAPP_CS) ||
    "6281234567890";

const cleanWhatsapp = sanitizePhoneNumber(rawWhatsapp);

export const SITUS_CONFIG: SitusConfig = {
    namaToko: "CRSL Official Store",
    tagline: "Animals as Your Bestfriends!",
    deskripsiSingkat:
        "Toko resmi apparel, tas, aksesoris, dan merchandise karakter original CRSL: Odin, Chilo, Popo, Piggy, dan Choco.",
    domain: "crsl.store",
    urlSitus:
        (typeof import.meta !== "undefined" && import.meta.env?.VITE_APP_URL) ||
        "https://crsl.store",

    // Nomor WhatsApp resmi CS (versi raw numerik untuk wa.me dan versi tampilan UI)
    whatsappCS: cleanWhatsapp,
    whatsappCSFormatted: `+${cleanWhatsapp.slice(0, 2)} ${cleanWhatsapp.slice(2, 5)}-${cleanWhatsapp.slice(5, 9)}-${cleanWhatsapp.slice(9)}`,
    emailSupport: "support@crsl.store",
    jamOperasional: "Senin - Sabtu: 09:00 - 17:00 WIB",
    alamatToko: "Sleman, Daerah Istimewa Yogyakarta, Indonesia",

    mediaSosial: {
        instagram: "https://instagram.com/crsl.official",
        tiktok: "https://tiktok.com/@crsl.official",
        youtube: "https://youtube.com/@crslofficial",
        shopee: "https://shopee.co.id/crsl.store",
        tokopedia: "https://tokopedia.com/crsl",
    },

    warnaBrand: {
        primer: "#E52027",
        primerHover: "#CC1C22",
        aksen: "#F59E0B",
        gelap: "#0F172A",
    },

    heroSlidesCMS: [
        {
            id: "bts-2026",
            judul: "Back to School Collection 2026",
            subjudul:
                "Tingkatkan semangat harimu bersama ransel dan perlengkapan terbaru dari CRSL.",
            gambar_desktop: "/assets/gambar/hero-bts-desktop.webp",
            gambar_mobile: "/assets/gambar/hero-bts-mobile.webp",
            tautan: "/katalog?kategori=tas",
            tombol_label: "Jelajahi Koleksi",
            alt_teks: "Koleksi Back to School CRSL Official Store",
        },
        {
            id: "new-arrival-apparel",
            judul: "New Daily Tees & Outerwear",
            subjudul:
                "Bahan katun premium lembut dengan bordir karakter maskot eksklusif.",
            gambar_desktop: "/assets/gambar/hero-apparel-desktop.webp",
            gambar_mobile: "/assets/gambar/hero-apparel-mobile.webp",
            tautan: "/katalog?urutan=terbaru",
            tombol_label: "Lihat New Arrival",
            alt_teks: "Koleksi Apparel Terbaru CRSL Official",
        },
    ],

    maskot: [
        {
            nama: "Odin",
            karakter: "Dino",
            deskripsi:
                "Pemberani, setia kawan, dan selalu siap menemani petualanganmu.",
            warnaHex: "#10B981",
            gambar: "/assets/gambar/maskot-odin.webp",
        },
        {
            nama: "Chilo",
            karakter: "Cat",
            deskripsi:
                "Manis, penyayang, dan suka kenyamanan santai di mana saja.",
            warnaHex: "#F59E0B",
            gambar: "/assets/gambar/maskot-chilo.webp",
        },
        {
            nama: "Popo",
            karakter: "Panda",
            deskripsi:
                "Tenang, bijaksana, dan pembawa kehangatan bagi teman-temannya.",
            warnaHex: "#64748B",
            gambar: "/assets/gambar/maskot-popo.webp",
        },
        {
            nama: "Piggy",
            karakter: "Pig",
            deskripsi: "Ceria, penuh energi positif, dan selalu membawa tawa.",
            warnaHex: "#F43F5E",
            gambar: "/assets/gambar/maskot-piggy.webp",
        },
        {
            nama: "Choco",
            karakter: "Bear",
            deskripsi: "Kuat, hangat, dan siap melindungi sahabat-sahabatnya.",
            warnaHex: "#8B5CF6",
            gambar: "/assets/gambar/maskot-choco.webp",
        },
    ],
};

export default SITUS_CONFIG;
