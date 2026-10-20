import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { LiveBuyerActivity } from "@/components/LiveBuyerActivity";
import { NetProceedsCalculator } from "@/components/NetProceedsCalculator";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const advantages = [
  {
    title: "No repairs, ever",
    cash: "Sell exactly as-is — leaky roof, dated kitchen, code violations, doesn't matter.",
    retail: "Buyers (and their inspectors) expect repairs or price concessions before closing.",
  },
  {
    title: "No showings or open houses",
    cash: "One visit from our team, then you're done. No strangers walking through your home.",
    retail: "Weeks of scheduling around showings, open houses, and last-minute requests.",
  },
  {
    title: "No financing risk",
    cash: "Every buyer on our platform has verified Proof of Funds before they can bid — cash, no loan to fall through.",
    retail: "Roughly 1 in 20 retail deals fall through after a buyer's financing falls apart, sending you back to square one.",
  },
  {
    title: "You pick the close date",
    cash: "Close in as little as 7-11 days, or push it out — your timeline, not a buyer's.",
    retail: "Tied to the buyer's lender, appraisal, and underwriting timeline — often 30-45+ days.",
  },
  {
    title: "Zero commission",
    cash: "0% — our 6% platform fee is paid by the winning investor, never by you.",
    retail: "Typically 5-6% of the sale price split between listing and buyer's agents.",
  },
  {
    title: "A guaranteed number",
    cash: "Your offer is locked in before investors ever bid — it only has room to move up, never down.",
    retail: "The agreed price can be renegotiated after inspection or a low appraisal.",
  },
];

export default async function ComparePage() {
  const session = await getSession();
  let defaultCashOffer: number | undefined;

  if (session?.role === "SELLER") {
    const latest = await prisma.property.findFirst({
      where: { sellerId: session.userId, offerPrice: { not: null } },
      orderBy: { createdAt: "desc" },
      select: { offerPrice: true },
    });
    defaultCashOffer = latest?.offerPrice ?? undefined;
  }

  return (
    <>
      <PublicHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-brand-50 via-cream-50 to-cream-50 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-cash-100 px-3 py-1 text-xs font-semibold text-cash-700">
              REAL BUYERS, REAL NUMBERS
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl">
              Cash offer vs. listing with an agent
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-600">
              See exactly who&apos;s buying right now, run your own numbers, and decide for yourself — no pressure,
              just the real math.
            </p>
          </div>
        </section>

        <section className="mx-auto -mt-10 max-w-5xl px-4 sm:px-6 lg:px-8">
          <LiveBuyerActivity />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">Run your own numbers</h2>
            <p className="mt-4 text-lg text-ink-600">
              Adjust any field — these are starting estimates, not your actual figures.
            </p>
          </div>
          <div className="mt-10">
            <NetProceedsCalculator defaultCashOffer={defaultCashOffer} />
          </div>
        </section>

        <section className="bg-ink-950 py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                What you&apos;re really trading off
              </h2>
              <p className="mt-4 text-lg text-ink-300">
                A cash offer usually means a lower top-line number than a perfect retail sale — in exchange for
                certainty, speed, and zero hassle. Here&apos;s the honest comparison.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {advantages.map((a) => (
                <div key={a.title} className="rounded-2xl bg-ink-900 p-6">
                  <h3 className="font-bold text-white">{a.title}</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <p className="flex gap-2 text-cash-400">
                      <span>✓</span>
                      <span>{a.cash}</span>
                    </p>
                    <p className="flex gap-2 text-ink-400">
                      <span>✕</span>
                      <span>{a.retail}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 rounded-3xl bg-brand-600 p-10 text-center sm:p-16">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">See your real guaranteed offer</h2>
            <p className="mx-auto max-w-xl text-lg text-brand-100">
              It takes less than 5 minutes, and there&apos;s zero obligation to accept.
            </p>
            <div className="flex justify-center">
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
