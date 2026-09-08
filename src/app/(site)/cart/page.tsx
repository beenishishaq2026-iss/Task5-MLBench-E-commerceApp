"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import LoadingState from "@/components/ui/LoadingState";

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { items, loading, updateQuantity, removeFromCart, subtotal } = useCart();
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/cart");
    }
  }, [authLoading, user, router]);

  async function handleQuantityChange(productId: string, quantity: number, stock: number) {
    if (quantity < 1) return;

    if (quantity > stock) {
      setItemErrors((prev) => ({
        ...prev,
        [productId]:
          stock > 0
            ? `Only ${stock} unit(s) available in stock.`
            : "No more products available in stock.",
      }));
      return;
    }

    setUpdatingId(productId);
    try {
      await updateQuantity(productId, quantity);
      setItemErrors((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    } catch (err) {
      setItemErrors((prev) => ({
        ...prev,
        [productId]: err instanceof Error ? err.message : "No more products available in stock.",
      }));
    } finally {
      setUpdatingId(null);
    }
  }

  if (authLoading || loading) {
    return <LoadingState message="Loading your cart..." />;
  }

  if (!user) {
    return null;
  }

  const hasStockIssue = items.some((item) => item.quantity > item.product.stock);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-ink/60">Your cart is empty.</p>
        <Link href="/products" className="text-sm font-medium text-rust hover:underline">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-4xl italic text-ink">
        Your Cart
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* cart items */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const price =
              item.product.discountPrice !== null &&
              item.product.discountPrice < item.product.price
                ? item.product.discountPrice
                : item.product.price;
            const image = item.product.images[0]?.url;
            const stock = item.product.stock;
            const atMaxStock = item.quantity >= stock;
            const isUpdating = updatingId === item.product._id;

            return (
              <div
                key={item.product._id}
                className="rounded-2xl border border-brass/20 bg-white p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
                    {image ? (
                      <Image src={image} alt={item.product.name} fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-ink/30">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="font-medium text-ink hover:text-rust"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-1 text-sm text-ink/60">${price} each</p>
                    {stock > 0 ? (
                      <p className="mt-0.5 text-xs text-ink/40">{stock} in stock</p>
                    ) : (
                      <p className="mt-0.5 text-xs font-medium text-rust">Out of stock</p>
                    )}
                  </div>

                  <div className="flex items-center rounded-full border border-brass/30">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.product._id, item.quantity - 1, stock)
                      }
                      disabled={item.quantity <= 1 || isUpdating}
                      className="px-3 py-1.5 text-ink/70 hover:text-rust disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.product._id, item.quantity + 1, stock)
                      }
                      disabled={atMaxStock || isUpdating}
                      title={atMaxStock ? "No more products available in stock" : undefined}
                      className="px-3 py-1.5 text-ink/70 hover:text-rust disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <p className="w-16 text-right font-medium text-ink">
                    ${(price * item.quantity).toFixed(2)}
                  </p>

                  <button
                    onClick={() => removeFromCart(item.product._id)}
                    className="text-sm text-rust hover:underline"
                  >
                    Remove
                  </button>
                </div>

                {itemErrors[item.product._id] && (
                  <p className="mt-2 text-right text-xs font-medium text-rust">
                    {itemErrors[item.product._id]}
                  </p>
                )}
              </div>
            );
          })}
        </div>


        <div className="h-fit rounded-2xl border border-brass/20 bg-white p-6">
          <h2 className="font-medium text-ink">Order Summary</h2>
          <div className="mt-4 flex justify-between text-sm text-ink/70">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <p className="mt-1 text-xs text-ink/40">
            Shipping and taxes calculated at checkout
          </p>

          {hasStockIssue && (
            <p className="mt-3 text-xs font-medium text-rust">
              Some items exceed available stock. Please adjust quantities before checking out.
            </p>
          )}

          {hasStockIssue ? (
            <button
              disabled
              className="mt-6 block w-full cursor-not-allowed rounded-full bg-ink/30 px-6 py-3 text-center text-sm font-semibold text-cream"
            >
              Proceed to Checkout
            </button>
          ) : (
            <Link
              href="/checkout"
              className="mt-6 block rounded-full bg-ink px-6 py-3 text-center text-sm font-semibold text-cream hover:bg-rust"
            >
              Proceed to Checkout
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}