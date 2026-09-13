"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <AdminGuard>
      <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-cream lg:flex">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r-[3px] border-orange lg:block">
          <div className="fixed h-screen w-64">
            <AdminSidebar />
          </div>
        </aside>

        {/* Mobile sidebar drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              aria-label="Close menu overlay"
              className="absolute inset-0 bg-ink/40 animate-fade-in"
              onClick={() => setMobileOpen(false)}
            />
            <div className="animate-slide-in-right absolute right-0 top-0 h-full w-72 max-w-[80vw] shadow-xl">
              <AdminSidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b-[3px] border-orange bg-white px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="shrink-0 rounded-lg p-2 text-ink hover:bg-cream lg:hidden"
                aria-label="Open admin menu"
              >
                <Menu size={20} />
              </button>
              <Link
                href="/admin"
                className="truncate font-[family-name:var(--font-display)] text-lg italic text-ink lg:hidden"
              >
                Auric Admin
              </Link>
            </div>

            <div className="flex min-w-0 shrink-0 items-center gap-3">
              <div className="hidden max-w-[160px] text-right sm:block">
                <p className="truncate text-sm font-medium leading-tight text-ink">
                  {user?.name || "Admin"}
                </p>
                <p className="truncate text-[11px] leading-tight text-ink/45">Administrator</p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rust/10 text-sm font-semibold text-rust">
                {(user?.name || "A").charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}