"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ShieldCheck, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
import { API_URL } from "@/lib/api";
import { Spinner } from "@/components/ui/LoadingState";

interface AdminUserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`${API_URL}/api/admin/users?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load users");

      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setUsers([]);
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    // FIX (react-hooks/set-state-in-effect): data fetching on mount / when
    // filters change is legitimate effect usage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, [loadUsers]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadUsers();
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink">Users</h2>
          <p className="text-sm text-ink/50">
            {loading ? "Loading…" : `${total} registered customer${total === 1 ? "" : "s"}`}
          </p>
        </div>
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email"
            className="w-full rounded-full border border-brass/30 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-rust"
          />
        </form>
      </div>

      {error && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <span>⚠️ {error}</span>
          <button
            onClick={loadUsers}
            className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3">
          <Spinner className="h-9 w-9" />
          <p className="text-sm text-ink/50">Loading users…</p>
        </div>
      ) : !error && users.length === 0 ? (
        <div className="mt-6 flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-brass/30 bg-white text-center">
          <p className="text-sm font-medium text-ink">No users found</p>
          <p className="text-sm text-ink/50">
            {search ? "Try a different search term." : "No customers have registered yet."}
          </p>
        </div>
      ) : (
        !error && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-brass/20 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-brass/15 text-[11px] uppercase tracking-wide text-ink/40">
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Orders</th>
                    <th className="px-5 py-3 font-medium">Total Spent</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-brass/10 last:border-0 hover:bg-cream/50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rust/10 text-xs font-semibold text-rust">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-ink">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-ink/70">{u.email}</td>
                      <td className="px-5 py-3.5">
                        {u.isVerified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            <ShieldCheck size={12} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                            <ShieldAlert size={12} /> Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-ink/70">{u.orderCount}</td>
                      <td className="px-5 py-3.5 text-ink/70">${u.totalSpent.toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-ink/50">
                        {new Date(u.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-brass/15 px-5 py-3">
                <p className="text-xs text-ink/45">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex items-center gap-1 rounded-lg border border-brass/30 px-3 py-1.5 text-xs font-medium text-ink/70 hover:bg-cream disabled:opacity-40"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="flex items-center gap-1 rounded-lg border border-brass/30 px-3 py-1.5 text-xs font-medium text-ink/70 hover:bg-cream disabled:opacity-40"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
