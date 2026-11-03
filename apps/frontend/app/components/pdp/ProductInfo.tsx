/**
 * SOFA-CLOUD — Product Info + Accordion (PDP)
 * Titre · Description · Specs accordéon · useInView animations
 */

import { useState } from "react";
import { cn } from "~/lib/utils";
import { useInView } from "~/hooks/useInView";

interface AccordionItem {
    title: string;
    content: string;
}

interface ProductInfoProps {
    title: string;
    style: string;
    material: string;
    bodyHtml: string;
    specs?: AccordionItem[];
}

const DEFAULT_SPECS: AccordionItem[] = [
    {
        title: "Dimensions & Poids",
        content: "2 Places : L.160 × P.90 × H.80 cm — 52 kg\n3 Places : L.210 × P.90 × H.80 cm — 68 kg\n4 Places : L.260 × P.90 × H.80 cm — 84 kg\nHauteur assise : 43 cm · Profondeur assise : 58 cm",
    },
    {
        title: "Entretien & Matières",
        content: "Dépoussiérage régulier à l'aspirateur (embout doux). Pour les taches, utiliser un chiffon légèrement humide et tamponner sans frotter. Ne pas utiliser de produits abrasifs. Nettoyage professionnel recommandé une fois par an.",
    },
    {
        title: "Livraison & Installation",
        content: "Livraison à domicile par nos équipes spécialisées. Installation et mise en place incluses. Reprise de vos anciens meubles possible sur demande (+99€). Délais : 14 à 21 jours ouvrés selon disponibilité.",
    },
    {
        title: "Garantie",
        content: "Structure et mécanismes : 5 ans. Revêtement et garniture : 2 ans. Garantie commerciale Sofa-Cloud applicable en cas de défaut de fabrication. Voir nos CGV pour les détails.",
    },
];

function AccordionPanel({ item }: { item: AccordionItem }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b border-border last:border-0">
            <button
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                className="w-full flex items-center justify-between py-4 text-left group focus-visible:outline-accent"
            >
                <span className="text-sm font-body font-medium text-primary group-hover:text-accent transition-colors">
                    {item.title}
                </span>
                <svg
                    className={cn("w-4 h-4 text-muted transition-transform duration-300", open && "rotate-180")}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div
                className={cn(
                    "overflow-hidden transition-all duration-350 ease-premium",
                    open ? "max-h-64 pb-4" : "max-h-0"
                )}
            >
                <p className="text-sm text-muted font-body leading-relaxed whitespace-pre-line">
                    {item.content}
                </p>
            </div>
        </div>
    );
}

export function ProductInfo({ title, style, material, bodyHtml, specs = DEFAULT_SPECS }: ProductInfoProps) {
    const [titleRef, titleInView] = useInView<HTMLDivElement>({ threshold: 0.2 });
    const [descRef, descInView] = useInView<HTMLDivElement>({ threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    return (
        <div className="space-y-6">
            {/* ── En-tête produit ──────────────────────── */}
            <div
                ref={titleRef}
                className={cn(
                    "space-y-1 transition-all duration-700 ease-premium",
                    titleInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
            >
                <p className="text-accent text-xs font-body tracking-[0.2em] uppercase">{style}</p>
                <h1
                    className="font-heading text-primary leading-tight"
                    style={{ fontSize: "clamp(2rem, 3vw, 2.75rem)" }}
                >
                    {title}
                </h1>
                <p className="text-sm text-muted">{material}</p>
            </div>

            {/* ── Description HTML ─────────────────────── */}
            <div
                ref={descRef}
                className={cn(
                    "transition-all duration-700 delay-100 ease-premium",
                    descInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
            >
                <div
                    className="prose prose-sm max-w-none text-muted font-body leading-relaxed [&>p]:mb-3 [&>ul]:mt-2 [&>ul>li]:text-sm [&>ul>li]:before:content-['—_'] [&>ul>li]:before:text-accent"
                    dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
            </div>

            {/* ── Accordéon specs ──────────────────────── */}
            <div className="border-t border-border pt-4">
                {specs.map((item) => (
                    <AccordionPanel key={item.title} item={item} />
                ))}
            </div>
        </div>
    );
}
