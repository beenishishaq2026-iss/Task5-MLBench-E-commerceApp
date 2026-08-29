"use client";

import { Truck } from "lucide-react";

const MESSAGE = "Free shipping on orders over $50";

export default function AnnouncementBar() {
  return (
    <div className="flex items-center justify-center gap-2 bg-rust px-6 py-2.5 text-center text-xs font-semibold tracking-wide text-white">
      <Truck size={14} className="text-white" />
      <span>{MESSAGE}</span>
    </div>
  );
}