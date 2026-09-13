"use client";

export interface OrderStatusCounts {
  pending: number;
  paid: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

const SEGMENTS: { key: keyof OrderStatusCounts; label: string; color: string }[] = [
  { key: "delivered", label: "Delivered", color: "var(--color-rust)" },
  { key: "shipped", label: "Shipped", color: "var(--color-orange)" },
  { key: "paid", label: "Paid", color: "var(--color-brass)" },
  { key: "pending", label: "Pending", color: "#D8C9A3" },
  { key: "cancelled", label: "Cancelled", color: "#C9BEB3" },
];

export default function OrderStatusDonut({ counts }: { counts: OrderStatusCounts }) {
  const total = SEGMENTS.reduce((sum, s) => sum + (counts[s.key] || 0), 0);
  const radius = 60;
  const stroke = 22;
  const circumference = 2 * Math.PI * radius;

  let offsetSoFar = 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative w-full max-w-[160px] shrink-0 sm:w-40">
        <svg viewBox="0 0 160 160" className="h-auto w-full">
          <g transform="rotate(-90 80 80)">
            {total === 0 ? (
              <circle
                cx={80}
                cy={80}
                r={radius}
                fill="none"
                stroke="var(--color-brass)"
                strokeOpacity={0.15}
                strokeWidth={stroke}
              />
            ) : (
              SEGMENTS.map((s) => {
                const value = counts[s.key] || 0;
                if (value === 0) return null;
                const fraction = value / total;
                const dash = fraction * circumference;
                const gap = circumference - dash;
                const el = (
                  <circle
                    key={s.key}
                    cx={80}
                    cy={80}
                    r={radius}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={stroke}
                    strokeDasharray={`${dash} ${gap}`}
                    strokeDashoffset={-offsetSoFar}
                  />
                );
                offsetSoFar += dash;
                return el;
              })
            )}
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
            {total}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-ink/40">Orders</span>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-x-6 gap-y-2 sm:w-auto sm:grid-cols-1">
        {SEGMENTS.map((s) => (
          <div key={s.key} className="flex items-center justify-between gap-6 text-sm">
            <span className="flex items-center gap-2 text-ink/70">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.label}
            </span>
            <span className="font-medium text-ink">{counts[s.key] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}