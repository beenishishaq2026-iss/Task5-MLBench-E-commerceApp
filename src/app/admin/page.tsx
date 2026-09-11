"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import { API_URL } from "@/lib/api";
import { Spinner } from "@/components/ui/LoadingState";
import RevenueChart, { RevenuePoint } from "@/components/admin/charts/RevenueChart";
import OrderStatusDonut, { OrderStatusCounts } from "@/components/admin/charts/OrderStatusDonut";

interface RecentOrder {
  _id: string;
  items: { name: string; quantity: number }[];
  totalPrice: number;
  status: string;
  isPaid: boolean;
  createdAt: string;
  user?: { name: string; email: string } | null;
}

interface TopProduct {
  _id: string;
  name: string;
  image?: string;
  sold: number;
  revenue: number;
}

interface CategorySales {
  _id: string;
  revenue: number;
}

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  revenueByDay: RevenuePoint[];
  orderStatusCounts: OrderStatusCounts;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  salesByCategory: CategorySales[];
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  paid: "bg-blue-50 text-blue-700",
  shipped: "bg-orange/10 text-orange-dark",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchStats() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/stats`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load dashboard stats");
      setStats(data);
    } catch (err) {
      setStats(null);
      setError(err instanceof Error ? err.message : "Failed to load dashboard. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // FIX (react-hooks/set-state-in-effect): fetching data on mount is
    // legitimate effect usage; the rule is just being strict about the
    // synchronous setLoading(true) inside fetchStats. Scoped disable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, []);

  const cards = stats
    ? [
        {
          label: "Total Revenue",
          value: `$${stats.totalRevenue.toFixed(2)}`,
          icon: DollarSign,
          accent: true,
        },
        { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag },
        { label: "Total Products", value: stats.totalProducts, icon: Package },
        { label: "Total Users", value: stats.totalUsers, icon: Users },
      ]
    : [];

  return (
    <div>
      <div>
        <h2 className="text-xl font-semibold text-ink">Dashboard</h2>
        <p className="text-sm text-ink/50">Overview of your store&apos;s performance</p>
      </div>

      {error && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <span>⚠️ {error}</span>
          <button
            onClick={fetchStats}
            className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3">
          <Spinner className="h-9 w-9" />
          <p className="text-sm text-ink/50">Loading dashboard…</p>
        </div>
      ) : (
        stats && (
          <>
            {/* KPI cards */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {cards.map((c) => (
                <div
                  key={c.label}
                  className="relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-brass/30 bg-white p-3.5 shadow-[0_1px_3px_rgba(43,36,32,0.06)] sm:p-5"
                >
                  <span
                    className={`absolute inset-y-0 left-0 w-1 ${c.accent ? "bg-orange" : "bg-rust"}`}
                  />
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-wide text-ink/50 sm:text-[11px]">
                      {c.label}
                    </span>
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 ${
                        c.accent ? "bg-orange/10" : "bg-rust/10"
                      }`}
                    >
                      <c.icon size={15} className={c.accent ? "text-orange-dark" : "text-rust"} />
                    </div>
                  </div>
                  <p className="mt-3 truncate font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-ink sm:text-2xl lg:text-3xl">
                    {c.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Revenue chart + order status */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-brass/30 bg-white p-4 shadow-[0_1px_3px_rgba(43,36,32,0.06)] sm:p-5 lg:col-span-2">
                <h3 className="font-[family-name:var(--font-display)] text-lg italic text-ink">
                  Revenue, last 7 days
                </h3>
                {stats.revenueByDay.every((d) => d.total === 0) ? (
                  <div className="flex min-h-[180px] items-center justify-center text-sm text-ink/40">
                    No paid orders in the last 7 days yet.
                  </div>
                ) : (
                  <div className="mt-4">
                    <RevenueChart data={stats.revenueByDay} />
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-brass/30 bg-white p-4 shadow-[0_1px_3px_rgba(43,36,32,0.06)] sm:p-5">
                <h3 className="font-[family-name:var(--font-display)] text-lg italic text-ink">
                  Order Status
                </h3>
                <div className="mt-4">
                  <OrderStatusDonut counts={stats.orderStatusCounts} />
                </div>
              </div>
            </div>

            {/* Recent orders */}
            <div className="mt-6 rounded-2xl border border-brass/30 bg-white p-4 shadow-[0_1px_3px_rgba(43,36,32,0.06)] sm:p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-[family-name:var(--font-display)] text-lg italic text-ink">
                  Recent Orders
                </h3>
                <Link
                  href="/admin/orders"
                  className="flex items-center gap-1 text-xs font-medium text-rust hover:underline"
                >
                  View all <ArrowUpRight size={13} />
                </Link>
              </div>

              {stats.recentOrders.length === 0 ? (
                <p className="mt-6 py-8 text-center text-sm text-ink/45">No orders yet.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-brass/15 text-[11px] uppercase tracking-wide text-ink/40">
                        <th className="py-2.5 pr-4 font-medium">Order</th>
                        <th className="py-2.5 pr-4 font-medium">Customer</th>
                        <th className="py-2.5 pr-4 font-medium">Items</th>
                        <th className="py-2.5 pr-4 font-medium">Status</th>
                        <th className="py-2.5 pr-4 font-medium text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((o) => (
                        <tr key={o._id} className="border-b border-brass/10 last:border-0">
                          <td className="py-3 pr-4 font-medium text-ink">
                            <Link href={`/admin/orders`} className="hover:text-rust">
                              #{o._id.slice(-6).toUpperCase()}
                            </Link>
                          </td>
                          <td className="py-3 pr-4 text-ink/70">{o.user?.name || "Guest"}</td>
                          <td className="py-3 pr-4 text-ink/60">
                            {o.items.length} item{o.items.length === 1 ? "" : "s"}
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                                STATUS_STYLES[o.status] || "bg-ink/5 text-ink/60"
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-right font-medium text-ink">
                            ${o.totalPrice.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Top products + Sales by category */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-brass/30 bg-white p-4 shadow-[0_1px_3px_rgba(43,36,32,0.06)] sm:p-5">
                <h3 className="font-[family-name:var(--font-display)] text-lg italic text-ink">
                  Top Selling Products
                </h3>
                {stats.topProducts.length === 0 ? (
                  <p className="mt-6 py-8 text-center text-sm text-ink/45">
                    No sales yet — this will fill in once orders come through.
                  </p>
                ) : (
                  <ul className="mt-4 divide-y divide-brass/10">
                    {stats.topProducts.map((p) => (
                      <li key={p._id} className="flex items-center gap-3 py-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-cream">
                          {p.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-ink/20">
                              <Package size={16} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                          <p className="text-xs text-ink/45">{p.sold} sold</p>
                        </div>
                        <p className="shrink-0 text-sm font-medium text-ink">
                          ${p.revenue.toFixed(2)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-brass/30 bg-white p-4 shadow-[0_1px_3px_rgba(43,36,32,0.06)] sm:p-5">
                <h3 className="font-[family-name:var(--font-display)] text-lg italic text-ink">
                  Sales by Category
                </h3>
                {stats.salesByCategory.length === 0 ? (
                  <p className="mt-6 py-8 text-center text-sm text-ink/45">
                    No sales yet — this will fill in once orders come through.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {stats.salesByCategory.map((c, i) => {
                      const max = stats.salesByCategory[0]?.revenue || 1;
                      const pct = Math.max(4, Math.round((c.revenue / max) * 100));
                      return (
                        <li key={c._id}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-ink/70">
                              <span className="text-xs font-semibold text-ink/35">#{i + 1}</span>
                              {c._id}
                            </span>
                            <span className="font-medium text-ink">${c.revenue.toFixed(2)}</span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-cream">
                            <div
                              className="h-full rounded-full bg-rust"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}