/**
 * SOFA-CLOUD — Homepage
 * Route : /
 * Hero video · Featured products (API) · Category grid · Brand story · NewsLetter
 */

import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { Hero } from "~/components/Hero";
import { CategoryGrid } from "~/components/CategoryGrid";
import { ProductCard } from "~/components/ProductCard";
import { SideCart } from "~/components/SideCart";
import { useInView } from "~/hooks/useInView";
import { cn } from "~/lib/utils";
import { fetchProducts } from "~/services/api.server";

export const meta: MetaFunction = () => [
    { title: "Sofa-Cloud — Canapés Premium & Mobilier Haut de Gamme" },
    { name: "description", content: "Découvrez notre collection de canapés premium fabriqués par des artisans européens. Design contemporain, matières nobles, livraison et installation incluses." },
    { property: "og:image", content: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80" },
];

const FEATURED_HANDLES = ["le-montaigne", "l-edimbourg", "le-riviera", "l-arcadia"];

export async function loader({ request }: LoaderFunctionArgs) {
    const { products } = await fetchProducts({ limit: 20 });
    const featured = FEATURED_HANDLES
        .map((h) => products.find((p) => p.handle === h))
        .filter(Boolean)
        .slice(0, 4);

    if (featured.length < 4) {
        const remaining = products.filter((p) => !FEATURED_HANDLES.includes(p.handle));
        featured.push(...remaining.slice(0, 4 - featured.length));
    }

    return json({ featured });
}

function FadeSection({ children, className }: { children: React.ReactNode; className?: string }) {
    const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.1 });
    return (
        <div
            ref={ref}
            className={cn(
                "transition-all duration-700 ease-premium",
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
                className
            )}
        >
            {children}
        </div>
    );
}

export default function HomePage() {
    const { featured } = useLoaderData<typeof loader>();
    const heroRef = useRef<HTMLDivElement>(null);
    const [heroVisible, setHeroVisible] = useState(false);

    useEffect(() => {
        const el = heroRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => setHeroVisible(entry.isIntersecting),
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <>
            <Header isHeroVisible={heroVisible} />

            <main id="main-content">
                <div ref={heroRef}>
                    <Hero />
                </div>

                <section id="featured" aria-labelledby="featured-heading" className="section-padding bg-background">
                    <div className="container-site">
                        <FadeSection className="text-center mb-14">
                            <p className="text-accent text-xs tracking-[0.25em] uppercase font-body mb-3">Nos Incontournables</p>
                            <h2 id="featured-heading" className="font-heading text-primary" style={{ fontSize: "clamp(2rem, 3vw, 3rem)" }}>
                                La Collection Signature
                            </h2>
                        </FadeSection>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                            {featured.map((product, i) => (
                                <FadeSection key={product.handle}>
                                    <ProductCard
                                        product={{
                                            ...product,
                                            variants: product.variants ?? [
                                                { option: "2 Places" },
                                                { option: "3 Places" },
                                                { option: "4 Places" },
                                            ],
                                        }}
                                        priority={i < 2}
                                    />
                                </FadeSection>
                            ))}
                        </div>

                        <FadeSection className="text-center mt-12">
                            <a href="/products" className="btn-outline">
                                Voir toute la collection →
                            </a>
                        </FadeSection>
                    </div>
                </section>

                <section id="categories" aria-label="Catégories de canapés" className="section-padding bg-surface">
                    <div className="container-site">
                        <FadeSection className="text-center mb-14">
                            <p className="text-accent text-xs tracking-[0.25em] uppercase font-body mb-3">Explorer par matière</p>
                            <h2 className="font-heading text-primary" style={{ fontSize: "clamp(2rem, 3vw, 3rem)" }}>
                                Chaque tissu, une identité
                            </h2>
                        </FadeSection>
                        <CategoryGrid />
                    </div>
                </section>

                <section id="brand-story" className="section-padding bg-background">
                    <div className="container-site">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <FadeSection>
                                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                                    <img
                                        src="https://images.unsplash.com/photo-1586105449897-20b5efeb3233?w=800&q=80"
                                        alt="Atelier artisanal Sofa-Cloud"
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </FadeSection>
                            <FadeSection>
                                <p className="text-accent text-xs tracking-[0.25em] uppercase font-body mb-4">Notre Maison</p>
                                <h2 className="font-heading text-primary mb-6" style={{ fontSize: "clamp(1.8rem, 2.5vw, 2.5rem)" }}>
                                    L'excellence artisanale, au prix juste
                                </h2>
                                <div className="space-y-4 text-muted leading-relaxed text-sm">
                                    <p>Sofa-Cloud naît d'un constat simple : il n'existait pas de canapé vraiment premium accessible. Nous avons tracé une troisième voie — celle du direct artisanal.</p>
                                    <p>En travaillant directement avec des ateliers familiaux en France, Italie et Portugal, nous supprimons jusqu'à 60 % des marges inutiles.</p>
                                </div>
                                <a href="/about" className="btn-primary inline-flex mt-8">
                                    Notre histoire →
                                </a>
                            </FadeSection>
                        </div>
                    </div>
                </section>

                <section aria-label="Nos engagements" className="bg-primary text-white py-12">
                    <div className="container-site">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            {[
                                { icon: "✦", label: "Artisanat européen" },
                                { icon: "◎", label: "Livraison gratuite" },
                                { icon: "◈", label: "30 jours pour changer d'avis" },
                                { icon: "⬡", label: "Garantie 5 ans structure" },
                            ].map((item) => (
                                <div key={item.label}>
                                    <p className="font-heading text-secondary text-xl mb-2">{item.icon}</p>
                                    <p className="text-white/80 text-xs font-body tracking-wide">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <SideCart />
        </>
    );
}
