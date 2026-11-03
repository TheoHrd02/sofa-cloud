/**
 * SOFA-CLOUD — Politique de Gestion des Cookies
 * Route : /cookies
 */
import type { MetaFunction } from "@remix-run/node";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { SideCart } from "~/components/SideCart";

export const meta: MetaFunction = () => [
    { title: "Politique Cookies — Sofa-Cloud" },
    { name: "robots", content: "noindex" },
];

const COOKIE_TYPES = [
    {
        type: "Cookies essentiels",
        required: true,
        description: "Nécessaires au fonctionnement du site. Ils permettent la navigation, la gestion du panier et la sécurité des sessions.",
        examples: [
            { name: "session_id", expire: "Session", provider: "Sofa-Cloud", purpose: "Gestion de la session utilisateur" },
            { name: "cart_token", expire: "30 jours", provider: "Sofa-Cloud", purpose: "Persistance du panier" },
            { name: "csrf_token", expire: "Session", provider: "Sofa-Cloud", purpose: "Protection contre les attaques CSRF" },
        ],
    },
    {
        type: "Cookies analytiques",
        required: false,
        description: "Permettent d'analyser l'audience du site de façon anonymisée. Vos données ne sont pas croisées avec des profils nominatifs.",
        examples: [
            { name: "_ga", expire: "13 mois", provider: "Google Analytics", purpose: "Distinction des utilisateurs" },
            { name: "_ga_*", expire: "13 mois", provider: "Google Analytics", purpose: "Statistiques de sessions" },
        ],
    },
    {
        type: "Cookies marketing",
        required: false,
        description: "Permettent de vous présenter des publicités pertinentes sur d'autres sites. Activés uniquement avec votre consentement.",
        examples: [
            { name: "_fbp", expire: "90 jours", provider: "Meta (Facebook)", purpose: "Retargeting publicitaire" },
            { name: "pin_unauth", expire: "1 an", provider: "Pinterest", purpose: "Audiences similaires" },
        ],
    },
];

export default function CookiesPage() {
    return (
        <>
            <Header />
            <main id="main-content" className="pt-[var(--header-height,80px)] min-h-screen">
                <div className="container-site py-16 max-w-3xl">
                    <p className="text-accent text-xs tracking-widest uppercase font-body mb-3">Légal</p>
                    <h1 className="font-heading text-primary mb-4" style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)" }}>Politique Cookies</h1>
                    <p className="text-muted text-sm leading-relaxed mb-10">
                        Ce site utilise des cookies conformément à la réglementation RGPD et aux recommandations de la CNIL.
                        Vous pouvez à tout moment modifier vos préférences via le bandeau de consentement ou en nous contactant.
                    </p>

                    <div className="space-y-12">
                        {COOKIE_TYPES.map((ct) => (
                            <section key={ct.type} aria-labelledby={ct.type}>
                                <div className="flex items-center gap-3 mb-3 border-b border-border pb-2">
                                    <h2 id={ct.type} className="font-heading text-xl text-primary">{ct.type}</h2>
                                    <span className={`text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 ${ct.required ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                                        {ct.required ? "Obligatoire" : "Optionnel"}
                                    </span>
                                </div>
                                <p className="text-muted text-sm mb-4">{ct.description}</p>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left border border-border">
                                        <thead>
                                            <tr className="bg-primary/5">
                                                <th className="px-3 py-2 font-medium text-primary border-b border-border">Cookie</th>
                                                <th className="px-3 py-2 font-medium text-primary border-b border-border">Expiration</th>
                                                <th className="px-3 py-2 font-medium text-primary border-b border-border">Fournisseur</th>
                                                <th className="px-3 py-2 font-medium text-primary border-b border-border">Finalité</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ct.examples.map((ex) => (
                                                <tr key={ex.name} className="border-b border-border/50 last:border-0">
                                                    <td className="px-3 py-2 font-mono text-primary">{ex.name}</td>
                                                    <td className="px-3 py-2 text-muted">{ex.expire}</td>
                                                    <td className="px-3 py-2 text-muted">{ex.provider}</td>
                                                    <td className="px-3 py-2 text-muted">{ex.purpose}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        ))}
                    </div>

                    <div className="mt-10 p-5 bg-primary/5 border border-border">
                        <h2 className="font-heading text-lg text-primary mb-2">Gestion de vos préférences</h2>
                        <p className="text-sm text-muted mb-4">
                            Vous pouvez retirer votre consentement à tout moment. Les cookies essentiels ne peuvent être désactivés car ils sont nécessaires au fonctionnement du site.
                        </p>
                        <button
                            onClick={() => { /* TODO Mission 5 : ouvrir le bandeau CMP */ alert("Préférences cookies — (intégration CMP à venir)"); }}
                            className="btn-outline text-sm py-2"
                        >
                            Gérer mes préférences
                        </button>
                    </div>

                    <p className="text-xs text-muted mt-10 pt-6 border-t border-border">Mis à jour le 1er janvier 2025 — Conforme CNIL</p>
                </div>
            </main>
            <Footer />
            <SideCart />
        </>
    );
}
