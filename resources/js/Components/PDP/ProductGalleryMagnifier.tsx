import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import { ImageOff, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "../../lib/utils";

export interface GalleryImage {
    id: number | string;
    url: string;
    alt_teks?: string;
    alt_text?: string;
}

interface ProductGalleryMagnifierProps {
    images: GalleryImage[];
    selectedImage: string;
    onSelectImage: (url: string) => void;
    productName: string;
    className?: string;
}

const PLACEHOLDER_IMAGE = "/assets/gambar/produk-placeholder.webp";

/**
 * Normalisasi URL gambar aman (mendukung path storage lokal Laravel & CDN remote)
 */
function normalizeMediaUrl(url?: string | null): string {
    if (!url) return "";
    const clean = url.trim();
    if (
        clean.startsWith("http://") ||
        clean.startsWith("https://") ||
        clean.startsWith("data:")
    ) {
        return clean;
    }
    if (clean.startsWith("/storage/")) return clean;
    if (clean.startsWith("storage/")) return `/${clean}`;
    if (clean.startsWith("/")) return clean;
    return `/storage/${clean}`;
}

export default function ProductGalleryMagnifier({
    images = [],
    selectedImage,
    onSelectImage,
    productName,
    className,
}: ProductGalleryMagnifierProps) {
    const [isHovering, setIsHovering] = useState(false);
    const [mainImgError, setMainImgError] = useState(false);
    const [brokenThumbnails, setBrokenThumbnails] = useState<
        Record<string, boolean>
    >({});

    const containerRef = useRef<HTMLDivElement>(null);
    const zoomLayerRef = useRef<HTMLDivElement>(null);
    const activeThumbnailRef = useRef<HTMLButtonElement>(null);

    // Koordinat sentuh untuk deteksi swipe mobile
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    // 1. Normalisasi Daftar Gambar dengan Fallback Terintegrasi
    const displayImages = useMemo(() => {
        if (images && images.length > 0) {
            return images.map((img, idx) => ({
                id: img.id ?? `gallery-img-${idx}`,
                url: normalizeMediaUrl(img.url) || PLACEHOLDER_IMAGE,
                alt_teks:
                    img.alt_teks ||
                    img.alt_text ||
                    `${productName} - Tampilan foto ke-${idx + 1}`,
            }));
        }

        const fallbackUrl =
            normalizeMediaUrl(selectedImage) || PLACEHOLDER_IMAGE;
        return [
            {
                id: "default-fallback",
                url: fallbackUrl,
                alt_teks: productName,
            },
        ];
    }, [images, selectedImage, productName]);

    const normalizedSelectedImage = useMemo(() => {
        return (
            normalizeMediaUrl(selectedImage) ||
            displayImages[0]?.url ||
            PLACEHOLDER_IMAGE
        );
    }, [selectedImage, displayImages]);

    const activeIndex = useMemo(() => {
        const idx = displayImages.findIndex(
            (img) => img.url === normalizedSelectedImage,
        );
        return idx !== -1 ? idx : 0;
    }, [displayImages, normalizedSelectedImage]);

    // Reset error state saat foto aktif berganti
    useEffect(() => {
        setMainImgError(false);
    }, [normalizedSelectedImage]);

    // Auto-scroll thumbnail rail agar item terpilih selalu terlihat
    useEffect(() => {
        if (activeThumbnailRef.current) {
            activeThumbnailRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "nearest",
            });
        }
    }, [activeIndex]);

    // Navigasi Prev/Next
    const handleNextImage = useCallback(() => {
        if (displayImages.length <= 1) return;
        const nextIdx = (activeIndex + 1) % displayImages.length;
        onSelectImage(displayImages[nextIdx].url);
    }, [activeIndex, displayImages, onSelectImage]);

    const handlePrevImage = useCallback(() => {
        if (displayImages.length <= 1) return;
        const prevIdx =
            (activeIndex - 1 + displayImages.length) % displayImages.length;
        onSelectImage(displayImages[prevIdx].url);
    }, [activeIndex, displayImages, onSelectImage]);

    // Navigasi Keyboard pada Tablist Thumbnail
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            handleNextImage();
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            handlePrevImage();
        }
    };

    // Tracking Kursor Presisi untuk Zoom Layer Desktop
    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!zoomLayerRef.current || !containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const x = Math.max(
                0,
                Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
            );
            const y = Math.max(
                0,
                Math.min(100, ((e.clientY - rect.top) / rect.height) * 100),
            );

            zoomLayerRef.current.style.backgroundPosition = `${x}% ${y}%`;
        },
        [],
    );

    // Handler Gestur Swipe Layar Sentuh Mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const diffX = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 45; // Ambang batas usapan (px)

        if (diffX > minSwipeDistance) {
            handleNextImage(); // Geser ke kiri (tampilkan gambar berikutnya)
        } else if (diffX < -minSwipeDistance) {
            handlePrevImage(); // Geser ke kanan (tampilkan gambar sebelumnya)
        }

        touchStartX.current = null;
        touchEndX.current = null;
    };

    const handleThumbnailError = (id: number | string) => {
        setBrokenThumbnails((prev) => ({ ...prev, [String(id)]: true }));
    };

    return (
        <div
            className={cn(
                "flex flex-col-reverse md:flex-row gap-3 sm:gap-4 lg:gap-5 items-start w-full select-none",
                className,
            )}
        >
            {/* 1. Thumbnails Rail */}
            {displayImages.length > 1 && (
                <div
                    role="tablist"
                    aria-label="Daftar foto galeri produk"
                    onKeyDown={handleKeyDown}
                    className="flex md:flex-col gap-2 sm:gap-2.5 overflow-x-auto md:overflow-y-auto max-h-135 w-full md:w-20 lg:w-22 shrink-0 py-1 no-scrollbar scroll-smooth overscroll-contain"
                >
                    {displayImages.map((img, index) => {
                        const isActive = activeIndex === index;
                        const isBroken = brokenThumbnails[String(img.id)];

                        return (
                            <button
                                key={img.id}
                                ref={isActive ? activeThumbnailRef : null}
                                type="button"
                                role="tab"
                                id={`thumbnail-tab-${index}`}
                                aria-selected={isActive}
                                aria-controls="product-gallery-main-view"
                                tabIndex={isActive ? 0 : -1}
                                onClick={() => onSelectImage(img.url)}
                                className={cn(
                                    "group relative rounded-2xl overflow-hidden aspect-square border-2 transition-all duration-200 cursor-pointer w-16 sm:w-18 md:w-full shrink-0 bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                    isActive
                                        ? "border-primary ring-2 ring-primary/20 shadow-xs opacity-100 scale-[1.02]"
                                        : "border-slate-200/90 hover:border-slate-300 opacity-70 hover:opacity-100",
                                )}
                                aria-label={`Tampilkan foto produk ke-${index + 1}`}
                            >
                                <img
                                    src={isBroken ? PLACEHOLDER_IMAGE : img.url}
                                    alt={img.alt_teks}
                                    width={88}
                                    height={88}
                                    loading="lazy"
                                    onError={() => handleThumbnailError(img.id)}
                                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
                                />
                            </button>
                        );
                    })}
                </div>
            )}

            {/* 2. Main Viewport & Inner Magnifier */}
            <div
                id="product-gallery-main-view"
                role="tabpanel"
                aria-labelledby={`thumbnail-tab-${activeIndex}`}
                ref={containerRef}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative flex-1 aspect-square w-full rounded-2xl bg-slate-100 border border-slate-200/90 overflow-hidden group touch-pan-y md:cursor-crosshair shadow-2xs"
            >
                {mainImgError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 p-6 text-center bg-slate-50">
                        <ImageOff className="w-10 h-10 stroke-[1.5] text-slate-300" />
                        <span className="text-xs font-semibold text-slate-500">
                            Gagal memuat pratinjau gambar produk
                        </span>
                    </div>
                ) : (
                    <>
                        {/* Foto Utama Statis */}
                        <img
                            key={normalizedSelectedImage}
                            src={normalizedSelectedImage}
                            alt={
                                displayImages[activeIndex]?.alt_teks ||
                                productName
                            }
                            width={700}
                            height={700}
                            onError={() => setMainImgError(true)}
                            className="w-full h-full object-cover object-center animate-in fade-in duration-200"
                        />

                        {/* Layer Zoom 2.3x High-Definition (Desktop Only) */}
                        <div
                            ref={zoomLayerRef}
                            className={cn(
                                "hidden md:block absolute inset-0 pointer-events-none transition-opacity duration-200 ease-out bg-no-repeat",
                                isHovering ? "opacity-100" : "opacity-0",
                            )}
                            style={{
                                backgroundImage: `url("${normalizedSelectedImage.replace(/"/g, '\\"')}")`,
                                backgroundSize: "230%",
                                backgroundPosition: "center center",
                            }}
                            aria-hidden="true"
                        />

                        {/* Kontrol Navigasi Panah Ergonomis (Mobile & Tablet) */}
                        {displayImages.length > 1 && (
                            <div className="md:hidden">
                                <button
                                    type="button"
                                    onClick={handlePrevImage}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200/80 flex items-center justify-center text-slate-700 shadow-sm active:scale-95 cursor-pointer z-10 transition-transform"
                                    aria-label="Foto produk sebelumnya"
                                >
                                    <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextImage}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200/80 flex items-center justify-center text-slate-700 shadow-sm active:scale-95 cursor-pointer z-10 transition-transform"
                                    aria-label="Foto produk selanjutnya"
                                >
                                    <ChevronRight className="w-5 h-5 stroke-[2.2]" />
                                </button>
                            </div>
                        )}

                        {/* Indikator Angka Gambar Aktif (Mobile & Tablet) */}
                        {displayImages.length > 1 && (
                            <span className="md:hidden absolute bottom-3.5 left-3.5 text-[10px] font-mono font-bold text-slate-800 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-2xs border border-slate-200/80 pointer-events-none z-10">
                                {activeIndex + 1} / {displayImages.length}
                            </span>
                        )}

                        {/* Petunjuk Visual Zoom (Desktop) */}
                        <span
                            className={cn(
                                "hidden md:inline-flex items-center gap-1.5 absolute bottom-3.5 right-3.5 text-[11px] font-bold text-slate-700 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-slate-200/80 pointer-events-none transition-opacity duration-200",
                                isHovering ? "opacity-0" : "opacity-100",
                            )}
                        >
                            <ZoomIn className="w-3.5 h-3.5 text-primary" />
                            <span>Arahkan kursor untuk zoom</span>
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}
