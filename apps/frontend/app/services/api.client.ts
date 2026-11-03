/**
 * SOFA-CLOUD — API Client (Client-side)
 * Fetch vers nos propres resource routes (same-origin).
 * Utilisé par useSearch et tout appel côté client.
 */

import type { ApiProduct, ApiProductsResponse } from "./api.server";

export type { ApiProduct, ApiProductsResponse };

/** GET /api/products — catalogue (pour recherche, etc.) */
export async function fetchProductsClient(params?: { q?: string }): Promise<ApiProductsResponse> {
    const search = new URLSearchParams();
    if (params?.q?.trim()) search.set("q", params.q.trim());

    const url = `/api/products${search.toString() ? `?${search}` : ""}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });

    if (!res.ok) {
        throw new Error(`API products failed: ${res.status}`);
    }

    return res.json();
}
