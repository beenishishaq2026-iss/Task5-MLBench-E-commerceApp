"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  Heart,
  ShoppingBag,
  User,
  Search,
  ArrowRight,
  ChevronDown,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { API_URL } from "@/lib/api";
import { Category } from "@/types";
import SearchOverlay from "@/components/layout/SearchOverlay";
import NotificationBell from "@/components/notifications/NotificationBell";
import ProfileMenu from "@/components/layout/ProfileMenu";
import { getCategoryIcon } from "@/utils/categoryIcons";

const navLinks = [
  { label: "Products", href: "/products" },
  { label: "Featured", href: "/#deals" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { user, loading, logout } = useAuth();
  const { itemCount } = useCart();
  const { products: wishlistProducts } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

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

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    router.push("/");
  };

  const isAdmin = user?.role === "admin";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-brass/30 bg-cream/90 backdrop-blur-sm">
        <nav className="relative mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-6 px-6 py-4">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-2xl italic tracking-tight text-ink"
        >
          Auric
        </Link>

        {/* centered nav links */}
        {!isAdmin && (
        <ul className="hidden items-center justify-center gap-8 md:flex">
          <li
            className="relative"
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

            {categoriesOpen && categories.length > 0 && (
              <div className="absolute left-0 top-full z-40 hidden w-[min(92vw,42rem)] pt-3 md:block">
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
        )}
        {isAdmin && <div />}

        <div className="flex items-center gap-5 justify-self-end">
          <div className="hidden items-center gap-5 md:flex">
            {!loading && user ? (
              <ProfileMenu />
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex h-6 items-center text-sm font-medium leading-none text-ink/80 hover:text-rust"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="flex h-6 items-center rounded-full bg-rust px-4 text-sm font-medium leading-none text-cream transition-colors hover:bg-rust-dark"
                >
                  Sign up
                </Link>
              </>
            )}
            {!isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => setSearchOverlayOpen((v) => !v)}
                  aria-label="Search"
                  className={`flex h-6 w-6 items-center justify-center transition-colors ${
                    searchOverlayOpen ? "text-rust" : "text-ink/80 hover:text-rust"
                  }`}
                >
                  <Search size={20} />
                </button>
                {!loading && user && (
                  <div className="flex h-6 w-6 items-center justify-center">
                    <NotificationBell />
                  </div>
                )}
                <Link
                  href="/wishlist"
                  aria-label="Wishlist"
                  className="relative flex h-6 w-6 items-center justify-center text-ink/80 hover:text-rust"
                >
                  <Heart size={20} />
                  {wishlistProducts.length > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rust text-[10px] font-semibold text-white">
                      {wishlistProducts.length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/cart"
                  aria-label="Cart"
                  className="relative flex h-6 w-6 items-center justify-center text-ink/80 hover:text-rust"
                >
                  <ShoppingBag size={20} />
                  {itemCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rust text-[10px] font-semibold text-white">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </>
            )}
          </div>

          {/* mobile: search + notification bell sit next to the hamburger toggle */}
          <div className="flex items-center gap-4 md:hidden">
            {!isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOverlayOpen((v) => !v);
                    setOpen(false);
                  }}
                  aria-label="Search"
                  className={`flex h-6 w-6 items-center justify-center transition-colors ${
                    searchOverlayOpen ? "text-rust" : "text-ink/80 hover:text-rust"
                  }`}
                >
                  <Search size={20} />
                </button>
                {!loading && user && (
                  <div className="flex h-6 w-6 items-center justify-center">
                    <NotificationBell />
                  </div>
                )}
              </>
            )}
            <button
              onClick={() => {
                setOpen(!open);
                setSearchOverlayOpen(false);
              }}
              aria-label="Toggle menu"
              className="flex h-6 w-6 items-center justify-center text-ink/80"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {searchOverlayOpen && (
          <Suspense fallback={null}>
            <SearchOverlay
              open={searchOverlayOpen}
              onClose={() => setSearchOverlayOpen(false)}
              categories={categories}
            />
          </Suspense>
        )}
      </nav>
      </header>

      {open && (
        <>
          <div
            className="animate-fade-in fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div className="animate-slide-in-right fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-cream shadow-2xl md:hidden">
            <div className="flex items-center justify-between border-b border-brass/30 px-6 py-5">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="font-[family-name:var(--font-display)] text-2xl italic tracking-tight text-ink"
              >
                Auric
              </Link>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-brass/40 text-ink transition-colors hover:border-rust hover:text-rust"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {!isAdmin && (
              <ul className="flex flex-col divide-y divide-brass/10">
                <li>
                  <button
                    onClick={() => setMobileCategoriesOpen((v) => !v)}
                    className={`flex w-full items-center justify-between py-3 text-[15px] font-medium hover:text-rust ${
                      pathname.startsWith("/categories") ? "text-rust" : "text-ink/80"
                    }`}
                  >
                    Categories
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        mobileCategoriesOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {mobileCategoriesOpen && (
                    <ul className="mb-2 ml-1 flex flex-col gap-1 border-l border-brass/20 pl-4">
                      {categories.map((cat) => (
                        <li key={cat._id}>
                          <Link
                            href={`/categories/${cat.slug}`}
                            onClick={() => setOpen(false)}
                            className="block py-2 text-sm text-ink/60 hover:text-rust"
                          >
                            {cat.name}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          href="/categories"
                          onClick={() => setOpen(false)}
                          className="block py-2 text-sm font-medium text-rust"
                        >
                          View All Categories
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
                {navLinks.map((link) => {
                  const isAnchorLink = link.href.includes("#");
                  const isActive = !isAnchorLink && pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`block py-3 text-[15px] font-medium hover:text-rust ${
                          isActive ? "text-rust" : "text-ink/80"
                        }`}
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              )}

              {!isAdmin && <div className="my-4 border-t border-brass/20" />}

              <ul className="flex flex-col divide-y divide-brass/10">
                {!isAdmin && (
                <>
                <li>
                  <Link
                    href="/wishlist"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-3 text-[15px] font-medium text-ink/80 hover:text-rust"
                  >
                    <span className="flex items-center gap-3">
                      <Heart size={18} />
                      Wishlist
                    </span>
                    {wishlistProducts.length > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rust px-1.5 text-[11px] font-semibold text-cream">
                        {wishlistProducts.length}
                      </span>
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cart"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-3 text-[15px] font-medium text-ink/80 hover:text-rust"
                  >
                    <span className="flex items-center gap-3">
                      <ShoppingBag size={18} />
                      Shopping Cart
                    </span>
                    {itemCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rust px-1.5 text-[11px] font-semibold text-cream">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                </li>
                </>
                )}

                {!loading && user && (
                  <>
                    <li>
                      <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 py-3 text-[15px] font-medium text-ink/80 hover:text-rust"
                      >
                        <User size={18} />
                        My Profile
                      </Link>
                    </li>
                    {user.role === "admin" && (
                      <li>
                        <Link
                          href="/admin"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 py-3 text-[15px] font-medium text-rust hover:text-rust-dark"
                        >
                          <LayoutDashboard size={18} />
                          Admin Dashboard
                        </Link>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>

            {!loading && (
              <div className="border-t border-brass/30 px-6 py-5">
                {user ? (
                  <div className="space-y-3">
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-2xl border border-brass/20 bg-white/60 px-3 py-2.5 transition-colors hover:border-rust/40"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rust text-sm font-semibold uppercase text-cream">
                        {user.name.charAt(0)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink">
                          {user.name}
                        </span>
                        <span className="block truncate text-xs text-ink/50">
                          {user.email}
                        </span>
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-rust px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rust-dark"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-rust px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rust-dark"
                    >
                      <LogIn size={16} />
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-full border border-brass/40 px-4 py-3 text-sm font-semibold text-ink transition-colors hover:border-rust hover:text-rust"
                    >
                      <UserPlus size={16} />
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}