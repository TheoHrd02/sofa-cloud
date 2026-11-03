/**
 * SOFA-CLOUD — Product Filters (PLP)
 * Sidebar filtres : matière, style, taille, prix
 * Sync URL search params — navigation native Remix
 */

import { useCallback } from "react";
import { cn } from "~/lib/utils";

/* ─── Filter Options (sync avec middleware mock data) ─────────────── */
export const FILTER_OPTIONS = {
    materials: ["Velours", "Cuir", "Lin & Coton", "Bouclé", "Tissu chiné", "Tissu outdoor"],
    styles: ["Contemporain", "Chesterfield", "Scandinave", "Art Déco", "Méditerranéen", "Côtier", "Industriel", "Haussmannien", "Provençal"],
    sizes: ["2 Places", "3 Places", "4 Places"],
    priceRanges: [
        { label: "Moins de 1 500 €", value: "0-1500" },
        { label: "1 500 € – 2 000 €", value: "1500-2000" },
        { label: "2 000 € – 2 500 €", value: "2000-2500" },
        { label: "Plus de 2 500 €", value: "2500-9999" },
    ],
};

export type SortOption = "featured" | "price-asc" | "price-desc" | "newest";

export interface ActiveFilters {
    material?: string;
    style?: string;
    size?: string;
    price?: string;
    sort?: SortOption;
    q?: string;
}

/* ─── Filter Section ──────────────────────────────────────────────── */
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="border-b border-border py-5">
            <p className="text-xs font-medium text-primary uppercase tracking-wider mb-3">{title}</p>
            {children}
        </div>
    );
}

/* ─── Checkbox Option ─────────────────────────────────────────────── */
function CheckOption({
    label, value, active, onToggle
}: { label: string; value: string; active: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            aria-pressed={active}
            className={cn(
                "w-full flex items-center gap-2.5 py-1.5 text-sm text-left transition-colors focus-visible:outline-accent",
                active ? "text-primary font-medium" : "text-muted hover:text-primary"
            )}
        >
            <span className={cn(
                "w-4 h-4 border flex items-center justify-center shrink-0 transition-colors",
                active ? "bg-primary border-primary" : "border-border"
            )}>
                {active && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </span>
            {label}
        </button>
    );
}

/* ─── Sort Select ─────────────────────────────────────────────────── */
function SortSelect({ value, onChange }: { value?: SortOption; onChange: (v: SortOption) => void }) {
    return (
        <select
            value={value ?? "featured"}
            onChange={(e) => onChange(e.target.value as SortOption)}
            className="text-sm text-primary bg-surface border border-border px-3 py-2 focus:outline-accent cursor-pointer"
            aria-label="Trier les produits"
        >
            <option value="featured">Populaires</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="newest">Nouveautés</option>
        </select>
    );
}

/* ─── Main Filters Component ──────────────────────────────────────── */
interface ProductFiltersProps {
    filters: ActiveFilters;
    onFilterChange: (key: keyof ActiveFilters, value: string | undefined) => void;
    onClearAll: () => void;
    totalCount: number;
    className?: string;
}

export function ProductFilters({ filters, onFilterChange, onClearAll, totalCount, className }: ProductFiltersProps) {
    const toggle = useCallback(
        (key: keyof ActiveFilters, value: string) => {
            onFilterChange(key, filters[key] === value ? undefined : value);
        },
        [filters, onFilterChange]
    );

    const activeCount = Object.values(filters).filter(Boolean).length;

    return (
        <aside aria-label="Filtres produits" className={cn("space-y-0", className)}>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
                <p className="font-heading text-lg text-primary">Filtrer</p>
                {activeCount > 0 && (
                    <button onClick={onClearAll} className="text-xs text-accent hover:text-accent/80 underline underline-offset-2 transition-colors">
                        Tout effacer ({activeCount})
                    </button>
                )}
            </div>

            {/* Sort (mobile-first) */}
            <FilterSection title="Trier par">
                <SortSelect value={filters.sort} onChange={(v) => onFilterChange("sort", v)} />
            </FilterSection>

            {/* Matière */}
            <FilterSection title="Matière">
                <div className="space-y-0.5">
                    {FILTER_OPTIONS.materials.map((mat) => (
                        <CheckOption
                            key={mat}
                            label={mat}
                            value={mat}
                            active={filters.material === mat}
                            onToggle={() => toggle("material", mat)}
                        />
                    ))}
                </div>
            </FilterSection>

            {/* Style */}
            <FilterSection title="Style">
                <div className="space-y-0.5">
                    {FILTER_OPTIONS.styles.map((style) => (
                        <CheckOption
                            key={style}
                            label={style}
                            value={style}
                            active={filters.style === style}
                            onToggle={() => toggle("style", style)}
                        />
                    ))}
                </div>
            </FilterSection>

            {/* Taille */}
            <FilterSection title="Taille">
                <div className="flex flex-wrap gap-2">
                    {FILTER_OPTIONS.sizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => toggle("size", size)}
                            aria-pressed={filters.size === size}
                            className={cn(
                                "px-3 py-1.5 border text-xs transition-all",
                                filters.size === size
                                    ? "bg-primary text-white border-primary"
                                    : "border-border text-muted hover:border-primary hover:text-primary"
                            )}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </FilterSection>

            {/* Prix */}
            <FilterSection title="Budget">
                <div className="space-y-0.5">
                    {FILTER_OPTIONS.priceRanges.map((range) => (
                        <CheckOption
                            key={range.value}
                            label={range.label}
                            value={range.value}
                            active={filters.price === range.value}
                            onToggle={() => toggle("price", range.value)}
                        />
                    ))}
                </div>
            </FilterSection>

            <p className="text-xs text-muted pt-3">{totalCount} produit{totalCount !== 1 ? "s" : ""}</p>
        </aside>
    );
}
