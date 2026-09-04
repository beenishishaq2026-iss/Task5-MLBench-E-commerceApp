"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  Heart,
  ShoppingBag,
  User,
  Shirt,
  Baby,
  Sparkles,
  Headphones,
  Sprout,
  UtensilsCrossed,
  Tent,
  Tag,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { API_URL } from "@/lib/api";
import { Category } from "@/types";

const navLinks = [
  { label: "Products", href: "/products" },
  { label: "Deals", href: "/#deals" },
  { label: "Contact", href: "/contact" },
];

const categoryIcons: Record<string, React.ElementType> = {
  apparel: Shirt,
  baby: Baby,
  beauty: Sparkles,
  electronics: Headphones,
  "home & living": Sprout,
  kitchen: UtensilsCrossed,
  outdoors: Tent,
};

function getCategoryIcon(name: string) {
  return categoryIcons[name.trim().toLowerCase()] || Tag;
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { user, loading, logout } = useAuth();
  const { itemCount } = useCart();
  const { products: wishlistProducts } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${API_URL}/api/categories`);
        const data = await res.json();
        if (res.ok) {
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.log("could not load categories", err);
      }
    }
    fetchCategories();
  }, []);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-brass/30 bg-cream/90 backdrop-blur-sm">
      <nav className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-6 px-6 py-4">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-2xl italic tracking-tight text-ink"
        >
          Auric
        </Link>

        {/* centered nav links */}
        <ul className="hidden items-center justify-center gap-8 md:flex">
          <li
            onMouseEnter={() => setCategoriesOpen(true)}
            onMouseLeave={() => setCategoriesOpen(false)}
          >
            <Link
              href="/categories"
              className={`text-sm font-medium transition-colors hover:text-rust ${
                pathname.startsWith("/categories") ? "text-rust" : "text-ink/80"
              }`}
            >
              Categories
            </Link>
          </li>
          {navLinks.map((link) => {
            const isAnchorLink = link.href.includes("#");
            const isActive = !isAnchorLink && pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-rust ${
                    isActive ? "text-rust" : "text-ink/80"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-5 justify-self-end">
          <div className="hidden items-center gap-5 md:flex">
            {!loading && user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-sm font-medium text-ink/80 hover:text-rust"
                >
                  <User size={18} />
                  {user.name.split(" ")[0]}
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="rounded-full border border-rust px-3 py-1 text-sm font-medium text-rust hover:bg-rust hover:text-white"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-ink/80 hover:text-rust"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-ink/80 hover:text-rust">
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-rust"
                >
                  Sign up
                </Link>
              </>
            )}
            <Link href="/wishlist" aria-label="Wishlist" className="relative text-ink/80 hover:text-rust">
              <Heart size={20} />
              {wishlistProducts.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rust text-[10px] font-semibold text-white">
                  {wishlistProducts.length}
                </span>
              )}
            </Link>
            <Link href="/cart" aria-label="Cart" className="relative text-ink/80 hover:text-rust">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rust text-[10px] font-semibold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {categoriesOpen && categories.length > 0 && (
        <div
          onMouseEnter={() => setCategoriesOpen(true)}
          onMouseLeave={() => setCategoriesOpen(false)}
          className="absolute left-1/2 top-full z-40 hidden w-[min(92vw,42rem)] -translate-x-1/2 pt-2 md:block"
        >
          <div className="rounded-2xl border border-brass/20 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
                Explore Categories
              </p>
              <Link
                href="/categories"
                className="flex items-center gap-1 text-xs font-medium text-ink/60 hover:text-rust"
              >
                View All Categories
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.name);
                return (
                  <Link
                    key={cat._id}
                    href={`/categories/${cat.slug}`}
                    className="group flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-cream"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-rust group-hover:bg-rust group-hover:text-cream">
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">
                        {cat.name}
                      </span>
                      <span className="block text-xs font-medium text-ink/40">
                        {cat.productCount ?? 0}{" "}
                        {cat.productCount === 1 ? "Product" : "Products"}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="border-t border-brass/30 bg-cream px-6 pb-6 md:hidden">
          <ul className="flex flex-col gap-4 pt-4">
            <li>
              <Link
                href="/categories"
                className={`text-sm font-medium hover:text-rust ${
                  pathname.startsWith("/categories") ? "text-rust" : "text-ink/80"
                }`}
                onClick={() => setOpen(false)}
              >
                Categories
              </Link>
            </li>
            {navLinks.map((link) => {
              const isAnchorLink = link.href.includes("#");
              const isActive = !isAnchorLink && pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm font-medium hover:text-rust ${
                      isActive ? "text-rust" : "text-ink/80"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/wishlist"
                className="text-sm font-medium text-ink/80 hover:text-rust"
                onClick={() => setOpen(false)}
              >
                Wishlist{wishlistProducts.length > 0 ? ` (${wishlistProducts.length})` : ""}
              </Link>
            </li>
            <li>
              <Link
                href="/cart"
                className="text-sm font-medium text-ink/80 hover:text-rust"
                onClick={() => setOpen(false)}
              >
                Cart{itemCount > 0 ? ` (${itemCount})` : ""}
              </Link>
            </li>
            {!loading && user ? (
              <>
                <li>
                  <Link
                    href="/profile"
                    className="text-sm font-medium text-ink/80 hover:text-rust"
                    onClick={() => setOpen(false)}
                  >
                    My Profile
                  </Link>
                </li>
                {user.role === "admin" && (
                  <li>
                    <Link
                      href="/admin"
                      className="text-sm font-medium text-rust hover:text-rust-dark"
                      onClick={() => setOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={handleLogout}
                    className="text-left text-sm font-medium text-ink/80 hover:text-rust"
                  >
                    Log out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-ink/80 hover:text-rust"
                    onClick={() => setOpen(false)}
                  >
                    Log in
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="inline-block rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream"
                    onClick={() => setOpen(false)}
                  >
                    Sign up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}