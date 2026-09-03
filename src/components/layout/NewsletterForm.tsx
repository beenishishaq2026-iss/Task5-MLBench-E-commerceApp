"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";

interface NewsletterFormProps {
  
  variant?: "card" | "inline";
}

export default function NewsletterForm({ variant = "card" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setFeedback("");

    try {
      const res = await fetch(`${API_URL}/api/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not subscribe. Please try again.");
      }

      setStatus("success");
      setFeedback(data.message || "Subscribed! Welcome to the collective.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setFeedback(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (variant === "inline") {
    return (
      <div>
        <p className="mt-4 text-sm text-cream/70">
          Early access to new arrivals and seasonal offers.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
            className="min-w-0 flex-1 rounded-full border border-cream/20 bg-cream/5 px-4 py-2 text-sm text-cream placeholder:text-cream/40 focus:border-brass focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="shrink-0 rounded-full bg-rust px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-rust-dark disabled:opacity-60"
          >
            {status === "loading" ? "..." : "Join"}
          </button>
        </form>
        {feedback && (
          <p className={`mt-2 text-xs ${status === "error" ? "text-rust" : "text-brass"}`}>
            {feedback}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brass/20 text-brass">
          ✉
        </span>
        <h3 className="text-lg font-semibold text-ink">Subscribe</h3>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
          className="w-full rounded-full border border-brass/30 px-5 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-rust focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#963F22] px-6 py-3 text-sm font-semibold text-[#FFFFFF] transition-colors hover:bg-[#7a321b] disabled:opacity-60"
        >
          {status === "loading" ? "Subscribing..." : "Unlock Access"}
          {status !== "loading" && <span aria-hidden>→</span>}
        </button>
      </form>

      {feedback ? (
        <p className={`mt-4 text-center text-xs ${status === "error" ? "text-rust" : "text-green-700"}`}>
          {feedback}
        </p>
      ) : (
        <p className="mt-4 text-center text-xs text-ink/50">
          By subscribing, you agree to our Terms of Service and Privacy Policy. Unsubscribe anytime.
        </p>
      )}
    </div>
  );
}