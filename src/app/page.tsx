import Image from "next/image";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { PropertyShowcase } from "@/components/PropertyShowcase";
import { PropertyPlaceholder } from "@/components/illustrations/PropertyPlaceholder";

const steps = [
  {
    title: "Submit your address",
    body:
      "Tell us about your property in under 5 minutes — address, condition, and why you're selling. No showings, no cleaning, no repairs.",
  },
  {
    title: "We calculate your guaranteed offer",
    body:
      "Our team pencils the after-repair value and rehab cost, then caps your offer at 20% below market value — whichever is lower, so you're always protected.",
  },
  {
    title: "Investors compete. You win.",
    body:
      "Your deal goes live to our vetted investor network, who bid against each other to win the contract. Your offer never drops — it can only get you paid faster.",
  },
];

const trustStats = [
  { value: "2,400+", label: "Vetted investors nationwide" },
  { value: "$186M+", label: "In competitive offers generated" },
  { value: "11 days", label: "Average time to close" },
  { value: "0%", label: "Commission charged to sellers" },
];

const investorSteps = [
  {
    title: "Build your Smart Buy Box",
    body:
      "Set your target markets by zip, county, or city, plus property type, condition, and price range — the criteria we use to match and score deals for you.",
  },
  {
    title: "Get matched deals",
    body:
      "Pre-vetted, pre-calculated deals land in your marketplace feed ranked by fit — no more scrolling listing sites hoping something pencils.",
  },
  {
    title: "Win in a live auction",
    body:
      "Bid against other verified investors in a transparent, ascending auction. You only pay the 6% platform fee if you win.",
  },
];

