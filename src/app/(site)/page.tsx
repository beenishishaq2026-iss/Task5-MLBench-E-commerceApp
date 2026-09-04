import Link from "next/link";
import { Truck, RotateCcw, ShieldCheck } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import NewsletterForm from "@/components/layout/NewsletterForm";
import ProductCard from "@/components/products/ProductCard";
import { SERVER_API_URL } from "@/lib/api";
import { ProductListResponse, Category } from "@/types";

async function getCategories() {
  try {
    const res = await fetch(`${SERVER_API_URL}/api/categories`, {
      cache: "no-store",
    });
    const data = await res.json();
    
    return (data.categories || []).slice(0, 6) as Category[];
  } catch (err) {
    console.log("could not load categories", err);
    return [] as Category[];
  }
}

async function getFeaturedProducts() {
  try {
    const featuredRes = await fetch(
      `${SERVER_API_URL}/api/products?isFeatured=true&limit=4`,
      { cache: "no-store" }
    );
    const featuredData: ProductListResponse = await featuredRes.json();

    if (featuredData.products && featuredData.products.length > 0) {
      return featuredData.products;
    }

    const latestRes = await fetch(`${SERVER_API_URL}/api/products?limit=4`, {
      cache: "no-store",
    });
    const latestData: ProductListResponse = await latestRes.json();
    return latestData.products || [];
  } catch (err) {
    console.log("could not load featured products", err);
    return [];
  }
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  const categories = await getCategories();

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
              Curated Collection • Honest Prices
            </p>
            <h1 className="mt-6 font-[family-name:var(--font-display)] text-5xl italic leading-tight text-ink md:text-6xl">
              Goods worth
              <br />
              keeping, always.
            </h1>
            <p className="mt-6 max-w-lg text-base text-ink/70">
              A considered collection of everyday essentials — honest pricing,
              lasting materials, and craftsmanship that doesn&apos;t need to
              shout about it.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/products"
                className="rounded-full bg-rust px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-rust-dark"
              >
                Shop Collection
              </Link>
              <Link
                href="/#deals"
                className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-rust hover:text-rust"
              >
                View Deals
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl shadow-xl">
              <img
                src="/images/hero-flatlay.png"
                alt="Curated earthy goods styled on natural linen"
                className="h-[420px] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-lg sm:flex">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brass/20 text-brass">
                ★
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">Premium</p>
                <p className="text-xs text-ink/60">Quality Guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="divider-signature mb-4">
          <span className="dot" />
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold italic text-ink md:text-5xl">
              Shop by category
            </h2>
            <p className="mt-2 text-sm text-ink/60">
              Everything organized simply — find what you need in seconds.
            </p>
          </div>
          <Link
            href="/categories"
            className="hidden text-sm font-medium text-[#C4632B] hover:underline md:block"
          >
            View all categories
          </Link>
        </div>

        {categories.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-brass/40 bg-white px-6 py-10 text-center text-sm text-ink/40">
            No categories yet — check back soon.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/categories/${cat.slug}`}
                className="group overflow-hidden rounded-2xl border border-brass/30 bg-white transition-all hover:border-rust hover:shadow-md"
              >
                <div className="h-28 w-full overflow-hidden bg-cream">
                  {cat.image.url ? (
                    <img
                      src={cat.image.url}
                      alt={cat.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-ink/30">
                      No image
                    </div>
                  )}
                </div>
                <div className="px-4 py-3 text-center">
                  <span className="text-sm font-medium text-ink group-hover:text-rust">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <AnnouncementBar />

      {/* Featured / Deals */}
      <section id="deals" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl border border-brass/20 bg-cream px-6 py-10 md:px-12 md:py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
              Limited Time Offers
            </p>
            <h2 className="animate-fade-up mt-3 font-[family-name:var(--font-display)] text-4xl font-bold italic text-ink md:text-5xl">
              Featured Collection
            </h2>
            <p className="mt-3 max-w-xl text-sm text-ink/60">
              Handpicked favorites and seasonal deals, pulled live from our
              catalog.
            </p>

            {featuredProducts.length > 0 ? (
              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <p className="mt-10 rounded-2xl border border-dashed border-brass/40 bg-white px-6 py-10 text-center text-sm text-ink/40">
                No products available yet — check back soon.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl">
          <img
            src="/images/hero-flatlay.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-ink/70" />

          <div className="relative grid grid-cols-1 items-center gap-10 px-8 py-16 md:grid-cols-2 md:px-16 md:py-24">
            <div className="text-cream">
              <h2 className="font-[family-name:var(--font-display)] text-4xl italic leading-tight md:text-5xl">
                Join the
                <br />
                Collective
              </h2>
              <p className="mt-5 max-w-md text-sm text-cream/80">
                Subscribe to receive early access to seasonal curations,
                exclusive discounts, and thoughtful stories on intentional
                living.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-cream/90">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brass" />
                  10% Off First Order
                </span>
                <span className="text-cream/40">•</span>
                <span>Weekly Digest</span>
                <span className="text-cream/40">•</span>
                <span>Zero Spam</span>
              </div>
            </div>

            <NewsletterForm />
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-t border-brass/20 bg-cream py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-6 text-sm text-ink/70 sm:flex-row sm:justify-around">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-rust" />
            Free shipping over $50
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw size={18} className="text-rust" />
            30-day easy returns
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-rust" />
            Secure checkout
          </div>
        </div>
      </section>
    </div>
  );
}