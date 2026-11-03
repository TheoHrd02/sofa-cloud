/**
 * SOFA-CLOUD — Footer (design inspiré Bobochic)
 * Sections : Brand + Nav + Newsletter + Paiements + Légal
 */

import { useState } from "react";
import { cn } from "~/lib/utils";

/* ─── Payment Icons (SVG inline — pas de dep extérieure) ────────── */
const PaymentIcons = () => (
    <div className="flex items-center gap-3 flex-wrap" aria-label="Modes de paiement acceptés">
        {/* Visa */}
        <svg viewBox="0 0 48 32" className="h-7 w-auto" aria-label="Visa" role="img">
            <rect width="48" height="32" rx="4" fill="#fff" stroke="#E0E0E0" strokeWidth="1" />
            <path fill="#1A1F71" d="M19.2 21.2l2.4-10.4h2.6L21.8 21.2H19.2zM30.4 11.1c-.5-.2-1.4-.4-2.4-.4-2.6 0-4.4 1.3-4.5 3.2 0 1.4 1.3 2.1 2.3 2.6 1 .5 1.4.8 1.4 1.2 0 .7-.8 1-1.6 1-.9 0-2.2-.3-2.9-.6l-.4-.2-.4 2.2c.7.3 1.9.6 3.1.6 2.8 0 4.6-1.3 4.6-3.3 0-1.1-.7-1.9-2.2-2.6-.9-.4-1.5-.7-1.5-1.2 0-.4.5-.8 1.5-.8.9 0 1.5.2 2 .4l.3.1.4-2.2zM33.6 17.3l1-2.7.5 2.7h-1.5zm3.2 3.9H39l-2-10.4h-2c-.6 0-1 .3-1.2.8l-3.8 9.6h2.7l.5-1.4h3.3l.3 1.4zM17.1 10.8l-2.6 7.1-.3-1.3c-.5-1.5-1.9-3.2-3.5-4l2.4 8.6h2.8l4.1-10.4h-2.9z" />
            <path fill="#FAA61A" d="M12 10.8H7.7l-.1.3c3.4.8 5.7 2.8 6.6 5.2l-.9-4.7c-.2-.6-.6-.8-1.3-.8z" />
        </svg>
        {/* Mastercard */}
        <svg viewBox="0 0 48 32" className="h-7 w-auto" aria-label="Mastercard" role="img">
            <rect width="48" height="32" rx="4" fill="#fff" stroke="#E0E0E0" strokeWidth="1" />
            <circle cx="18" cy="16" r="8" fill="#EB001B" />
            <circle cx="30" cy="16" r="8" fill="#F79E1B" />
            <path fill="#FF5F00" d="M24 9.8a8 8 0 010 12.4A8 8 0 0124 9.8z" />
        </svg>
        {/* American Express */}
        <svg viewBox="0 0 48 32" className="h-7 w-auto" aria-label="American Express" role="img">
            <rect width="48" height="32" rx="4" fill="#2E77BC" />
            <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">AMEX</text>
        </svg>
        {/* PayPal */}
        <svg viewBox="0 0 48 32" className="h-7 w-auto" aria-label="PayPal" role="img">
            <rect width="48" height="32" rx="4" fill="#fff" stroke="#E0E0E0" strokeWidth="1" />
            <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle" fill="#003087" fontSize="8" fontWeight="bold" fontFamily="Arial">PayPal</text>
        </svg>
        {/* Secure badge */}
        <div className="flex items-center gap-1 text-[10px] text-muted border border-border rounded px-2 py-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            SSL
        </div>
    </div>
);

/* ─── Newsletter ─────────────────────────────────────────────────── */
function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.includes("@")) { setStatus("error"); return; }
        // TODO Mission 5 : connecter à Klaviyo / Mailchimp API
        setStatus("success");
        setEmail("");
        setTimeout(() => setStatus("idle"), 4000);
    };

    return (
        <div>
            <p className="text-xs text-white/50 tracking-widest uppercase font-body mb-3">Newsletter</p>
            <p className="text-white/70 text-sm mb-4 leading-relaxed">
                Nouveautés, inspirations déco et offres exclusives — en avant-première.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2" aria-label="S'inscrire à la newsletter">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className={cn(
                        "flex-1 min-w-0 bg-white/5 border text-white placeholder:text-white/30 text-sm px-4 py-3",
                        "focus:outline-none focus:border-secondary transition-colors",
                        status === "error" ? "border-red-400" : "border-white/20"
                    )}
                    aria-label="Adresse email"
                />
                <button
                    type="submit"
                    className="bg-secondary text-primary font-medium text-xs tracking-wider uppercase px-4 py-3 hover:bg-secondary/90 transition-colors shrink-0"
                    aria-label="S'inscrire"
                >
                    OK
                </button>
            </form>
            {status === "success" && (
                <p role="status" className="text-secondary text-xs mt-2">✓ Merci ! Vous êtes inscrit(e).</p>
            )}
            {status === "error" && (
                <p role="alert" className="text-red-400 text-xs mt-2">Veuillez entrer un email valide.</p>
            )}
        </div>
    );
}

