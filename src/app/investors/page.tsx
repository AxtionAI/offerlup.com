import Image from "next/image";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { PropertyShowcase } from "@/components/PropertyShowcase";

const features = [
  {
    title: "Smart Buy Box matching",
    body:
      "Set your target markets by zip, county, or city, plus property type, condition, and price range. We surface deals that actually fit — not a firehose of noise.",
  },
  {
    title: "Transparent bidding",
    body:
      "See the current high bid and bid history in real time. No backroom deals — every investor is bidding on the same live number.",
  },
  {
    title: "Proof of Funds, done once",
    body:
      "Upload your POF once and get verified by our team. Verified investors can bid instantly on any live deal that matches their buy box.",
  },
  {
    title: "One flat fee",
    body:
      "6% of your winning bid, charged only when you win. No subscriptions, no per-lead fees, no hidden costs.",
  },
];

export default function InvestorsPage() {
  return (
    <>
      <PublicHeader />
      <main className="flex-1">
        <section className="bg-ink-950">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-400">
                FOR INVESTORS
              </span>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Off-market deal flow, matched to your buy box
              </h1>
              <p className="mt-5 text-lg text-ink-300">
                Stop scrolling listing sites. OfferLift pre-vets sellers, pre-calculates deal economics, and pushes
                matched deals straight to you — then lets you win them in a transparent live auction.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-500"
                >
                  Create Investor Account
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-ink-700 px-6 py-3 text-sm font-semibold text-white hover:bg-ink-900"
                >
                  Log in
                </Link>
              </div>
            </div>
            <div className="relative hidden aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl lg:block">
              <Image
                src="/images/investor-closing-deal.jpg"
                alt="Investors reviewing and signing a matched property deal"
                fill
                sizes="50vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-ink-100 p-8">
                <h3 className="text-lg font-bold text-ink-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-600">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-cash-100 px-3 py-1 text-xs font-semibold text-cash-700">
              LIVE OPPORTUNITIES
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              Deals in the pipeline right now
            </h2>
            <p className="mt-4 text-lg text-ink-600">
              Build your Smart Buy Box and get matched to deals like these the moment they go live.
            </p>
          </div>
          <div className="mt-12">
            <PropertyShowcase limit={6} />
          </div>
        </section>

        <section className="bg-cream-100 py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-extrabold text-ink-900">The economics, in plain numbers</h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <div className="text-3xl font-extrabold text-ink-900">You win at</div>
                <div className="mt-1 text-sm text-ink-500">your own max bid — never more</div>
              </div>
              <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <div className="text-3xl font-extrabold text-brand-600">+ 6%</div>
                <div className="mt-1 text-sm text-ink-500">platform fee on winning bids only</div>
              </div>
              <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <div className="text-3xl font-extrabold text-cash-600">$0</div>
                <div className="mt-1 text-sm text-ink-500">cost to browse, bid, or lose</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 rounded-3xl bg-ink-900 p-10 text-center sm:p-16 lg:grid-cols-[1.5fr_1fr] lg:text-left">
            <div>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Build your Smart Buy Box today</h2>
              <p className="mt-3 text-lg text-ink-300">Get matched to live deals the moment they hit the market.</p>
            </div>
            <div className="flex items-center justify-center lg:justify-end">
              <Link
                href="/signup"
                className="rounded-xl bg-white px-8 py-4 text-base font-bold text-ink-900 shadow-sm hover:bg-ink-100"
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
