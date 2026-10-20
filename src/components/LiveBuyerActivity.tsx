import { getLiveBuyerStats } from "@/lib/platformStats";
import { formatCurrency } from "@/lib/offer";

function timeAgo(date: Date) {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export async function LiveBuyerActivity() {
  const stats = await getLiveBuyerStats();

  return (
    <div className="rounded-2xl border border-ink-100 bg-white shadow-sm">
      <div className="grid grid-cols-3 divide-x divide-ink-100 border-b border-ink-100">
        <div className="p-5 text-center">
          <p className="text-2xl font-extrabold text-ink-900">{stats.verifiedInvestorCount}+</p>
          <p className="mt-1 text-xs text-ink-500">Verified cash buyers</p>
        </div>
        <div className="p-5 text-center">
          <p className="text-2xl font-extrabold text-brand-600">{stats.liveAuctionCount}</p>
          <p className="mt-1 text-xs text-ink-500">Live auctions right now</p>
        </div>
        <div className="p-5 text-center">
          <p className="text-2xl font-extrabold text-cash-600">{stats.activeBuyBoxCount}</p>
          <p className="mt-1 text-xs text-ink-500">Active buy boxes watching</p>
        </div>
      </div>
      <div className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="live-pulse h-2 w-2 rounded-full bg-cash-500" />
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Live bidding activity</p>
        </div>
        {stats.recentBids.length === 0 ? (
          <p className="text-sm text-ink-400">No bids yet today — but buyers are standing by.</p>
        ) : (
          <ul className="space-y-2.5">
            {stats.recentBids.map((bid) => (
              <li key={bid.id} className="flex items-center justify-between text-sm">
                <span className="text-ink-600">
                  <span className="font-semibold text-ink-900">{bid.investorLabel}</span> bid on a property in{" "}
                  {bid.city}, {bid.state}
                </span>
                <span className="whitespace-nowrap text-right">
                  <span className="font-bold text-ink-900">{formatCurrency(bid.amount)}</span>
                  <span className="ml-2 text-xs text-ink-400">{timeAgo(bid.createdAt)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
