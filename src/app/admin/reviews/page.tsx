"use client";

import { useCallback, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { API_URL } from "@/lib/api";
import { Review } from "@/types";
import { Spinner } from "@/components/ui/LoadingState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "true" | "false">("all");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url = `${API_URL}/api/reviews${filter !== "all" ? `?replied=${filter}` : ""}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load reviews");
      setReviews(data.reviews || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loadReviews sets loading/error state before its fetch; this is the standard fetch-on-mount/filter-change pattern
    loadReviews();
  }, [loadReviews]);

  async function handleReply(reviewId: string) {
    const text = replyDrafts[reviewId]?.trim();
    if (!text) return;
    setSubmittingId(reviewId);
    try {
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ adminReply: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to post reply");

      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, adminReply: data.review.adminReply } : r))
      );
      setReplyDrafts((prev) => ({ ...prev, [reviewId]: "" }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        icon={Star}
        title="Reviews"
        description="Moderate and respond to customer reviews"
      >
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | "true" | "false")}
          className="rounded-lg border border-brass/30 bg-white px-3 py-2.5 text-sm focus:border-rust focus:outline-none"
        >
          <option value="all">All reviews</option>
          <option value="false">Awaiting reply</option>
          <option value="true">Replied</option>
        </select>
      </AdminPageHeader>

      {loading && (
        <div className="mt-10 flex justify-center">
          <Spinner />
        </div>
      )}
      {error && <p className="mt-4 text-sm text-rust">{error}</p>}

      {!loading && !error && reviews.length === 0 && (
        <p className="mt-8 text-sm text-ink/50">No reviews found.</p>
      )}

      <div className="mt-6 space-y-5">
        {reviews.map((r) => {
          const reviewer = typeof r.user === "string" ? "User" : r.user.name;
          const productName = typeof r.product === "string" ? r.product : r.product.name;
          return (
            <div key={r._id} className="rounded-2xl border border-brass/20 bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className={i < r.rating ? "fill-brass text-brass" : "text-brass/30"}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-ink">{reviewer}</span>
                <span className="text-xs text-ink/40">on</span>
                <span className="text-sm font-medium text-rust">{productName}</span>
                {r.verifiedPurchase && (
                  <span className="rounded-full bg-rust/10 px-2 py-0.5 text-[11px] font-medium text-rust">
                    Verified purchase
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm leading-6 text-ink/70">{r.comment}</p>

              {r.adminReply ? (
                <div className="mt-3 rounded-xl bg-cream/60 border border-brass/20 p-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-rust">
                    Your reply
                  </span>
                  <p className="mt-1 text-sm leading-6 text-ink/70">{r.adminReply}</p>
                </div>
              ) : (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={replyDrafts[r._id] || ""}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [r._id]: e.target.value }))}
                    placeholder="Write a reply to this review..."
                    className="flex-1 rounded-xl border border-brass/20 px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-rust focus:outline-none"
                  />
                  <button
                    onClick={() => handleReply(r._id)}
                    disabled={submittingId === r._id || !replyDrafts[r._id]?.trim()}
                    className="rounded-xl bg-rust px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {submittingId === r._id ? "Sending..." : "Reply"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}