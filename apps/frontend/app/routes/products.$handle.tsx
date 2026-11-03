/**
 * SOFA-CLOUD — Product Detail Page (PDP)
 * Route : /products/:handle
 *
 * Données : API middleware (source unique).
 * Related products : fetch catalogue, filter par style/material.
 */

import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { SideCart } from "~/components/SideCart";
import { MediaGallery, type MediaItem } from "~/components/pdp/MediaGallery";
import { ProductInfo } from "~/components/pdp/ProductInfo";
import { VariantSelector } from "~/components/pdp/VariantSelector";
import { CrossSell } from "~/components/pdp/CrossSell";
import { Reassurance } from "~/components/pdp/Reassurance";
import { useVariant } from "~/hooks/useVariant";
import { useCart } from "~/context/CartContext";
import { formatPrice, cn } from "~/lib/utils";
import type { MaterialOption, ProductVariant } from "~/hooks/useVariant";
import { fetchProductByHandle, fetchProducts } from "~/services/api.server";

const MATERIALS_CATALOG: Record<string, MaterialOption[]> = {
    "Velours": [
        { label: "Velours Charbon", color: "#3D3D3D" },
        { label: "Velours Ivoire", color: "#E8D8C0" },
        { label: "Velours Sauge", color: "#8FAF8F" },
    ],
    "Cuir": [
        { label: "Cuir Cognac", color: "#9B5A2A" },
        { label: "Cuir Noir", color: "#1A1A1A" },
    ],
    "Bouclé": [
        { label: "Bouclé Crème", color: "#F5F0E8" },
        { label: "Bouclé Taupe", color: "#B5A898" },
    ],
    "Lin & Coton": [
        { label: "Lin Écru", color: "#D8CDB8" },
        { label: "Lin Gris", color: "#A0A0A0" },
    ],
    "Tissu chiné": [
        { label: "Chiné Taupe", color: "#9B9080" },
        { label: "Chiné Anthracite", color: "#5A5A5A" },
    ],
    "Tissu outdoor": [
        { label: "Outdoor Écru", color: "#E8E0D0" },
        { label: "Outdoor Sable", color: "#C8B89A" },
    ],
};

function getMaterialKey(material: string): string {
    const m = material.toLowerCase();
    if (m.includes("velours")) return "Velours";
    if (m.includes("cuir")) return "Cuir";
    if (m.includes("bouclé") || m.includes("boucle")) return "Bouclé";
    if (m.includes("lin") || m.includes("coton")) return "Lin & Coton";
    if (m.includes("chiné") || m.includes("chine")) return "Tissu chiné";
    if (m.includes("outdoor")) return "Tissu outdoor";
    return "Velours";
}

const VARIANTS_BASE: ProductVariant[] = [
    { option: "2 Places", price_ttc: 0, compare_at_price_ttc: 0, stock: 8 },
    { option: "3 Places", price_ttc: 0, compare_at_price_ttc: 0, stock: 12 },
    { option: "4 Places", price_ttc: 0, compare_at_price_ttc: 0, stock: 5 },
];

export async function loader({ params }: LoaderFunctionArgs) {
    const handle = params.handle as string;
    const product = await fetchProductByHandle(handle);

    if (!product) {
        throw new Response("Produit introuvable", { status: 404 });
    }

    const { products: allProducts } = await fetchProducts({ limit: 50 });
    const materialKey = getMaterialKey(product.material ?? "");
    const related = allProducts
        .filter((p) => p.handle !== handle && (p.style === product.style || getMaterialKey(p.material ?? "") === materialKey))
        .slice(0, 4)
        .map((p) => ({
            handle: p.handle,
            title: p.title,
            style: p.style,
            material: p.material,
            price_ttc: p.price_ttc,
            compare_at_price_ttc: p.compare_at_price_ttc,
            imageUrl: p.imageUrl,
        }));

    const variantsFromApi = product.variants;
    const stockBySize: Record<string, number> = {};
    if (Array.isArray(variantsFromApi)) {
        for (const v of variantsFromApi) {
            const opt = (v as { option?: string }).option ?? (v as { option1?: string }).option1;
            const stock = (v as { stock?: number }).stock ?? (v as { inventory_qty?: number }).inventory_qty ?? 0;
            if (opt) stockBySize[opt] = stock;
        }
    }

    const variantsBase = VARIANTS_BASE.map((v) => ({
        ...v,
        stock: stockBySize[v.option] ?? v.stock,
    }));

    return json({
        product: {
            ...product,
            materialKey,
            images: product.images ?? (product.imageUrl ? [product.imageUrl] : []),
        },
        related,
        variantsBase,
    });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    if (!data) return [{ title: "Produit introuvable — Sofa-Cloud" }];
    const { product } = data;
    return [
        { title: `${product.title} — Canapé ${product.style} | Sofa-Cloud` },
        { name: "description", content: `Découvrez ${product.title}, canapé ${product.style} en ${product.material}. Livraison et installation incluses.` },
        { property: "og:image", content: product.images?.[0] ?? product.imageUrl },
    ];
};

