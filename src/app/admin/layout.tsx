"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // FIX (react-hooks/set-state-in-effect): reset the mobile menu when the
  // route changes, without a setState-in-effect. Compare against the
  // previous pathname during render and adjust state directly instead.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [pathname]);

  return (
    <AdminGuard>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      
        <div className="flex items-center justify-between sm:block">
          <h1 className="font-[family-name:var(--font-display)] text-xl italic text-ink sm:text-2xl md:text-3xl">
            Admin Dashboard
          </h1>
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="rounded-lg p-2 text-ink hover:bg-brass/10 sm:hidden"
            aria-label="Toggle admin menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <nav className="mt-3 flex flex-col overflow-hidden rounded-xl border border-brass/30 bg-white sm:hidden">
            {TABS.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`border-b border-brass/10 px-4 py-3 text-sm font-medium last:border-0 ${
                    active ? "bg-rust/10 text-rust" : "text-ink/70 hover:bg-cream/60"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        )}
        
        <nav className="mt-6 hidden gap-2 overflow-x-auto border-b border-brass/30 sm:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                ref={active ? activeRef : undefined}
                className={`shrink-0 whitespace-nowrap rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                  active ? "border-b-2 border-rust text-rust" : "text-ink/60 hover:text-rust"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 sm:mt-8">{children}</div>
      </div>
    </AdminGuard>
  );
}