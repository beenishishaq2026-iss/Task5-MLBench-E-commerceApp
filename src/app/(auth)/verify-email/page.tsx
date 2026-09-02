"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "@/lib/api";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (otp.trim().length !== 6) {
      setError("Enter the 6-digit code sent to your email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");

      setSuccess(data.message || "Email verified successfully.");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    if (!email.trim()) {
      setError("Please enter your email first");
      return;
    }
    setResending(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not resend code");
      setSuccess(data.message || "A new code has been sent.");
      setCooldown(30);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setResending(false);
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
            Verify your email
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Enter the 6-digit code we sent to your email address. It expires in 10 minutes.
          </p>

          <form onSubmit={handleVerify} className="mt-6 space-y-4">
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
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-brass/30 px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-rust focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Verification code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full rounded-xl border border-brass/30 px-4 py-3 text-center text-lg tracking-[0.5em] text-ink placeholder:tracking-normal placeholder:text-ink/40 focus:border-rust focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-rust px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-rust-dark disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify email"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink/60">
            Didn&apos;t get a code?{" "}
            <button
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="font-semibold text-rust hover:underline disabled:cursor-not-allowed disabled:text-ink/40 disabled:no-underline"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? "Sending..." : "Resend code"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}