export function ErrorBoundary() {
    return (
        <>
            <Header />
            <main id="main-content" className="pt-[var(--header-height,80px)]">
                <div className="container-site py-32 text-center">
                    <p className="font-heading text-6xl text-accent/20 mb-6">404</p>
                    <h1 className="font-heading text-3xl text-primary mb-4">Produit introuvable</h1>
                    <p className="text-muted mb-10 max-w-sm mx-auto leading-relaxed">
                        Ce canapé n'existe pas ou a été retiré de notre catalogue. Découvrez nos autres collections.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/products" className="btn-primary">Voir le catalogue →</a>
                        <a href="/" className="btn-outline">Retour à l'accueil</a>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default function ProductDetailPage() {
    const { product, related, variantsBase } = useLoaderData<typeof loader>();
    const { addItem } = useCart();

    const materials = MATERIALS_CATALOG[product.materialKey] ?? [];
    const supplierPrice = product.supplier_price ?? 620;

    const variant = useVariant(
        supplierPrice,
        variantsBase,
        materials,
        "3 Places",
        materials[0]?.label
    );

    const mediaItems: MediaItem[] = (product.images ?? []).map((src, i) => ({
        type: "image" as const,
        src,
        alt: i === 0 ? `${product.title} — vue principale` : `${product.title} — vue ${i + 1}`,
    }));

    if (mediaItems.length === 0 && product.imageUrl) {
        mediaItems.push({ type: "image", src: product.imageUrl, alt: `${product.title} — vue principale` });
    }

    const handleAddToCart = () => {
        addItem({
            id: `${product.handle}-${variant.selectedSize}-${variant.selectedMaterial}`,
            title: product.title,
            size: variant.selectedSize,
            material: variant.selectedMaterial,
            variant: `${variant.selectedSize} — ${variant.selectedMaterial}`,
            price_ttc: variant.priceTtc,
            imageUrl: product.images?.[0] ?? product.imageUrl ?? "",
            handle: product.handle,
        });
    };

    const relatedForCrossSell = related.map((p) => ({
        ...p,
        imageUrl: p.imageUrl ?? product.imageUrl ?? product.images?.[0],
    }));

    return (
        <>
            <Header />
            <main id="main-content" className="pt-[var(--header-height,80px)]">
                <nav aria-label="Fil d'Ariane" className="border-b border-border py-3">
                    <div className="container-site">
                        <ol className="flex items-center gap-2 text-xs text-muted">
                            <li><a href="/" className="hover:text-primary transition-colors">Accueil</a></li>
                            <li aria-hidden="true">›</li>
                            <li><a href="/products" className="hover:text-primary transition-colors">Collections</a></li>
                            <li aria-hidden="true">›</li>
                            <li className="text-primary font-medium truncate" aria-current="page">{product.title}</li>
                        </ol>
                    </div>
                </nav>

                <div className="container-site py-10 lg:py-16">
                    <div className="grid lg:grid-cols-2 gap-10 xl:gap-16">
                        <div className="lg:sticky lg:top-[calc(var(--header-height,80px)+1.5rem)] lg:self-start">
                            <MediaGallery items={mediaItems} productTitle={product.title} />
                        </div>

                        <div className="space-y-8">
                            {product.badge && (
                                <div className="flex">
                                    <span className={cn(
                                        "inline-flex items-center px-3 py-1 text-xs font-body font-medium tracking-widest uppercase",
                                        product.badge === "bestseller" ? "bg-accent/10 text-accent border border-accent/30" :
                                            product.badge === "nouveau" ? "bg-primary/10 text-primary border border-primary/30" :
                                                "bg-secondary/20 text-secondary border border-secondary/30"
                                    )}>
                                        {product.badge === "bestseller" ? "★ Bestseller" :
                                            product.badge === "nouveau" ? "Nouveau" : "Exclusif"}
                                    </span>
                                </div>
                            )}

                            <ProductInfo
                                title={product.title}
                                style={product.style ?? ""}
                                material={product.material ?? ""}
                                bodyHtml={product.body_html ?? ""}
                            />

                            <div className="border-t border-border pt-6">
                                <VariantSelector variant={variant} />
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleAddToCart}
                                    className="btn-primary w-full justify-center py-4 text-base"
                                >
                                    Ajouter au panier — {formatPrice(variant.priceTtc)}
                                </button>
                                <p className="text-center text-xs text-muted font-body">
                                    ✦ Livraison offerte · Installation incluse · 30 jours pour changer d'avis
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Reassurance />

                {relatedForCrossSell.length > 0 && (
                    <CrossSell products={relatedForCrossSell} currentHandle={product.handle} />
                )}
            </main>

            <Footer />
            <SideCart />
        </>
    );
}
