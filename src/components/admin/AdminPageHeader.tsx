import { LucideIcon } from "lucide-react";

export default function AdminPageHeader({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Optional right-aligned actions (buttons, filters, etc). */
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rust/10 text-rust">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink sm:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 text-sm text-ink/50">{description}</p>
          )}
        </div>
      </div>

      {children && (
        <div className="flex shrink-0 items-center gap-2.5">{children}</div>
      )}
    </div>
  );
}