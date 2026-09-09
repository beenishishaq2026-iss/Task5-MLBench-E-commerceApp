"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { API_URL } from "@/lib/api";
import { Product } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import LoadingState from "@/components/ui/LoadingState";

export default function ProductDetailsPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setErrorMsg("");

      try {
        const res = await fetch(`${API_URL}/api/products/${params.slug}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Product not found");
        }

        setProduct(data.product);
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

    fetchProduct();
  }, [params.slug]);

  if (loading) {
    return <LoadingState message="Loading product..." />;
  }

  if (errorMsg || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-rust">
          {errorMsg || "Product not found"}
        </p>

        <Link
          href="/products"
          className="text-sm font-medium text-rust hover:underline"
        >
          Back to products
        </Link>
      </div>
    );
  }

  const onSale =
    product.discountPrice !== null &&
    product.discountPrice < product.price;

  const currentPrice = onSale
    ? product.discountPrice
    : product.price;

  const savings = onSale
    ? Math.round(
        ((product.price - product.discountPrice!) / product.price) * 100
      )
    : 0;

  const mainImage = product.images[activeImageIndex]?.url;
  const inWishlist = isInWishlist(product._id);

  function increaseQty() {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  }

  function decreaseQty() {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  }

  async function handleAddToCart() {
    if (!user) {
      router.push(`/login?redirect=/products/${params.slug}`);
      return;
    }

    setAddingToCart(true);
    setCartMessage("");

    try {
      await addToCart(product._id, quantity);
      setCartMessage("Added to cart!");
    } catch (err) {
      setCartMessage(
        err instanceof Error
          ? err.message
          : "Could not add to cart"
      );
    } finally {
      setAddingToCart(false);
    }
  }

  async function handleToggleWishlist() {
    if (!user) {
      router.push(`/login?redirect=/products/${params.slug}`);
      return;
    }

    await toggleWishlist(product._id);
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-16">

      {/* Breadcrumb */}
      <div className="mb-10 text-sm text-ink/50">
        <Link href="/products" className="hover:text-rust">
          Products
        </Link>

        <span className="mx-2">/</span>

        <Link
          href={`/categories/${product.category.slug}`}
          className="hover:text-rust"
        >
          {product.category.name}
        </Link>

        <span className="mx-2">/</span>

        <span className="text-ink/70">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">

        {/* ================= IMAGE GALLERY ================= */}
        <section>
          <div className="relative aspect-[4/3] w-full max-h-[480px] overflow-hidden rounded-2xl bg-[#f7f5f0]">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-ink/30">
                No image available
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.map((img, index) => (
                <button
                  key={img.publicId}
                  onClick={() => setActiveImageIndex(index)}
                  className={`
                    relative aspect-square overflow-hidden rounded-xl border
                    transition
                    ${
                      index === activeImageIndex
                        ? "border-rust ring-1 ring-rust"
                        : "border-brass/20 hover:border-rust/50"
                    }
                  `}
                >
                  <Image
                    src={img.url}
                    alt={`${product.name} image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ================= PRODUCT INFORMATION ================= */}
        <section className="flex flex-col">

          {/* Category */}
          <Link
            href={`/categories/${product.category.slug}`}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-rust hover:underline"
          >
            {product.category.name}
          </Link>

          {/* Product name */}
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold italic leading-tight text-ink md:text-5xl">
            {product.name}
          </h1>

          {/* Brand */}
          {product.brand && (
            <p className="mt-2 text-sm text-ink/50">
              by {product.brand}
            </p>
          )}

          {/* Rating */}
          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm">
              <span className="text-lg">★</span>
              <span className="font-semibold">4.8</span>
            </div>

            <span className="text-ink/30">|</span>

            <span className="text-sm text-ink/60">
              47 reviews
            </span>
          </div>

          {/* Price */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-semibold text-rust">
              ${currentPrice}
            </span>

            {onSale && (
              <>
                <span className="text-lg text-ink/40 line-through">
                  ${product.price}
                </span>

                <span className="rounded-full bg-rust/10 px-3 py-1 text-xs font-semibold text-rust">
                  Save {savings}%
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="mt-5">
            {product.stock > 0 ? (
              <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                In Stock and ready to ship
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium text-rust">
                <span className="h-2 w-2 rounded-full bg-rust" />
                Out of stock
              </div>
            )}
          </div>

          {/* Description */}
          <p className="mt-7 max-w-xl text-[15px] leading-7 text-ink/70">
            {product.description}
          </p>

          {/* Product details */}
          <div className="mt-8 border-t border-brass/20">

            {/* Material */}
            {"material" in product && product.material && (
              <div className="flex items-center justify-between border-b border-brass/20 py-4">
                <span className="text-sm text-ink/50">
                  Material
                </span>

                <span className="text-sm font-semibold text-ink">
                  {product.material}
                </span>
              </div>
            )}

            {/* Fit */}
            {"fit" in product && product.fit && (
              <div className="flex items-center justify-between border-b border-brass/20 py-4">
                <span className="text-sm text-ink/50">
                  Fit
                </span>

                <span className="text-sm font-semibold text-ink">
                  {product.fit}
                </span>
              </div>
            )}

            {/* Sizes */}
            {"sizes" in product && product.sizes && (
              <div className="flex items-center justify-between border-b border-brass/20 py-4">
                <span className="text-sm text-ink/50">
                  Sizes
                </span>

                <span className="text-sm font-semibold text-ink">
                  {Array.isArray(product.sizes)
                    ? product.sizes.join(" – ")
                    : product.sizes}
                </span>
              </div>
            )}

            {/* Care */}
            {"care" in product && product.care && (
              <div className="flex items-center justify-between border-b border-brass/20 py-4">
                <span className="text-sm text-ink/50">
                  Care
                </span>

                <span className="text-sm font-semibold text-ink">
                  {product.care}
                </span>
              </div>
            )}
          </div>

          {/* Quantity + Cart */}
          <div className="mt-8 flex gap-3">

            <div className="flex items-center rounded-full border border-brass/30">
              <button
                onClick={decreaseQty}
                disabled={quantity <= 1}
                className="px-4 py-3 text-lg text-ink/60 hover:text-rust disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                −
              </button>

              <span className="w-8 text-center text-sm font-medium">
                {quantity}
              </span>

              <button
                onClick={increaseQty}
                disabled={quantity >= product.stock}
                className="px-4 py-3 text-lg text-ink/60 hover:text-rust disabled:opacity-30"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
              className="flex-1 rounded-full bg-rust px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-rust-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              {addingToCart ? "Adding..." : "Add to Cart"}
            </button>
          </div>

          {/* Cart message */}
          {cartMessage && (
            <p className="mt-3 text-sm text-green-700">
              {cartMessage}
            </p>
          )}

          {/* Wishlist */}
          <button
            onClick={handleToggleWishlist}
            className={`
              mt-3 w-full rounded-full border px-6 py-3 text-sm font-semibold transition
              ${
                inWishlist
                  ? "border-rust bg-rust text-white"
                  : "border-rust text-rust hover:bg-rust hover:text-white"
              }
            `}
          >
            {inWishlist
              ? "♥ In Wishlist"
              : "♡ Add to Wishlist"}
          </button>

        </section>
      </div>
    </main>
  );
}