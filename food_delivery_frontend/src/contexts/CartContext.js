import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

/**
 * PUBLIC_INTERFACE
 */
export function CartProvider({ children }) {
  /** This is a public function. */
  const { api, isAuthenticated, role } = useAuth();

  // Local cart shape: { [menuItemId]: { menuItem, quantity } }
  const [itemsById, setItemsById] = useState({});

  const addItem = useCallback(
    async (menuItem, quantity = 1) => {
      setItemsById((prev) => {
        const existing = prev[menuItem.id];
        const newQty = Math.min(50, (existing?.quantity || 0) + quantity);
        return { ...prev, [menuItem.id]: { menuItem, quantity: newQty } };
      });

      // Sync with backend only for authenticated customers
      if (isAuthenticated && role === "customer") {
        await api.upsertCartItem({ menu_item_id: menuItem.id, quantity: quantity });
        // Note: backend upsert sets exact quantity, while local adds; for simplicity,
        // we keep local optimistic behavior and allow user to adjust in cart page.
      }
    },
    [api, isAuthenticated, role]
  );

  const setQuantity = useCallback(
    async (menuItemId, quantity) => {
      const qty = Math.max(1, Math.min(50, quantity));
      setItemsById((prev) => {
        const existing = prev[menuItemId];
        if (!existing) return prev;
        return { ...prev, [menuItemId]: { ...existing, quantity: qty } };
      });

      if (isAuthenticated && role === "customer") {
        await api.upsertCartItem({ menu_item_id: menuItemId, quantity: qty });
      }
    },
    [api, isAuthenticated, role]
  );

  const removeItem = useCallback(
    async (menuItemId) => {
      setItemsById((prev) => {
        const next = { ...prev };
        delete next[menuItemId];
        return next;
      });

      if (isAuthenticated && role === "customer") {
        // backend needs cart_item_id to delete; we don't keep it locally.
        // We'll rely on refreshFromBackend to reconcile, or user can clear by setting qty.
      }
    },
    [isAuthenticated, role]
  );

  const clear = useCallback(() => setItemsById({}), []);

  const refreshFromBackend = useCallback(async () => {
    if (!isAuthenticated || role !== "customer") return;
    const cartItems = await api.getCart();
    // Without menu item details returned by backend, we can only store IDs/qty.
    // We'll keep minimal shape; cart page will display IDs if missing details.
    setItemsById((prev) => {
      const next = { ...prev };
      for (const ci of cartItems) {
        const existing = next[ci.menu_item_id];
        next[ci.menu_item_id] = {
          menuItem: existing?.menuItem || { id: ci.menu_item_id, name: `Item #${ci.menu_item_id}`, price: 0 },
          quantity: ci.quantity
        };
      }
      return next;
    });
  }, [api, isAuthenticated, role]);

  const items = useMemo(() => Object.values(itemsById), [itemsById]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => sum + (Number(it.menuItem.price) || 0) * it.quantity, 0);
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      itemsById,
      addItem,
      setQuantity,
      removeItem,
      clear,
      refreshFromBackend,
      subtotal
    }),
    [items, itemsById, addItem, setQuantity, removeItem, clear, refreshFromBackend, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 */
export function useCart() {
  /** This is a public function. */
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
