# CRSL Merchandise Store - Design System

## Brand Identity
- **Nama**: CRSL (Carousel)
- **Tagline**: "Animals as your Bestfriends!"
- **Personality**: Playful, friendly, youthful, colorful
- **Target**: Gen Z & Millennial Indonesia
- **Karakter IP**: Choco (Bear), Popo (Panda), Pigko (Pig), Odin (Dinosaur), Chilo (Cat)

## Antislop Dials
```
Dial: ENERGY 2 / RHYTHM 2 / MOTION 1
```
- **ENERGY 2 (Balanced)**: Friendly dan approachable, tidak corporate/sterile tapi juga tidak overwhelming. Warna merah brand digunakan dengan purpose: CTA dan highlight.
- **RHYTHM 2 (Consistent with breaks)**: Layout section konsisten tapi ada variasi di hero, promo, dan product grid. Tidak monoton.
- **MOTION 1 (Calm)**: Animasi hanya pada running text marquee, hover states, dan drawer transitions. Tidak ada parallax atau scroll-reveal berlebihan.

**Alasan**: E-commerce merchandise untuk anak muda butuh kesan fun tapi tetap fokus pada produk. Motion minimal karena performa mobile lebih penting dari animasi mewah.

---

## Color Tokens

### Light Mode
```css
--warna-primer: #E52027;           /* Merah brand CRSL */
--warna-primer-hover: #CC1C22;     /* Merah lebih gelap untuk hover */
--warna-primer-aktif: #B3181E;     /* Merah paling gelap untuk active */
--warna-sekunder: #64748B;         /* Slate untuk text sekunder */
--warna-aksen: #71757A;            /* Abu untuk elemen netral */

--warna-latar: #FFFFFF;            /* Background utama */
--warna-latar-sekunder: #F8F8F8;   /* Background section alternatif */
--warna-permukaan: #FFFFFF;        /* Surface cards dan modal */
--warna-latar-overlay: rgba(0,0,0,0.5); /* Overlay drawer/modal */

--warna-teks: #444038;             /* Teks utama - coklat gelap */
--warna-teks-sekunder: #71757A;    /* Teks sekunder */
--warna-teks-redup: #71757A;       /* Teks redup konsisten */
--warna-teks-pudar: rgba(68,64,56,0.6); /* Teks disabled/placeholder */
--warna-teks-invers: #FFFFFF;      /* Teks di atas background gelap */

--warna-batas: rgba(68,64,56,0.12); /* Border default */
--warna-batas-fokus: #E52027;      /* Border saat focus */

--warna-sukses: #1BA303;
--warna-peringatan: #F09342;
--warna-error: #F5564A;
--warna-info: #4169E0;
```

### Dark Mode
```css
--warna-latar: #1A1A1A;
--warna-latar-sekunder: #242424;
--warna-permukaan: #242424;        /* Surface cards dan modal dark */
--warna-latar-overlay: rgba(0,0,0,0.7);

--warna-teks: #E8E6E3;
--warna-teks-sekunder: #A0A0A0;
--warna-teks-redup: #A0A0A0;       /* Teks redup dark mode */
--warna-teks-pudar: rgba(232,230,227,0.5);
--warna-teks-invers: #1A1A1A;

### Character Color Tokens (5 Sahabat CRSL)
```css
--karakter-odin: #10B981;   /* Dinosaurus Hijau Petualang */
--karakter-chilo: #EC4899;  /* Kucing Pink Artistik */
--karakter-pigko: #F472B6;  /* Babi Peach Ceria */
--karakter-popo: #2D3748;   /* Panda Slate Bijak */
--karakter-choco: #8B5A2B;  /* Beruang Cokelat Pelindung */
```

--warna-batas: rgba(255,255,255,0.12);
```
Warna primer (`#E52027`) tetap sama di dark mode. Merah tetap merah.

**Alasan warna**: Merah `#E52027` adalah brand color CRSL dari website asli. Coklat gelap `#444038` dipilih sebagai base content karena lebih lembut dari hitam murni, sesuai personality playful brand.

---

## Typography

### Font Stack
```css
--font-body: 'Open Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```
**Alasan**: Open Sans digunakan website asli CRSL. Readable di layar kecil, weight bervariasi (400-700), support karakter Indonesia lengkap.

