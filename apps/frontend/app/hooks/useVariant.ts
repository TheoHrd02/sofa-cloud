/**
 * SOFA-CLOUD — useVariant Hook
 * State machine pour la gestion des variantes produit.
 * Prix calculé localement — zéro latence réseau.
 */

import { useState, useCallback, useMemo } from "react";

// ─── Pricing Engine (côté client, miroir de services/pricing.py) ──────────────
const MULTIPLIER = 2.5;
const FEES = 150;
const VAT = 1.20;
const COMPARE_MULTIPLIER = 3.2;

const SIZE_MULTIPLIERS: Record<string, number> = {
    "2 Places": 0.85,
    "3 Places": 1.0,
    "4 Places": 1.18,
};

function calculatePrice(supplierPrice: number, sizeMultiplier: number) {
    const adjustedCost = supplierPrice * sizeMultiplier;
    const priceHt = adjustedCost * MULTIPLIER + FEES;
    const priceTtc = Math.round(priceHt * VAT * 100) / 100;
    const compareHt = adjustedCost * COMPARE_MULTIPLIER + FEES;
    const compareTtc = Math.round(compareHt * VAT * 100) / 100;
    const marginPct = ((priceHt - adjustedCost) / priceHt) * 100;
    return { priceHt, priceTtc, compareTtc, marginPct };
}

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface ProductVariant {
    option: string;         // "2 Places"
    price_ttc: number;
    compare_at_price_ttc: number;
    stock: number;
    sku?: string;
}

export interface MaterialOption {
    label: string;
    color: string;          // CSS hex/hsl
    imageIndex?: number;    // index de l'image dans la galerie
}

export interface VariantState {
    selectedSize: string;
    selectedMaterial: string;
    priceTtc: number;
    compareTtc: number;
    marginPct: number;
    stock: number;
    isInStock: boolean;
}

export interface UseVariantReturn extends VariantState {
    setSize: (size: string) => void;
    setMaterial: (material: string) => void;
    availableSizes: string[];
    availableMaterials: MaterialOption[];
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useVariant(
    supplierPrice: number,
    variants: ProductVariant[],
    materials: MaterialOption[] = [],
    initialSize = "3 Places",
    initialMaterial?: string
): UseVariantReturn {
    const [selectedSize, setSelectedSize] = useState(initialSize);
    const [selectedMaterial, setSelectedMaterial] = useState(
        initialMaterial ?? materials[0]?.label ?? ""
    );

    // Calcul du prix dynamique depuis supplierPrice + taille sélectionnée
    const pricing = useMemo(() => {
        const mult = SIZE_MULTIPLIERS[selectedSize] ?? 1.0;
        return calculatePrice(supplierPrice, mult);
    }, [supplierPrice, selectedSize]);

    // Stock depuis les données variantes
    const stock = useMemo(() => {
        return variants.find((v) => v.option === selectedSize)?.stock ?? 0;
    }, [variants, selectedSize]);

    const setSize = useCallback((size: string) => {
        if (SIZE_MULTIPLIERS[size] !== undefined) setSelectedSize(size);
    }, []);

    const setMaterial = useCallback((material: string) => {
        setSelectedMaterial(material);
    }, []);

    return {
        selectedSize,
        selectedMaterial,
        priceTtc: pricing.priceTtc,
        compareTtc: pricing.compareTtc,
        marginPct: pricing.marginPct,
        stock,
        isInStock: stock > 0,
        setSize,
        setMaterial,
        availableSizes: Object.keys(SIZE_MULTIPLIERS),
        availableMaterials: materials,
    };
}
