"use client";

import { Columns2, Columns3, Columns4 } from "lucide-react";

export const GRID_COLUMN_CLASSES: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4",
};

const options = [
  { cols: 2, icon: Columns2, label: "View 2 per row" },
  { cols: 3, icon: Columns3, label: "View 3 per row" },
  { cols: 4, icon: Columns4, label: "View 4 per row" },
] as const;

interface GridViewToggleProps {
  value: number;
  onChange: (cols: number) => void;
}

export default function GridViewToggle({ value, onChange }: GridViewToggleProps) {
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-full border border-brass/30 bg-white p-1">
      {options.map(({ cols, icon: Icon, label }) => (
        <button
          key={cols}
          type="button"
          onClick={() => onChange(cols)}
          aria-label={label}
          aria-pressed={value === cols}
          className={
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors " +
            (value === cols
              ? "bg-ink text-cream"
              : "text-ink/50 hover:text-rust")
          }
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}