/**
 * SOFA-CLOUD — Conditions Générales d'Utilisation
 * Route : /cgu
 */
import type { MetaFunction } from "@remix-run/node";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { SideCart } from "~/components/SideCart";

export const meta: MetaFunction = () => [
    { title: "Conditions Générales d'Utilisation — Sofa-Cloud" },
    { name: "robots", content: "noindex" },
];

const SECTIONS = [
    { title: "1. Objet", content: "Les présentes CGU ont pour objet de définir les modalités et conditions d'utilisation des services proposés sur le site sofa-cloud.fr, ainsi que les droits et obligations des parties dans ce cadre." },
    { title: "2. Acceptation des CGU", content: "L'utilisation du site implique l'acceptation pleine et entière des présentes CGU. Ces dernières sont susceptibles d'être modifiées ou complétées à tout moment. Il est conseillé de les consulter régulièrement." },
    { title: "3. Accès au site", content: "Le site est accessible 24h/24 et 7j/7, sauf en cas de force majeure ou d'opérations de maintenance. Sofa-Cloud ne saurait être tenu responsable de tout dommage découlant d'une indisponibilité du site." },
    {
        title: "4. Commandes & Paiement", content: `Les prix sont indiqués en euros TTC.
Les commandes sont fermes et définitives après validation du paiement.
Modes de paiement acceptés : Carte bancaire (Visa, Mastercard, Amex), PayPal.
Toutes les transactions sont sécurisées par Stripe (certifié PCI-DSS niveau 1).` },
    { title: "5. Livraison", content: "Les délais de livraison sont indiqués lors de la commande. Ils courent à compter de la validation du paiement. En cas de retard, Sofa-Cloud s'engage à en informer le client dans les meilleurs délais." },
    { title: "6. Droit de rétractation", content: "Conformément à l'article L221-18 du Code de la consommation, vous disposez d'un délai de 30 jours à compter de la réception du produit pour exercer votre droit de rétractation sans avoir à justifier votre décision." },
    {
        title: "7. Garanties légales", content: `En tant que professionnel, Sofa-Cloud est soumis aux garanties légales :
• Garantie légale de conformité (art. L217-4 Code consommation) : 2 ans
• Garantie contre les vices cachés (art. 1641 Code civil)
Garantie commerciale supplémentaire : 2 ans pièces + main d'œuvre.` },
    { title: "8. Loi applicable", content: "Les présentes CGU sont soumises au droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable. À défaut, les tribunaux de Paris seront compétents." },
];

export default function CguPage() {
    return (
        <>
            <Header />
            <main id="main-content" className="pt-[var(--header-height,80px)] min-h-screen">
                <div className="container-site py-16 max-w-3xl">
                    <p className="text-accent text-xs tracking-widest uppercase font-body mb-3">Légal</p>
                    <h1 className="font-heading text-primary mb-10" style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)" }}>Conditions Générales d'Utilisation</h1>
                    <div className="space-y-10">
                        {SECTIONS.map((s) => (
                            <section key={s.title} aria-labelledby={s.title}>
                                <h2 id={s.title} className="font-heading text-xl text-primary mb-3 border-b border-border pb-2">{s.title}</h2>
                                <p className="text-muted text-sm leading-relaxed whitespace-pre-line">{s.content}</p>
                            </section>
                        ))}
                    </div>
                    <p className="text-xs text-muted mt-12 pt-6 border-t border-border">Mis à jour le 1er janvier 2025</p>
                </div>
            </main>
            <Footer />
            <SideCart />
        </>
    );
}
