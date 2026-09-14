"use client";

import { useState } from "react";
import { Megaphone, Tag, Send, CheckCircle2, TriangleAlert } from "lucide-react";
import { API_URL } from "@/lib/api";

type AnnouncementType = "sale" | "announcement";

const TYPE_OPTIONS: { value: AnnouncementType; label: string; description: string; icon: typeof Tag }[] = [
  {
    value: "sale",
    label: "Sale / Offer",
    description: "Flash sales, discount codes, limited-time deals.",
    icon: Tag,
  },
  {
    value: "announcement",
    label: "Announcement",
    description: "General updates, news, or heads-up messages.",
    icon: Megaphone,
  },
];

export default function AdminAnnouncementsPage() {
  const [type, setType] = useState<AnnouncementType>("sale");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSending(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/announcements`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, message, link: link || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send announcement");

      setResult({ ok: true, text: `Sent to ${data.recipients} ${data.recipients === 1 ? "user" : "users"}.` });
      setTitle("");
      setMessage("");
      setLink("");
    } catch (err) {
      setResult({ ok: false, text: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="divider-signature mb-4">
        <span className="dot" />
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">Notify</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl italic text-ink">
        Announcements
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Send a sale or announcement to every registered user. It lands instantly in their
        notification bell, and as a push alert on devices that have enabled push notifications.
      </p>

      <form
        onSubmit={handleSend}
        className="mt-8 space-y-6 rounded-3xl border border-brass/20 bg-white px-6 py-8 shadow-sm sm:px-8"
      >
        <div>
          <p className="mb-3 text-sm font-semibold text-ink">Type</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TYPE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = type === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                    active
                      ? "border-rust bg-rust/5"
                      : "border-brass/20 hover:border-rust/30"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      active ? "bg-rust text-white" : "bg-brass/10 text-rust"
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">{opt.label}</span>
                    <span className="block text-xs text-ink/50">{opt.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-semibold text-ink">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            placeholder={type === "sale" ? "Weekend Flash Sale" : "New feature: Wishlist sharing"}
            className="w-full rounded-xl border border-brass/30 bg-cream/40 px-4 py-2.5 text-sm text-ink outline-none focus:border-rust"
            required
          />
        </div>

        <div>
          <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-ink">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={280}
            rows={4}
            placeholder="Enjoy 20% off all products this weekend with code WEEKEND20."
            className="w-full resize-none rounded-xl border border-brass/30 bg-cream/40 px-4 py-2.5 text-sm text-ink outline-none focus:border-rust"
            required
          />
          <p className="mt-1 text-right text-xs text-ink/40">{message.length}/280</p>
        </div>

        <div>
          <label htmlFor="link" className="mb-1.5 block text-sm font-semibold text-ink">
            Link <span className="font-normal text-ink/40">(optional)</span>
          </label>
          <input
            id="link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="/products?category=sale"
            className="w-full rounded-xl border border-brass/30 bg-cream/40 px-4 py-2.5 text-sm text-ink outline-none focus:border-rust"
          />
          <p className="mt-1 text-xs text-ink/40">
            Where tapping the notification should take the user, e.g. a category or product page.
          </p>
        </div>

        {result && (
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
              result.ok ? "bg-emerald-50 text-emerald-700" : "bg-rust/10 text-rust"
            }`}
          >
            {result.ok ? <CheckCircle2 size={16} /> : <TriangleAlert size={16} />}
            {result.text}
          </div>
        )}

        <button
          type="submit"
          disabled={sending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-rust px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-rust-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={16} />
          {sending ? "Sending..." : "Send to all users"}
        </button>
      </form>
    </div>
  );
}