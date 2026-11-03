/**
 * SOFA-CLOUD — Politique de Confidentialité
 * Route : /confidentialite
 */
import type { MetaFunction } from "@remix-run/node";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { SideCart } from "~/components/SideCart";

export const meta: MetaFunction = () => [
    { title: "Politique de Confidentialité — Sofa-Cloud" },
    { name: "robots", content: "noindex" },
];

const SECTIONS = [
    {
        title: "Responsable du traitement",
        content: "Sofa-Cloud SAS, 15 rue du Faubourg Saint-Honoré, 75008 Paris. DPO : dpo@sofa-cloud.fr",
    },
    {
        title: "Données collectées",
        content: `Nous collectons les données suivantes :
• Données d'identification : nom, prénom, adresse email, numéro de téléphone
• Données de livraison : adresse postale
• Données de paiement : transmises directement à notre prestataire de paiement (Stripe) — nous ne stockons aucune donnée bancaire
• Données de navigation : cookies techniques et analytics (voir politique cookies)
• Données de préférence : historique de navigation, liste de souhaits (optionnel)`,
    },
    {
        title: "Finalités et base légale",
        content: `Vos données sont traitées pour :
• L'exécution du contrat de vente (base : exécution contractuelle)
• La gestion du service client (base : intérêt légitime)
• L'envoi de newsletters marketing (base : consentement — révocable à tout moment)
• L'amélioration de nos services (base : intérêt légitime)
• Le respect de nos obligations légales comptables et fiscales (base : obligation légale)`,
    },
    {
        title: "Durée de conservation",
        content: `• Données clients actifs : durée de la relation commerciale + 3 ans
• Données de facturation : 10 ans (obligation légale)
• Données marketing : 3 ans après le dernier contact actif
• Données de navigation : 13 mois maximum`,
    },
    {
        title: "Destinataires des données",
        content: `Vos données peuvent être partagées avec :
• Nos prestataires logistiques (pour la livraison)
• Stripe (paiement en ligne) — certifié PCI-DSS
• Klaviyo (emailing — UE uniquement)
• Google Analytics (anonymisé)

Aucune vente de données à des tiers.`,
    },
    {
        title: "Vos droits (RGPD)",
        content: `Conformément au RGPD, vous disposez des droits suivants :
• Droit d'accès à vos données
• Droit de rectification
• Droit à l'effacement ("droit à l'oubli")
• Droit à la limitation du traitement
• Droit à la portabilité
• Droit d'opposition

Pour exercer ces droits : dpo@sofa-cloud.fr ou par courrier à notre adresse sociale. Réponse sous 1 mois. Vous pouvez également saisir la CNIL (cnil.fr).`,
    },
];

export default function ConfidentialitePage() {
    return (
        <>
            <Header />
            <main id="main-content" className="pt-[var(--header-height,80px)] min-h-screen">
                <div className="container-site py-16 max-w-3xl">
                    <p className="text-accent text-xs tracking-widest uppercase font-body mb-3">Légal</p>
                    <h1 className="font-heading text-primary mb-10" style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)" }}>Politique de Confidentialité</h1>
                    <div className="space-y-10">
                        {SECTIONS.map((s) => (
                            <section key={s.title} aria-labelledby={s.title}>
                                <h2 id={s.title} className="font-heading text-xl text-primary mb-3 border-b border-border pb-2">{s.title}</h2>
                                <p className="text-muted text-sm leading-relaxed whitespace-pre-line">{s.content}</p>
                            </section>
                        ))}
                    </div>
                    <p className="text-xs text-muted mt-12 pt-6 border-t border-border">Mis à jour le 1er janvier 2025 — Version RGPD</p>
                </div>
            </main>
            <Footer />
            <SideCart />
        </>
    );
}
