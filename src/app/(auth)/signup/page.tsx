"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { API_URL } from "@/lib/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']/;

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const hasMinLength = formData.password.length >= 8;
  const hasSpecialChar = SPECIAL_CHAR_REGEX.test(formData.password);
  const isPasswordValid = hasMinLength && hasSpecialChar;
  const isEmailValid = formData.email === "" || EMAIL_REGEX.test(formData.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setTouched({ email: true, password: true });

    if (!EMAIL_REGEX.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!isPasswordValid) {
      setError("Please meet all password requirements below");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      setSuccess(data.message || "Account created! Check your email for a verification code.");

      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      }, 1200);
    } catch (err: unknown) {
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
            Create your account
          </h1>
          <p className="mt-1 text-sm text-ink/60">Join Auric for early access and considered goods.</p>

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
              <label className="mb-1 block text-sm font-medium text-ink">Full name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-brass/30 px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-rust focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur("email")}
                placeholder="you@example.com"
                className={`w-full rounded-xl border px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none ${
                  touched.email && !isEmailValid
                    ? "border-red-400 focus:border-red-400"
                    : "border-brass/30 focus:border-rust"
                }`}
              />
              {touched.email && !isEmailValid && (
                <p className="mt-1 text-xs text-red-600">Please enter a valid email address</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur("password")}
                  placeholder="At least 8 characters"
                  className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-ink placeholder:text-ink/40 focus:outline-none ${
                    touched.password && !isPasswordValid
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

              {(touched.password || formData.password.length > 0) && (
                <ul className="mt-2 space-y-1">
                  <li className={`flex items-center gap-1.5 text-xs ${hasMinLength ? "text-green-700" : "text-ink/50"}`}>
                    {hasMinLength ? <Check size={13} /> : <X size={13} />}
                    At least 8 characters
                  </li>
                  <li className={`flex items-center gap-1.5 text-xs ${hasSpecialChar ? "text-green-700" : "text-ink/50"}`}>
                    {hasSpecialChar ? <Check size={13} /> : <X size={13} />}
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
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink/60">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-rust hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}