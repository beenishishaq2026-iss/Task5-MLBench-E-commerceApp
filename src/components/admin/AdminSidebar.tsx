"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminSidebar({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-brass/20 px-5 py-5">
        <Link href="/admin" className="flex items-center gap-2" onClick={onNavigate}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rust text-sm font-semibold text-white">
            A
          </span>
          <span className="font-[family-name:var(--font-display)] text-lg italic text-ink">
            Auric Admin
          </span>
        </Link>
        <button
          onClick={onNavigate}
          className="rounded-lg p-1.5 text-ink/50 hover:bg-cream lg:hidden"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-ink/35">
          Menu
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-rust text-white shadow-sm"
                      : "text-ink/65 hover:bg-cream"
                  }`}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="px-3 pb-2 pt-6 text-[11px] font-semibold uppercase tracking-wide text-ink/35">
          General
        </p>
        <ul className="space-y-1">
          <li>
            <Link
              href="/profile"
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/65 transition-colors hover:bg-cream"
            >
              <Settings size={17} />
              Settings
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink/65 transition-colors hover:bg-cream"
            >
              <LogOut size={17} />
              Log out
            </button>
          </li>
        </ul>
      </nav>

      <div className="border-t border-brass/20 px-5 py-4">
        <p className="truncate text-sm font-medium text-ink">{user?.name || "Admin"}</p>
        <p className="truncate text-xs text-ink/45">{user?.email}</p>
      </div>
    </div>
  );
}