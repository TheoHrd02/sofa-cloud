import type { Config } from "tailwindcss";

export default {
    content: ["./app/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#1A1A2E",
                    light: "#252545",
                },
                secondary: {
                    DEFAULT: "#E8D5B0",
                    light: "#F2E8D0",
                },
                accent: {
                    DEFAULT: "#C9A96E",
                    dark: "#A8854A",
                },
                background: "#FAFAF8",
                surface: "#FFFFFF",
                muted: "#6B6B6B",
                border: "#E5E5E5",
            },
            fontFamily: {
                heading: ["Cormorant Garamond", "Georgia", "serif"],
                body: ["Inter", "system-ui", "sans-serif"],
            },
            fontSize: {
                "display-1": ["clamp(3rem, 6vw, 5.5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
                "display-2": ["clamp(2.25rem, 4vw, 3.75rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
                "heading-1": ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.15" }],
                "heading-2": ["clamp(1.25rem, 2vw, 1.875rem)", { lineHeight: "1.2" }],
            },
            spacing: {
                "18": "4.5rem",
                "22": "5.5rem",
                "30": "7.5rem",
                "section": "6rem",
            },
            maxWidth: {
                "site": "1440px",
            },
            transitionTimingFunction: {
                "premium": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            },
            transitionDuration: {
                "350": "350ms",
                "400": "400ms",
            },
            backdropBlur: {
                "xs": "4px",
            },
            keyframes: {
                "slide-in-right": {
                    "0%": { transform: "translateX(100%)" },
                    "100%": { transform: "translateX(0)" },
                },
                "slide-out-right": {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(100%)" },
                },
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "fade-up": {
                    "0%": { opacity: "0", transform: "translateY(24px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                "scale-in": {
                    "0%": { opacity: "0", transform: "scale(0.97)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
            },
            animation: {
                "slide-in-right": "slide-in-right 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
                "slide-out-right": "slide-out-right 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
                "fade-in": "fade-in 0.4s ease forwards",
                "fade-up": "fade-up 0.6s ease forwards",
                "scale-in": "scale-in 0.5s ease forwards",
            },
            boxShadow: {
                "premium": "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
                "premium-lg": "0 12px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
                "cart": "−24px 0 80px rgba(0, 0, 0, 0.18)",
            },
        },
    },
    plugins: [],
} satisfies Config;
