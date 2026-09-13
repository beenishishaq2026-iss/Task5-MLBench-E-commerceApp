"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ArrowRight, ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/products/ProductCard";
import LoadingState from "@/components/ui/LoadingState";

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { products, loading, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [busy, setBusy] = useState<"move" | "clear" | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/wishlist");
    }
  }, [authLoading, user, router]);

  if (authLoading || loading) {
    return <LoadingState message="Loading your wishlist..." />;
  }

  if (!user) {
    return null;
  }

  async function handleMoveAllToCart() {
    setBusy("move");
    try {
      for (const product of products) {
        await addToCart(product._id);
      }
      await clearWishlist();
    } finally {
      setBusy(null);
    }
  }

  async function handleClearWishlist() {
    setBusy("clear");
    try {
      await clearWishlist();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl italic text-ink">
            Your Wishlist
          </h1>
          {products.length > 0 && (
            <p className="mt-1 text-sm text-ink/50">
              {products.length} {products.length === 1 ? "item" : "items"} saved for later
            </p>
          )}
        </div>

        {products.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleMoveAllToCart}
              disabled={busy !== null}
              className="flex items-center gap-2 rounded-full bg-rust px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rust-dark disabled:opacity-60"
            >
              <ShoppingBag size={16} />
              {busy === "move" ? "Moving..." : "Move All to Cart"}
            </button>
            <button
              onClick={handleClearWishlist}
              disabled={busy !== null}
              className="text-sm font-medium text-rust underline decoration-rust/40 underline-offset-4 transition-colors hover:text-rust-dark disabled:opacity-60"
            >
              {busy === "clear" ? "Clearing..." : "Clear Wishlist"}
            </button>
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border border-brass/20 bg-white px-6 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rust/10">
            <Heart size={32} className="text-rust" strokeWidth={1.75} />
          </div>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl italic text-ink">
            Your wishlist is waiting to be filled
          </h2>
          <p className="max-w-sm text-sm text-ink/50">
            Found something you love but not ready to check out right away? Tap the heart icon on
            any product to save it right here.
          </p>
          <Link
            href="/products"
            className="mt-4 flex items-center gap-2 rounded-full bg-rust px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-rust-dark"
          >
            Browse Catalog
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}