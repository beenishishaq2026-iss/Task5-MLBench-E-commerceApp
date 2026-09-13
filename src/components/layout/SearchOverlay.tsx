"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Sparkles, ArrowRight } from "lucide-react";
import { API_URL } from "@/lib/api";
import { Category, Product } from "@/types";
import { getCategoryIcon } from "@/utils/categoryIcons";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

// Store categories, used as both the quick "trending" chips and the
// popular-categories grid. Matched against whatever the API returns by
// name so real category ids/slugs are used when they exist.
const OWN_CATEGORIES = [
  "Beauty",
  "Books & Gallery",
  "Shoes",
  "Electronics",
  "Clothes",
  "Furniture",
  "Kitchen",
  "Sports & Outdoors",
  "Stationery Items",
];

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
}

export default function SearchOverlay({ open, onClose, categories }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const debouncedQuery = useDebouncedValue(query, 350);

  // close on Escape, close on click outside the panel
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  // debounced fetch of quick product suggestions as the user types
  // (when the query is empty we render the trending/categories view instead,
  // so `suggestions` is simply left as-is and never read in that branch)
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) return;

    let cancelled = false;
    async function fetchSuggestions() {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(
          `${API_URL}/api/products?search=${encodeURIComponent(trimmed)}&limit=5`
        );
        const data = await res.json();
        if (!cancelled && res.ok) {
          setSuggestions(data.products || []);
        }
      } catch (err) {
        console.log("could not load search suggestions", err);
      } finally {
        if (!cancelled) setLoadingSuggestions(false);
      }
    }

    fetchSuggestions();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  function goToSearch(value: string) {
    const trimmed = value.trim();
    onClose();
    router.push(trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : "/products");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    goToSearch(query);
  }

  // prefer the store's real categories (with working ids) when a name
  // matches one of our own categories; otherwise fall back to a
  // search-by-name link so the tile still works
  const popularCategories = OWN_CATEGORIES.map((name) => {
    const match = categories.find(
      (cat) => cat.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    return { name, match };
  });

  if (!open) return null;

  return (
    <div className="absolute inset-x-0 top-full z-50">
      <div
        className="animate-fade-in fixed inset-0 -z-10 bg-ink/20 backdrop-blur-[2px]"
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className="mx-auto w-full max-w-3xl px-4 pt-3 sm:px-6"
      >
        <div className="overflow-hidden rounded-2xl border border-brass/20 bg-white shadow-xl">
          <form onSubmit={handleSubmit} className="flex items-center gap-3 border-b border-brass/10 px-5 py-4">
            <Search size={20} className="shrink-0 text-ink/40" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, categories, or keywords..."
              className="w-full bg-transparent text-[15px] text-ink placeholder:text-ink/40 focus:outline-none"
            />
            <span className="hidden shrink-0 rounded-md border border-brass/30 px-1.5 py-0.5 text-[10px] font-medium text-ink/40 sm:inline-flex">
              ESC
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="shrink-0 text-ink/40 hover:text-rust"
            >
              <X size={16} />
            </button>
          </form>

          <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
            {query.trim() ? (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-rust">
                  Product Matches
                </p>
                {loadingSuggestions && (
                  <p className="py-2 text-sm text-ink/50">Searching...</p>
                )}
                {!loadingSuggestions && suggestions.length === 0 && (
                  <p className="py-2 text-sm text-ink/50">
                    No quick matches for &quot;{query}&quot; yet — press enter to search everything.
                  </p>
                )}
                {!loadingSuggestions && suggestions.length > 0 && (
                  <ul className="flex flex-col divide-y divide-brass/10">
                    {suggestions.map((product) => (
                      <li key={product._id}>
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-3 py-2.5 hover:text-rust"
                        >
                          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-cream">
                            {product.images?.[0]?.url && (
                              <Image
                                src={product.images[0].url}
                                alt={product.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-ink">
                              {product.name}
                            </span>
                            <span className="block text-xs text-ink/40">
                              {product.category?.name}
                            </span>
                          </span>
                          <span className="shrink-0 text-sm font-medium text-ink/70">
                            ${(product.discountPrice ?? product.price).toFixed(2)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  type="button"
                  onClick={() => goToSearch(query)}
                  className="mt-3 flex items-center gap-1 text-sm font-medium text-rust hover:text-rust-dark"
                >
                  See all results for &quot;{query}&quot;
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-rust">
                    <Sparkles size={13} />
                    Trending Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {OWN_CATEGORIES.slice(0, 5).map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setQuery(name)}
                        className="rounded-full border border-brass/30 px-3 py-1.5 text-xs font-medium text-ink/70 transition-colors hover:border-rust hover:text-rust"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-rust">
                    Popular Categories
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {popularCategories.map(({ name, match }) => {
                      const Icon = getCategoryIcon(name);
                      return (
                        <Link
                          key={name}
                          href={match ? `/products?category=${match._id}` : `/products?search=${encodeURIComponent(name)}`}
                          onClick={onClose}
                          className="flex items-center gap-2 rounded-xl border border-brass/20 px-3 py-2.5 text-left transition-colors hover:border-rust hover:bg-cream"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-rust">
                            <Icon size={16} />
                          </span>
                          <span className="truncate text-sm font-medium text-ink">{name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}