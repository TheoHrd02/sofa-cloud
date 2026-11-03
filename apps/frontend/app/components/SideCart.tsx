/**
 * SOFA-CLOUD — SideCart v2
 * Refactored to use useCart() context instead of props.
 * All state (items, open, close, update, remove) comes from CartContext.
 */

import { useEffect, useRef } from "react";
import { useCart } from "~/context/CartContext";
import { cn, formatPrice } from "~/lib/utils";

function SideCartItem({ item }: { item: { id: string; title: string; variant: string; price_ttc: number; imageUrl: string; quantity: number } }) {
    const { removeItem, updateQuantity } = useCart();

    return (
        <div className="flex gap-4 py-4 border-b border-border/50">
            {/* Image */}
            <div className="w-20 h-20 shrink-0 overflow-hidden bg-gray-50">
                <img src={`${item.imageUrl}?w=160&q=70`} alt={item.title} className="w-full h-full object-cover" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="font-heading text-base text-primary truncate">{item.title}</p>
                <p className="text-xs text-muted mt-0.5 truncate">{item.variant}</p>
                <p className="text-sm font-medium text-primary mt-1">{formatPrice(item.price_ttc)}</p>

                {/* Qty controls */}
                <div className="flex items-center gap-2 mt-2">
                    <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Diminuer la quantité"
                        className="w-6 h-6 border border-border flex items-center justify-center text-muted hover:border-primary hover:text-primary transition-colors text-sm"
                    >
                        −
                    </button>
                    <span className="w-6 text-center text-sm text-primary">{item.quantity}</span>
                    <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Augmenter la quantité"
                        className="w-6 h-6 border border-border flex items-center justify-center text-muted hover:border-primary hover:text-primary transition-colors text-sm"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Remove */}
            <button
                onClick={() => removeItem(item.id)}
                aria-label={`Supprimer ${item.title}`}
                className="text-muted hover:text-primary transition-colors shrink-0 mt-0.5"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

export function SideCart() {
    const { state, closeCart, count, total, clearCart } = useCart();
    const { isOpen, items } = state;
    const closeBtnRef = useRef<HTMLButtonElement>(null);

    // Focus management
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => closeBtnRef.current?.focus(), 100);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    // Escape key
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeCart(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [closeCart]);

    return (
        <>
            {/* Backdrop — transition suppressed by body:not(.js-mounted) CSS rule until hydrated */}
            <div
                onClick={closeCart}
                className={cn(
                    "fixed inset-0 z-[70] bg-primary/40 backdrop-blur-sm",
                    "transition-opacity duration-350",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                aria-hidden="true"
            />

            {/* Drawer — transition suppressed by body:not(.js-mounted) CSS rule until hydrated */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Votre panier"
                className={cn(
                    "fixed top-0 right-0 h-full w-full max-w-md z-[71] bg-surface flex flex-col",
                    "transition-transform duration-400 ease-premium",
                    "shadow-premium-lg",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                    <div>
                        <h2 className="font-heading text-xl text-primary">Votre Panier</h2>
                        {count > 0 && <p className="text-xs text-muted mt-0.5">{count} article{count !== 1 ? "s" : ""}</p>}
                    </div>
                    <button ref={closeBtnRef} onClick={closeCart} aria-label="Fermer le panier" className="p-2 text-muted hover:text-primary transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-6 py-2">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
                            <svg className="w-12 h-12 text-border" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                            </svg>
                            <p className="font-heading text-lg text-muted">Votre panier est vide</p>
                            <a href="/products" onClick={closeCart} className="btn-primary text-sm">Découvrir nos canapés</a>
                        </div>
                    ) : (
                        <>
                            {items.map((item) => <SideCartItem key={item.id} item={item} />)}
                        </>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="px-6 py-6 border-t border-border bg-surface space-y-3">
                        {/* Subtotal */}
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-muted">Sous-total TTC</p>
                            <p className="font-heading text-xl text-primary">{formatPrice(total)}</p>
                        </div>
                        <p className="text-xs text-muted">Livraison et installation offertes dès 1 500 €</p>

                        {/* Checkout CTA — TODO: connecter à Shopify Checkout (Phase 3) */}
                        <button
                            disabled
                            title="Le paiement en ligne sera disponible prochainement"
                            className="btn-primary w-full justify-center text-base py-4 opacity-50 cursor-not-allowed"
                        >
                            Procéder au paiement →
                        </button>
                        <p className="text-center text-xs text-muted">
                            Paiement en ligne bientôt disponible
                        </p>
                        <button onClick={clearCart} className="w-full text-center text-xs text-muted hover:text-primary transition-colors py-1">
                            Vider le panier
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
