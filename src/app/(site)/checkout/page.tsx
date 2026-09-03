"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

interface ShippingForm {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { items, loading: cartLoading, subtotal, refreshCart } = useCart();

  const [form, setForm] = useState<ShippingForm>({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });
  const [placing, setPlacing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/checkout");
    }
  }, [authLoading, user, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setPlacing(true);

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ shippingAddress: form }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not place order");
      }

      await refreshCart();

      const orderId = data.order._id;

      const checkoutRes = await fetch(`${API_URL}/api/payments/checkout/${orderId}`, {
        method: "POST",
        credentials: "include",
      });
      const checkoutData = await checkoutRes.json();

      if (!checkoutRes.ok || !checkoutData.url) {
        throw new Error(checkoutData.message || "Could not start payment");
      }

      window.location.href = checkoutData.url;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPlacing(false);
    }
  }

  if (authLoading || cartLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-ink/60">Loading checkout...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-ink/60">Your cart is empty, nothing to check out.</p>
        <Link href="/products" className="text-sm font-medium text-rust hover:underline">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-4xl italic text-ink">
        Checkout
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* shipping form */}
        <form onSubmit={handlePlaceOrder} className="space-y-4 lg:col-span-2">
          {errorMsg && (
            <div className="rounded-xl border border-rust/30 bg-rust/10 px-4 py-3 text-sm text-rust-dark">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Full name</label>
            <input
              type="text"
              name="fullName"
              required
              value={form.fullName}
              onChange={handleChange}
              className="w-full rounded-xl border border-brass/30 px-4 py-3 text-sm focus:border-rust focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Address</label>
            <input
              type="text"
              name="address"
              required
              value={form.address}
              onChange={handleChange}
              className="w-full rounded-xl border border-brass/30 px-4 py-3 text-sm focus:border-rust focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">City</label>
              <input
                type="text"
                name="city"
                required
                value={form.city}
                onChange={handleChange}
                className="w-full rounded-xl border border-brass/30 px-4 py-3 text-sm focus:border-rust focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Postal code</label>
              <input
                type="text"
                name="postalCode"
                required
                value={form.postalCode}
                onChange={handleChange}
                className="w-full rounded-xl border border-brass/30 px-4 py-3 text-sm focus:border-rust focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Country</label>
              <input
                type="text"
                name="country"
                required
                value={form.country}
                onChange={handleChange}
                className="w-full rounded-xl border border-brass/30 px-4 py-3 text-sm focus:border-rust focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Phone</label>
              <input
                type="text"
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-brass/30 px-4 py-3 text-sm focus:border-rust focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={placing}
            className="w-full rounded-full bg-rust px-6 py-3.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:opacity-60"
          >
            {placing ? "Redirecting to payment..." : "Place Order & Pay"}
          </button>

          <p className="text-center text-xs text-ink/40">
            You&apos;ll be redirected to Stripe to enter your card details securely.
          </p>
        </form>

        {/* order summary */}
        <div className="h-fit rounded-2xl border border-brass/20 bg-white p-6">
          <h2 className="font-medium text-ink">Order Summary</h2>

          <div className="mt-4 space-y-2">
            {items.map((item) => {
              const price =
                item.product.discountPrice !== null &&
                item.product.discountPrice < item.product.price
                  ? item.product.discountPrice
                  : item.product.price;

              return (
                <div key={item.product._id} className="flex justify-between text-sm text-ink/70">
                  <span>
                    {item.product.name} x{item.quantity}
                  </span>
                  <span>${(price * item.quantity).toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-between border-t border-brass/20 pt-4 text-sm font-semibold text-ink">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}