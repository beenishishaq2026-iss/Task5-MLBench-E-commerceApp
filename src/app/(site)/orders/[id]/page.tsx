"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { API_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import LoadingState from "@/components/ui/LoadingState";

interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  itemsPrice: number;
  totalPrice: number;
  status: string;
  isPaid: boolean;
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const paymentParam = searchParams.get("payment");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [retrying, setRetrying] = useState(false);

  async function handleRetryPayment() {
    setRetrying(true);
    try {
      const res = await fetch(`${API_URL}/api/payments/checkout/${params.id}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.message || "Could not start payment");
      }
      window.location.href = data.url;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setRetrying(false);
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`${API_URL}/api/orders/${params.id}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Order not found");
        }

        setOrder(data.order);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchOrder();
    }
  }, [params.id, user]);

  if (authLoading || loading) {
    return <LoadingState message="Loading order..." />;
  }

  if (errorMsg || !order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-rust">{errorMsg || "Order not found"}</p>
        <Link href="/products" className="text-sm font-medium text-rust hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (paymentParam === "success" && order.isPaid) {
    return (
      <div className="mx-auto flex min-h-[75vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
        <div className="w-full animate-fade-up rounded-2xl border border-brass/20 bg-white p-10 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rust/10">
            <CheckCircle2 className="h-9 w-9 text-rust" strokeWidth={1.75} />
          </div>

          <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl italic text-ink">
            Payment Successful!
          </h1>

          <p className="mt-3 text-sm text-ink/60">
            Thank you, {order.shippingAddress.fullName.split(" ")[0]}. Your payment has been
            verified and your order has been confirmed.
          </p>
          <p className="mt-1 text-xs text-ink/40">
            We&apos;ll process your order and keep you updated.
          </p>

          <div className="divider-signature mt-6">
            <span className="dot" />
          </div>

          <div className="mt-6 flex justify-between text-sm text-ink/70">
            <span>Order total</span>
            <span className="font-semibold text-ink">${order.totalPrice.toFixed(2)}</span>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="flex-1 rounded-full bg-rust px-6 py-3 text-sm font-semibold text-white hover:bg-rust-dark"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="flex-1 rounded-full border border-brass/30 px-6 py-3 text-sm font-semibold text-ink hover:bg-cream"
            >
              Back to Home
            </Link>
          </div>

          <a
            href={`${API_URL}/api/orders/${order._id}/invoice`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-rust hover:underline"
          >
            Download invoice (PDF)
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
        Order Confirmed
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl italic text-ink">
        Thank you, {order.shippingAddress.fullName.split(" ")[0]}!
      </h1>
      <p className="mt-2 text-ink/60">
        Your order has been placed and is currently{" "}
        <span className="font-medium capitalize text-ink">{order.status}</span>.
      </p>

      {paymentParam === "success" && !order.isPaid && (
        <div className="mt-6 rounded-xl border border-brass/30 bg-brass/10 px-4 py-3 text-sm text-ink/70">
          Payment is confirming - this can take a few seconds to reflect here. Refresh shortly if it doesn&apos;t update.
        </div>
      )}

      {paymentParam === "pending" && !order.isPaid && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-brass/40 bg-brass/10 px-4 py-3 text-sm text-ink sm:flex-row sm:items-center sm:justify-between">
          <span>Payment pending. You left checkout before completing payment — your order is saved and waiting.</span>
          <button
            onClick={handleRetryPayment}
            disabled={retrying}
            className="shrink-0 rounded-full bg-rust px-4 py-2 text-xs font-semibold text-white hover:bg-rust-dark disabled:opacity-60"
          >
            {retrying ? "Redirecting..." : "Complete payment"}
          </button>
        </div>
      )}

      {errorMsg && paymentParam === "pending" && (
        <p className="mt-2 text-xs text-rust">{errorMsg}</p>
      )}

      <div className="mt-8 rounded-2xl border border-brass/20 bg-white p-6">
        <h2 className="font-medium text-ink">Items</h2>
        <div className="mt-3 space-y-2">
          {order.items.map((item) => (
            <div key={item.product} className="flex justify-between text-sm text-ink/70">
              <span>
                {item.name} x{item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between border-t border-brass/20 pt-4 text-sm font-semibold text-ink">
          <span>Total</span>
          <span>${order.totalPrice.toFixed(2)}</span>
        </div>

        {order.isPaid && (
          <a
            href={`${API_URL}/api/orders/${order._id}/invoice`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-rust hover:underline"
          >
            Download invoice (PDF)
          </a>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-brass/20 bg-white p-6">
        <h2 className="font-medium text-ink">Shipping to</h2>
        <p className="mt-2 text-sm text-ink/70">
          {order.shippingAddress.fullName}
          <br />
          {order.shippingAddress.address}, {order.shippingAddress.city}
          <br />
          {order.shippingAddress.postalCode}, {order.shippingAddress.country}
          <br />
          {order.shippingAddress.phone}
        </p>
      </div>

      <Link
        href="/products"
        className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-rust"
      >
        Continue Shopping
      </Link>
    </div>
  );
}