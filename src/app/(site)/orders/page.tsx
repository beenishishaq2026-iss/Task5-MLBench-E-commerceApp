"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PackageX, ChevronRight } from "lucide-react";
import { API_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import LoadingState from "@/components/ui/LoadingState";

interface OrderListItem {
  _id: string;
  items: { name: string; quantity: number }[];
  totalPrice: number;
  status: string;
  isPaid: boolean;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  pending: "bg-brass/15 text-brass",
  paid: "bg-emerald-100 text-emerald-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rust/10 text-rust",
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [payErrorId, setPayErrorId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/orders");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch(`${API_URL}/api/orders/mine`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Could not load your orders");
        }

        setOrders(data.orders || []);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchOrders();
    }
  }, [user]);

  async function handlePayNow(e: React.MouseEvent, orderId: string) {
    e.preventDefault();
    e.stopPropagation();

    setPayErrorId(null);
    setPayingOrderId(orderId);

    try {
      const res = await fetch(`${API_URL}/api/payments/checkout/${orderId}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.message || "Could not start payment");
      }

      window.location.href = data.url;
    } catch (err) {
      setPayErrorId(orderId);
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setPayingOrderId(null);
    }
  }

  if (authLoading || loading) {
    return <LoadingState message="Loading your orders..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
        Your Account
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl italic text-ink sm:text-4xl">
        My Orders
      </h1>
      <p className="mt-2 max-w-md text-sm text-ink/60">
        Track and review everything you&apos;ve ordered from us.
      </p>

      {errorMsg && (
        <div className="mt-8 rounded-2xl border border-rust/20 bg-white p-6 text-center text-sm text-rust">
          {errorMsg}
        </div>
      )}

      {!errorMsg && orders.length === 0 && (
        <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-3xl border border-brass/20 bg-white px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brass/10">
            <PackageX size={24} className="text-brass" />
          </div>
          <p className="font-[family-name:var(--font-display)] text-2xl italic text-ink">
            No orders yet
          </p>
          <p className="max-w-xs text-sm text-ink/50">
            Once you place an order, it will show up here so you can track it any time.
          </p>
          <Link
            href="/products"
            className="mt-1 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-rust"
          >
            Browse products
          </Link>
        </div>
      )}

      {!errorMsg && orders.length > 0 && (
        <div className="mt-8 space-y-4">
          {orders.map((order) => {
            const itemSummary = order.items
              .slice(0, 2)
              .map((i) => i.name)
              .join(", ");
            const extraCount = order.items.length - 2;
            const statusClass =
              statusStyles[order.status] || "bg-ink/5 text-ink/60";
            const canPay = order.status === "pending" && !order.isPaid;
            const isPaying = payingOrderId === order._id;

            return (
              <Link
                key={order._id}
                href={`/orders/${order._id}`}
                className="flex flex-col gap-4 rounded-2xl border border-brass/20 bg-white p-5 transition-colors hover:border-rust/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-ink">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusClass}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-ink/60">
                    {itemSummary}
                    {extraCount > 0 ? ` + ${extraCount} more` : ""}
                  </p>
                  <p className="mt-1 text-xs text-ink/40">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  {payErrorId === order._id && (
                    <p className="mt-1 text-xs text-rust">
                      Could not start payment. Try again.
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-brass/10 pt-3 sm:justify-end sm:border-t-0 sm:pt-0">
                  <p className="font-semibold text-ink">
                    ${order.totalPrice.toFixed(2)}
                  </p>
                  {canPay && (
                    <button
                      onClick={(e) => handlePayNow(e, order._id)}
                      disabled={isPaying}
                      className="shrink-0 rounded-full bg-rust px-4 py-2 text-xs font-semibold text-white hover:bg-rust-dark disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPaying ? "Redirecting..." : "Pay Now"}
                    </button>
                  )}
                  <ChevronRight size={18} className="text-ink/30" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}