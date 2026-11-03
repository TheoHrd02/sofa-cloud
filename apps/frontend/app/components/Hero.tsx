/**
 * SOFA-CLOUD — Hero Section
 * Vidéo autoplay fullscreen · Overlay gradient · Typographie premium
 * Fallback image si vidéo non disponible.
 *
 * Accessibilité :
 *   - role="banner" sur la section principale
 *   - Video : muted, aria-hidden="true" (décorative)
 *   - Bouton CTA : aria-label explicite
 */

import { cn } from "~/lib/utils";

interface HeroProps {
    videoUrl?: string;
    fallbackImageUrl?: string;
    tagline?: string;
    headline?: string;
    cta?: { label: string; href: string };
}

export function Hero({
    videoUrl,
    fallbackImageUrl = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=90",
    tagline = "Savoir-faire français",
    headline = "L'art du\ncanapé premium.",
    cta = { label: "Découvrir la collection", href: "/collections" },
}: HeroProps) {
    return (
        <section
            role="banner"
            aria-label="Section héros — Sofa-Cloud"
            className="relative w-full h-[100dvh] min-h-[600px] flex items-end overflow-hidden"
        >
            {/* ── Media : Vidéo ou Image ─────────────────────────── */}
            <div className="absolute inset-0 z-0">
                {videoUrl ? (
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        aria-hidden="true"
                        className="w-full h-full object-cover"
                    >
                        <source src={videoUrl} type="video/mp4" />
                        {/* Fallback */}
                        <img src={fallbackImageUrl} alt="" aria-hidden="true" className="w-full h-full object-cover" />
                    </video>
                ) : (
                    <img
                        src={fallbackImageUrl}
                        alt=""
                        aria-hidden="true"
                        className="w-full h-full object-cover"
                    />
                )}

                {/* ── Gradient Overlay ─────────────────────────────── */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: "linear-gradient(to top, rgba(26,26,46,0.85) 0%, rgba(26,26,46,0.3) 50%, rgba(26,26,46,0.1) 100%)",
                    }}
                    aria-hidden="true"
                />
            </div>

            {/* ── Content ───────────────────────────────────────── */}
            <div className="relative z-10 container-site pb-20 lg:pb-28">
                <div className="max-w-2xl animate-fade-up" style={{ animationDelay: "200ms" }}>

                    {/* Tagline */}
                    <p className="text-secondary/80 font-body text-sm tracking-[0.25em] uppercase mb-6">
                        {tagline}
                    </p>

                    {/* Headline */}
                    <h1
                        className="font-heading text-white text-balance mb-8"
                        style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)", lineHeight: "1.05", letterSpacing: "-0.02em" }}
                    >
                        {headline.split("\n").map((line, i) => (
                            <span key={i} className={cn("block", i === 1 && "text-secondary")}>
                                {line}
                            </span>
                        ))}
                    </h1>

                    {/* CTA */}
                    <a
                        href={cta.href}
                        aria-label={`${cta.label} — Sofa-Cloud`}
                        className="btn-primary inline-flex"
                    >
                        {cta.label}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </a>
                </div>
            </div>

            {/* ── Scroll Indicator ──────────────────────────────── */}
            <div
                aria-hidden="true"
                className="absolute bottom-8 right-10 z-10 flex flex-col items-center gap-2 text-white/50"
            >
                <span className="text-xs font-body tracking-[0.2em] uppercase" style={{ writingMode: "vertical-rl" }}>
                    Scroll
                </span>
                <div className="w-px h-12 bg-white/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white/60 animate-bounce" />
                </div>
            </div>
        </section>
    );
}
