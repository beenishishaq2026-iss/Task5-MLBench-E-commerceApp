"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/products/ProductCard";

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { products, loading } = useWishlist();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/wishlist");
    }
  }, [authLoading, user, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-ink/60">Loading your wishlist...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-4xl italic text-ink">
        Your Wishlist
      </h1>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <p className="text-ink/60">Nothing here yet.</p>
          <Link href="/products" className="text-sm font-medium text-rust hover:underline">
            Browse products
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