"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import type { CartItem, Product } from "@/lib/types";
import { productPrice } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => boolean;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function cartKey(userId: string) {
  return `amer_cart_v2_${userId}`;
}

function readCart(userId: string): CartItem[] {
  try {
    const raw = localStorage.getItem(cartKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(userId: string, items: CartItem[]) {
  localStorage.setItem(cartKey(userId), JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  // Always tied to current account — never share across users
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const suppressPersist = useRef(true);

  useEffect(() => {
    try {
      localStorage.removeItem("amer_cart");
    } catch {
      /* ignore */
    }
  }, []);

  // Load only this user's cart when account changes
  useEffect(() => {
    suppressPersist.current = true;
    if (!userId) {
      setOwnerId(null);
      setItems([]);
      return;
    }
    setOwnerId(userId);
    setItems(readCart(userId));
  }, [userId]);

  // Persist only to the matching account key
  useEffect(() => {
    if (suppressPersist.current) {
      suppressPersist.current = false;
      return;
    }
    if (!ownerId || ownerId !== userId) return;
    writeCart(ownerId, items);
  }, [items, ownerId, userId]);

  const addItem = useCallback(
    (product: Product, qty = 1) => {
      if (!userId || ownerId !== userId) return false;
      const price = productPrice(product);
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product._id);
        if (existing) {
          return prev.map((i) =>
            i.productId === product._id
              ? { ...i, qty: Math.min(i.qty + qty, product.stock) }
              : i
          );
        }
        return [
          ...prev,
          {
            productId: product._id,
            name: product.name,
            image: product.image,
            price,
            qty: Math.min(qty, product.stock),
            stock: product.stock,
          },
        ];
      });
      return true;
    },
    [userId, ownerId]
  );

  const updateQty = useCallback(
    (productId: string, qty: number) => {
      if (!userId || ownerId !== userId) return;
      setItems((prev) =>
        prev
          .map((i) =>
            i.productId === productId
              ? { ...i, qty: Math.max(1, Math.min(qty, i.stock)) }
              : i
          )
          .filter((i) => i.qty > 0)
      );
    },
    [userId, ownerId]
  );

  const removeItem = useCallback(
    (productId: string) => {
      if (!userId || ownerId !== userId) return;
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    },
    [userId, ownerId]
  );

  const clear = useCallback(() => {
    setItems([]);
    if (userId && ownerId === userId) writeCart(userId, []);
  }, [userId, ownerId]);

  const isOwnCart = Boolean(userId && ownerId === userId);
  const visibleItems = isOwnCart ? items : [];
  const count = visibleItems.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = visibleItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  const value = useMemo(
    () => ({
      items: visibleItems,
      addItem,
      updateQty,
      removeItem,
      clear,
      count,
      subtotal,
    }),
    [visibleItems, addItem, updateQty, removeItem, clear, count, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