export default function Home() {
  return (
    <>
      <PublicHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-cash-100 px-3 py-1 text-xs font-semibold text-cash-700">
                🏆 Investors compete. You get top dollar.
              </span>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
                Sell your house the <span className="text-brand-600">smarter</span> way
              </h1>
              <p className="mt-5 max-w-xl text-lg text-ink-600">
                Submit your property once. We send it to a live auction of vetted cash investors who bid against
                each other to win your deal — driving your guaranteed offer as high as the numbers allow. No
                showings. No repairs. No commissions.
              </p>

              <form action="/sell" className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  placeholder="Enter your property address"
                  className="w-full rounded-xl border border-ink-200 bg-white px-5 py-4 text-base text-ink-900 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-xl bg-brand-600 px-6 py-4 text-base font-semibold text-white shadow-sm hover:bg-brand-700"
                >
                  Get My Cash Offer
                </button>
              </form>
              <p className="mt-3 text-sm text-ink-400">Free. No obligation. Offer in as little as 24 hours.</p>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-xl">
                <PropertyPlaceholder seed="homepage-hero" className="h-40 w-full" />
                <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink-500">Your Guaranteed Offer</span>
                  <span className="rounded-full bg-cash-100 px-2.5 py-1 text-xs font-bold text-cash-700">
                    LIVE AUCTION
                  </span>
                </div>
                <div className="mt-3 text-4xl font-extrabold text-ink-900">$312,000</div>
                <p className="mt-1 text-sm text-ink-500">412 Maple Street, Phoenix, AZ</p>

                <div className="mt-6 space-y-3 rounded-xl bg-ink-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-500">Zillow Estimate</span>
                    <span className="font-semibold text-ink-900">$398,500</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-500">After Repair Value</span>
                    <span className="font-semibold text-ink-900">$410,000</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-500">Estimated Rehab</span>
                    <span className="font-semibold text-ink-900">− $62,000</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between rounded-xl border border-brand-100 bg-brand-50 p-4">
                  <div>
                    <p className="text-xs font-semibold text-brand-700">7 investors bidding</p>
                    <p className="text-xs text-ink-500">Auction ends in 4h 12m</p>
                  </div>
                  <div className="flex -space-x-2">
                    {["JD", "MK", "RT", "+4"].map((i) => (
                      <span
                        key={i}
                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-ink-800 text-[10px] font-bold text-white"
                      >
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Link
              href="/sell"
              className="group overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src="/images/seller-new-keys.jpg"
                  alt="Happy couple holding keys to their new home"
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Selling a house?</p>
                <h3 className="mt-1 text-xl font-bold text-ink-900">Get a guaranteed cash offer</h3>
                <p className="mt-2 text-sm text-ink-600">
                  Real sellers are getting offers in under 24 hours — no repairs, no showings, no commissions.
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-brand-600 group-hover:underline">
                  Get My Cash Offer →
                </span>
              </div>
            </Link>
            <Link
              href="/investors"
              className="group overflow-hidden rounded-2xl border border-ink-100 bg-ink-950 shadow-sm transition hover:shadow-md"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src="/images/investor-closing-deal.jpg"
                  alt="Investors reviewing and signing a property deal"
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">Buying properties?</p>
                <h3 className="mt-1 text-xl font-bold text-white">Win deals in live auctions</h3>
                <p className="mt-2 text-sm text-ink-300">
                  Verified investors are bidding on matched deals right now — see what&apos;s live and build your
                  buy box.
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-brand-400 group-hover:underline">
                  Explore For Investors →
                </span>
              </div>
            </Link>
          </div>
        </section>

        <section className="border-y border-ink-100 bg-white py-10">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
            {trustStats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-extrabold text-ink-900">{s.value}</div>
                <div className="mt-1 text-sm text-ink-500">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">How OfferLift works</h2>
            <p className="mt-4 text-lg text-ink-600">
              Three simple steps between you and a competitive, guaranteed cash offer.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="relative rounded-2xl border border-ink-100 p-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-bold text-ink-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-600">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-cash-100 px-3 py-1 text-xs font-semibold text-cash-700">
              LIVE ON THE MARKETPLACE
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              Real deals, happening right now
            </h2>
            <p className="mt-4 text-lg text-ink-600">
              A look at properties currently in our pipeline. Exact addresses stay private until a seller is
              under contract — investors see the full picture once they&apos;re verified.
            </p>
          </div>
          <div className="mt-12">
            <PropertyShowcase limit={6} />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-xl">
              <Image
                src="/images/seller-new-keys.jpg"
                alt="Happy couple moving into their new home after selling"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                From &quot;I need to sell&quot; to keys handed over
              </h2>
              <p className="mt-4 text-lg text-ink-600">
                No open houses, no repair punch lists, no waiting on buyer financing. Sellers tell us about the
                property once — our team and our investor network handle the rest.
              </p>
              <ul className="mt-6 space-y-3 text-ink-700">
                <li className="flex gap-3"><span className="text-cash-600">✓</span> Close on your timeline, often in under two weeks</li>
                <li className="flex gap-3"><span className="text-cash-600">✓</span> Sell as-is — no repairs, no cleaning, no staging</li>
                <li className="flex gap-3"><span className="text-cash-600">✓</span> Your offer is locked in before investors ever bid</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-ink-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Here&apos;s the math behind every offer
                </h2>
                <p className="mt-4 text-lg text-ink-300">
                  Your offer is calculated transparently, and it&apos;s the <strong className="text-white">lower</strong> of
                  two numbers — so you&apos;re always protected on the downside, and the competitive auction only
                  helps you capture more upside.
                </p>
                <dl className="mt-8 space-y-6">
                  <div>
                    <dt className="font-semibold text-white">Option A — Flip Math</dt>
                    <dd className="text-ink-300">After Repair Value (ARV) minus estimated rehab cost</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-white">Option B — Market Safeguard</dt>
                    <dd className="text-ink-300">80% of your home&apos;s Zillow Estimate (a 20% market discount cap)</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl bg-ink-800 p-8">
                <h3 className="text-sm font-semibold text-ink-300">Example Offer Calculation</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between text-ink-300">
                    <span>After Repair Value</span>
                    <span className="text-white">$410,000</span>
                  </div>
                  <div className="flex justify-between text-ink-300">
                    <span>− Rehab Cost</span>
                    <span className="text-white">$62,000</span>
                  </div>
                  <div className="flex justify-between border-t border-ink-700 pt-3 font-semibold text-white">
                    <span>= Flip Math Offer</span>
                    <span>$348,000</span>
                  </div>
                  <div className="flex justify-between pt-4 text-ink-300">
                    <span>Zillow Estimate × 80%</span>
                    <span className="text-white">$318,800</span>
                  </div>
                  <div className="mt-4 flex justify-between rounded-lg bg-cash-500/10 p-4 text-base font-bold text-cash-400">
                    <span>Your Guaranteed Offer</span>
                    <span>$318,800</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ----- Investor-focused lower portion, mirroring the seller section above ----- */}

        <section className="relative overflow-hidden bg-ink-950">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-400">
                FOR INVESTORS
              </span>
              <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Off-market deal flow, <span className="text-brand-400">matched to your buy box</span>
              </h2>
              <p className="mt-5 max-w-xl text-lg text-ink-300">
                Stop scrolling listing sites. We pre-vet sellers, pre-calculate deal economics, and push matched
                deals straight to you — then let you win them in a transparent live auction.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="rounded-xl bg-brand-600 px-6 py-4 text-base font-semibold text-white shadow-sm hover:bg-brand-500"
                >
                  Create Investor Account →
                </Link>
                <Link
                  href="/investors"
                  className="rounded-xl border border-ink-700 px-6 py-4 text-base font-semibold text-white hover:bg-ink-900"
                >
                  See how it works
                </Link>
              </div>
            </div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="/images/investor-closing-deal.jpg"
                alt="Investors closing on a matched deal"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">How investing works</h2>
            <p className="mt-4 text-lg text-ink-600">Three steps between you and a matched, vetted deal.</p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3">
            {investorSteps.map((step, i) => (
              <div key={step.title} className="relative rounded-2xl border border-ink-100 p-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-bold text-ink-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-600">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 rounded-3xl border border-ink-100 bg-white p-10 shadow-sm sm:p-16 lg:grid-cols-2 lg:gap-10">
            <div className="rounded-2xl bg-brand-600 p-8 text-center sm:p-10 lg:text-left">
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Ready to see your offer?</h2>
              <p className="mt-3 text-brand-100">It takes less than 5 minutes, and there&apos;s zero obligation to accept.</p>
              <Link
                href="/sell"
                className="mt-6 inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-700 shadow-sm hover:bg-brand-50"
              >
                Get My Cash Offer →
              </Link>
            </div>
            <div className="rounded-2xl bg-ink-950 p-8 text-center sm:p-10 lg:text-left">
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Ready to build your buy box?</h2>
              <p className="mt-3 text-ink-300">Free to join. Get matched to live deals the moment they hit the market.</p>
              <Link
                href="/signup"
                className="mt-6 inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold text-ink-900 shadow-sm hover:bg-ink-100"
              >
                Create Investor Account →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
