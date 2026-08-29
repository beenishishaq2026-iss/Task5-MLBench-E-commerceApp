"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { API_URL } from "@/lib/api";
import { Category, ProductFiltersMeta } from "@/types";


export default function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [filterMeta, setFilterMeta] = useState<ProductFiltersMeta | null>(null);

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  // load categories + filter meta (brands, price range) once on mount
  useEffect(() => {
    async function loadFilterData() {
      try {
        const catRes = await fetch(`${API_URL}/api/categories`);
        const catData = await catRes.json();
        setCategories(catData.categories || []);

        const metaRes = await fetch(`${API_URL}/api/products/meta/filters`);
        const metaData = await metaRes.json();
        setFilterMeta(metaData);
      } catch (err) {
        console.log("could not load filters", err);
      }
    }

    loadFilterData();
  }, []);

  // helper to update one query param and push the new url
  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // reset back to page 1 whenever a filter changes
    params.delete("page");

    router.push(pathname + "?" + params.toString());
  }

  function handlePriceApply() {
    const params = new URLSearchParams(searchParams.toString());

    if (minPrice) {
      params.set("minPrice", minPrice);
    } else {
      params.delete("minPrice");
    }

    if (maxPrice) {
      params.set("maxPrice", maxPrice);
    } else {
      params.delete("maxPrice");
    }

    params.delete("page");
    router.push(pathname + "?" + params.toString());
  }

  const selectedCategories = (searchParams.get("category") || "")
    .split(",")
    .filter(Boolean);
  const selectedBrand = searchParams.get("brand") || "";
  const inStockOnly = searchParams.get("inStock") === "true";

  function toggleCategory(id: string) {
    const current = new Set(selectedCategories);
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    updateParam("category", Array.from(current).join(","));
  }

  function clearFilters() {
    router.push(pathname);
    setMinPrice("");
    setMaxPrice("");
  }

  return (
    <aside className="w-full space-y-6 rounded-2xl border border-brass/20 bg-white p-5 lg:w-72 lg:shrink-0">
      {/* category list — multi-select checkboxes */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-ink">Category</p>
          {selectedCategories.length > 0 && (
            <button
              onClick={() => updateParam("category", "")}
              className="text-xs font-medium text-rust hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-1">
          {categories.map((cat) => (
            <label
              key={cat._id}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-ink/70 hover:bg-brass/10"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat._id)}
                onChange={() => toggleCategory(cat._id)}
                className="h-4 w-4 shrink-0 accent-rust"
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      {/* brand list, only show if we actually got some brands back */}
      {filterMeta && filterMeta.brands.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-ink">Brand</p>
          <div className="space-y-1">
            <button
              onClick={() => updateParam("brand", "")}
              className={
                "block w-full rounded-lg px-3 py-1.5 text-left text-sm " +
                (selectedBrand === ""
                  ? "bg-ink text-cream"
                  : "text-ink/70 hover:bg-brass/10")
              }
            >
              All
            </button>

            {filterMeta.brands.map((brand) => (
              <button
                key={brand}
                onClick={() => updateParam("brand", brand)}
                className={
                  "block w-full rounded-lg px-3 py-1.5 text-left text-sm " +
                  (selectedBrand === brand
                    ? "bg-ink text-cream"
                    : "text-ink/70 hover:bg-brass/10")
                }
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* price range */}
      <div>
        <p className="mb-2 text-sm font-medium text-ink">Price range</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder={filterMeta ? String(filterMeta.minPrice) : "Min"}
            className="w-full rounded-lg border border-brass/30 px-2 py-1.5 text-sm focus:border-rust focus:outline-none"
          />
          <span className="text-ink/40">-</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder={filterMeta ? String(filterMeta.maxPrice) : "Max"}
            className="w-full rounded-lg border border-brass/30 px-2 py-1.5 text-sm focus:border-rust focus:outline-none"
          />
        </div>
        <button
          onClick={handlePriceApply}
          className="mt-2 w-full rounded-lg border border-ink/20 py-1.5 text-sm font-medium text-ink hover:bg-ink hover:text-cream"
        >
          Apply
        </button>
      </div>

      {/* in stock checkbox */}
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => updateParam("inStock", e.target.checked ? "true" : "")}
          className="h-4 w-4 accent-rust"
        />
        In stock only
      </label>

      <button onClick={clearFilters} className="text-sm font-medium text-rust hover:underline">
        Clear all filters
      </button>
    </aside>
  );
}