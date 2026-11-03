/**
 * SOFA-CLOUD — Category Grid
 * 4 tuiles matières vers /products?material=X
 * Hover parallax léger · Overlay gradient · Animation useInView
 */

import { cn } from "~/lib/utils";
import { useInView } from "~/hooks/useInView";

const CATEGORIES = [
    {
        label: "Velours",
        description: "Douceur & profondeur",
        href: "/products?material=Velours",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    },
    {
        label: "Cuir",
        description: "Noblesse intemporelle",
        href: "/products?material=Cuir",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    },
    {
        label: "Lin & Coton",
        description: "Nature & authenticité",
        href: "/products?material=Lin",
        image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80",
    },
    {
        label: "Bouclé",
        description: "Tendance nordique",
        href: "/products?material=Bouclé",
        image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80",
    },
];

function CategoryTile({
    cat,
    delay,
}: {
    cat: (typeof CATEGORIES)[number];
    delay: number;
}) {
    const [ref, inView] = useInView<HTMLAnchorElement>({ threshold: 0.15 });

    return (
        <a
            ref={ref}
            href={cat.href}
            className={cn(
                "group relative block aspect-[3/4] overflow-hidden bg-gray-100 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                "transition-all duration-700 ease-premium",
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
            style={{ transitionDelay: `${delay}ms` }}
            aria-label={`Explorer la catégorie ${cat.label}`}
        >
            {/* Image */}
            <img
                src={cat.image}
                alt={cat.label}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-premium group-hover:scale-110"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />

            {/* Text */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-secondary text-xs tracking-[0.2em] uppercase font-body mb-1">
                    {cat.description}
                </p>
                <p className="font-heading text-white text-2xl leading-tight group-hover:text-secondary transition-colors duration-300">
                    {cat.label}
                </p>
            </div>

            {/* Arrow reveal */}
            <div className="absolute top-4 right-4 w-9 h-9 bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
            </div>
        </a>
    );
}

export function CategoryGrid({ className }: { className?: string }) {
    return (
        <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6", className)}>
            {CATEGORIES.map((cat, i) => (
                <CategoryTile key={cat.label} cat={cat} delay={i * 100} />
            ))}
        </div>
    );
}
