/**
 * SOFA-CLOUD — useInView Hook
 * Équivalent React de @vueuse/useIntersectionObserver
 *
 * Usage :
 *   const [ref, isInView] = useInView({ threshold: 0.15, once: true });
 *   <div ref={ref} className={cn("opacity-0 translate-y-6 transition-all duration-700", isInView && "opacity-100 translate-y-0")} />
 */

import { useEffect, useRef, useState, useCallback } from "react";

interface UseInViewOptions {
    /** Pourcentage visible avant déclenchement (0 à 1) */
    threshold?: number;
    /** Si true, l'animation ne se répète pas après le premier trigger */
    once?: boolean;
    /** Marge autour du root (ex: "0px 0px -80px 0px" pour déclencher un peu avant) */
    rootMargin?: string;
}

type UseInViewReturn<T extends Element = Element> = [
    ref: React.RefObject<T>,
    isInView: boolean,
];

export function useInView<T extends Element = Element>({
    threshold = 0.1,
    once = true,
    rootMargin = "0px 0px -60px 0px",
}: UseInViewOptions = {}): UseInViewReturn<T> {
    const ref = useRef<T>(null);
    const [isInView, setIsInView] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const disconnect = useCallback(() => {
        observerRef.current?.disconnect();
        observerRef.current = null;
    }, []);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    if (once) disconnect();
                } else if (!once) {
                    setIsInView(false);
                }
            },
            { threshold, rootMargin }
        );

        observerRef.current.observe(element);
        return disconnect;
    }, [threshold, rootMargin, once, disconnect]);

    return [ref, isInView];
}

/**
 * useInViewStagger — plusieurs éléments avec délai progressif
 * Usage : const [refs, inViews] = useInViewStagger(4, { threshold: 0.1 });
 */
export function useInViewStagger(
    count: number,
    options?: UseInViewOptions
): [Array<React.RefObject<Element>>, boolean[]] {
    const results = Array.from({ length: count }, () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useInView(options)
    );
    return [results.map(([r]) => r), results.map(([, v]) => v)];
}
