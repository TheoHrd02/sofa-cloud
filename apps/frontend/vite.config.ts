import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [
        // Le plugin Remix ne doit pas tourner sous Vitest (recommandation Remix).
        !process.env.VITEST && remix({
            routes(defineRoutes) {
                return defineRoutes((route) => {
                    // Core
                    route("/", "routes/_index.tsx", { index: true });
                    route("/products", "routes/products._index.tsx", { index: true });
                    route("/products/:handle", "routes/products.$handle.tsx");
                    route("/api/products", "routes/api.products.ts");
                    // Institutional
                    route("/about", "routes/about.tsx");
                    // Legal pages
                    route("/mentions-legales", "routes/mentions-legales.tsx");
                    route("/confidentialite", "routes/confidentialite.tsx");
                    route("/cgu", "routes/cgu.tsx");
                    route("/cookies", "routes/cookies.tsx");
                });
            },
            future: {
                v3_fetcherPersist: true,
                v3_relativeSplatPath: true,
                v3_throwAbortReason: true,
            },
        }),
        tsconfigPaths(),
    ],
    server: {
        port: 3000,
        host: "0.0.0.0",
    },
});
