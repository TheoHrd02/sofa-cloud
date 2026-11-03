/**
 * SOFA-CLOUD — Cross-Sell (PDP)
 * "Complétez votre intérieur" — même style ou même color_family
 * Animation scroll staggered via useInView
 */

import { cn, formatPrice } from "~/lib/utils";
import { useInView } from "~/hooks/useInView";

interface RelatedProduct {
    handle: string;
    title: string;
    style: string;
    material: string;
    price_ttc: number;
    compare_at_price_ttc: number;
    imageUrl?: string;
}

interface CrossSellProps {
    products: RelatedProduct[];
    currentHandle: string;
    className?: string;
}

function CrossSellCard({ product, delay }: { product: RelatedProduct; delay: number }) {
    const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.15 });
    const fallback = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=75";

    return (
        <div
            ref={ref}
            className={cn(
                "group transition-all duration-700 ease-premium",
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {/* Image */}
            <a href={`/products/${product.handle}`} className="block relative aspect-[4/5] bg-gray-100 overflow-hidden mb-3 focus-visible:ring-2 focus-visible:ring-accent">
                <img
                    src={product.imageUrl ?? fallback}
                    alt={`${product.title} — ${product.material}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
                />
            </a>

            {/* Info */}
            <a href={`/products/${product.handle}`} className="block group-hover:text-accent transition-colors">
                <p className="text-accent text-xs tracking-widest uppercase font-body mb-0.5">{product.style}</p>
                <p className="font-heading text-lg text-primary group-hover:text-accent transition-colors">{product.title}</p>
                <p className="text-xs text-muted mb-2">{product.material}</p>
                <div className="flex items-baseline gap-2">
                    <span className="price text-base">{formatPrice(product.price_ttc)}</span>
                    {product.compare_at_price_ttc > product.price_ttc && (
                        <span className="price-original text-xs">{formatPrice(product.compare_at_price_ttc)}</span>
                    )}
                </div>
            </a>
        </div>
    );
}

export function CrossSell({ products, currentHandle, className }: CrossSellProps) {
    const related = products.filter((p) => p.handle !== currentHandle).slice(0, 3);
    if (related.length === 0) return null;

    const [titleRef, titleInView] = useInView<HTMLDivElement>({ threshold: 0.2 });

    return (
        <section aria-labelledby="cross-sell-heading" className={cn("section-padding border-t border-border", className)}>
            <div className="container-site">
                {/* Header */}
                <div
                    ref={titleRef}
                    className={cn(
                        "mb-10 transition-all duration-700 ease-premium",
                        titleInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                >
                    <p className="text-accent font-body text-xs tracking-[0.2em] uppercase mb-2">Vous aimerez aussi</p>
                    <h2 id="cross-sell-heading" className="font-heading text-primary" style={{ fontSize: "clamp(1.75rem, 2.5vw, 2.25rem)" }}>
                        Complétez votre intérieur
                    </h2>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-10">
                    {related.map((product, i) => (
                        <CrossSellCard key={product.handle} product={product} delay={i * 100} />
                    ))}
                </div>
            </div>
        </section>
    );
}
