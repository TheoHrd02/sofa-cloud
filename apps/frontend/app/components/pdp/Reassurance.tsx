/**
 * SOFA-CLOUD — Reassurance Section (PDP)
 * 4 blocs : Livraison · Garantie · Retours · Conseiller
 * Animation : useInView staggered avec délai progressif
 */

import { cn } from "~/lib/utils";
import { useInView } from "~/hooks/useInView";

interface DeliveryEstimate {
    label: string;
    carrier: string;
    free_delivery: boolean;
    installation_included: boolean;
}

interface ReassuranceProps {
    delivery?: DeliveryEstimate | null;
    className?: string;
}

interface ReassuranceItem {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    detail: string;
}

const TruckIcon = () => (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
);
const ShieldIcon = () => (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
);
const ReturnIcon = () => (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
);
const ChatIcon = () => (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
);

export function Reassurance({ delivery, className }: ReassuranceProps) {
    const items: ReassuranceItem[] = [
        {
            icon: <TruckIcon />,
            title: "Livraison Premium",
            subtitle: delivery?.free_delivery ? "Offerte" : "Calculée",
            detail: delivery?.label ?? "14 à 21 jours ouvrés",
        },
        {
            icon: <ShieldIcon />,
            title: "Garantie 5 ans",
            subtitle: "Structure & mécanismes",
            detail: "Couverture totale défauts fabrication",
        },
        {
            icon: <ReturnIcon />,
            title: "Retours 30 jours",
            subtitle: "Satisfait ou remboursé",
            detail: "Retour et reprise offerts",
        },
        {
            icon: <ChatIcon />,
            title: "Conseiller Dédié",
            subtitle: "Disponible 7j/7",
            detail: "Chat, WhatsApp ou téléphone",
        },
    ];

    // Chaque item a son propre IntersectionObserver
    const [r0, v0] = useInView<HTMLDivElement>({ threshold: 0.2 });
    const [r1, v1] = useInView<HTMLDivElement>({ threshold: 0.2 });
    const [r2, v2] = useInView<HTMLDivElement>({ threshold: 0.2 });
    const [r3, v3] = useInView<HTMLDivElement>({ threshold: 0.2 });
    const refs = [r0, r1, r2, r3];
    const inViews = [v0, v1, v2, v3];

    return (
        <section
            aria-label="Nos engagements"
            className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4 py-8 border-y border-border", className)}
        >
            {items.map((item, i) => (
                <div
                    key={item.title}
                    ref={refs[i] as React.RefObject<HTMLDivElement>}
                    className={cn(
                        "flex flex-col items-center text-center gap-2 px-3 py-4 rounded-sm bg-background",
                        "transition-all duration-600 ease-premium",
                        inViews[i]
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-5"
                    )}
                    style={{ transitionDelay: `${i * 80}ms` }}
                >
                    <div className="text-accent mb-1">{item.icon}</div>
                    <p className="font-body text-sm font-semibold text-primary">{item.title}</p>
                    <p className="text-accent text-xs font-medium">{item.subtitle}</p>
                    <p className="text-xs text-muted leading-relaxed">{item.detail}</p>
                </div>
            ))}
        </section>
    );
}
