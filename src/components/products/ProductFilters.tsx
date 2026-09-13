"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { API_URL } from "@/lib/api";
import { Category, ProductFiltersMeta } from "@/types";

interface ProductFiltersProps {
  /** When rendered inside the mobile drawer, tweaks layout + shows a footer CTA */
  variant?: "sidebar" | "drawer";
  /** Called when the user taps "Show results" or the X inside the drawer */
  onClose?: () => void;
  /** Live result count, shown on the drawer's "Show results" button */
  resultCount?: number;
}

// quick price presets shown as pill buttons above the custom min/max inputs
const PRICE_PRESETS = [
  { label: "All Prices", min: "", max: "" },
  { label: "Under $30", min: "", max: "30" },
  { label: "$30 to $70", min: "30", max: "70" },
  { label: "$70 & Above", min: "70", max: "" },
];

/** Small collapsible section wrapper used for Category / Brand / Price */
function FilterSection({
  title,
  isActive,
  defaultOpen = false,
  children,
}: {
  title: string;
  isActive?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-brass/20 pb-4 last:border-b-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-1 text-left"
      >
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink">
          {title}
          {isActive && (
            <span className="rounded-full bg-brass/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-normal text-rust-dark">
              Active
            </span>
          )}
        </span>
        {open ? (
          <ChevronUp size={16} className="text-ink/50" />
        ) : (
          <ChevronDown size={16} className="text-ink/50" />
        )}
      </button>

      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function ProductFilters({
  variant = "sidebar",
  onClose,
  resultCount,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [filterMeta, setFilterMeta] = useState<ProductFiltersMeta | null>(null);

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  // keep local price inputs synced if the filters get cleared elsewhere (e.g. chip X).
  // Updated during render (not in an effect) to avoid the extra render pass —
  // same pattern the products page uses to sync its search box.
  const urlMinPrice = searchParams.get("minPrice") || "";
  const urlMaxPrice = searchParams.get("maxPrice") || "";
  const [syncedMinPrice, setSyncedMinPrice] = useState(urlMinPrice);
  const [syncedMaxPrice, setSyncedMaxPrice] = useState(urlMaxPrice);
  if (urlMinPrice !== syncedMinPrice || urlMaxPrice !== syncedMaxPrice) {
    setSyncedMinPrice(urlMinPrice);
    setSyncedMaxPrice(urlMaxPrice);
    setMinPrice(urlMinPrice);
    setMaxPrice(urlMaxPrice);
  }

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

  function applyPriceRange(nextMin: string, nextMax: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextMin) {
      params.set("minPrice", nextMin);
    } else {
      params.delete("minPrice");
    }

    if (nextMax) {
      params.set("maxPrice", nextMax);
    } else {
      params.delete("maxPrice");
    }

    params.delete("page");
    router.push(pathname + "?" + params.toString());
  }

  function handlePriceApply() {
    applyPriceRange(minPrice, maxPrice);
  }

  function handlePricePreset(preset: (typeof PRICE_PRESETS)[number]) {
    setMinPrice(preset.min);
    setMaxPrice(preset.max);
    applyPriceRange(preset.min, preset.max);
  }

  const selectedCategories = (searchParams.get("category") || "")
    .split(",")
    .filter(Boolean);
  const selectedBrand = searchParams.get("brand") || "";
  const inStockOnly = searchParams.get("inStock") === "true";
  const hasPriceFilter = Boolean(searchParams.get("minPrice") || searchParams.get("maxPrice"));

  const activePresetLabel = (() => {
    const found = PRICE_PRESETS.find(
      (p) => p.min === (searchParams.get("minPrice") || "") && p.max === (searchParams.get("maxPrice") || "")
    );
    return found ? found.label : null;
  })();

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

  const isDrawer = variant === "drawer";

  const content = (
    <div
      className={
        isDrawer
          ? "flex h-full min-h-0 flex-col"
          : "w-full space-y-5 rounded-2xl border border-brass/20 bg-white p-5 lg:w-72 lg:shrink-0"
      }
    >
      {isDrawer && (
        <div className="flex shrink-0 items-center justify-between border-b border-brass/20 px-5 py-4">
          <p className="font-[family-name:var(--font-display)] text-xl italic text-ink">
            Filters
          </p>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:bg-brass/10 hover:text-rust"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <div
        className={
          isDrawer
            ? "min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5"
            : "contents"
        }
      >
        {/* header row */}
        <div className="flex items-center justify-between">
          <p className="font-[family-name:var(--font-display)] text-lg italic text-ink">
            Filters
          </p>
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-medium text-rust hover:underline"
          >
            <X size={12} />
            Clear All
          </button>
        </div>

        <div className="h-px w-full bg-brass/20" />

        {/* category list — multi-select checkboxes, collapsible + scrollable */}
        <FilterSection title="Categories" isActive={selectedCategories.length > 0}>
          <div className="filter-scroll max-h-48 space-y-1 overflow-y-auto pr-1">
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
            {categories.length === 0 && (
              <p className="px-3 py-1.5 text-sm text-ink/40">No categories yet</p>
            )}
          </div>
        </FilterSection>

        {/* price range — presets + custom min/max */}
        <FilterSection title="Price Range" isActive={hasPriceFilter} defaultOpen>
          <div className="grid grid-cols-2 gap-2">
            {PRICE_PRESETS.map((preset) => {
              const isSelected = activePresetLabel === preset.label;
              return (
                <button
                  key={preset.label}
                  onClick={() => handlePricePreset(preset)}
                  className={
                    "rounded-lg border px-3 py-2 text-xs font-medium transition-colors " +
                    (isSelected
                      ? "border-rust bg-rust/10 text-rust-dark"
                      : "border-brass/30 text-ink/70 hover:border-rust/40 hover:text-ink")
                  }
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex w-full items-center gap-1 rounded-lg border border-brass/30 px-2 py-1.5 focus-within:border-rust">
              <span className="text-sm text-ink/40">$</span>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder={filterMeta ? String(filterMeta.minPrice) : "Min"}
                className="w-full text-sm text-ink outline-none"
              />
            </div>
            <span className="text-ink/40">—</span>
            <div className="flex w-full items-center gap-1 rounded-lg border border-brass/30 px-2 py-1.5 focus-within:border-rust">
              <span className="text-sm text-ink/40">$</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder={filterMeta ? String(filterMeta.maxPrice) : "Max"}
                className="w-full text-sm text-ink outline-none"
              />
            </div>
            <button
              onClick={handlePriceApply}
              className="shrink-0 rounded-lg bg-rust px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-rust-dark"
            >
              Go
            </button>
          </div>
        </FilterSection>

        {/* brand list, only show if we actually got some brands back */}
        {filterMeta && filterMeta.brands.length > 0 && (
          <FilterSection title="Brand" isActive={Boolean(selectedBrand)}>
            <div className="filter-scroll max-h-48 space-y-1 overflow-y-auto pr-1">
              <button
                onClick={() => updateParam("brand", "")}
                className={
                  "block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors " +
                  (selectedBrand === ""
                    ? "bg-rust text-cream"
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
                    "block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors " +
                    (selectedBrand === brand
                      ? "bg-rust text-cream"
                      : "text-ink/70 hover:bg-brass/10")
                  }
                >
                  {brand}
                </button>
              ))}
            </div>
          </FilterSection>
        )}

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
      </div>

      {isDrawer && (
        <div className="shrink-0 border-t border-brass/20 bg-white px-5 py-4">
          <button
            onClick={onClose}
            className="block w-full rounded-full bg-rust px-6 py-3 text-center text-sm font-semibold text-cream hover:bg-rust-dark"
          >
            Show {resultCount ?? ""} {resultCount === 1 ? "result" : "results"}
          </button>
        </div>
      )}
    </div>
  );

  if (!isDrawer) {
    return <aside className="hidden lg:block">{content}</aside>;
  }

  return (
    <div className="fixed inset-0 z-[60]">
      {/* backdrop */}
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />

      {/* bottom sheet — same trigger + panel on every screen size */}
      <div className="animate-slide-up absolute inset-x-0 bottom-0 mx-auto flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-3xl sm:mb-6">
        {content}
      </div>
    </div>
  );
}