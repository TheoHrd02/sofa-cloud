/**
 * SOFA-CLOUD — Variant Selector (PDP)
 * Sélecteur taille + matière · Prix temps réel · ARIA live region
 */

import { cn, formatPrice } from "~/lib/utils";
import type { MaterialOption, UseVariantReturn } from "~/hooks/useVariant";

interface VariantSelectorProps {
    variant: UseVariantReturn;
    className?: string;
}

/* ─── Taille Buttons ─────────────────────────────────────────────── */
function SizeButton({
    label,
    selected,
    stock,
    onClick,
}: {
    label: string;
    selected: boolean;
    stock: number;
    onClick: () => void;
}) {
    const isOutOfStock = stock === 0;
    return (
        <button
            onClick={onClick}
            disabled={isOutOfStock}
            aria-pressed={selected}
            aria-label={`${label}${isOutOfStock ? " — Épuisé" : ""}`}
            className={cn(
                "relative px-5 py-2.5 text-sm font-body font-medium border transition-all duration-250 focus-visible:ring-2 focus-visible:ring-accent",
                selected
                    ? "bg-primary text-white border-primary"
                    : "bg-transparent text-primary border-border hover:border-primary",
                isOutOfStock && "opacity-40 cursor-not-allowed"
            )}
        >
            {label}
            {isOutOfStock && (
                <span className="sr-only">(Épuisé)</span>
            )}
        </button>
    );
}

/* ─── Material Swatch ────────────────────────────────────────────── */
function MaterialSwatch({
    material,
    selected,
    onClick,
}: {
    material: MaterialOption;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            aria-pressed={selected}
            aria-label={`Matière : ${material.label}`}
            title={material.label}
            className={cn(
                "group flex items-center gap-2.5 px-3 py-2 border rounded-sm transition-all duration-250 text-sm focus-visible:ring-2 focus-visible:ring-accent",
                selected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
            )}
        >
            <span
                className={cn(
                    "w-4 h-4 rounded-full shrink-0 ring-offset-1 transition-all duration-250",
                    selected && "ring-2 ring-primary"
                )}
                style={{ backgroundColor: material.color }}
                aria-hidden="true"
            />
            <span className={cn("text-sm", selected ? "text-primary font-medium" : "text-muted")}>
                {material.label}
            </span>
        </button>
    );
}

/* ─── Main Selector ──────────────────────────────────────────────── */
export function VariantSelector({ variant, className }: VariantSelectorProps) {
    const {
        selectedSize,
        selectedMaterial,
        priceTtc,
        compareTtc,
        isInStock,
        stock,
        setSize,
        setMaterial,
        availableSizes,
        availableMaterials,
    } = variant;

    const discount = compareTtc > priceTtc
        ? Math.round((1 - priceTtc / compareTtc) * 100)
        : null;

    return (
        <div className={cn("space-y-6", className)}>

            {/* ── Prix (ARIA live pour alerter les lecteurs d'écran) ─── */}
            <div className="flex items-baseline gap-4 flex-wrap">
                <output
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label={`Prix : ${formatPrice(priceTtc)}`}
                    className="font-heading text-4xl text-primary tracking-tight"
                >
                    {formatPrice(priceTtc)}
                </output>
                {compareTtc > priceTtc && (
                    <span className="price-original text-base">
                        {formatPrice(compareTtc)}
                    </span>
                )}
                {discount && (
                    <span className="inline-flex items-center px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium tracking-wide">
                        -{discount}%
                    </span>
                )}
            </div>
            <p className="text-xs text-muted -mt-4">Prix TTC · Livraison offerte</p>

            {/* ── Taille ─────────────────────────────────────────────── */}
            <fieldset>
                <legend className="text-sm font-body font-medium text-primary mb-3 flex items-center gap-2">
                    Taille
                    <span className="text-muted font-normal">— {selectedSize}</span>
                </legend>
                <div role="group" className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => {
                        const s = variant.availableMaterials.length > 0 ? 10 : stock;
                        return (
                            <SizeButton
                                key={size}
                                label={size}
                                selected={selectedSize === size}
                                stock={s}
                                onClick={() => setSize(size)}
                            />
                        );
                    })}
                </div>
            </fieldset>

            {/* ── Matière (si disponible) ─────────────────────────────── */}
            {availableMaterials.length > 0 && (
                <fieldset>
                    <legend className="text-sm font-body font-medium text-primary mb-3 flex items-center gap-2">
                        Matière
                        <span className="text-muted font-normal">— {selectedMaterial}</span>
                    </legend>
                    <div role="group" className="flex flex-wrap gap-2">
                        {availableMaterials.map((mat) => (
                            <MaterialSwatch
                                key={mat.label}
                                material={mat}
                                selected={selectedMaterial === mat.label}
                                onClick={() => setMaterial(mat.label)}
                            />
                        ))}
                    </div>
                </fieldset>
            )}

            {/* ── Stock indicator ─────────────────────────────────────── */}
            <p className="text-xs text-muted flex items-center gap-1.5">
                <span className={cn("w-1.5 h-1.5 rounded-full", isInStock ? "bg-green-500" : "bg-red-400")} aria-hidden="true" />
                {isInStock
                    ? stock <= 3
                        ? `Plus que ${stock} exemplaire${stock > 1 ? "s" : ""} disponible`
                        : `En stock — Expédié sous 14-21 jours ouvrés`
                    : "Temporairement indisponible"}
            </p>
        </div>
    );
}
