"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AdminGuard>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl italic text-ink">
          Admin Dashboard
        </h1>

        <nav className="mt-6 flex gap-2 border-b border-brass/30">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                  active ? "border-b-2 border-rust text-rust" : "text-ink/60 hover:text-rust"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8">{children}</div>
      </div>
    </AdminGuard>
  );
}