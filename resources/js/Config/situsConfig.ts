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
        primaryActive: '#B3181E',
        secondary: '#64748B',
        darkBg: '#1A1A1A',
        darkCard: '#242424',
        emerald: '#1BA303',
        amber: '#F09342',
        rose: '#F5564A',
        sky: '#4169E0',
    },
    motion: {
        rotatorDuration: 4, // 4 detik
        rotatorEaseOut: 'power2.out',
        rotatorEaseIn: 'power2.in',
        transitionDuration: 0.5,
    },
    typography: {
        fontBody: "'Plus Jakarta Sans', 'Open Sans', system-ui, sans-serif",
        fontMono: "'JetBrains Mono', Consolas, monospace",
        headingWeight: 900,
        subheadingWeight: 700,
        bodyWeight: 500,
    },
    layout: {
        bilahAtasHeight: '40px',
        navigasiHeight: '56px',
        maxWidth: '1280px',
    },
};
