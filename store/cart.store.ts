import { CartCustomization, CartStore } from "@/type";
import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePromotionStore } from "./promotion.store";

function areCustomizationsEqual(
    a: CartCustomization[] = [],
    b: CartCustomization[] = []
): boolean {
    if (a.length !== b.length) return false;

    const aSorted = [...a].sort((x, y) => x.id.localeCompare(y.id));
    const bSorted = [...b].sort((x, y) => x.id.localeCompare(y.id));

    return aSorted.every((item, idx) => item.id === bSorted[idx].id);
}

// Validate item has proper UUID format
function isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                // Validate item ID format
                if (!item.id || !isValidUUID(item.id)) {
                    console.error('❌ Cannot add item with invalid ID:', item.id, '- Item:', item.name);
                    return;
                }
                
                const customizations = item.customizations ?? [];

                const existing = get().items.find(
                    (i) =>
                        i.id === item.id &&
                        areCustomizationsEqual(i.customizations ?? [], customizations)
                );

                if (existing) {
                    set({
                        items: get().items.map((i) =>
                            i.id === item.id &&
                            areCustomizationsEqual(i.customizations ?? [], customizations)
                                ? { ...i, quantity: i.quantity + 1 }
                                : i
                        ),
                    });
                    console.log('Added to cart:', existing.name, '- Qty:', existing.quantity + 1);
                } else {
                    set({
                        items: [...get().items, { 
                            ...item, 
                            quantity: 1, 
                            customizations,
                            cartId: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Unique cart ID
                        }],
                    });
                    console.log('Added to cart:', item.name);
                }
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
                return total;
            },

            getSubtotal: () => {
                return get().getTotalPrice();
            },

            getDiscountAmount: () => {
                const subtotal = get().getSubtotal();
                const { getTotalDiscount } = usePromotionStore.getState();
                return getTotalDiscount(subtotal);
            },

            getFinalTotal: () => {
                const subtotal = get().getSubtotal();
                const discount = get().getDiscountAmount();
                return Math.max(0, subtotal - discount);
            },
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => AsyncStorage),
            // Migrate old invalid data
            migrate: (persistedState: any, version: number) => {
                if (persistedState && Array.isArray(persistedState.items)) {
                    // Filter out items with invalid IDs
                    persistedState.items = persistedState.items.filter((item: any) => 
                        item.id && isValidUUID(item.id)
                    );
                }
                return persistedState;
            },
        }
    )
);
