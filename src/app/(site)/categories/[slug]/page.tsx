"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import { Category, Product } from "@/types";
import ProductCard from "@/components/products/ProductCard";

export default function CategoryDetailPage() {
  const params = useParams<{ slug: string }>();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchCategoryAndProducts() {
      setLoading(true);
      setErrorMsg("");

      try {
        // first get the category itself by its slug
        const catRes = await fetch(`${API_URL}/api/categories/${params.slug}`);
        const catData = await catRes.json();

        if (!catRes.ok) {
          throw new Error(catData.message || "Category not found");
        }

        setCategory(catData.category);

        // then get products that belong to this category's id
        const prodRes = await fetch(
          `${API_URL}/api/products?category=${catData.category._id}&limit=24`
        );
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
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

    fetchCategoryAndProducts();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-ink/60">Loading category...</p>
      </div>
    );
  }

  if (errorMsg || !category) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-rust">{errorMsg || "Category not found"}</p>
        <Link href="/categories" className="text-sm font-medium text-rust hover:underline">
          Back to categories
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <Link
          href="/categories"
          className="text-xs font-semibold uppercase tracking-[0.15em] text-rust hover:underline"
        >
          Categories
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl italic text-ink">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 max-w-2xl text-ink/60">{category.description}</p>
        )}
      </div>

      {products.length === 0 ? (
        <p className="py-20 text-center text-sm text-ink/50">
          No products in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}