import { CartCustomization, CartStore } from "@/type";
import { create } from "zustand";

function areCustomizationsEqual(
    a: CartCustomization[] = [],
    b: CartCustomization[] = []
): boolean {
    if (a.length !== b.length) return false;

    const aSorted = [...a].sort((x, y) => x.id.localeCompare(y.id));
    const bSorted = [...b].sort((x, y) => x.id.localeCompare(y.id));

    return aSorted.every((item, idx) => item.id === bSorted[idx].id);
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],

    addItem: (item) => {
        console.log('🛒 Cart Store: Adding item', item);
        const customizations = item.customizations ?? [];

        const existing = get().items.find(
            (i) =>
                i.id === item.id &&
                areCustomizationsEqual(i.customizations ?? [], customizations)
        );

        if (existing) {
            console.log('🛒 Cart Store: Item exists, increasing quantity');
            set({
                items: get().items.map((i) =>
                    i.id === item.id &&
                    areCustomizationsEqual(i.customizations ?? [], customizations)
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                ),
            });
        } else {
            console.log('🛒 Cart Store: New item, adding to cart');
            set({
                items: [...get().items, { 
                    ...item, 
                    quantity: 1, 
                    customizations,
                    cartId: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Unique cart ID
                }],
            });
        }
        console.log('🛒 Cart Store: Updated items', get().items);
    },

    removeItem: (id, customizations = []) => {
        set({
            items: get().items.filter(
                (i) =>
                    !(
                        i.id === id &&
                        areCustomizationsEqual(i.customizations ?? [], customizations)
                    )
            ),
        });
    },

    increaseQty: (id, customizations = []) => {
        set({
            items: get().items.map((i) =>
                i.id === id &&
                areCustomizationsEqual(i.customizations ?? [], customizations)
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
            ),
        });
    },

    decreaseQty: (id, customizations = []) => {
        set({
            items: get()
                .items.map((i) =>
                    i.id === id &&
                    areCustomizationsEqual(i.customizations ?? [], customizations)
                        ? { ...i, quantity: i.quantity - 1 }
                        : i
                )
                .filter((i) => i.quantity > 0),
        });
    },

    clearCart: () => set({ items: [] }),

    getTotalItems: () => {
        const total = get().items.reduce((total, item) => total + item.quantity, 0);
        console.log('🛒 Cart Store: getTotalItems =', total, 'items:', get().items.length);
        return total;
    },

    getTotalPrice: () => {
        const total = get().items.reduce((total, item) => {
            const base = item.price;
            const customPrice =
                item.customizations?.reduce(
                    (s: number, c: CartCustomization) => s + c.price,
                    0
                ) ?? 0;
            return total + item.quantity * (base + customPrice);
        }, 0);
        console.log('🛒 Cart Store: getTotalPrice =', total);
        return total;
    },
}));
