"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TriangleAlert, ArrowRight, X, Tag } from "lucide-react";
import { API_URL } from "@/lib/api";
import { Category, ProductListResponse } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import ProductSort from "@/components/products/ProductSort";
import GridViewToggle, { GRID_COLUMN_CLASSES } from "@/components/products/GridViewToggle";
import EmptyCartIllustration from "@/components/illustrations/EmptyCartIllustration";
import { Spinner } from "@/components/ui/LoadingState";
import { getCategoryIcon } from "@/utils/categoryIcons";

function CategoryDetails() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "";

  const [category, setCategory] = useState<Category | null>(null);
  const [productData, setProductData] = useState<ProductListResponse | null>(null);
  const [gridCols, setGridCols] = useState(4);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const Icon = useMemo(
    () => (category ? getCategoryIcon(category.name) : Tag),
    [category]
  );

  useEffect(() => {
    async function fetchCategoryAndProducts() {
      setLoading(true);
      setErrorMsg("");

      try {
        const catRes = await fetch(`${API_URL}/api/categories/${params.slug}`);
        const catData = await catRes.json();

        if (!catRes.ok) {
          throw new Error(catData.message || "Category not found");
        }

        setCategory(catData.category);

        const productParams = new URLSearchParams({ category: catData.category._id });
        if (sort) productParams.set("sort", sort);

        const productsRes = await fetch(`${API_URL}/api/products?${productParams.toString()}`);
        const productsData = await productsRes.json();

        if (!productsRes.ok) {
          throw new Error(productsData.message || "Failed to load products");
        }

        setProductData(productsData);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryAndProducts();
  }, [params.slug, sort]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-3">
        <Spinner />
        <p className="text-sm text-ink/50">Loading category...</p>
      </div>
    );
  }

  if (errorMsg || !category) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rust/10">
          <TriangleAlert size={24} className="text-rust" />
        </div>
        <p className="text-sm text-rust">{errorMsg || "Category not found"}</p>
        <Link href="/categories" className="text-sm font-medium text-rust hover:underline">
          Back to categories
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-6 rounded-2xl border border-brass/20 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cream text-rust">
            {/* eslint-disable-next-line react-hooks/static-components -- Icon is
                picked from a fixed, module-level lookup table (see categoryIcons.ts),
                never a newly-defined component, so this is safe despite the lint rule's
                overly broad heuristic for "components created during render". */}
            <Icon size={28} />
          </span>
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl italic text-ink sm:text-4xl">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-1 max-w-xl text-sm text-ink/60">{category.description}</p>
            )}
          </div>
        </div>

        <Link
          href="/products"
          className="flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-rust px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rust-dark sm:self-auto"
        >
          All Products
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/60">
          {productData ? `Showing ${productData.products.length} of ${productData.total} products` : ""}
        </p>
        <div className="flex items-center gap-3">
          <ProductSort />
          <GridViewToggle value={gridCols} onChange={setGridCols} />
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-rust/10 px-4 py-1.5 text-sm font-medium text-rust">
          Category: {category.name}
          <Link
            href="/products"
            aria-label="Clear category filter"
            className="text-rust/60 hover:text-rust"
          >
            <X size={14} />
          </Link>
        </span>
      </div>

      <div className="mb-6 h-px w-full bg-brass/20" />

      {productData && productData.products.length === 0 && (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-3xl border border-brass/20 bg-gradient-to-b from-cream/70 to-white px-6 text-center">
          <EmptyCartIllustration className="h-20 w-20" size={80} />
          <div>
            <p className="font-[family-name:var(--font-display)] text-2xl italic text-ink">
              No products yet
            </p>
            <p className="mx-auto mt-2 max-w-xs text-sm text-ink/50">
              Check back soon — new items are added to this category regularly.
            </p>
          </div>
          <Link
            href="/products"
            className="mt-1 rounded-full bg-rust px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rust-dark"
          >
            Browse all products
          </Link>
        </div>
      )}

      {productData && productData.products.length > 0 && (
        <div className={`grid gap-5 ${GRID_COLUMN_CLASSES[gridCols]}`}>
          {productData.products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryDetailsPage() {
  return (
    <Suspense fallback={null}>
      <CategoryDetails />
    </Suspense>
  );
}