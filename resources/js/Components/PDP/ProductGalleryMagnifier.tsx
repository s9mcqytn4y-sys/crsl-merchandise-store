import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import { ImageOff, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

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
}

export default function ProductGalleryMagnifier({
    images = [],
    selectedImage,
    onSelectImage,
    productName,
}: ProductGalleryMagnifierProps) {
    const [isHovering, setIsHovering] = useState(false);
    const [imgError, setImgError] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const zoomLayerRef = useRef<HTMLDivElement>(null);
    const activeThumbnailRef = useRef<HTMLButtonElement>(null);

    // Normalisasi fallback gambar minimal 1 foto
    const displayImages = useMemo(() => {
        if (images.length > 0) return images;
        return [
            {
                id: "default-fallback",
                url: selectedImage || "/assets/gambar/placeholder.webp",
                alt_teks: productName,
            },
        ];
    }, [images, selectedImage, productName]);

    const activeIndex = useMemo(() => {
        const idx = displayImages.findIndex((img) => img.url === selectedImage);
        return idx !== -1 ? idx : 0;
    }, [displayImages, selectedImage]);

    // Reset error boundary saat foto aktif berganti
    useEffect(() => {
        setImgError(false);
    }, [selectedImage]);

    // Auto-scroll thumbnail rail agar item yang dipilih selalu tampak
    useEffect(() => {
        if (activeThumbnailRef.current) {
            activeThumbnailRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "nearest",
            });
        }
    }, [selectedImage]);

    // Navigasi prev/next khusus mobile atau shortcut
    const handleNextImage = () => {
        const nextIdx = (activeIndex + 1) % displayImages.length;
        onSelectImage(displayImages[nextIdx].url);
    };

    const handlePrevImage = () => {
        const prevIdx =
            (activeIndex - 1 + displayImages.length) % displayImages.length;
        onSelectImage(displayImages[prevIdx].url);
    };

    // Tracking mouse performa tinggi tanpa re-render state berulang
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

    return (
        <div className="flex flex-col-reverse md:flex-row gap-3 sm:gap-4 lg:gap-5 items-start w-full select-none">
            {/* 1. Thumbnails Rail */}
            {displayImages.length > 1 && (
                <div
                    role="tablist"
                    aria-label="Daftar foto galeri produk"
                    className="flex md:flex-col gap-2 sm:gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[540px] w-full md:w-20 lg:w-22 shrink-0 py-1 scrollbar-none scroll-smooth"
                >
                    {displayImages.map((img, index) => {
                        const isActive = selectedImage === img.url;
                        const altText =
                            img.alt_teks ||
                            img.alt_text ||
                            `${productName} thumbnail foto ke-${index + 1}`;

                        return (
                            <button
                                key={img.id ?? index}
                                ref={isActive ? activeThumbnailRef : null}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                tabIndex={isActive ? 0 : -1}
                                onClick={() => onSelectImage(img.url)}
                                className={`group relative rounded-xl overflow-hidden aspect-square border-2 transition-all duration-150 cursor-pointer w-16 sm:w-18 md:w-full shrink-0 bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                                    isActive
                                        ? "border-slate-900 ring-2 ring-slate-900/10 shadow-xs opacity-100"
                                        : "border-slate-200/80 hover:border-slate-400 opacity-70 hover:opacity-100"
                                }`}
                                aria-label={`Tampilkan foto produk ke-${index + 1}`}
                            >
                                <img
                                    src={img.url}
                                    alt={altText}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
                                    loading="lazy"
                                />
                            </button>
                        );
                    })}
                </div>
            )}

            {/* 2. Main Viewport & Inner Magnifier */}
            <div
                ref={containerRef}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onMouseMove={handleMouseMove}
                className="relative flex-1 aspect-square w-full rounded-2xl bg-slate-50 border border-slate-200/90 overflow-hidden group touch-pan-y md:cursor-crosshair shadow-2xs"
            >
                {imgError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
                        <ImageOff className="w-10 h-10 stroke-[1.5]" />
                        <span className="text-xs font-semibold">
                            Gagal memuat pratinjau gambar produk
                        </span>
                    </div>
                ) : (
                    <>
                        {/* Foto Utama Statis */}
                        <img
                            key={selectedImage}
                            src={selectedImage}
                            alt={productName}
                            width={650}
                            height={650}
                            onError={() => setImgError(true)}
                            className="w-full h-full object-cover object-center animate-in fade-in duration-200"
                        />

                        {/* Layer Zoom 2x High-Definition (Desktop Only) */}
                        <div
                            ref={zoomLayerRef}
                            className={`hidden md:block absolute inset-0 pointer-events-none transition-opacity duration-200 ease-out bg-no-repeat ${
                                isHovering ? "opacity-100" : "opacity-0"
                            }`}
                            style={{
                                backgroundImage: `url(${selectedImage})`,
                                backgroundSize: "230%",
                                backgroundPosition: "center center",
                            }}
                            aria-hidden="true"
                        />

                        {/* Kontrol Navigasi Geser (Tampil pada Mobile & Tablet) */}
                        {displayImages.length > 1 && (
                            <div className="md:hidden">
                                <button
                                    type="button"
                                    onClick={handlePrevImage}
                                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs active:scale-95"
                                    aria-label="Foto sebelumnya"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextImage}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs active:scale-95"
                                    aria-label="Foto selanjutnya"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Pill Indikator Gambar Aktif (Mobile & Tablet) */}
                        {displayImages.length > 1 && (
                            <span className="md:hidden absolute bottom-3 left-3 text-[10px] font-bold text-slate-700 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-2xs border border-slate-200/80">
                                {activeIndex + 1} / {displayImages.length}
                            </span>
                        )}

                        {/* Petunjuk Zoom Visual (Desktop) */}
                        <span
                            className={`hidden md:inline-flex items-center gap-1.5 absolute bottom-3.5 right-3.5 text-[11px] font-bold text-slate-700 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-slate-200/80 pointer-events-none transition-opacity duration-200 ${
                                isHovering ? "opacity-0" : "opacity-100"
                            }`}
                        >
                            <ZoomIn className="w-3.5 h-3.5 text-[#E52027]" />
                            Arahkan kursor untuk memperbesar
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}
