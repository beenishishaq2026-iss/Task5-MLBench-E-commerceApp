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

interface WishlistContextValue {
  products: Product[];
  loading: boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  async function refreshWishlist() {
    if (!user) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/wishlist`, {
        credentials: "include",
      });
      const data = await res.json();
      setProducts(data.wishlist?.products || []);
    } catch (err) {
      console.log("could not load wishlist", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await refreshWishlist();
    })();
   
  }, [user]);

  function isInWishlist(productId: string) {
    return products.some((p) => p._id === productId);
  }

  async function toggleWishlist(productId: string) {
    if (isInWishlist(productId)) {
      const res = await fetch(`${API_URL}/api/wishlist/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(data.wishlist.products);
      }
    } else {
      const res = await fetch(`${API_URL}/api/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(data.wishlist.products);
      }
    }
  }

  return (
    <WishlistContext.Provider
      value={{ products, loading, toggleWishlist, isInWishlist, refreshWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}