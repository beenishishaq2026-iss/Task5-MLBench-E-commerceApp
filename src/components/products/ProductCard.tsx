"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Check, Heart, Star, Truck } from "lucide-react";
import { Product } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const NEW_WINDOW_DAYS = 14;

export default function ProductCard({ product }: { product: Product }) {
  const mainImage = product.images[0]?.url;
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wishlisting, setWishlisting] = useState(false);

  const onSale =
    product.discountPrice !== null && product.discountPrice < product.price;
  const discountPercent = onSale
    ? Math.round(
        ((product.price - (product.discountPrice as number)) /
          product.price) *
          100
      )
    : 0;
  const savedAmount = onSale
    ? (product.price - (product.discountPrice as number)).toFixed(2)
    : "0";

  const isNew =
    !!product.createdAt &&
    Date.now() - new Date(product.createdAt).getTime() 
      NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  const wishlisted = isInWishlist(product._id);

  const requireAuth = (redirectPath: string) => {
    router.push(`/login?redirect=${redirectPath}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      requireAuth(`/products/${product.slug}`);
      return;
    }

    setAdding(true);
    try {
      await addToCart(product._id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      console.log("could not add to cart", err);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      requireAuth(`/products/${product.slug}`);
      return;
    }

    setWishlisting(true);
    try {
      await toggleWishlist(product._id);
    } catch (err) {
      console.log("could not update wishlist", err);
    } finally {
      setWishlisting(false);
    }
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brass/20 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-ink/30">
            No image
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {isNew && (
            <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-cream">
              New
            </span>
          )}
          {onSale && (
            <span className="rounded-full bg-rust px-3 py-1 text-xs font-semibold text-white">
              -{discountPercent}%
            </span>
          )}
          {!onSale && !isNew && product.isFeatured && (
            <span className="rounded-full bg-brass px-3 py-1 text-xs font-semibold text-white">
              Bestseller
            </span>
          )}
        </div>

        <button
          onClick={handleToggleWishlist}
          disabled={wishlisting}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-ink/70 shadow-sm transition-colors hover:text-rust disabled:opacity-60"
        >
          <Heart size={13} className={wishlisted ? "fill-rust text-rust" : ""} />
        </button>

        {product.stock === 0 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold text-cream">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-[11px] uppercase tracking-wide text-ink/50">
          {product.category?.name}
        </p>
        <h3 className="mt-0.5 truncate text-sm font-medium text-ink">{product.name}</h3>

        <div className="mt-1 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={11}
              className={
                i < Math.round(product.ratingsAverage)
                  ? "fill-brass text-brass"
                  : "text-brass/30"
              }
            />
          ))}
          <span className="ml-1 text-xs font-medium text-ink/60">
            {product.ratingsAverage.toFixed(1)}
          </span>
          <span className="text-xs text-ink/40">({product.numReviews})</span>
        </div>

        <div className="mt-1.5 flex items-center gap-2">
          {onSale ? (
            <>
              <span className="font-semibold text-rust">
                ${product.discountPrice}
              </span>
              <span className="text-sm text-ink/40 line-through">
                ${product.price}
              </span>
            </>
          ) : (
            <span className="font-semibold text-ink">${product.price}</span>
          )}
        </div>
        {onSale && (
          <p className="mt-0.5 text-xs font-medium text-rust">
            Save ${savedAmount}
          </p>
        )}

        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink/50">
          <Truck size={11} />
          Free Delivery
        </p>

        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-rust px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {added ? <Check size={14} /> : <ShoppingCart size={14} />}
          {product.stock === 0
            ? "Out of stock"
            : added
            ? "Added"
            : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
}