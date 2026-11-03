/**
 * SOFA-CLOUD — Mentions Légales
 * Route : /mentions-legales
 */
import type { MetaFunction } from "@remix-run/node";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { SideCart } from "~/components/SideCart";

export const meta: MetaFunction = () => [
    { title: "Mentions Légales — Sofa-Cloud" },
    { name: "robots", content: "noindex" },
];

const SECTIONS = [
    {
        title: "Éditeur du site",
        content: `SOFA-CLOUD SAS
Capital social : 50 000 €
RCS Paris B 901 234 567
SIRET : 901 234 567 00012
TVA intracommunautaire : FR 12 901234567

Siège social : 15 rue du Faubourg Saint-Honoré, 75008 Paris, France
Directeur de la publication : Camille Martin

Contact : contact@sofa-cloud.fr | +33 1 23 45 67 89`,
    },
    {
        title: "Hébergement",
        content: `Le site est hébergé par :
Amazon Web Services (AWS)
31 Place des Corolles, Tour Carpe Diem
92098 Paris La Défense Cedex, France
aws.amazon.com`,
    },
    {
        title: "Propriété intellectuelle",
        content: `L'ensemble du contenu de ce site (textes, images, visuels, graphismes, logo, icônes, sons, logiciels…) est protégé par le Code de la Propriété Intellectuelle. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de Sofa-Cloud SAS.

Toute exploitation non autorisée du site ou de l'un quelconque des éléments qu'il contient sera considérée comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.`,
    },
    {
        title: "Liens hypertextes",
        content: `Le site peut contenir des liens hypertextes renvoyant vers d'autres sites internet. Sofa-Cloud SAS ne saurait être tenu responsable du contenu de ces sites tiers ni des éventuels dommages liés à leur utilisation.`,
    },
    {
        title: "Limitation de responsabilité",
        content: `Sofa-Cloud SAS ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l'utilisateur lors de l'accès au site, résultant de l'utilisation d'un matériel ne répondant pas aux spécifications techniques requises.`,
    },
    {
        title: "Droit applicable et juridiction",
        content: `Les présentes mentions légales sont soumises au droit français. En cas de litige et à défaut d'accord amiable, compétence est attribuée aux tribunaux français.`,
    },
];

export default function MentionsLegalesPage() {
    return (
        <>
            <Header />
            <main id="main-content" className="pt-[var(--header-height,80px)] min-h-screen">
                <div className="container-site py-16 max-w-3xl">
                    <p className="text-accent text-xs tracking-widest uppercase font-body mb-3">Légal</p>
                    <h1 className="font-heading text-primary mb-10" style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)" }}>Mentions Légales</h1>
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
