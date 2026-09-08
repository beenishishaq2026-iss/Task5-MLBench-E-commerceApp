"use client";

import Link from "next/link";

export default function AnnouncementBar() {
  return (
    <div className="flex items-center justify-center gap-2 bg-rust px-6 py-2.5 text-center text-xs font-semibold tracking-wide text-white">
      <span>🔥 Special Offers &amp; Featured Products —</span>
      <Link
        href="/#deals"
        className="rounded-full border border-white/70 px-3 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-white hover:text-rust"
      >
        Shop Now →
      </Link>
    </div>
  );
}