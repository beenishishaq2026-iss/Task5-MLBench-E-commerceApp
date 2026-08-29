import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-brass/30 bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-2xl italic">
              Auric
            </h3>
            <p className="mt-3 max-w-xs text-sm text-cream/70">
              Considered goods, presented without the noise. Honest prices,
              lasting materials.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-brass">
              Shop
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-cream/80">
              <li><Link href="/products" className="hover:text-rust">All Products</Link></li>
              <li><Link href="/categories" className="hover:text-rust">Categories</Link></li>
              <li><Link href="/cart" className="hover:text-rust">Cart</Link></li>
              <li><Link href="/wishlist" className="hover:text-rust">Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-brass">
              Support
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-cream/80">
              <li><Link href="/about" className="hover:text-rust">About</Link></li>
              <li><Link href="/contact" className="hover:text-rust">Contact</Link></li>
              <li><Link href="/contact#faq" className="hover:text-rust">FAQs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-brass">
              Newsletter
            </h4>
            <p className="mt-4 text-sm text-cream/70">
              Early access to new arrivals and seasonal offers.
            </p>
          </div>
        </div>

        <div className="divider-signature my-10">
          <span className="dot" />
        </div>

        <p className="text-center text-xs text-cream/50">
          © 2026 Auric. All rights reserved.
        </p>
      </div>
    </footer>
  );
}