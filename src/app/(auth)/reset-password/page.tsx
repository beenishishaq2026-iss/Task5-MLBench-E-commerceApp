"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Check } from "lucide-react";
import { API_URL } from "@/lib/api";

const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']/;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const hasMinLength = password.length >= 8;
  const hasSpecialChar = SPECIAL_CHAR_REGEX.test(password);
  const isPasswordValid = hasMinLength && hasSpecialChar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setTouchedPassword(true);

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (otp.trim().length !== 6) {
      setError("Enter the 6-digit code sent to your email");
      return;
    }
    if (!isPasswordValid) {
      setError("Please meet all password requirements below");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not reset password");

      setSuccess(data.message || "Password reset successfully. You can now log in.");
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
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
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
            Reset your password
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Enter the 6-digit code we sent to your email along with your new password. It expires in 10 minutes.
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
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-brass/30 px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-rust focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Reset code</label>
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

            <div>
              <label className="mb-1 block text-sm font-medium text-ink">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="new-password"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  data-lpignore="true"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouchedPassword(true)}
                  placeholder="At least 8 characters"
                  className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-ink placeholder:text-ink/40 focus:outline-none ${
                    touchedPassword && !isPasswordValid
                      ? "border-red-400 focus:border-red-400"
                      : "border-brass/30 focus:border-rust"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-rust"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {(touchedPassword || password.length > 0) && (
                <ul className="mt-3 space-y-2">
                  <li className={`flex items-center gap-2 text-xs ${hasMinLength ? "text-green-700" : "text-ink/50"}`}>
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                        hasMinLength ? "bg-green-600" : "bg-ink/10"
                      }`}
                    >
                      {hasMinLength ? (
                        <Check size={10} className="text-white" strokeWidth={3} />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-ink/30" />
                      )}
                    </span>
                    At least 8 characters
                  </li>
                  <li className={`flex items-center gap-2 text-xs ${hasSpecialChar ? "text-green-700" : "text-ink/50"}`}>
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                        hasSpecialChar ? "bg-green-600" : "bg-ink/10"
                      }`}
                    >
                      {hasSpecialChar ? (
                        <Check size={10} className="text-white" strokeWidth={3} />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-ink/30" />
                      )}
                    </span>
                    At least one special character (!@#$%...)
                  </li>
                </ul>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-rust px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-rust-dark disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}