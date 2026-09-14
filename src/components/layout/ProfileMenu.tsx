"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, User, Package, Heart, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const { products: wishlistProducts } = useWishlist();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (!user) return null;

  async function handleLogout() {
    setOpen(false);
    await logout();
    router.push("/");
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className={`flex h-9 items-center gap-1.5 rounded-full border pl-1 pr-2 transition-colors ${
          open ? "border-rust" : "border-brass/30 hover:border-rust/50"
        }`}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rust text-xs font-semibold uppercase text-white">
          {user.name.charAt(0)}
        </span>
        <ChevronDown
          size={14}
          className={`text-ink/50 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-brass/20 bg-white shadow-xl">
          <div className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 border-l border-t border-brass/20 bg-white" />

          <div className="relative border-b border-brass/20 px-4 py-3.5">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink/50">{user.email}</p>
          </div>

          <div className="py-1.5">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-ink/80 hover:bg-cream hover:text-rust"
            >
              <User size={16} />
              Profile
            </Link>
            {!isAdmin && (
              <>
                <Link
                  href="/orders"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-ink/80 hover:bg-cream hover:text-rust"
                >
                  <Package size={16} />
                  My Orders
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium text-ink/80 hover:bg-cream hover:text-rust"
                >
                  <span className="flex items-center gap-3">
                    <Heart size={16} />
                    Wishlist
                  </span>
                  {wishlistProducts.length > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rust px-1.5 text-[11px] font-semibold text-white">
                      {wishlistProducts.length}
                    </span>
                  )}
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-ink/80 hover:bg-cream hover:text-rust"
              >
                <LayoutDashboard size={16} />
                Admin Dashboard
              </Link>
            )}
          </div>

          <div className="border-t border-brass/20 py-1.5">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-rust hover:bg-rust/5"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}