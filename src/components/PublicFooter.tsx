import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-ink-100 bg-cream-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
                OL
              </span>
              <span className="text-lg font-extrabold tracking-tight text-ink-900">OfferLift</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-ink-500">
              The wholesale marketplace where vetted investors compete for your house, so you get top dollar
              without lifting a finger.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink-900">Sellers</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-500">
              <li><Link href="/sell" className="hover:text-ink-900">Get a cash offer</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-ink-900">How it works</Link></li>
              <li><Link href="/login" className="hover:text-ink-900">Track my offer</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink-900">Investors</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-500">
              <li><Link href="/investors" className="hover:text-ink-900">Why OfferLift</Link></li>
              <li><Link href="/signup" className="hover:text-ink-900">Create an account</Link></li>
              <li><Link href="/login" className="hover:text-ink-900">Investor login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink-900">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-500">
              <li><span>About</span></li>
              <li><span>Contact</span></li>
              <li><span>Trust &amp; Safety</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-ink-200 pt-6 text-xs text-ink-400">
          © 2026 OfferLift. Demo marketplace for illustration purposes only — not a licensed real estate brokerage.
        </div>
      </div>
    </footer>
  );
}
