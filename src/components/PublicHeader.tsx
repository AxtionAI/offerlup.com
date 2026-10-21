import Link from "next/link";
import { getSession } from "@/lib/auth";

export async function PublicHeader() {
  const session = await getSession();

  const dashboardHref =
    session?.role === "ADMIN"
      ? "/admin/dashboard"
      : session?.role === "INVESTOR"
      ? "/investor/dashboard"
      : session?.role === "SELLER"
      ? "/seller/properties"
      : null;

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            OL
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink-900">OfferLup</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-600 md:flex">
          <Link href="/sell" className="hover:text-ink-900">
            Sell Your House
          </Link>
          <Link href="/investors" className="hover:text-ink-900">
            For Investors
          </Link>
          <Link href="/compare" className="hover:text-ink-900">
            Cash vs. Retail
          </Link>
          <Link href="/#how-it-works" className="hover:text-ink-900">
            How It Works
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {dashboardHref ? (
            <Link
              href={dashboardHref}
              className="rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-800"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden text-sm font-semibold text-ink-700 hover:text-ink-900 sm:block">
                Log in
              </Link>
              <Link
                href="/sell"
                className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                Get My Cash Offer
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
