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
      await fetchReviews();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-12 border-t border-brass/20 pt-8">
      <div className="flex items-center gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-2xl italic text-ink">Reviews</h2>
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

      {user && user.role !== "admin" && (
        <form onSubmit={handleSubmit} className="mt-6 max-w-xl">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button key={i} type="button" onClick={() => setRating(i + 1)} aria-label={`Rate ${i + 1} stars`}>
                <Star size={20} className={i < rating ? "fill-brass text-brass" : "text-brass/30"} />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts on this product..."
            className="mt-3 w-full rounded-xl border border-brass/20 p-3 text-sm text-ink placeholder:text-ink/40 focus:border-rust focus:outline-none"
            rows={3}
          />
          {error && <p className="mt-2 text-sm text-rust">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 rounded-xl bg-rust px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit review"}
          </button>
        </form>
      )}

      <div className="mt-8 space-y-6">
        {reviews.length === 0 && <p className="text-sm text-ink/50">No reviews yet — be the first.</p>}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}