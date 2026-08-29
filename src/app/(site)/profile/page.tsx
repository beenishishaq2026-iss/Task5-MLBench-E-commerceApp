"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-ink/60">Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
        Your Account
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold italic text-ink">
        Welcome, {user.name}
      </h1>

      <div className="mt-10 rounded-3xl border border-brass/20 bg-white px-8 py-8 shadow-sm">
        <div className="divide-y divide-brass/20">
          <div className="flex items-center justify-between py-4">
            <span className="text-sm font-medium text-ink/60">Full name</span>
            <span className="text-sm font-semibold text-ink">{user.name}</span>
          </div>
          <div className="flex items-center justify-between py-4">
            <span className="text-sm font-medium text-ink/60">Email</span>
            <span className="text-sm font-semibold text-ink">{user.email}</span>
          </div>
          <div className="flex items-center justify-between py-4">
            <span className="text-sm font-medium text-ink/60">Role</span>
            <span className="text-sm font-semibold capitalize text-ink">
              {user.role}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 w-full rounded-full border border-rust px-6 py-3 text-sm font-semibold text-rust transition-colors hover:bg-rust hover:text-white"
        >
          Log out
        </button>
      </div>
    </div>
  );
}