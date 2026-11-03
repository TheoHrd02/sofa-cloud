/**
 * SOFA-CLOUD — Product Listing Page (PLP)
 * Route : /products
 *
 * Filtres actifs 100% URL-synced (Remix navigate) :
 *   ?material=Velours&style=Contemporain&size=3+Places&price=1500-2500&sort=price-asc
 *
 * Données : API middleware (source unique).
 * Filtrage/sort appliqué côté loader après fetch.
 */

import { useState, useCallback } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import { json } from "@remix-run/node";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { SideCart } from "~/components/SideCart";
import { ProductCard } from "~/components/ProductCard";
import { ProductFilters, type ActiveFilters, type SortOption } from "~/components/plp/ProductFilters";
import { QuickView, type QuickViewProduct } from "~/components/plp/QuickView";
import { useInView } from "~/hooks/useInView";
import { cn } from "~/lib/utils";
import { fetchProducts } from "~/services/api.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => [
    { title: `Collections Canapés (${data?.totalCount ?? 0} produits) — Sofa-Cloud` },
    { name: "description", content: "Parcourez notre catalogue de canapés premium : filtrez par matière, style, taille et budget. Livraison gratuite dès 1 500 €." },
];

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const params = url.searchParams;

    const activeFilters: ActiveFilters = {
        material: params.get("material") ?? undefined,
        style: params.get("style") ?? undefined,
        size: params.get("size") ?? undefined,
        price: params.get("price") ?? undefined,
        sort: (params.get("sort") ?? "featured") as SortOption,
        q: params.get("q") ?? undefined,
    };

    const { products: rawProducts } = await fetchProducts({
        limit: 50,
        offset: 0,
        q: activeFilters.q,
    });

    const sizeFilter = activeFilters.size || "3 Places";

    let products = rawProducts.map((p) => {
        const variant = p.variants?.find((v) => v.option === sizeFilter);
        const price_ttc = variant?.price_ttc ?? p.price_ttc;
        const compare_at_price_ttc = variant?.compare_at_price_ttc ?? p.compare_at_price_ttc;

        return {
            ...p,
            price_ttc,
            compare_at_price_ttc,
            variants: p.variants ?? [
                { option: "2 Places" },
                { option: "3 Places" },
                { option: "4 Places" },
            ],
        };
    });

    if (activeFilters.material) {
        const mat = activeFilters.material.toLowerCase();
        products = products.filter(
            (p) =>
                (p.material ?? "").toLowerCase().includes(mat) ||
                mat.includes((p.material ?? "").toLowerCase())
        );
    }

    if (activeFilters.style) {
        products = products.filter(
            (p) => (p.style ?? "").toLowerCase() === activeFilters.style!.toLowerCase()
        );
    }

    if (activeFilters.price) {
        const [lo, hi] = activeFilters.price.split("-").map(Number);
        products = products.filter((p) => p.price_ttc >= lo && p.price_ttc <= hi);
    }

    switch (activeFilters.sort) {
        case "price-asc":
            products.sort((a, b) => a.price_ttc - b.price_ttc);
            break;
        case "price-desc":
            products.sort((a, b) => b.price_ttc - a.price_ttc);
            break;
        case "newest":
            products.reverse();
            break;
    }

    return json({ products, activeFilters, totalCount: products.length });
}

function EmptyState({ onReset }: { onReset: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-6 opacity-20 font-heading">∅</div>
            <h2 className="font-heading text-2xl text-primary mb-3">Aucun produit trouvé</h2>
            <p className="text-muted text-sm mb-8 max-w-xs leading-relaxed">
                Aucun canapé ne correspond à votre sélection de filtres. Essayez d'élargir vos critères.
            </p>
            <button onClick={onReset} className="btn-primary">Réinitialiser les filtres</button>
        </div>
    );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <button
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-primary/5 border border-primary/20 text-primary hover:bg-accent/10 hover:border-accent transition-colors"
        >
            {label}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    );
}

