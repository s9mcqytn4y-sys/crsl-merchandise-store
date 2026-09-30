import { useState } from "react";
import { Link } from "@inertiajs/react";
import { cn } from "../../lib/utils";

interface PemisahSeksiProps {
    src?: string;
    mobileSrc?: string;
    alt?: string;
    label?: string;
    href?: string;
    className?: string;
}

const DEFAULT_BANNER = "/assets/gambar/banner-bts-divider.webp";

export default function PemisahSeksi({
    src = DEFAULT_BANNER,
    mobileSrc,
    alt = "CRSL Special Collection Banner",
    label = "CRSL Collection Divider",
    href,
    className,
}: PemisahSeksiProps) {
    const [imageError, setImageError] = useState(false);

    if (imageError) {
        return null; // Graceful degrade: sembunyikan container jika aset 404
    }

    const isClickable = Boolean(href);

    const bannerContent = (
        <div className="w-full h-[100px] sm:h-[140px] md:h-[170px] lg:h-[200px] overflow-hidden relative">
            <picture>
                {mobileSrc && (
                    <source media="(max-width: 639px)" srcSet={mobileSrc} />
                )}
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    width={2048}
                    height={280}
                    onError={() => setImageError(true)}
                    className={cn(
                        "w-full h-full object-cover object-center select-none transition-all duration-300",
                        isClickable
                            ? "group-hover:scale-[1.01] group-hover:brightness-105 cursor-pointer"
                            : "brightness-95 pointer-events-none",
                    )}
                />
            </picture>
        </div>
    );

    return (
        <section
            aria-label={label}
            className={cn(
                "w-full overflow-hidden my-4 sm:my-6 md:my-8 bg-slate-950 border-y border-slate-900/60 relative group",
                className,
            )}
        >
            {isClickable && href ? (
                href.startsWith("http") ? (
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]"
                        aria-label={alt}
                    >
                        {bannerContent}
                    </a>
                ) : (
                    <Link
                        href={href}
                        className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]"
                        aria-label={alt}
                    >
                        {bannerContent}
                    </Link>
                )
            ) : (
                bannerContent
            )}
        </section>
    );
}
