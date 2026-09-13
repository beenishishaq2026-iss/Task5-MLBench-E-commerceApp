"use client";

import { useId, useMemo, useState } from "react";

export interface RevenuePoint {
  date: string; // YYYY-MM-DD
  total: number;
}

function formatDayLabel(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

export default function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const gradientId = useId();
  const patternId = useId();
  const [hovered, setHovered] = useState<number | null>(null);

  const max = Math.max(1, ...data.map((d) => d.total));
  const peakIndex = useMemo(() => {
    let idx = 0;
    data.forEach((d, i) => {
      if (d.total > data[idx].total) idx = i;
    });
    return idx;
  }, [data]);
  const activeIndex = hovered ?? peakIndex;

  const width = 700;
  const height = 240;
  const paddingLeft = 40;
  const paddingTop = 46;
  const paddingBottom = 28;
  const chartWidth = width - paddingLeft - 10;
  const chartHeight = height - paddingBottom - paddingTop;
  const barGap = 16;
  const barWidth = data.length ? (chartWidth - barGap * (data.length - 1)) / data.length : 0;
  const pillRadius = Math.min(barWidth / 2, 18);

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Revenue over the last 7 days"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-orange)" />
            <stop offset="100%" stopColor="var(--color-rust)" />
          </linearGradient>
          <pattern
            id={patternId}
            width="7"
            height="7"
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="7" height="7" fill="transparent" />
            <line x1="0" y1="0" x2="0" y2="7" stroke="#FFFFFF" strokeOpacity={0.28} strokeWidth={2.5} />
          </pattern>
        </defs>

        {/* Grid lines + y-axis labels */}
        {gridLines.map((g) => {
          const y = paddingTop + chartHeight * (1 - g);
          return (
            <g key={g}>
              <line
                x1={paddingLeft}
                x2={width - 10}
                y1={y}
                y2={y}
                stroke="var(--color-ink)"
                strokeOpacity={0.1}
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--color-ink)"
                opacity={0.45}
              >
                ${Math.round((max * g) / 1)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = max > 0 ? (d.total / max) * chartHeight : 0;
          const x = paddingLeft + i * (barWidth + barGap);
          const isActive = activeIndex === i;
          const drawnHeight = Math.max(barHeight, pillRadius * 2);
          const drawnY = paddingTop + chartHeight - drawnHeight;
          const tooltipWidth = 78;
          const tooltipX = Math.min(Math.max(x + barWidth / 2 - tooltipWidth / 2, 0), width - tooltipWidth);
          const tooltipY = Math.max(drawnY - 40, 0);

          return (
            <g
              key={d.date}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {/* invisible hit area for easier hover */}
              <rect x={x} y={paddingTop} width={barWidth} height={chartHeight} fill="transparent" />

              {/* pill-shaped bar */}
              <rect
                x={x}
                y={drawnY}
                width={barWidth}
                height={drawnHeight}
                rx={pillRadius}
                fill={`url(#${gradientId})`}
                opacity={isActive ? 1 : 0.55}
              />
              {/* diagonal hatch texture on top */}
              <rect
                x={x}
                y={drawnY}
                width={barWidth}
                height={drawnHeight}
                rx={pillRadius}
                fill={`url(#${patternId})`}
                opacity={isActive ? 1 : 0.55}
              />

              <text
                x={x + barWidth / 2}
                y={height - 8}
                textAnchor="middle"
                fontSize="11"
                fill="var(--color-ink)"
                opacity={isActive ? 0.85 : 0.5}
                fontWeight={isActive ? 600 : 400}
              >
                {formatDayLabel(d.date)}
              </text>

              {isActive && (
                <g>
                  {/* connector dot on top of the bar */}
                  <circle
                    cx={x + barWidth / 2}
                    cy={drawnY}
                    r={6}
                    fill="white"
                    stroke="var(--color-orange)"
                    strokeWidth={3}
                  />
                  {/* connector line up to tooltip */}
                  <line
                    x1={x + barWidth / 2}
                    y1={drawnY - 6}
                    x2={x + barWidth / 2}
                    y2={tooltipY + 30}
                    stroke="var(--color-orange)"
                    strokeWidth={1.5}
                    strokeDasharray="2 3"
                  />
                  <rect
                    x={tooltipX}
                    y={tooltipY}
                    width={tooltipWidth}
                    height={26}
                    rx={7}
                    fill="var(--color-orange)"
                  />
                  <text
                    x={tooltipX + tooltipWidth / 2}
                    y={tooltipY + 17}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight={700}
                    fill="white"
                  >
                    ${d.total.toFixed(2)}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}