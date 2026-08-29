"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FolderOpen, SearchX, TriangleAlert, X } from "lucide-react";
import { API_URL } from "@/lib/api";
import { Category } from "@/types";
import SearchBar from "@/components/products/SearchBar";
import GridViewToggle, { GRID_COLUMN_CLASSES } from "@/components/products/GridViewToggle";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchText, setSearchText] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [gridCols, setGridCols] = useState(3);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${API_URL}/api/categories`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load categories");
        }

        setCategories(data.categories);
      } catch (err) {
        if (err instanceof Error) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    if (!activeSearch) return categories;
    const q = activeSearch.trim().toLowerCase();
    return categories.filter((cat) => cat.name.toLowerCase().includes(q));
  }, [categories, activeSearch]);

  function handleClearSearch() {
    setSearchText("");
    setActiveSearch("");
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="divider-signature mb-4">
        <span className="dot" />
      </div>

      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
            Browse
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl italic text-ink">
            Categories
          </h1>
        </div>

        <SearchBar
          value={searchText}
          onChange={setSearchText}
          onSubmit={setActiveSearch}
          onClear={handleClearSearch}
          placeholder="Search categories..."
          className="md:max-w-sm"
        />
      </div>

      {activeSearch && (
        <div className="mb-6 flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-brass/10 px-4 py-1.5 text-sm font-medium text-ink">
            Search: {activeSearch}
            <button
              onClick={handleClearSearch}
              aria-label="Clear search filter"
              className="text-ink/50 hover:text-rust"
            >
              <X size={14} />
            </button>
          </span>
        </div>
      )}

      {!loading && !errorMsg && categories.length > 0 && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-ink/60">
              {filteredCategories.length} of {categories.length} categories
            </p>
            <GridViewToggle value={gridCols} onChange={setGridCols} />
          </div>

          {/* light divider between the count row and the category grid */}
          <div className="mb-6 h-px w-full bg-brass/20" />
        </>
      )}

      {loading && (
        <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-brass/20 bg-white text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brass/30 border-t-rust" />
          <p className="text-sm text-ink/50">Loading categories...</p>
        </div>
      )}

      {errorMsg && (
        <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-rust/20 bg-white px-6 text-center">
          <TriangleAlert size={28} className="text-rust" />
          <p className="text-sm font-medium text-ink">Something went wrong</p>
          <p className="max-w-xs text-sm text-ink/50">{errorMsg}</p>
        </div>
      )}

      {!loading && !errorMsg && categories.length === 0 && (
        <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-brass/30 bg-white px-6 text-center">
          <FolderOpen size={28} className="text-ink/30" />
          <p className="text-sm font-medium text-ink">No categories yet</p>
          <p className="max-w-xs text-sm text-ink/50">
            Check back soon — new categories are on the way.
          </p>
        </div>
      )}

      {!loading && !errorMsg && categories.length > 0 && filteredCategories.length === 0 && (
        <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-brass/30 bg-white px-6 text-center">
          <SearchX size={28} className="text-ink/30" />
          <p className="text-sm font-medium text-ink">No categories match your search</p>
          <p className="max-w-xs text-sm text-ink/50">
            Try a different name, or clear the search to see everything.
          </p>
        </div>
      )}

      {!loading && !errorMsg && filteredCategories.length > 0 && (
        <div className={`grid gap-6 ${GRID_COLUMN_CLASSES[gridCols]}`}>
          {filteredCategories.map((cat) => (
            <Link
              key={cat._id}
              href={`/categories/${cat.slug}`}
              className="group overflow-hidden rounded-2xl border border-brass/20 bg-white transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream">
                {cat.image.url ? (
                  <Image
                    src={cat.image.url}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-ink/30">
                    No image
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-[family-name:var(--font-display)] text-xl italic text-ink">
                    {cat.name}
                  </h3>
                  <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-rust">
                    {cat.productCount ?? 0}{" "}
                    {cat.productCount === 1 ? "Product" : "Products"}
                  </span>
                </div>
                {cat.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-ink/60">
                    {cat.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}