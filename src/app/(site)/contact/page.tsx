"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { API_URL } from "@/lib/api";

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const FAQS = [
  {
    q: "How long does shipping take?",
    a: "Orders typically arrive within 3-7 business days. You'll receive a tracking link as soon as your order ships.",
  },
  {
    q: "What is your return policy?",
    a: "We offer 30-day easy returns on all unused items in their original packaging. Contact us to start a return.",
  },
  {
    q: "How can I track my order?",
    a: "Log in and visit your Profile to see order history and status, or use the tracking link in your confirmation email.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes, we ship to most countries. Shipping costs and delivery times are calculated at checkout.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not send your message");
      }

      setStatus("success");
      setFeedback(data.message || "Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setFeedback(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-brass/20 bg-cream py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
            We&apos;d love to hear from you
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl italic text-ink md:text-5xl">
            Get in Touch
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-ink/60">
            Questions about an order, a product, or just want to say hello? Our team
            is here to help.
          </p>
        </div>
      </section>

      {/* Form + info */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr]">
          {/* Form */}
          <div className="rounded-2xl border border-brass/20 bg-white p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-ink">Send us a message</h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink/60">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-brass/30 px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-rust focus:outline-none"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink/60">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-brass/30 px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-rust focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink/60">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-brass/30 px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-rust focus:outline-none"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink/60">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full resize-none rounded-xl border border-brass/30 px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-rust focus:outline-none"
                  placeholder="Tell us more..."
                />
              </div>

              {feedback && (
                <p
                  className={`rounded-xl px-4 py-3 text-sm ${
                    status === "error"
                      ? "border border-rust/30 bg-rust/10 text-rust-dark"
                      : "border border-green-600/30 bg-green-600/10 text-green-800"
                  }`}
                >
                  {feedback}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-rust disabled:opacity-60 sm:w-auto"
              >
                {status === "loading" ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* Contact info */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-brass/20 bg-white p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brass/20 text-rust">
                  <Mail size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">Email us</p>
                  <p className="mt-1 text-sm text-ink/60">support@auric.com</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-brass/20 bg-white p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brass/20 text-rust">
                  <Phone size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">Call us</p>
                  <p className="mt-1 text-sm text-ink/60">+1 (555) 010-2938</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-brass/20 bg-white p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brass/20 text-rust">
                  <MapPin size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">Visit us</p>
                  <p className="mt-1 text-sm text-ink/60">
                    128 Market Street, Suite 4<br />
                    San Francisco, CA 94103
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-brass/20 bg-white p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brass/20 text-rust">
                  <Clock size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">Support hours</p>
                  <p className="mt-1 text-sm text-ink/60">Mon-Fri, 9am-6pm (PST)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-brass/20 bg-cream py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">FAQ</p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl italic text-ink">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-10 space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl border border-brass/20 bg-white p-5 open:border-rust/30"
              >
                <summary className="cursor-pointer list-none text-sm font-medium text-ink marker:content-none">
                  <span className="flex items-center justify-between gap-3">
                    {faq.q}
                    <span className="shrink-0 text-rust transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm text-ink/60">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}