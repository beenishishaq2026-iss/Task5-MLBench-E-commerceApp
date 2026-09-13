import Image from "next/image";
import Link from "next/link";
import { Leaf, HandHeart, Sparkles } from "lucide-react";

export const metadata = {
  title: "About | Auric",
};

const values = [
  {
    icon: Leaf,
    title: "Thoughtfully Sourced",
    description:
      "Every piece is chosen with care — quality ingredients and materials, never shortcuts.",
  },
  {
    icon: HandHeart,
    title: "Honest Pricing",
    description:
      "No inflated markups. Just fair prices for goods made to last.",
  },
  {
    icon: Sparkles,
    title: "Everyday Luxury",
    description:
      "Beautifully made essentials that feel special without the fuss.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Intro */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
          Our Story
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl italic leading-tight text-ink md:text-6xl">
          About Auric
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-ink/70">
          Our mission is to bring ethically sourced, beautifully crafted
          essentials directly to your door. We believe in honest pricing,
          lasting quality, and the kind of everyday luxury that never goes
          out of style.
        </p>
      </section>

      {/* Crafted with purpose */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-brass/20 bg-[#f7f5f0] md:grid-cols-2">
          <div className="flex flex-col justify-center px-8 py-12 md:px-12 md:py-16">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold italic text-ink md:text-4xl">
              Crafted with Purpose
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-ink/70">
              Auric started with a simple idea: the things we use every day
              should be beautiful, effective, and made with integrity. We
              work with trusted makers and brands who share that same
              standard.
            </p>
            <p className="mt-4 text-[15px] leading-7 text-ink/70">
              By keeping things simple and transparent, we bring you
              exceptional pieces at fair prices — without the markup that
              usually comes with it.
            </p>
          </div>

          <div className="relative min-h-[320px] w-full md:min-h-full">
            <Image
              src="/images/hero-flatlay.png"
              alt="Curated Auric goods styled on natural linen"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="divider-signature mb-4">
          <span className="dot" />
        </div>
        <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold italic text-ink md:text-5xl">
          What we stand for
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {values.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-brass/20 bg-white p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rust/10 text-rust">
                <Icon size={20} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">
                {title}
              </h3>
              <p className="mt-2 text-sm text-ink/60">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold italic text-ink md:text-4xl">
            Ready to explore?
          </h2>
          <p className="mt-3 text-sm text-ink/60">
            Discover the full collection, made with intention.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block rounded-full bg-rust px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-rust-dark"
          >
            Shop Collection
          </Link>
        </div>
      </section>
    </div>
  );
}