/* ─── Footer Links ───────────────────────────────────────────────── */
const FOOTER_COLUMNS = [
    {
        title: "Collections",
        links: [
            { label: "Canapés 2 Places", href: "/products?size=2-places" },
            { label: "Canapés 3 Places", href: "/products?size=3-places" },
            { label: "Chesterfield", href: "/products?style=Chesterfield" },
            { label: "Velours", href: "/products?material=Velours" },
            { label: "Cuir", href: "/products?material=Cuir" },
            { label: "Bouclé", href: "/products?material=Bouclé" },
        ],
    },
    {
        title: "Styles",
        links: [
            { label: "Contemporain", href: "/products?style=Contemporain" },
            { label: "Scandinave", href: "/products?style=Scandinave" },
            { label: "Art Déco", href: "/products?style=Art+Déco" },
            { label: "Industriel", href: "/products?style=Industriel" },
            { label: "Méditerranéen", href: "/products?style=Méditerranéen" },
            { label: "Haussmannien", href: "/products?style=Haussmannien" },
        ],
    },
    {
        title: "La Maison",
        links: [
            { label: "Notre Histoire", href: "/about" },
            { label: "Nos Engagements", href: "/about#engagements" },
            { label: "Guide des Matières", href: "/about#matieres" },
            { label: "FAQ", href: "/about#faq" },
            { label: "Contact", href: "mailto:contact@sofa-cloud.fr" },
            { label: "Livraison & Installation", href: "/about#livraison" },
        ],
    },
];

const LEGAL_LINKS = [
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "Confidentialité", href: "/confidentialite" },
    { label: "CGU", href: "/cgu" },
    { label: "Cookies", href: "/cookies" },
];

/* ─── Main Footer ─────────────────────────────────────────────────── */
export function Footer() {
    return (
        <footer className="bg-primary text-white" aria-label="Pied de page">

            {/* ── Main footer ─────────────────────────────────── */}
            <div className="max-w-[1440px] mx-auto px-6 lg:px-10 pt-16 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

                    {/* Brand col */}
                    <div className="lg:col-span-2 space-y-6">
                        <a href="/" aria-label="Sofa-Cloud — Accueil" className="block">
                            <span className="font-heading text-3xl tracking-wider text-white">SOFA-CLOUD</span>
                            <p className="text-white/40 text-xs tracking-widest mt-1">L'art du canapé premium</p>
                        </a>
                        <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                            Canapés haute de gamme sélectionnés auprès des meilleurs artisans européens.
                            Livraison et installation premium offertes dès 1 500 €.
                        </p>
                        {/* Social */}
                        <div className="flex items-center gap-4">
                            {[
                                { href: "https://instagram.com", label: "Instagram", d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
                                { href: "https://pinterest.com", label: "Pinterest", d: "M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" },
                            ].map((social) => (
                                <a
                                    key={social.href}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.label}
                                    className="w-9 h-9 border border-white/20 flex items-center justify-center text-white/50 hover:border-white/50 hover:text-white transition-all"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d={social.d} />
                                    </svg>
                                </a>
                            ))}
                        </div>

                        <NewsletterForm />
                    </div>

                    {/* Nav columns */}
                    {FOOTER_COLUMNS.map((col) => (
                        <div key={col.title}>
                            <p className="text-xs text-white/40 tracking-widest uppercase font-body mb-4">{col.title}</p>
                            <ul className="space-y-2.5">
                                {col.links.map((link) => (
                                    <li key={link.href}>
                                        <a
                                            href={link.href}
                                            className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Bottom bar ──────────────────────────────────── */}
            <div className="border-t border-white/10">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                        {/* Legal links */}
                        <nav aria-label="Liens légaux" className="flex flex-wrap items-center gap-x-5 gap-y-2">
                            {LEGAL_LINKS.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="text-xs text-white/40 hover:text-white/70 transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <span className="text-xs text-white/30">© 2025 Sofa-Cloud</span>
                        </nav>

                        {/* Payment icons */}
                        <PaymentIcons />
                    </div>
                </div>
            </div>
        </footer>
    );
}
