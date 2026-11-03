/**
 * SOFA-CLOUD — Header
 * Transparent → blur on scroll · MegaMenu matières · Search · Cart icon
 *
 * Fonctionnalités :
 *   - Header transparent au-dessus du Hero, opacifié au scroll
 *   - Navigation mega-menu avec images (Matières, Styles, Collections)
 *   - Barre de recherche avec résultats en direct (useSearch)
 *   - Icône panier avec compteur (useCart)
 *   - Mobile : menu hamburger
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useCart } from "~/context/CartContext";
import { useSearch } from "~/hooks/useSearch";
import { useMounted } from "~/hooks/useMounted";
import { cn, formatPrice } from "~/lib/utils";

/* ─── Nav Data ──────────────────────────────────────────────────── */
const NAV_ITEMS = [
    {
        label: "Collections",
        href: "/products",
        mega: [
            { label: "Tous les canapés", href: "/products", description: "Notre catalogue complet", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80" },
            { label: "Nouveautés", href: "/products?sort=newest", description: "Les dernières créations", image: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=400&q=80" },
            { label: "Bestsellers", href: "/products?badge=bestseller", description: "Les incontournables", image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&q=80" },
            { label: "Exclusivités", href: "/products?badge=exclusif", description: "Pièces en édition limitée", image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=80" },
        ],
    },
    {
        label: "Matières",
        mega: [
            { label: "Velours", href: "/products?material=Velours", description: "Douceur & profondeur", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80" },
            { label: "Cuir", href: "/products?material=Cuir", description: "Noblesse intemporelle", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" },
            { label: "Lin & Coton", href: "/products?material=Lin", description: "Nature & authenticité", image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=80" },
            { label: "Bouclé", href: "/products?material=Bouclé", description: "Tendance nordique", image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&q=80" },
        ],
    },
    {
        label: "Styles",
        mega: [
            { label: "Contemporain", href: "/products?style=Contemporain", description: "Minimalisme raffiné", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80" },
            { label: "Chesterfield", href: "/products?style=Chesterfield", description: "Aristocratie britannique", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" },
            { label: "Scandinave", href: "/products?style=Scandinave", description: "Sérénité nordique", image: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=400&q=80" },
            { label: "Art Déco", href: "/products?style=Art+D%C3%A9co", description: "Géométrie des années 30", image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&q=80" },
        ],
    },
    { label: "Notre Histoire", href: "/about" },
];

/* ─── Search Overlay ────────────────────────────────────────────── */
function SearchOverlay({ onClose }: { onClose: () => void }) {
    const [query, setQuery] = useState("");
    const { results, isSearching } = useSearch(query);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    return (
        <>
            <div className="fixed inset-0 z-[70] bg-primary/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
            <div className="fixed top-0 left-0 right-0 z-[71] bg-surface shadow-premium-lg p-6 lg:p-8">
                <div className="container-site max-w-3xl">
                    {/* Input */}
                    <div className="flex items-center gap-4 border-b border-border pb-4">
                        <svg className="w-5 h-5 text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <input
                            ref={inputRef}
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Rechercher un canapé, une matière, un style…"
                            className="flex-1 bg-transparent text-primary text-lg placeholder:text-muted/50 focus:outline-none font-body"
                            aria-label="Recherche produit"
                            id="search-input"
                        />
                        <button onClick={onClose} aria-label="Fermer la recherche" className="text-muted hover:text-primary transition-colors p-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Results */}
                    {isSearching && (
                        <p className="text-muted text-sm py-4">Recherche en cours…</p>
                    )}
                    {!isSearching && query && results.length === 0 && (
                        <p className="text-muted text-sm py-4">Aucun résultat pour « {query} »</p>
                    )}
                    {results.length > 0 && (
                        <ul className="py-4 space-y-3" role="listbox" aria-label="Résultats de recherche">
                            {results.map((r) => (
                                <li key={r.handle} role="option" aria-selected="false">
                                    <a
                                        href={`/products/${r.handle}`}
                                        onClick={onClose}
                                        className="flex items-center gap-4 p-3 hover:bg-primary/5 transition-colors group"
                                    >
                                        <img
                                            src={r.imageUrl}
                                            alt={r.title}
                                            className="w-12 h-12 object-cover bg-gray-100 shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-heading text-primary group-hover:text-accent transition-colors">{r.title}</p>
                                            <p className="text-xs text-muted truncate">{r.material} · {r.style}</p>
                                        </div>
                                        <span className="price text-sm shrink-0">{formatPrice(r.price_ttc)}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                    {!query && (
                        <div className="py-4">
                            <p className="text-xs text-muted font-body uppercase tracking-widest mb-3">Suggestions populaires</p>
                            <div className="flex flex-wrap gap-2">
                                {["Velours", "Cuir", "Bouclé", "Contemporain", "Chesterfield"].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setQuery(s)}
                                        className="px-3 py-1.5 border border-border text-sm text-muted hover:border-primary hover:text-primary transition-colors"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

/* ─── MegaMenu ──────────────────────────────────────────────────── */
function MegaMenu({ items }: { items: { label: string; href: string; description: string; image: string }[] }) {
    return (
        <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-[700px] max-w-[95vw] bg-surface shadow-premium-lg border border-border/50 z-50 animate-fade-in"
        >
            <div className="grid grid-cols-4">
                {items.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        className="group block p-4 hover:bg-primary/3 transition-colors border-r border-border/30 last:border-r-0"
                    >
                        <div className="aspect-[4/3] overflow-hidden mb-3 bg-gray-100">
                            <img
                                src={item.image}
                                alt={item.label}
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                        <p className="font-heading text-sm text-primary group-hover:text-accent transition-colors leading-tight">
                            {item.label}
                        </p>
                        <p className="text-xs text-muted mt-0.5">{item.description}</p>
                    </a>
                ))}
            </div>
        </div>
    );
}

/* ─── Mobile Menu ───────────────────────────────────────────────── */
function MobileMenu({ onClose }: { onClose: () => void }) {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    return (
        <>
            <div className="fixed inset-0 z-[55] bg-primary/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
            <nav
                className="fixed top-0 left-0 bottom-0 z-[56] w-[80vw] max-w-sm bg-surface shadow-premium-lg overflow-y-auto flex flex-col"
                aria-label="Menu mobile"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <a href="/" className="font-heading text-primary text-xl" onClick={onClose}>Sofa-Cloud</a>
                    <button onClick={onClose} aria-label="Fermer" className="p-2 text-muted hover:text-primary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col gap-0 p-6">
                    <a href="/products" className="py-3 border-b border-border/50 font-heading text-primary text-lg" onClick={onClose}>Collections</a>
                    <a href="/products?material=Velours" className="py-2.5 border-b border-border/30 text-sm text-muted hover:text-primary" onClick={onClose}>Velours</a>
                    <a href="/products?material=Cuir" className="py-2.5 border-b border-border/30 text-sm text-muted hover:text-primary" onClick={onClose}>Cuir</a>
                    <a href="/products?material=Lin" className="py-2.5 border-b border-border/30 text-sm text-muted hover:text-primary" onClick={onClose}>Lin & Coton</a>
                    <a href="/products?material=Bouclé" className="py-2.5 border-b border-border/30 text-sm text-muted hover:text-primary" onClick={onClose}>Bouclé</a>
                    <a href="/products?style=Contemporain" className="py-2.5 border-b border-border/30 text-sm text-muted hover:text-primary" onClick={onClose}>Contemporain</a>
                    <a href="/products?style=Chesterfield" className="py-2.5 border-b border-border/30 text-sm text-muted hover:text-primary" onClick={onClose}>Chesterfield</a>
                    <a href="/about" className="py-3 border-b border-border/50 font-heading text-primary text-lg" onClick={onClose}>Notre Histoire</a>
                </div>

                <div className="mt-auto p-6 border-t border-border">
                    <a href="/products" className="btn-primary w-full justify-center" onClick={onClose}>Voir le catalogue →</a>
                </div>
            </nav>
        </>
    );
}

/* ─── Header ────────────────────────────────────────────────────── */
interface HeaderProps {
    isHeroVisible?: boolean;
}

export function Header({ isHeroVisible = false }: HeaderProps) {
    const mounted = useMounted();
    const { state, openCart, count } = useCart();
    const [scrolled, setScrolled] = useState(false);
    const [activeMega, setActiveMega] = useState<string | null>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Scroll detection
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleMegaEnter = useCallback((label: string) => {
        if (megaTimer.current) clearTimeout(megaTimer.current);
        setActiveMega(label);
    }, []);

    const handleMegaLeave = useCallback(() => {
        megaTimer.current = setTimeout(() => setActiveMega(null), 180);
    }, []);

    // Header is transparent only over Hero, opaque everywhere else
    const isTransparent = isHeroVisible && !scrolled && mounted;

    return (
        <>
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-40 transition-all duration-400",
                    isTransparent
                        ? "bg-transparent border-transparent"
                        : "bg-surface/95 backdrop-blur-md border-b border-border shadow-sm"
                )}
                style={{ height: "var(--header-height, 72px)" }}
            >
                <div className="container-site flex items-center justify-between h-full gap-6">
                    {/* Logo */}
                    <a
                        href="/"
                        className={cn(
                            "font-heading text-2xl tracking-tight transition-colors shrink-0",
                            isTransparent ? "text-white" : "text-primary"
                        )}
                        aria-label="Sofa-Cloud — Accueil"
                    >
                        Sofa-Cloud
                    </a>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale">
                        {NAV_ITEMS.map((item) => (
                            <div
                                key={item.label}
                                className="relative"
                                onMouseEnter={() => item.mega && handleMegaEnter(item.label)}
                                onMouseLeave={handleMegaLeave}
                            >
                                <a
                                    href={item.href ?? "/products"}
                                    className={cn(
                                        "px-4 py-2 text-sm font-body transition-colors inline-flex items-center gap-1",
                                        isTransparent
                                            ? "text-white/90 hover:text-white"
                                            : "text-muted hover:text-primary"
                                    )}
                                >
                                    {item.label}
                                    {item.mega && (
                                        <svg
                                            className={cn(
                                                "w-3 h-3 transition-transform duration-300",
                                                activeMega === item.label ? "rotate-180" : ""
                                            )}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                </a>
                                {item.mega && activeMega === item.label && (
                                    <MegaMenu items={item.mega} />
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                        {/* Search */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            aria-label="Rechercher"
                            id="header-search-btn"
                            className={cn(
                                "p-2.5 transition-colors",
                                isTransparent ? "text-white/80 hover:text-white" : "text-muted hover:text-primary"
                            )}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </button>

                        {/* Cart */}
                        <button
                            onClick={openCart}
                            aria-label={`Panier — ${count ?? 0} article${(count ?? 0) !== 1 ? "s" : ""}`}
                            id="header-cart-btn"
                            className={cn(
                                "relative p-2.5 transition-colors",
                                isTransparent ? "text-white/80 hover:text-white" : "text-muted hover:text-primary"
                            )}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                            </svg>
                            {mounted && (count ?? 0) > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                                    {count}
                                </span>
                            )}
                        </button>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileOpen(true)}
                            aria-label="Menu"
                            id="header-menu-btn"
                            className={cn(
                                "lg:hidden p-2.5 transition-colors",
                                isTransparent ? "text-white/80 hover:text-white" : "text-muted hover:text-primary"
                            )}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Search Overlay */}
            {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}

            {/* Mobile Menu */}
            {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
        </>
    );
}
