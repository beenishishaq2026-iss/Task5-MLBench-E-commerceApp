"use client";

import { useEffect, useState, Fragment } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { API_URL } from "@/lib/api";
import { Order } from "@/types";

const STATUS_OPTIONS = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-ink/10 text-ink/60",
  paid: "bg-blue-100 text-blue-700",
  shipped: "bg-brass/20 text-brass",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function loadOrders() {
    setLoading(true);
    try {
      const url = `${API_URL}/api/orders${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`;
      const res = await fetch(url, { credentials: "include" });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) throw new Error(data.message || `Failed to load orders (${res.status})`);
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update order");

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: data.order.status, isPaid: data.order.isPaid } : o))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUpdatingId(null);
    }
  }

  function toggleExpand(orderId: string) {
    setExpandedId((prev) => (prev === orderId ? null : orderId));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-ink">Orders</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-brass/30 px-3 py-2 text-sm focus:border-rust focus:outline-none"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-rust/30 bg-rust/10 px-4 py-3 text-sm text-rust-dark">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-brass/30 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-ink/60">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="p-6 text-sm text-ink/60">No orders yet.</p>
        ) : (
          <>
            {/* Mobile: stacked expandable cards */}
            <div className="divide-y divide-brass/10 sm:hidden">
              {orders.map((order) => {
                const customer = typeof order.user === "object" ? order.user : null;
                const isExpanded = expandedId === order._id;
                return (
                  <div key={order._id}>
                    <button
                      onClick={() => toggleExpand(order._id)}
                      className="flex w-full items-center justify-between gap-3 p-4 text-left"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-ink/70">#{order._id.slice(-8)}</p>
                        <p className="mt-1 truncate text-sm text-ink">{customer?.name || "—"}</p>
                        <p className="mt-0.5 text-xs text-ink/50">
                          {order.items.length} item(s) · ${order.totalPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                          {order.status}
                        </span>
                        {isExpanded ? <ChevronUp size={16} className="text-ink/50" /> : <ChevronDown size={16} className="text-ink/50" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="space-y-4 bg-cream/20 px-4 pb-4">
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Items</p>
                          <ul className="space-y-1">
                            {order.items.map((item, i) => (
                              <li key={i} className="flex justify-between text-sm text-ink/70">
                                <span className="truncate pr-2">{item.name} × {item.quantity}</span>
                                <span className="shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Shipping Address</p>
                          <p className="text-sm text-ink/70">
                            {order.shippingAddress.fullName}
                            <br />
                            {order.shippingAddress.address}
                            <br />
                            {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                            <br />
                            {order.shippingAddress.country}
                            <br />
                            {order.shippingAddress.phone}
                          </p>
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Update Status</p>
                          <select
                            value={order.status}
                            disabled={updatingId === order._id}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="w-full rounded-lg border border-brass/30 px-3 py-2 text-sm focus:border-rust focus:outline-none disabled:opacity-60"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s} disabled={s === "pending" && order.isPaid}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <p className="text-xs text-ink/40">
                          Placed {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop/tablet: table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="border-b border-brass/30 bg-cream/50 text-left text-ink/60">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const customer = typeof order.user === "object" ? order.user : null;
                    const isExpanded = expandedId === order._id;
                    return (
                      <Fragment key={order._id}>
                        <tr
                          onClick={() => setExpandedId(isExpanded ? null : order._id)}
                          className="cursor-pointer border-b border-brass/10 last:border-0 hover:bg-cream/40"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-ink/70">
                            #{order._id.slice(-8)}
                          </td>
                          <td className="px-4 py-3 text-ink">
                            {customer?.name || "—"}
                            <div className="text-xs text-ink/50">{customer?.email}</div>
                          </td>
                          <td className="px-4 py-3 text-ink/70">{order.items.length} item(s)</td>
                          <td className="px-4 py-3 font-medium text-ink">${order.totalPrice.toFixed(2)}</td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={order.status}
                              disabled={updatingId === order._id}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              className={`rounded-full border-0 px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rust/30 ${STATUS_COLORS[order.status]}`}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s} disabled={s === "pending" && order.isPaid}>
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-ink/60">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="border-b border-brass/10 bg-cream/20">
                            <td colSpan={6} className="px-4 py-4">
                              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
                                    Items
                                  </p>
                                  <ul className="space-y-1">
                                    {order.items.map((item, i) => (
                                      <li key={i} className="flex justify-between text-sm text-ink/70">
                                        <span>
                                          {item.name} × {item.quantity}
                                        </span>
                                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
                                    Shipping Address
                                  </p>
                                  <p className="text-sm text-ink/70">
                                    {order.shippingAddress.fullName}
                                    <br />
                                    {order.shippingAddress.address}
                                    <br />
                                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                                    <br />
                                    {order.shippingAddress.country}
                                    <br />
                                    {order.shippingAddress.phone}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}