"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, FolderOpen, Users, ShoppingBag, DollarSign } from "lucide-react";
import { API_URL } from "@/lib/api";

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/stats`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null));
  }, []);

  const cards = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users },
    { label: "Total Products", value: stats?.totalProducts, icon: Package },
    { label: "Total Orders", value: stats?.totalOrders, icon: ShoppingBag },
    { label: "Total Revenue", value: stats ? `$${stats.totalRevenue.toFixed(2)}` : undefined, icon: DollarSign },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-brass/30 bg-white p-6">
            <c.icon size={20} className="text-rust" />
            <p className="mt-3 text-2xl font-semibold text-ink">{c.value ?? "—"}</p>
            <p className="text-sm text-ink/60">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/admin/products" className="rounded-2xl border border-brass/30 bg-white p-6 transition-colors hover:border-rust">
          <Package size={20} className="text-rust" />
          <p className="mt-3 font-medium text-ink">Manage Products</p>
          <p className="text-sm text-ink/60">Add, edit or remove products</p>
        </Link>
        <Link href="/admin/categories" className="rounded-2xl border border-brass/30 bg-white p-6 transition-colors hover:border-rust">
          <FolderOpen size={20} className="text-rust" />
          <p className="mt-3 font-medium text-ink">Manage Categories</p>
          <p className="text-sm text-ink/60">Add, edit or remove categories</p>
        </Link>
      </div>
    </div>
  );
}