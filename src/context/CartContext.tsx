"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { API_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/types";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function refreshCart() {
    
    if (!user) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        credentials: "include",
      });
      const data = await res.json();
      setItems(data.cart?.items || []);
    } catch (err) {
      console.log("could not load cart", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await refreshCart();
    })();
   
  }, [user]);

  async function addToCart(productId: string, quantity = 1) {
    const res = await fetch(`${API_URL}/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId, quantity }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to add to cart");
    }
    setItems(data.cart.items);
  }

  async function updateQuantity(productId: string, quantity: number) {
    const res = await fetch(`${API_URL}/api/cart/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ quantity }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to update cart");
    }
    setItems(data.cart.items);
  }

  async function removeFromCart(productId: string) {
    const res = await fetch(`${API_URL}/api/cart/${productId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to remove item");
    }
    setItems(data.cart.items);
  }

  async function clearCart() {
    const res = await fetch(`${API_URL}/api/cart`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) {
      setItems(data.cart.items);
    }
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price =
      item.product.discountPrice !== null &&
      item.product.discountPrice < item.product.price
        ? item.product.discountPrice
        : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}