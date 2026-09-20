/**
 * CRSL Store v2 — Central Source of Truth Config & Design Tokens
 * Dirancang future-proof untuk kemudahan integrasi Admin CMS.
 */

export const SITUS_CONFIG = {
    nama: 'CRSL Official Store',
    tagline: 'Animals as your Bestfriends!',
    domain: 'crsl-store.id',
    lokasi: 'Sleman, D.I. Yogyakarta, Indonesia',
    whatsappCS: '6281234567890',
    pesanPromoBilahAtas: [
        'GRATIS ONGKIR SELURUH INDONESIA',
        'DISKON 10% ALL ITEM UNTUK NEW ADOPTER',
        'BELANJA DI WEBSITE LEBIH MURAH',
        'EXCLUSIVE STICKER PACK DI SETIAP PEMBELIAN',
    ],
};

export const THEME_TOKENS = {
    colors: {
        primary: '#E52027',
        primaryHover: '#CC1C22',
        primaryLight: '#FEF2F2',
        darkBg: '#0F172A',
        darkCard: '#1E293B',
        emerald: '#10B981',
        sky: '#3B82F6',
        amber: '#F59E0B',
        rose: '#F43F5E',
        choco: '#78350F',
    },
    motion: {
        rotatorDuration: 4, // 4 detik
        rotatorEase: 'power2.inOut',
        transitionDuration: 0.5,
    },
    typography: {
        fontFamily: "'Inter', sans-serif",
        headingWeight: 900,
        subheadingWeight: 800,
        bodyWeight: 500,
    },
};
