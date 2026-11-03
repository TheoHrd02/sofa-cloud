/**
 * useMounted — returns true only after the component has hydrated on the client.
 *
 * WHY: On SSR, useEffect never runs, so `mounted` stays false.
 * On CSR (after hydration), the first useEffect commits and sets it to true.
 *
 * USE CASE: Gate CSS transitions & animations so they only fire AFTER the first
 * client render, eliminating the "flash of transitioning content" (FOTC) that
 * occurs when a CSS transition runs against the SSR-painted state immediately
 * on page load.
 *
 * Pattern:
 *   const mounted = useMounted();
 *   className={cn("transition-opacity duration-300", mounted ? "opacity-0" : "")}
 *          ↑ no transition during SSR/hydration window
 */
import { useState, useEffect } from "react";

export function useMounted(): boolean {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    return mounted;
}
