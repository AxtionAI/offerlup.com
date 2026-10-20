import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

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
              <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-xl">
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

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 rounded-3xl bg-brand-600 p-10 text-center sm:p-16 lg:grid-cols-[1.5fr_1fr] lg:text-left">
            <div>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Ready to see your offer?</h2>
              <p className="mt-3 text-lg text-brand-100">
                It takes less than 5 minutes, and there&apos;s zero obligation to accept.
              </p>
            </div>
            <div className="flex items-center justify-center lg:justify-end">
              <Link
                href="/sell"
                className="rounded-xl bg-white px-8 py-4 text-base font-bold text-brand-700 shadow-sm hover:bg-brand-50"
              >
                Get My Cash Offer →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
