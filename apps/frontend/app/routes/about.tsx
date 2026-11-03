/**
 * SOFA-CLOUD — Notre Histoire
 * Route : /about
 * Layout narratif : hero + sections alternées images/texte + valeurs + FAQ
 */

import type { MetaFunction } from "@remix-run/node";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { SideCart } from "~/components/SideCart";
import { useInView } from "~/hooks/useInView";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => [
    { title: "Notre Histoire — Sofa-Cloud" },
    { name: "description", content: "Découvrez l'histoire de Sofa-Cloud, notre philosophie, nos artisans partenaires et notre engagement pour un mobilier premium responsable." },
];

/* ─── Animated Section ─────────────────────────────────────────── */
function Section({ children, className }: { children: React.ReactNode; className?: string }) {
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

/* ─── Values Data ──────────────────────────────────────────────── */
const VALEURS = [
    { icon: "✦", title: "Artisanat européen", body: "Chaque canapé est fabriqué par des artisans sélectionnés en France, Italie et Portugal. Aucun compromis sur la qualité." },
    { icon: "◈", title: "Prix justes", body: "En supprimant les intermédiaires, nous offrons des pièces de créateur à des prix accessibles. Transparence totale sur nos marges." },
    { icon: "⬡", title: "Durabilité", body: "Structures en chêne massif FSC, textiles certifiés OEKO-TEX, mousses sans formaldéhyde. Conçu pour durer 15 ans minimum." },
    { icon: "◎", title: "Service blanc gant", body: "Livraison à deux porteurs, installation dans la pièce de votre choix, reprise de l'emballage. Zéro stress, zéro effort." },
];

const FAQ = [
    { q: "Quels délais de livraison ?", r: "Entre 4 et 8 semaines selon le modèle et la matière choisie. Les canapés en stock sont livrables en 10 jours ouvrés." },
    { q: "Puis-je recevoir des échantillons ?", r: "Oui, nous envoyons gratuitement jusqu'à 5 échantillons de tissu à domicile sous 48h ouvrés." },
    { q: "Quelle garantie ?", r: "2 ans pièces et main d'œuvre sur la structure. 5 ans sur les ressorts. L'entretien courant est couvert par votre assurance habitation." },
    { q: "Retours & échanges ?", r: "30 jours pour retourner votre achat sans justification. Frais de retour offerts pour les commandes > 1 500 €." },
];

export default function AboutPage() {
    return (
        <>
            <Header />

            <main id="main-content" className="pt-[var(--header-height,80px)]">

                {/* ── Hero Histoire ──────────────────────────────── */}
                <section className="relative h-[70vh] min-h-[500px] overflow-hidden flex items-end">
                    <div className="absolute inset-0">
                        <img
                            src="https://images.unsplash.com/photo-1586105449897-20b5efeb3233?w=1600&q=85"
                            alt="Atelier artisanal Sofa-Cloud"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
                    </div>
                    <div className="relative z-10 container-site pb-16">
                        <p className="text-secondary text-xs tracking-widest uppercase font-body mb-3">Notre Maison</p>
                        <h1 className="font-heading text-white" style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", lineHeight: 1.05 }}>
                            L'élégance<br />
                            <em className="text-secondary not-italic">comme héritage.</em>
                        </h1>
                    </div>
                </section>

                {/* ── Origin Story ──────────────────────────────── */}
                <section id="histoire" className="section-padding bg-surface">
                    <div className="container-site">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <Section>
                                <p className="text-accent text-xs tracking-widest uppercase font-body mb-4">Les origines</p>
                                <h2 className="font-heading text-primary mb-6" style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}>
                                    Née d'une passion pour le savoir-faire
                                </h2>
                                <div className="space-y-4 text-muted leading-relaxed">
                                    <p>Sofa-Cloud est née en 2019 d'un constat simple : il n'existait pas de canapé premium véritablement accessible. Les grandes maisons proposaient des prix prohibitifs, les enseignes du mass market sacrifiaient la qualité.</p>
                                    <p>Nous avons choisi une troisième voie — celle du <strong className="text-primary font-medium">direct-to-consumer artisanal</strong>. En travaillant directement avec des ateliers familiaux en France, Italie et Portugal, nous éliminons jusqu'à 60% des marges intermédiaires.</p>
                                    <p>Chaque pièce est pensée par notre studio parisien, fabriquée par des mains expertes, et livrée avec un service qui correspond à son rang.</p>
                                </div>
                            </Section>
                            <Section>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="aspect-[3/4] overflow-hidden">
                                        <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80" alt="Canapé Le Montaigne" className="w-full h-full object-cover" loading="lazy" />
                                    </div>
                                    <div className="aspect-[3/4] overflow-hidden mt-8">
                                        <img src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=80" alt="Atelier tissu" className="w-full h-full object-cover" loading="lazy" />
                                    </div>
                                </div>
                            </Section>
                        </div>
                    </div>
                </section>

                {/* ── Chiffres clés ─────────────────────────────── */}
                <section className="section-padding bg-primary text-white">
                    <div className="container-site">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                            {[
                                { value: "2019", label: "Fondée à Paris" },
                                { value: "10+", label: "Artisans partenaires" },
                                { value: "2 400+", label: "Clients satisfaits" },
                                { value: "4.9/5", label: "Note moyenne" },
                            ].map((stat) => (
                                <div key={stat.value}>
                                    <p className="font-heading text-secondary mb-1" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>{stat.value}</p>
                                    <p className="text-white/60 text-sm">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Nos Engagements ───────────────────────────── */}
                <section id="engagements" className="section-padding bg-surface">
                    <div className="container-site">
                        <div className="text-center mb-14">
                            <p className="text-accent text-xs tracking-widest uppercase font-body mb-3">Ce qui nous définit</p>
                            <h2 className="font-heading text-primary" style={{ fontSize: "clamp(2rem, 3vw, 3rem)" }}>Nos Engagements</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {VALEURS.map((v) => (
                                <Section key={v.title} className="text-center">
                                    <div className="text-3xl text-accent mb-4 font-heading">{v.icon}</div>
                                    <h3 className="font-heading text-xl text-primary mb-3">{v.title}</h3>
                                    <p className="text-sm text-muted leading-relaxed">{v.body}</p>
                                </Section>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Ateliers ──────────────────────────────────── */}
                <section id="matieres" className="section-padding overflow-hidden">
                    <div className="container-site">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <Section>
                                <div className="aspect-video overflow-hidden bg-gray-100">
                                    <img
                                        src="https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?w=800&q=80"
                                        alt="Sélection des matières premières"
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            </Section>
                            <Section>
                                <p className="text-accent text-xs tracking-widest uppercase font-body mb-4">Matières & Savoir-faire</p>
                                <h2 className="font-heading text-primary mb-6" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
                                    Chaque tissu raconte une histoire
                                </h2>
                                <div className="space-y-6">
                                    {[
                                        { mat: "Velours", desc: "Filé en Italie du Nord, our velours côtelé offre une douceur incomparable et résiste à l'usage quotidien." },
                                        { mat: "Cuir pleine fleur", desc: "Tannage végétal au Portugal, chaque peau est unique. Le cuir se patine magnifiquement avec le temps." },
                                        { mat: "Bouclé", desc: "Tissage artisanal français, les boucles créent une texture d'exception qui capture et diffuse la lumière." },
                                    ].map((item) => (
                                        <div key={item.mat} className="flex gap-4">
                                            <div className="w-1 bg-accent shrink-0" />
                                            <div>
                                                <p className="font-heading text-primary mb-1">{item.mat}</p>
                                                <p className="text-sm text-muted">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <a href="/products" className="btn-primary inline-flex mt-8">Voir les collections →</a>
                            </Section>
                        </div>
                    </div>
                </section>

                {/* ── Livraison ─────────────────────────────────── */}
                <section id="livraison" className="section-padding bg-primary/5">
                    <div className="container-site">
                        <div className="text-center mb-12">
                            <h2 className="font-heading text-primary" style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)" }}>Livraison & Installation Premium</h2>
                            <p className="text-muted mt-3 max-w-xl mx-auto text-sm leading-relaxed">
                                Offerte dès 1 500 €, notre livraison en deux porteurs inclut l'installation dans la pièce de votre choix et la reprise des emballages.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                            {[
                                { step: "01", title: "Planification", body: "Prise de RDV au créneau de votre choix, 7j/7." },
                                { step: "02", title: "Livraison", body: "Deux porteurs en blouse blanche, protection des sols incluse." },
                                { step: "03", title: "Installation", body: "Assemblage et mise en place dans votre salon. Emballages repris." },
                            ].map((s) => (
                                <div key={s.step} className="text-center">
                                    <p className="font-heading text-4xl text-accent/30 mb-3">{s.step}</p>
                                    <p className="font-heading text-primary text-lg mb-2">{s.title}</p>
                                    <p className="text-sm text-muted">{s.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FAQ ───────────────────────────────────────── */}
                <section id="faq" className="section-padding bg-surface">
                    <div className="container-site max-w-3xl">
                        <div className="text-center mb-12">
                            <h2 className="font-heading text-primary" style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)" }}>Questions fréquentes</h2>
                        </div>
                        <div className="divide-y divide-border">
                            {FAQ.map((item) => (
                                <details key={item.q} className="group py-5 cursor-pointer">
                                    <summary className="flex items-center justify-between font-heading text-primary text-lg list-none">
                                        {item.q}
                                        <svg className="w-5 h-5 text-accent transition-transform duration-300 group-open:rotate-45 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </summary>
                                    <p className="text-muted text-sm leading-relaxed mt-3">{item.r}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA final ─────────────────────────────────── */}
                <section className="section-padding bg-primary text-white text-center">
                    <div className="container-site max-w-2xl">
                        <h2 className="font-heading text-white mb-4" style={{ fontSize: "clamp(2rem, 3vw, 3rem)" }}>
                            Prêt(e) à trouver votre canapé idéal ?
                        </h2>
                        <p className="text-white/60 mb-8 text-sm">Commandez en ligne ou visitez notre showroom parisien sur rendez-vous.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="/products" className="btn-primary py-4 px-8">Voir les collections</a>
                            <a href="mailto:contact@sofa-cloud.fr" className="btn-outline border-white/30 text-white hover:bg-white hover:text-primary py-4 px-8">Contacter un conseiller</a>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
            <SideCart />
        </>
    );
}
