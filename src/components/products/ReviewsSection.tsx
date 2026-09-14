"use client";

import { useEffect, useState, useCallback } from "react";
import { Star } from "lucide-react";
import { API_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Review } from "@/types";

export default function ReviewsSection({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingsAverage, setRatingsAverage] = useState(0);
  const [numReviews, setNumReviews] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/products/${slug}/reviews`);
      if (!res.ok) return;
      const data = await res.json();
      setReviews(data.reviews);
      setRatingsAverage(data.ratingsAverage);
      setNumReviews(data.numReviews);
    } catch (err) {
      console.log("could not load reviews", err);
    }
  }, [slug]);

  useEffect(() => {
    (async () => {
      await fetchReviews();
    })();
  }, [fetchReviews]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not submit review");
        return;
      }
      setComment("");
      setRating(5);
      setShowForm(false);
      await fetchReviews();
    } finally {
      setSubmitting(false);
    }
  }

  const canReview = !!user && user.role !== "admin";

  return (
    <div className="mt-12 border-t border-brass/20 pt-8">
      <h2 className="font-[family-name:var(--font-display)] text-2xl italic text-ink">
        Customer Reviews
      </h2>

      {numReviews > 0 && (
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.round(ratingsAverage) ? "fill-brass text-brass" : "text-brass/30"}
              />
            ))}
          </div>
          <span className="text-sm text-ink/60">
            {ratingsAverage.toFixed(1)} ({numReviews})
          </span>
        </div>
      )}

      {/* Write-a-review + summary cards, styled like the rest of the app */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-brass/20 bg-white/60 p-6">
          <h3 className="text-lg font-semibold text-ink">Write a Review</h3>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            Share your thoughts, sizing feedback, and product rating with other shoppers.
          </p>

          {canReview ? (
            !showForm ? (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-5 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-rust"
              >
                Write a Review
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i + 1)}
                      aria-label={`Rate ${i + 1} stars`}
                    >
                      <Star size={20} className={i < rating ? "fill-brass text-brass" : "text-brass/30"} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts on this product..."
                  className="mt-3 w-full rounded-xl border border-brass/20 bg-white p-3 text-sm text-ink placeholder:text-ink/40 focus:border-rust focus:outline-none"
                  rows={3}
                  autoFocus
                />
                {error && <p className="mt-2 text-sm text-rust">{error}</p>}
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-rust px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-rust-dark disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit review"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-sm font-medium text-ink/50 hover:text-rust"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )
          ) : (
            <a
              href="/login"
              className="mt-5 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-rust"
            >
              Log in to write a review
            </a>
          )}
        </div>

        {numReviews === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-brass/20 bg-cream/60 p-6 text-center">
            <Star size={32} className="text-brass/40" />
            <p className="font-semibold text-ink">No reviews yet.</p>
            <p className="text-sm text-ink/50">Be the first to review this product!</p>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-6">
        {reviews.map((r) => {
          const reviewer = typeof r.user === "string" ? "User" : r.user.name;
          return (
            <div key={r._id} className="border-b border-brass/20 pb-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={i < r.rating ? "fill-brass text-brass" : "text-brass/30"}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-ink">{reviewer}</span>
                {r.verifiedPurchase && (
                  <span className="rounded-full bg-rust/10 px-2 py-0.5 text-[11px] font-medium text-rust">
                    Verified purchase
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-6 text-ink/70">{r.comment}</p>
              {r.adminReply && (
                <div className="mt-3 rounded-xl bg-cream/60 border border-brass/20 p-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-rust">
                    Reply from the shop
                  </span>
                  <p className="mt-1 text-sm leading-6 text-ink/70">{r.adminReply}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}