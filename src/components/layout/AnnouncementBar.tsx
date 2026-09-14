"use client";

import Link from "next/link";

export default function AnnouncementBar() {
  return (
    <div className="flex items-center justify-center gap-3 bg-rust px-6 py-2.5 text-center text-xs font-semibold tracking-wide text-white md:grid md:grid-cols-[1fr_auto_1fr] md:gap-0">
      <span className="md:col-start-2 md:justify-self-center">
        🔥 Special Offers &amp; Featured Products
      </span>
      <Link
        href="/#deals"
        className="rounded-full border-2 border-white bg-amber-50 px-5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-rust-dark shadow-sm transition-colors hover:bg-orange-dark hover:text-white hover:shadow-md md:col-start-3 md:justify-self-end"
      >
        Shop Now
      </Link>
    </div>
  );
}