### Scale
| Token | Size | Weight | Line Height | Penggunaan |
|:---|:---|:---|:---|:---|
| `--teks-h1` | 2rem (32px) | 400 | 1.125 | Judul halaman |
| `--teks-h2` | 1.5rem (24px) | 700 | 1.167 | Judul section |
| `--teks-h3` | 1.25rem (20px) | 600 | 1.2 | Sub-judul |
| `--teks-h4` | 1rem (16px) | 600 | 1.25 | Judul card/komponen |
| `--teks-body` | 0.875rem (14px) | 400 | 1.143 | Body text |
| `--teks-body-medium` | 0.875rem (14px) | 500 | 1.143 | Body text emphasized |
| `--teks-caption` | 0.75rem (12px) | 400 | 1.167 | Caption, helper text |
| `--teks-xxs` | 0.625rem (10px) | 400 | 1.1 | Badge, micro text |

---

## Spacing

Skala 4px base:
```css
--jarak-xs: 0.25rem;   /* 4px */
--jarak-sm: 0.5rem;    /* 8px */
--jarak-md: 1rem;      /* 16px */
--jarak-lg: 1.5rem;    /* 24px */
--jarak-xl: 2rem;      /* 32px */
--jarak-2xl: 3rem;     /* 48px */
--jarak-3xl: 4rem;     /* 64px */
```

---

## Border Radius
```css
--radius-sm: 0.125rem;  /* 2px - tags, chips */
--radius-md: 0.375rem;  /* 6px - input, cards */
--radius-lg: 0.5rem;    /* 8px - modals, sections */
--radius-xl: 0.75rem;   /* 12px - larger cards */
--radius-penuh: 9999px; /* pill buttons */
```
**Alasan radius**: Website asli menggunakan `--rounded-box: 8px` dan `--btn-radius: 99rem` (pill). Kita pertahankan pill untuk CTA buttons karena itu bagian dari brand identity CRSL.

---

## Shadows
```css
--bayangan-sm: 0 1px 2px 0 rgba(0,0,0,0.05);
--bayangan-md: 0 2px 15px -3px rgba(18,29,61,0.1), 0 4px 6px -4px rgba(18,29,61,0.1);
--bayangan-lg: 0 3px 5px -1px rgba(0,0,0,0.2), 0 5px 8px 0 rgba(0,0,0,0.14);
```
Bayangan digunakan hanya pada: dropdown, modal, drawer. Bukan pada setiap card.

---

## Z-Index Scale
```css
--z-dasar: 0;
--z-konten: 10;
--z-sticky: 100;
--z-bilah-atas: 1000;
--z-navigasi: 1006;
--z-overlay: 1007;
--z-drawer: 1008;
--z-modal: 1100;
--z-pencarian: 1100;
--z-notifikasi: 100000;
```

---

## Breakpoints
```css
/* Mobile first - tidak perlu media query */
/* Tablet */  @media (min-width: 600px)
/* Desktop */ @media (min-width: 960px)
/* Wide */    @media (min-width: 1280px)
```

---

## Component Patterns

### Bilah Atas (Announcement Bar)
- Latar: `--warna-primer` (merah)
- Teks: `--warna-teks-invers` (putih)
- Tinggi: 36px mobile, 40px desktop
- Animasi: CSS marquee, kecepatan 20s, linear infinite

### Header Navigation
- Latar: `--warna-latar` (putih)
- Tinggi: 48px mobile, 56px desktop
- Position: sticky, top: 0 (setelah bilah atas)
- Border bottom: 1px `--warna-batas`

### Drawer / Sidebar
- Lebar: 85vw mobile, max 380px
- Animasi: slide-in dari kiri, 300ms ease
- Overlay: `--warna-latar-overlay`
- Focus trap: aktif saat drawer terbuka

### Modal
- Lebar: 90vw mobile, max 480px desktop
- Position: fixed center
- Border radius: `--radius-lg`
- Overlay: `--warna-latar-overlay`

### Button
- Radius: `--radius-penuh` (pill)
- Padding: `--jarak-sm` `--jarak-lg`
- Min tinggi: 44px (tap target accessibility)
- Teks: uppercase? Tidak. Sentence case.

---

## Accessibility Standards
- WCAG AA minimum (contrast 4.5:1 normal text, 3:1 large text)
- Focus indicator visible: 2px solid `--warna-primer`
- Tap target minimum: 44x44px
- `aria-label` pada semua icon-only buttons
- `role="dialog"` pada modals, `aria-modal="true"`
- `aria-expanded` pada hamburger menu
- Skip navigation link
- Reduced motion: `prefers-reduced-motion: reduce`
