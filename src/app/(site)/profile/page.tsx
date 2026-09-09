"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Heart, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import LoadingState from "@/components/ui/LoadingState";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const { products: wishlistProducts } = useWishlist();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) {
    return <LoadingState message="Loading your profile..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
        Your Account
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold italic text-ink sm:text-4xl">
        Welcome, {user.name}
      </h1>

      {/* quick access to order history + wishlist */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/orders"
          className="flex items-center justify-between gap-3 rounded-2xl border border-brass/20 bg-white p-5 shadow-sm transition-colors hover:border-rust/30"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brass/10 text-rust">
              <Package size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">My Orders</p>
              <p className="text-xs text-ink/50">Track and review past purchases</p>
            </div>
          </div>
          <ChevronRight size={18} className="shrink-0 text-ink/30" />
        </Link>

        <Link
          href="/wishlist"
          className="flex items-center justify-between gap-3 rounded-2xl border border-brass/20 bg-white p-5 shadow-sm transition-colors hover:border-rust/30"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brass/10 text-rust">
              <Heart size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                My Wishlist
                {wishlistProducts.length > 0 ? ` (${wishlistProducts.length})` : ""}
              </p>
              <p className="text-xs text-ink/50">Items you&apos;ve saved for later</p>
            </div>
          </div>
          <ChevronRight size={18} className="shrink-0 text-ink/30" />
        </Link>
      </div>

      <div className="mt-6 rounded-3xl border border-brass/20 bg-white px-6 py-8 shadow-sm sm:px-8">
        <div className="divide-y divide-brass/20">
          <div className="flex items-center justify-between py-4">
            <span className="text-sm font-medium text-ink/60">Full name</span>
            <span className="text-sm font-semibold text-ink">{user.name}</span>
          </div>
          <div className="flex items-center justify-between py-4">
            <span className="text-sm font-medium text-ink/60">Email</span>
            <span className="text-sm font-semibold text-ink">{user.email}</span>
          </div>
          <div className="flex items-center justify-between py-4">
            <span className="text-sm font-medium text-ink/60">Role</span>
            <span className="text-sm font-semibold capitalize text-ink">
              {user.role}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 w-full rounded-full border border-rust px-6 py-3 text-sm font-semibold text-rust transition-colors hover:bg-rust hover:text-white"
        >
          Log out
        </button>
      </div>
    </div>
  );
}