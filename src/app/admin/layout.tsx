import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl italic text-ink">
          Admin Dashboard
        </h1>
        <div className="mt-8">{children}</div>
      </div>
    </AdminGuard>
  );
}