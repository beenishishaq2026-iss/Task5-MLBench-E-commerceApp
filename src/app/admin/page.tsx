"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  FolderOpen,
  Users,
  ShoppingBag,
  DollarSign,
  ClipboardList,
  ChevronRight,
} from "lucide-react";
import { API_URL } from "@/lib/api";
import { Spinner } from "@/components/ui/LoadingState";

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

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
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, hint: "Registered customers" },
    { label: "Total Products", value: stats?.totalProducts, icon: Package, hint: "Live catalog items" },
    { label: "Total Orders", value: stats?.totalOrders, icon: ShoppingBag, hint: "All-time orders" },
    {
      label: "Total Revenue",
      value: stats ? `$${stats.totalRevenue.toFixed(2)}` : undefined,
      icon: DollarSign,
      hint: "All-time revenue",
      accent: "orange",
    },
  ];

  const actions = [
    { href: "/admin/products", label: "Manage Products", desc: "Add, edit or remove products", icon: Package },
    { href: "/admin/categories", label: "Manage Categories", desc: "Add, edit or remove categories", icon: FolderOpen },
    { href: "/admin/orders", label: "Manage Orders", desc: "View and update order status", icon: ClipboardList },
  ];

  return (
    <div>
      {/* Error state */}
      {error && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <span>⚠️ {error}</span>
          <button
            onClick={fetchStats}
            className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3">
          <Spinner className="h-9 w-9" />
          <p className="text-sm text-ink/50">Loading dashboard…</p>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => (
              <div
                key={c.label}
                className="relative flex flex-col overflow-hidden rounded-2xl border border-brass/20 bg-white p-5"
              >
                <span
                  className={`absolute inset-y-0 left-0 w-1 ${
                    c.accent === "orange" ? "bg-orange" : "bg-rust"
                  }`}
                />
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/50">
                    {c.label}
                  </span>
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      c.accent === "orange" ? "bg-orange/10" : "bg-rust/10"
                    }`}
                  >
                    <c.icon size={16} className={c.accent === "orange" ? "text-orange-dark" : "text-rust"} />
                  </div>
                </div>
                <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-ink">
                  {c.value ?? "—"}
                </p>
                <hr className="my-3 border-brass/15" />
                <span className="text-[11px] text-ink/40">{c.hint}</span>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="mt-10">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-lg italic text-ink">
                Quick Actions
              </h2>
            </div>
            <div className="overflow-hidden rounded-2xl border border-brass/20 bg-white">
              {actions.map((a, i) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className={`flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-cream/60 ${
                    i !== actions.length - 1 ? "border-b border-brass/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rust/10">
                      <a.icon size={16} className="text-rust" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{a.label}</p>
                      <p className="text-xs text-ink/50">{a.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-ink/30" />
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}