export default function ProductsPage() {
    const { products, activeFilters, totalCount } = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [quickViewProduct, setQuickViewProduct] = useState<QuickViewProduct | null>(null);
    const [filterOpen, setFilterOpen] = useState(false);

    const handleFilterChange = useCallback(
        (key: keyof ActiveFilters, value: string | undefined) => {
            const params = new URLSearchParams(searchParams);
            if (value) params.set(key, value);
            else params.delete(key);
            navigate(`/products?${params.toString()}`, { replace: true });
        },
        [navigate, searchParams]
    );

    const handleClearAll = useCallback(() => {
        navigate("/products", { replace: true });
    }, [navigate]);

    const activeFilterCount = Object.entries(activeFilters).filter(
        ([k, v]) => k !== "sort" && v
    ).length;

    const [gridRef, gridInView] = useInView<HTMLDivElement>({ threshold: 0.05 });

    return (
        <>
            <Header />
            <main id="main-content" className="pt-[var(--header-height,80px)]">
                <div className="bg-surface border-b border-border py-10">
                    <div className="container-site">
                        <p className="text-accent text-xs tracking-widest uppercase font-body mb-2">Catalogue</p>
                        <h1 className="font-heading text-primary mb-1" style={{ fontSize: "clamp(2rem, 3vw, 2.75rem)" }}>
                            {activeFilters.material ? `Canapés ${activeFilters.material}` :
                                activeFilters.style ? `Canapés ${activeFilters.style}` :
                                    activeFilters.q ? `Résultats pour "${activeFilters.q}"` :
                                        "Toutes nos Collections"}
                        </h1>
                        <p className="text-muted text-sm">{totalCount} produit{totalCount !== 1 ? "s" : ""}</p>
                    </div>
                </div>

                {activeFilterCount > 0 && (
                    <div className="border-b border-border bg-background">
                        <div className="container-site py-3 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted font-body mr-1">Filtres actifs :</span>
                            {activeFilters.material && (
                                <FilterPill label={`Matière : ${activeFilters.material}`} onRemove={() => handleFilterChange("material", undefined)} />
                            )}
                            {activeFilters.style && (
                                <FilterPill label={`Style : ${activeFilters.style}`} onRemove={() => handleFilterChange("style", undefined)} />
                            )}
                            {activeFilters.size && (
                                <FilterPill label={`Taille : ${activeFilters.size}`} onRemove={() => handleFilterChange("size", undefined)} />
                            )}
                            {activeFilters.price && (
                                <FilterPill label={`Budget : ${activeFilters.price.replace("-", " – ")} €`} onRemove={() => handleFilterChange("price", undefined)} />
                            )}
                            <button onClick={handleClearAll} className="text-xs text-accent underline underline-offset-2 hover:text-accent/70 ml-2">
                                Tout effacer
                            </button>
                        </div>
                    </div>
                )}

                <div className="container-site py-10">
                    <div className="flex gap-10">
                        <aside className="hidden lg:block w-56 shrink-0">
                            <div className="sticky top-[calc(var(--header-height,80px)+1.5rem)]">
                                <ProductFilters
                                    filters={activeFilters}
                                    onFilterChange={handleFilterChange}
                                    onClearAll={handleClearAll}
                                    totalCount={totalCount}
                                />
                            </div>
                        </aside>

                        <div className="flex-1 min-w-0">
                            <div className="lg:hidden flex items-center justify-between mb-6 gap-3">
                                <button
                                    onClick={() => setFilterOpen(true)}
                                    className="flex items-center gap-2 text-sm border border-border px-4 py-2 text-primary hover:border-primary transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h18M7 12h10M11 20h2" />
                                    </svg>
                                    Filtrer
                                    {activeFilterCount > 0 && (
                                        <span className="bg-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>
                                    )}
                                </button>
                                <select
                                    value={activeFilters.sort ?? "featured"}
                                    onChange={(e) => handleFilterChange("sort", e.target.value)}
                                    className="text-sm border border-border px-3 py-2 text-primary bg-surface focus:outline-accent"
                                    aria-label="Trier les produits"
                                >
                                    <option value="featured">Populaires</option>
                                    <option value="price-asc">Prix croissant</option>
                                    <option value="price-desc">Prix décroissant</option>
                                    <option value="newest">Nouveautés</option>
                                </select>
                            </div>

                            <div className="hidden lg:flex items-center justify-end mb-8">
                                <label className="text-xs text-muted mr-3 font-body">Trier par</label>
                                <select
                                    value={activeFilters.sort ?? "featured"}
                                    onChange={(e) => handleFilterChange("sort", e.target.value)}
                                    className="text-sm border border-border px-3 py-2 text-primary bg-surface focus:outline-accent cursor-pointer"
                                    aria-label="Trier les produits"
                                >
                                    <option value="featured">Populaires</option>
                                    <option value="price-asc">Prix croissant</option>
                                    <option value="price-desc">Prix décroissant</option>
                                    <option value="newest">Nouveautés</option>
                                </select>
                            </div>

                            {products.length === 0 ? (
                                <EmptyState onReset={handleClearAll} />
                            ) : (
                                <div
                                    ref={gridRef}
                                    className={cn(
                                        "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 transition-opacity duration-500",
                                        gridInView ? "opacity-100" : "opacity-0"
                                    )}
                                >
                                    {products.map((product, i) => (
                                        <ProductCard
                                            key={product.handle}
                                            product={product}
                                            priority={i < 3}
                                            onQuickView={(p) => setQuickViewProduct(p as unknown as QuickViewProduct)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {filterOpen && (
                    <>
                        <div className="fixed inset-0 z-[50] bg-primary/30 backdrop-blur-sm lg:hidden" onClick={() => setFilterOpen(false)} aria-hidden="true" />
                        <div className="fixed bottom-0 left-0 right-0 z-[51] bg-surface max-h-[85vh] overflow-y-auto p-6 lg:hidden shadow-premium-lg">
                            <div className="flex items-center justify-between mb-4">
                                <p className="font-heading text-primary text-lg">Filtres</p>
                                <button onClick={() => setFilterOpen(false)} aria-label="Fermer" className="p-1 text-muted hover:text-primary">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <ProductFilters
                                filters={activeFilters}
                                onFilterChange={(k, v) => { handleFilterChange(k, v); setFilterOpen(false); }}
                                onClearAll={() => { handleClearAll(); setFilterOpen(false); }}
                                totalCount={totalCount}
                            />
                        </div>
                    </>
                )}
            </main>

            <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
            <Footer />
            <SideCart />
        </>
    );
}
