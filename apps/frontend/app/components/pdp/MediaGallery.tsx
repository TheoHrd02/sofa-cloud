/**
 * SOFA-CLOUD — Media Gallery (PDP)
 * Thumbnails verticaux · Image HD principale · Vidéo tissu · Zoom modal
 *
 * Accessibilité :
 *   - role="tablist" sur les thumbnails
 *   - role="tab" + aria-selected sur chaque thumbnail
 *   - role="tabpanel" sur la zone media principale
 *   - Zoom modal : role="dialog", Escape pour fermer
 */

import { useState, useEffect, useCallback } from "react";
import { cn } from "~/lib/utils";

export interface MediaItem {
    type: "image" | "video";
    src: string;
    alt?: string;
    poster?: string; // pour les vidéos
}

interface MediaGalleryProps {
    items: MediaItem[];
    productTitle: string;
}

/* ─── Zoom Modal ─────────────────────────────────────────────────── */
function ZoomModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Vue agrandie du produit"
            className="fixed inset-0 z-[90] flex items-center justify-center bg-primary/95 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                aria-label="Fermer le zoom"
                className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <img
                src={src}
                alt={alt}
                className="max-h-[90vh] max-w-[90vw] object-contain animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}

/* ─── Main Gallery ───────────────────────────────────────────────── */
export function MediaGallery({ items, productTitle }: MediaGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [zoomOpen, setZoomOpen] = useState(false);
    const activeItem = items[activeIndex];

    // Navigation clavier sur la galerie
    const handleThumbnailKey = useCallback(
        (e: React.KeyboardEvent, index: number) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveIndex(index);
            }
        },
        []
    );

    return (
        <>
            <div className="flex gap-4 lg:gap-5 h-full">
                {/* ── Thumbnails (colonne gauche) ─────────── */}
                <div
                    role="tablist"
                    aria-label="Galerie médias"
                    aria-orientation="vertical"
                    className="hidden lg:flex flex-col gap-2.5 w-20 shrink-0"
                >
                    {items.map((item, i) => (
                        <button
                            key={i}
                            role="tab"
                            aria-selected={i === activeIndex}
                            aria-controls="gallery-panel"
                            id={`gallery-tab-${i}`}
                            onClick={() => setActiveIndex(i)}
                            onKeyDown={(e) => handleThumbnailKey(e, i)}
                            className={cn(
                                "relative aspect-square rounded-sm overflow-hidden border-2 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-accent",
                                i === activeIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                            )}
                        >
                            {item.type === "video" ? (
                                <>
                                    <img src={item.poster ?? item.src} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                    <span className="sr-only">Vidéo — tissu en gros plan</span>
                                </>
                            ) : (
                                <img src={item.src} alt={item.alt ?? productTitle} className="w-full h-full object-cover" />
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Media Principale ────────────────────── */}
                <div
                    id="gallery-panel"
                    role="tabpanel"
                    aria-labelledby={`gallery-tab-${activeIndex}`}
                    className="relative flex-1 aspect-[4/5] lg:aspect-auto bg-gray-50 overflow-hidden group"
                >
                    {activeItem.type === "video" ? (
                        <video
                            key={activeItem.src}
                            autoPlay
                            muted
                            loop
                            playsInline
                            poster={activeItem.poster}
                            className="w-full h-full object-cover"
                            aria-label={`Vidéo tissu — ${productTitle}`}
                        >
                            <source src={activeItem.src} type="video/mp4" />
                        </video>
                    ) : (
                        <>
                            <img
                                key={activeItem.src}
                                src={activeItem.src}
                                alt={activeItem.alt ?? productTitle}
                                className="w-full h-full object-cover transition-transform duration-500 ease-premium group-hover:scale-[1.02] cursor-zoom-in"
                                onClick={() => setZoomOpen(true)}
                            />
                            {/* Zoom hint */}
                            <button
                                onClick={() => setZoomOpen(true)}
                                aria-label="Agrandir l'image"
                                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-primary hover:bg-white shadow-premium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Zoom Modal */}
            {zoomOpen && activeItem.type === "image" && (
                <ZoomModal
                    src={activeItem.src}
                    alt={activeItem.alt ?? productTitle}
                    onClose={() => setZoomOpen(false)}
                />
            )}
        </>
    );
}
