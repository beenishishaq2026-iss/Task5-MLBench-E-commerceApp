"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SearchX, PackageX, TriangleAlert, X } from "lucide-react";
import { API_URL } from "@/lib/api";
import { ProductListResponse } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import ProductFilters from "@/components/products/ProductFilters";
import ProductSort from "@/components/products/ProductSort";
import Pagination from "@/components/products/Pagination";
import SearchBar from "@/components/products/SearchBar";
import GridViewToggle, { GRID_COLUMN_CLASSES } from "@/components/products/GridViewToggle";

function ProductsListing() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeSearch = searchParams.get("search") || "";

  const [searchText, setSearchText] = useState(activeSearch);
  const [gridCols, setGridCols] = useState(4);
  const [productData, setProductData] = useState<ProductListResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // keep the search box in sync if the URL changes elsewhere (e.g. clearing
  // filters resets the pathname). Adjusted during render rather than in an
  // effect, per React's guidance for syncing state to a changed prop/param.
  const [syncedSearch, setSyncedSearch] = useState(activeSearch);
  if (activeSearch !== syncedSearch) {
    setSyncedSearch(activeSearch);
    setSearchText(activeSearch);
  }

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setErrorMsg("");

      try {
        const res = await fetch(
          `${API_URL}/api/products?${searchParams.toString()}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load products");
        }

        setProductData(data);
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

    fetchProducts();
  }, [searchParams]);

  function updateSearchParam(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(pathname + "?" + params.toString());
  }

  function handleClearSearch() {
    setSearchText("");
    updateSearchParam("");
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="divider-signature mb-4">
        <span className="dot" />
      </div>

      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
            Shop
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl italic text-ink">
           Explore Collection
          </h1>
          <p className="mt-2 max-w-md text-sm text-ink/60">
            Carefully curated everyday essentials designed for durability,
            simplicity, and delight.
          </p>
        </div>

        <SearchBar
          value={searchText}
          onChange={setSearchText}
          onSubmit={updateSearchParam}
          onClear={handleClearSearch}
          placeholder="Search products..."
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

      <div className="flex flex-col gap-10 lg:flex-row">
        <ProductFilters />

        <div className="flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink/60">
              {productData
                ? `Showing ${productData.products.length} of ${productData.total} products`
                : ""}
            </p>
            <div className="flex items-center gap-3">
              <ProductSort />
              <GridViewToggle value={gridCols} onChange={setGridCols} />
            </div>
          </div>

          {/* light divider between the count/sort row and the product grid */}
          <div className="mb-6 h-px w-full bg-brass/20" />

          {loading && (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-brass/20 bg-white text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brass/30 border-t-rust" />
              <p className="text-sm text-ink/50">Loading products...</p>
            </div>
          )}

          {errorMsg && (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-rust/20 bg-white px-6 text-center">
              <TriangleAlert size={28} className="text-rust" />
              <p className="text-sm font-medium text-ink">
                Something went wrong
              </p>
              <p className="max-w-xs text-sm text-ink/50">{errorMsg}</p>
            </div>
          )}

          {!loading && !errorMsg && productData && productData.products.length === 0 && (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-brass/30 bg-white px-6 text-center">
              {activeSearch ? (
                <SearchX size={28} className="text-ink/30" />
              ) : (
                <PackageX size={28} className="text-ink/30" />
              )}
              <p className="text-sm font-medium text-ink">
                No products match your filters
              </p>
              <p className="max-w-xs text-sm text-ink/50">
                Try clearing a filter or searching for something else.
              </p>
            </div>
          )}

          {!loading && !errorMsg && productData && productData.products.length > 0 && (
            <>
              <div className={`grid gap-5 ${GRID_COLUMN_CLASSES[gridCols]}`}>
                {productData.products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              <Pagination
                currentPage={productData.page}
                totalPages={productData.totalPages}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsListing />
    </Suspense>
  );
}