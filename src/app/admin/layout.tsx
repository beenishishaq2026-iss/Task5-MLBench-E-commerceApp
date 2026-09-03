"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [pathname]);

  return (
    <AdminGuard>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 overflow-x-hidden">
        <h1 className="font-[family-name:var(--font-display)] text-xl italic text-ink sm:text-2xl md:text-3xl">
          Admin Dashboard
        </h1>

        <div className="relative mt-4 sm:mt-6">
          <nav className="flex gap-1 overflow-x-auto border-b border-brass/30 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  ref={active ? activeRef : undefined}
                  className={`shrink-0 whitespace-nowrap rounded-t-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
                    active ? "border-b-2 border-rust text-rust" : "text-ink/60 hover:text-rust"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
          {/* fade hint so it's obvious the tabs scroll on mobile */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent sm:hidden" />
        </div>

        <div className="mt-6 sm:mt-8">{children}</div>
      </div>
    </AdminGuard>
  );
}