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
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-ink/60">Loading product...</p>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-rust">{errorMsg || "Product not found"}</p>
        <Link href="/products" className="text-sm font-medium text-rust hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  const onSale =
    product.discountPrice !== null && product.discountPrice < product.price;
  const mainImage = product.images[activeImageIndex]?.url;
  const inWishlist = isInWishlist(product._id);

  function increaseQty() {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  }

  function decreaseQty() {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  }

  async function handleAddToCart() {
    // if not logged in, send them to login first
    if (!user) {
      router.push("/login?redirect=/products/" + params.slug);
      return;
    }

    if (!product) return;

    setAddingToCart(true);
    setCartMessage("");

    try {
      await addToCart(product._id, quantity);
      setCartMessage("Added to cart!");
    } catch (err) {
      setCartMessage(err instanceof Error ? err.message : "Could not add to cart");
    } finally {
      setAddingToCart(false);
    }
  }

  async function handleToggleWishlist() {
    if (!user) {
      router.push("/login?redirect=/products/" + params.slug);
      return;
    }

    if (!product) return;

    await toggleWishlist(product._id);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* left side - images */}
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-brass/20 bg-white">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-ink/30">
                No image
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((img, index) => (
                <button
                  key={img.publicId}
                  onClick={() => setActiveImageIndex(index)}
                  className={
                    "relative h-20 w-20 overflow-hidden rounded-xl border " +
                    (index === activeImageIndex ? "border-rust" : "border-brass/20")
                  }
                >
                  <Image src={img.url} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Link
            href={`/categories/${product.category.slug}`}
            className="text-xs font-semibold uppercase tracking-[0.15em] text-rust hover:underline"
          >
            {product.category.name}
          </Link>

          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold italic text-ink">
            {product.name}
          </h1>

          {product.brand && (
            <p className="mt-1 text-sm text-ink/60">by {product.brand}</p>
          )}

          <div className="mt-4 flex items-center gap-3">
            {onSale ? (
              <>
                <span className="text-2xl font-semibold text-rust">
                  ${product.discountPrice}
                </span>
                <span className="text-lg text-ink/40 line-through">
                  ${product.price}
                </span>
              </>
            ) : (
              <span className="text-2xl font-semibold text-ink">
                ${product.price}
              </span>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-ink/70">{product.description}</p>

          <div className="mt-6">
            {product.stock > 0 ? (
              <p className="text-sm font-medium text-green-700">
                In stock ({product.stock} available)
              </p>
            ) : (
              <p className="text-sm font-medium text-rust">Out of stock</p>
            )}
          </div>

          
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-brass/30">
              <button
                onClick={decreaseQty}
                className="px-4 py-2 text-ink/70 hover:text-rust"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={increaseQty}
                className="px-4 py-2 text-ink/70 hover:text-rust"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
              className="flex-1 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-rust disabled:cursor-not-allowed disabled:opacity-40"
            >
              {addingToCart ? "Adding..." : "Add to Cart"}
            </button>
          </div>

          {cartMessage && (
            <p className="mt-2 text-sm text-ink/70">{cartMessage}</p>
          )}

          <button
            onClick={handleToggleWishlist}
            className={
              "mt-3 w-full rounded-full border px-6 py-3 text-sm font-semibold transition-colors " +
              (inWishlist
                ? "border-rust bg-rust text-white"
                : "border-rust text-rust hover:bg-rust hover:text-white")
            }
          >
            {inWishlist ? "In Wishlist" : "Add to Wishlist"}
          </button>
        </div>
      </div>
    </div>
  );
}