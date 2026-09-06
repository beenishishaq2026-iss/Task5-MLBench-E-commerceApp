"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setSuccess(data.message || "If an account exists for that email, we've sent a reset code.");
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`);
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="font-[family-name:var(--font-display)] text-3xl italic text-ink">
            Auric
          </Link>
        </div>

        <div className="rounded-3xl bg-white px-8 py-8 shadow-xl">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold italic text-ink">
            Forgot your password?
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Enter your account email and we&apos;ll send you a code to reset it.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-xl border border-rust/30 bg-rust/10 px-4 py-3 text-sm text-rust-dark">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
                {success}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Email</label>
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-brass/30 px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-rust focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-rust px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-rust-dark disabled:opacity-60"
            >
              {loading ? "Sending code..." : "Send reset code"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink/60">
            Remembered your password?{" "}
            <Link href="/login" className="font-semibold text-rust hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}