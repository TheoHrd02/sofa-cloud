/**
 * SOFA-CLOUD — API Client (Server-side only)
 * Appel au middleware depuis les loaders Remix.
 * Ne pas importer côté client (contient process.env).
 */

const getBaseUrl = (): string => {
    if (typeof window !== "undefined") {
        return ""; // Client: use relative URLs (resource routes)
    }
    return process.env.MIDDLEWARE_API_URL ?? "http://localhost:8000";
};

export interface ApiProduct {
    handle: string;
    title: string;
    material: string;
    style: string;
    price_ttc: number;
    compare_at_price_ttc: number;
    imageUrl?: string;
    badge?: "bestseller" | "nouveau" | "exclusif" | null;
    variants?: { option: string; price_ttc?: number; compare_at_price_ttc?: number; stock?: number }[];
    supplier_price?: number;
    body_html?: string;
    images?: string[];
    image_urls?: string[];
    color_family?: string;
    tags?: string[];
}

export interface ApiProductsResponse {
    total: number;
    limit: number;
    offset: number;
    source: string;
    products: ApiProduct[];
}

export interface ApiProductDetail extends ApiProduct {
    body_html?: string;
    images?: string[];
    image_urls?: string[];
    variants?: { option: string; option2?: string; price: number; compare_at_price: number; inventory_qty: number; sku: string }[];
}

function normalizeVariant(v: Record<string, unknown>): { option: string; price_ttc?: number; compare_at_price_ttc?: number; stock?: number } {
    const option = (v.option1 ?? v.option) as string;
    const price_ttc = v.price_ttc != null ? Number(v.price_ttc) : (v.price != null ? Number(v.price) : undefined);
    const compare_at_price_ttc = v.compare_at_price_ttc != null ? Number(v.compare_at_price_ttc) : (v.compare_at_price != null ? Number(v.compare_at_price) : undefined);
    const stock = (v.stock ?? v.inventory_qty) as number | undefined;
    return { option, price_ttc, compare_at_price_ttc, stock };
}

/** Normalise un produit API vers le format attendu par le frontend */
export function normalizeProduct(p: Record<string, unknown>): ApiProduct {
    const imageUrl =
        (p.imageUrl as string) ??
        (Array.isArray(p.image_urls) && p.image_urls[0]) ??
        (Array.isArray(p.images) && p.images[0]) ??
        (p.image_placeholder as string) ??
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80";

    const tags = (p.tags as string[]) ?? [];
    let badge: ApiProduct["badge"] = null;
    if (tags.includes("bestseller")) badge = "bestseller";
    else if (tags.includes("nouveau")) badge = "nouveau";
    else if (tags.includes("exclusif")) badge = "exclusif";

    const rawVariants = (p.variants as Record<string, unknown>[]) ?? [];
    const variants = rawVariants.length > 0
        ? rawVariants.map(normalizeVariant)
        : [{ option: "2 Places" }, { option: "3 Places" }, { option: "4 Places" }];

    return {
        handle: p.handle as string,
        title: p.title as string,
        material: (p.material as string) ?? "",
        style: (p.style as string) ?? "",
        price_ttc: Number(p.price_ttc ?? 0),
        compare_at_price_ttc: Number(p.compare_at_price_ttc ?? p.compare_at_price ?? 0),
        imageUrl,
        badge,
        variants,
        supplier_price: p.supplier_price != null ? Number(p.supplier_price) : undefined,
        body_html: p.body_html as string | undefined,
        images: p.images as string[] | undefined,
        image_urls: p.image_urls as string[] | undefined,
        color_family: p.color_family as string | undefined,
        tags,
    };
}

/** GET /api/v1/products — liste catalogue */
export async function fetchProducts(params?: {
    limit?: number;
    offset?: number;
    q?: string;
}): Promise<ApiProductsResponse> {
    const base = getBaseUrl();
    const search = new URLSearchParams();
    if (params?.limit != null) search.set("limit", String(params.limit));
    if (params?.offset != null) search.set("offset", String(params.offset));
    if (params?.q) search.set("q", params.q);

    const url = `${base}/api/v1/products/${search.toString() ? `?${search}` : ""}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });

    if (!res.ok) {
        throw new Error(`API products failed: ${res.status}`);
    }

    const data = (await res.json()) as {
        total: number;
        limit: number;
        offset: number;
        source: string;
        products: Record<string, unknown>[];
    };

    return {
        ...data,
        products: data.products.map(normalizeProduct),
    };
}

/** GET /api/v1/products/{handle} — détail produit */
export async function fetchProductByHandle(handle: string): Promise<ApiProductDetail | null> {
    const base = getBaseUrl();
    const res = await fetch(`${base}/api/v1/products/${encodeURIComponent(handle)}`, {
        headers: { Accept: "application/json" },
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API product failed: ${res.status}`);

    const raw = (await res.json()) as Record<string, unknown>;
    const normalized = normalizeProduct(raw) as ApiProductDetail;

    // Images pour PDP
    const images =
        (raw.images as string[]) ??
        (raw.image_urls as string[]) ??
        (raw.image_placeholder ? [raw.image_placeholder as string] : [normalized.imageUrl ?? ""]);

    return {
        ...normalized,
        body_html: raw.body_html as string | undefined,
        images,
        variants: raw.variants as ApiProductDetail["variants"],
    };
}
