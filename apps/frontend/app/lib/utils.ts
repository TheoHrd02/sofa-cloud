/**
 * SOFA-CLOUD — Utilities
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely — deduplicates conflicting classes */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

/** Formate un prix en euros */
export function formatPrice(amount: number | string, currency = "EUR"): string {
    return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(amount));
}

/** Génère un slug depuis un titre */
export function slugify(str: string): string {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
}
