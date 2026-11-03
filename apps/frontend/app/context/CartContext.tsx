/**
 * SOFA-CLOUD — Cart Context
 * Shared cart state across the entire Remix app.
 * Persisted to localStorage for session continuity.
 *
 * Usage :
 *   const { items, addItem, removeItem, updateQuantity, cartCount, cartTotal, openCart } = useCart();
 */

import { createContext, useContext, useReducer, useCallback, useEffect, useState } from "react";

/* ─── Types ──────────────────────────────────────────────────────── */
export interface CartItem {
    id: string;          // `${handle}-${size}-${material}` — unique per variant
    handle: string;
    title: string;
    variant: string;     // "3 Places — Velours côtelé charbon"
    size: string;
    material: string;
    price_ttc: number;
    imageUrl: string;
    quantity: number;
}

export interface CartState {
    items: CartItem[];
    isOpen: boolean;
}

/* ─── Derived helpers ────────────────────────────────────────────── */
export function cartCount(items: CartItem[]): number {
    return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartTotal(items: CartItem[]): number {
    return Math.round(items.reduce((sum, i) => sum + i.price_ttc * i.quantity, 0) * 100) / 100;
}

export function cartToJSON(items: CartItem[]) {
    return {
        id: "local-cart-001",
        items: items.map((i) => ({
            id: i.id,
            handle: i.handle,
            title: i.title,
            variant: i.variant,
            unitPrice: i.price_ttc,
            quantity: i.quantity,
            lineTotal: Math.round(i.price_ttc * i.quantity * 100) / 100,
            imageUrl: i.imageUrl,
        })),
        totalQuantity: cartCount(items),
        totalPrice: cartTotal(items),
        currency: "EUR",
        updatedAt: new Date().toISOString(),
    };
}

/* ─── Reducer ────────────────────────────────────────────────────── */
type CartAction =
    | { type: "ADD_ITEM"; item: CartItem }
    | { type: "REMOVE_ITEM"; id: string }
    | { type: "UPDATE_QTY"; id: string; quantity: number }
    | { type: "CLEAR" }
    | { type: "OPEN_CART" }
    | { type: "CLOSE_CART" }
    | { type: "HYDRATE"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case "ADD_ITEM": {
            const existing = state.items.find((i) => i.id === action.item.id);
            const items = existing
                ? state.items.map((i) =>
                    i.id === action.item.id
                        ? { ...i, quantity: i.quantity + action.item.quantity }
                        : i
                )
                : [...state.items, action.item];
            return { ...state, items, isOpen: true };
        }
        case "REMOVE_ITEM":
            return { ...state, items: state.items.filter((i) => i.id !== action.id) };
        case "UPDATE_QTY":
            return {
                ...state,
                items: action.quantity <= 0
                    ? state.items.filter((i) => i.id !== action.id)
                    : state.items.map((i) => i.id === action.id ? { ...i, quantity: action.quantity } : i),
            };
        case "CLEAR":
            return { ...state, items: [] };
        case "OPEN_CART":
            return { ...state, isOpen: true };
        case "CLOSE_CART":
            return { ...state, isOpen: false };
        case "HYDRATE":
            return { ...state, items: action.items };
        default:
            return state;
    }
}

/* ─── Context ────────────────────────────────────────────────────── */
const CartContext = createContext<{
    state: CartState;
    addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    count: number;
    total: number;
    toJSON: () => ReturnType<typeof cartToJSON>;
} | null>(null);

/* ─── Provider ───────────────────────────────────────────────────── */
const STORAGE_KEY = "sofa-cloud-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });
    const [hydrated, setHydrated] = useState(false);

    // Hydrate from localStorage on mount (client only)
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const items = JSON.parse(stored) as CartItem[];
                dispatch({ type: "HYDRATE", items });
            }
        } catch { /* ignore */ }
        setHydrated(true);
    }, []);

    // Persist to localStorage on change
    useEffect(() => {
        if (!hydrated) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
        } catch { /* ignore */ }
    }, [state.items, hydrated]);

    const addItem = useCallback((item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
        dispatch({ type: "ADD_ITEM", item: { ...item, quantity: item.quantity ?? 1 } });
    }, []);

    const removeItem = useCallback((id: string) => dispatch({ type: "REMOVE_ITEM", id }), []);
    const updateQuantity = useCallback((id: string, quantity: number) => dispatch({ type: "UPDATE_QTY", id, quantity }), []);
    const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);
    const openCart = useCallback(() => dispatch({ type: "OPEN_CART" }), []);
    const closeCart = useCallback(() => dispatch({ type: "CLOSE_CART" }), []);
    const toJSON = useCallback(() => cartToJSON(state.items), [state.items]);

    return (
        <CartContext.Provider value={{
            state,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            openCart,
            closeCart,
            count: cartCount(state.items),
            total: cartTotal(state.items),
            toJSON,
        }}>
            {children}
        </CartContext.Provider>
    );
}

/* ─── Hook ───────────────────────────────────────────────────────── */
export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within a CartProvider");
    return ctx;
}
