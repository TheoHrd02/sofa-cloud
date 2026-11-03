/**
 * SOFA-CLOUD — useSearch Hook
 * Debounced product search via API (/api/products?q=).
 * Plus de catalogue local — source unique middleware.
 */

import { useState, useEffect, useCallback } from "react";
import { fetchProductsClient } from "~/services/api.client";

export interface SearchResult {
    handle: string;
    title: string;
    material: string;
    style: string;
    price_ttc: number;
    imageUrl: string;
}

export function useSearch(query: string, debounceMs = 300) {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const timer = setTimeout(async () => {
            try {
                const data = await fetchProductsClient({ q: query.trim() });
                const mapped: SearchResult[] = data.products.slice(0, 6).map((p) => ({
                    handle: p.handle,
                    title: p.title,
                    material: p.material ?? "",
                    style: p.style ?? "",
                    price_ttc: p.price_ttc,
                    imageUrl: p.imageUrl ?? "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=70",
                }));
                setResults(mapped);
            } catch {
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [query, debounceMs]);

    return { results, isSearching };
}
