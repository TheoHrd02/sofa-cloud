/**
 * SOFA-CLOUD — Resource Route : /api/products
 * Proxy vers le middleware pour le client (useSearch).
 * Le client ne peut pas appeler middleware:8000 directement (réseau Docker).
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { fetchProducts } from "~/services/api.server";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? undefined;

    const data = await fetchProducts({
        limit: 50,
        offset: 0,
        q: q || undefined,
    });

    return json(data);
}
