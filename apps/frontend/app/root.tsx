/**
 * SOFA-CLOUD — Root Layout
 * - Inject Google Fonts
 * - Link global CSS (Tailwind + custom)
 * - Skip-to-content link pour accessibilité
 * - CartProvider : shared cart state across all routes
 */

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { useEffect } from "react";
import stylesheet from "~/styles/global.css?url";
import { CartProvider } from "~/context/CartContext";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap",
  },
  { rel: "stylesheet", href: stylesheet },
];

export const meta: MetaFunction = () => [
  { charSet: "utf-8" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
  { name: "theme-color", content: "#1A1A2E" },
];

export default function App() {
  // Add 'js-mounted' to body after first render — gates all CSS transitions globally.
  // global.css: body:not(.js-mounted) * { transition-duration: 0ms !important }
  // This prevents ANY transition from firing during the SSR→CSR hydration window.
  useEffect(() => {
    document.body.classList.add("js-mounted");
  }, []);

  return (
    <html lang="fr" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-primary antialiased" suppressHydrationWarning>

        {/* Skip to content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-accent focus:text-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
        >
          Aller au contenu principal
        </a>

        {/* ✅ CartProvider wraps entire app — shared state across all routes */}
        <CartProvider>
          <Outlet />
        </CartProvider>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
