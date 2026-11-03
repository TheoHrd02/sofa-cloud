/**
 * SOFA-CLOUD — Product Card
 * Hover zoom image · Badge premium · Prix barré · CTA reveal
 *
 * Accessibilité :
 *   - Lien principal englobe toute la carte
 *   - aria-label descriptif
 *   - role="img" sur les badges
 */

import { cn, formatPrice } from "~/lib/utils";

interface ProductCardProduct {
    handle: string;
    title: string;
    material: string;
    style: string;
    price_ttc: number;
    compare_at_price_ttc: number;
    imageUrl?: string;
    badge?: "nouveau" | "bestseller" | "exclusif" | null;
    variants?: { option: string }[];
    supplier_price?: number;
}

interface ProductCardProps {
    product: ProductCardProduct;
    className?: string;
    priority?: boolean; // true = eager load image (above fold)
    onQuickView?: (product: ProductCardProduct) => void;
}

const BADGE_STYLES: Record<NonNullable<ProductCardProduct["badge"]>, string> = {
    bestseller: "bg-accent text-white",
    nouveau: "bg-primary text-white",
    exclusif: "bg-secondary text-primary",
};

const BADGE_LABELS: Record<NonNullable<ProductCardProduct["badge"]>, string> = {
    bestseller: "Bestseller",
    nouveau: "Nouveau",
    exclusif: "Exclusif",
};

export function ProductCard({ product, className, priority = false, onQuickView }: ProductCardProps) {
    const discount = product.compare_at_price_ttc > product.price_ttc
        ? Math.round((1 - product.price_ttc / product.compare_at_price_ttc) * 100)
        : null;

    const fallbackImage = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80";

    return (
        <article
            className={cn("group relative flex flex-col bg-surface overflow-hidden", className)}
            aria-label={`${product.title} — ${product.material} — ${formatPrice(product.price_ttc)}`}
        >
            {/* ── Image Container ─────────────────────────────── */}
            <a
                href={`/products/${product.handle}`}
                className="block relative aspect-[4/5] bg-gray-100 overflow-hidden focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                tabIndex={0}
                aria-label={`Voir ${product.title}`}
            >
                <img
                    src={product.imageUrl ?? fallbackImage}
                    alt={`${product.title} — ${product.material}`}
                    loading={priority ? "eager" : "lazy"}
                    className="w-full h-full object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
                />

                {/* Badge */}
                {product.badge && (
                    <div
                        role="img"
                        aria-label={BADGE_LABELS[product.badge]}
                        className={cn(
                            "absolute top-3 left-3 px-3 py-1 text-xs font-body font-medium tracking-widest uppercase",
                            BADGE_STYLES[product.badge]
                        )}
                    >
                        {BADGE_LABELS[product.badge]}
                    </div>
                )}

                {/* Discount pill */}
                {discount && (
                    <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                        -{discount}%
                    </div>
                )}

                {/* Hover CTA */}
                <div className={cn(
                    "absolute inset-x-0 bottom-0 p-4",
                    "translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
                    "transition-all duration-350 ease-premium bg-gradient-to-t from-primary/90 to-transparent"
                )}>
                    <div className={cn("flex gap-2", onQuickView ? "flex-col" : "")}>
                        <span className="btn-primary w-full justify-center text-xs py-3">
                            Voir le produit
                        </span>
                        {onQuickView && (
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
                                className="btn-outline border-white/40 text-white hover:bg-white hover:text-primary w-full justify-center text-xs py-2"
                            >
                                Vue rapide
                            </button>
                        )}
                    </div>
                </div>
            </a>

            {/* ── Info ────────────────────────────────────────── */}
            <div className="flex flex-col gap-1 pt-4 pb-2 px-0.5">
                {/* Style tag */}
                <p className="text-accent text-xs font-body tracking-[0.15em] uppercase">{product.style}</p>

                {/* Title */}
                <a href={`/products/${product.handle}`} className="font-heading text-xl text-primary hover:text-accent transition-colors leading-tight">
                    {product.title}
                </a>

                {/* Material */}
                <p className="text-sm text-muted">{product.material}</p>

                {/* Size variants */}
                {product.variants && product.variants.length > 0 && (
                    <p className="text-xs text-muted/70 mt-0.5">
                        {product.variants.map((v) => v.option).join(" · ")}
                    </p>
                )}

                {/* Pricing */}
                <div className="flex items-baseline gap-3 mt-2">
                    <span className="price text-xl">{formatPrice(product.price_ttc)}</span>
                    {product.compare_at_price_ttc > product.price_ttc && (
                        <span className="price-original">{formatPrice(product.compare_at_price_ttc)}</span>
                    )}
                </div>
            </div>
        </article>
    );
}
