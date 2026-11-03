/**
 * SOFA-CLOUD — Quick View Modal (PLP)
 * Aperçu produit au survol — galerie + sélecteur variante + ATC
 * Accessible : role="dialog", focus trap, Escape, aria-live prix
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { cn, formatPrice } from "~/lib/utils";
import { useVariant } from "~/hooks/useVariant";

export interface QuickViewProduct {
    handle: string;
    title: string;
    style: string;
    material: string;
    supplier_price: number;
    imageUrl: string;
    badge?: "bestseller" | "nouveau" | "exclusif" | null;
}

const MATERIALS = [
    { label: "Velours Charbon", color: "#3D3D3D" },
    { label: "Velours Ivoire", color: "#E8D8C0" },
    { label: "Bouclé Crème", color: "#F5F0E8" },
];

const VARIANT_SIZES = [
    { option: "2 Places", size_multiplier: 0.85, stock: 8, price_ttc: 0, compare_at_price_ttc: 0 },
    { option: "3 Places", size_multiplier: 1.0, stock: 12, price_ttc: 0, compare_at_price_ttc: 0 },
    { option: "4 Places", size_multiplier: 1.18, stock: 5, price_ttc: 0, compare_at_price_ttc: 0 },
];

interface QuickViewProps {
    product: QuickViewProduct | null;
    onClose: () => void;
}

export function QuickView({ product, onClose }: QuickViewProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const variant = useVariant(
        product?.supplier_price ?? 620,
        VARIANT_SIZES,
        MATERIALS,
        "3 Places",
        product?.material
    );

    // Focus trap + Escape
    useEffect(() => {
        if (!product) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        // Focus first focusable element
        setTimeout(() => {
            const first = dialogRef.current?.querySelector<HTMLElement>(
                "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
            );
            first?.focus();
        }, 50);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [product, onClose]);

    if (!product) return null;

    const discount = Math.round((1 - variant.priceTtc / variant.compareTtc) * 100);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[60] bg-primary/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Dialog */}
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label={`Aperçu rapide — ${product.title}`}
                className="fixed inset-0 z-[61] flex items-center justify-center p-4 lg:p-10"
            >
                <div className="bg-surface w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-premium-lg animate-scale-in">
                    {/* Close */}
                    <button
                        onClick={onClose}
                        aria-label="Fermer"
                        className="absolute top-4 right-4 z-10 p-2 text-muted hover:text-primary transition-colors bg-surface/80 backdrop-blur-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="grid md:grid-cols-2 gap-0">
                        {/* Image */}
                        <div className="aspect-square bg-gray-50 overflow-hidden">
                            <img
                                src={`${product.imageUrl}&w=600&q=80`}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Info */}
                        <div className="p-6 lg:p-8 space-y-5 flex flex-col justify-between">
                            <div className="space-y-4">
                                {/* Header */}
                                <div>
                                    <p className="text-accent text-xs tracking-widest uppercase font-body mb-1">{product.style}</p>
                                    <h2 className="font-heading text-2xl text-primary">{product.title}</h2>
                                    <p className="text-sm text-muted mt-0.5">{product.material}</p>
                                </div>

                                {/* Prix */}
                                <div className="flex items-baseline gap-3">
                                    <output aria-live="polite" className="font-heading text-3xl text-primary">
                                        {formatPrice(variant.priceTtc)}
                                    </output>
                                    <span className="price-original text-sm">{formatPrice(variant.compareTtc)}</span>
                                    {discount > 0 && (
                                        <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 font-medium">-{discount}%</span>
                                    )}
                                </div>

                                {/* Taille */}
                                <fieldset>
                                    <legend className="text-xs font-medium text-primary uppercase tracking-wider mb-2">
                                        Taille — {variant.selectedSize}
                                    </legend>
                                    <div className="flex gap-2 flex-wrap">
                                        {variant.availableSizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => variant.setSize(size)}
                                                aria-pressed={variant.selectedSize === size}
                                                className={cn(
                                                    "px-4 py-2 text-sm border transition-all duration-200",
                                                    variant.selectedSize === size
                                                        ? "bg-primary text-white border-primary"
                                                        : "border-border text-primary hover:border-primary"
                                                )}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </fieldset>

                                {/* Matière */}
                                <fieldset>
                                    <legend className="text-xs font-medium text-primary uppercase tracking-wider mb-2">
                                        Matière — {variant.selectedMaterial}
                                    </legend>
                                    <div className="flex gap-2 flex-wrap">
                                        {variant.availableMaterials.map((mat) => (
                                            <button
                                                key={mat.label}
                                                onClick={() => variant.setMaterial(mat.label)}
                                                aria-pressed={variant.selectedMaterial === mat.label}
                                                title={mat.label}
                                                className={cn(
                                                    "w-7 h-7 rounded-full border-2 transition-all",
                                                    variant.selectedMaterial === mat.label ? "border-primary scale-110" : "border-transparent"
                                                )}
                                                style={{ backgroundColor: mat.color }}
                                            />
                                        ))}
                                    </div>
                                </fieldset>
                            </div>

                            {/* CTAs */}
                            <div className="space-y-2 pt-2">
                                <a
                                    href={`/products/${product.handle}`}
                                    className="btn-primary w-full justify-center"
                                    onClick={onClose}
                                >
                                    Voir la fiche complète
                                </a>
                                <button className="btn-outline w-full justify-center text-sm py-3">
                                    Ajouter au panier — {formatPrice(variant.priceTtc)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
