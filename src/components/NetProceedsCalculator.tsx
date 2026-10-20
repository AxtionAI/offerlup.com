"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/offer";

export function NetProceedsCalculator({ defaultCashOffer }: { defaultCashOffer?: number }) {
  const [listPrice, setListPrice] = useState(defaultCashOffer ? String(Math.round(defaultCashOffer * 1.15)) : "400000");
  const [commissionPct, setCommissionPct] = useState("6");
  const [closingCostPct, setClosingCostPct] = useState("2");
  const [repairCost, setRepairCost] = useState("15000");
  const [daysOnMarket, setDaysOnMarket] = useState("75");
  const [dailyHoldingCost, setDailyHoldingCost] = useState("55");
  const [cashOffer, setCashOffer] = useState(defaultCashOffer ? String(Math.round(defaultCashOffer)) : "320000");

  const result = useMemo(() => {
    const list = Number(listPrice) || 0;
    const commission = list * ((Number(commissionPct) || 0) / 100);
    const closingCosts = list * ((Number(closingCostPct) || 0) / 100);
    const repairs = Number(repairCost) || 0;
    const holding = (Number(daysOnMarket) || 0) * (Number(dailyHoldingCost) || 0);
    const retailNet = list - commission - closingCosts - repairs - holding;

    const cash = Number(cashOffer) || 0;

    return {
      commission,
      closingCosts,
      repairs,
      holding,
      retailNet,
      cashNet: cash,
      difference: cash - retailNet,
    };
  }, [listPrice, commissionPct, closingCostPct, repairCost, daysOnMarket, dailyHoldingCost, cashOffer]);

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-ink-500">If you list traditionally</h3>
          <div className="mt-4 space-y-4">
            <Field label="Expected listing price">
              <MoneyInput value={listPrice} onChange={setListPrice} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Agent commission (%)">
                <input type="number" value={commissionPct} onChange={(e) => setCommissionPct(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Closing costs (%)">
                <input type="number" value={closingCostPct} onChange={(e) => setClosingCostPct(e.target.value)} className={inputCls} />
              </Field>
            </div>
            <Field label="Repairs needed to list">
              <MoneyInput value={repairCost} onChange={setRepairCost} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Est. days on market">
                <input type="number" value={daysOnMarket} onChange={(e) => setDaysOnMarket(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Daily holding cost">
                <MoneyInput value={dailyHoldingCost} onChange={setDailyHoldingCost} />
              </Field>
            </div>
          </div>

          <div className="mt-6 space-y-2 rounded-xl bg-ink-50 p-4 text-sm">
            <Row label="Listing price" value={formatCurrency(Number(listPrice) || 0)} />
            <Row label="− Agent commission" value={`− ${formatCurrency(result.commission)}`} />
            <Row label="− Closing costs" value={`− ${formatCurrency(result.closingCosts)}`} />
            <Row label="− Repairs to list" value={`− ${formatCurrency(result.repairs)}`} />
            <Row label="− Holding costs while listed" value={`− ${formatCurrency(result.holding)}`} />
            <div className="border-t border-ink-200 pt-2">
              <Row label="Estimated net proceeds" value={formatCurrency(result.retailNet)} bold />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-cash-700">If you sell for cash with us</h3>
          <div className="mt-4">
            <Field label="Your guaranteed cash offer">
              <MoneyInput value={cashOffer} onChange={setCashOffer} />
            </Field>
            <p className="mt-2 text-xs text-ink-400">
              Pulled from your submission when available — adjust to compare any offer amount.
            </p>
          </div>

          <div className="mt-6 space-y-2 rounded-xl bg-cash-50 p-4 text-sm">
            <Row label="Guaranteed offer" value={formatCurrency(result.cashNet)} />
            <Row label="Repairs you pay for" value={formatCurrency(0)} />
            <Row label="Commission you pay" value={formatCurrency(0)} />
            <Row label="Typical time to close" value="~11 days" />
            <div className="border-t border-cash-200 pt-2">
              <Row label="Your net proceeds" value={formatCurrency(result.cashNet)} bold accent="cash" />
            </div>
          </div>

          <div
            className={`mt-6 rounded-xl p-4 text-center ${
              result.difference >= 0 ? "bg-cash-100" : "bg-ink-100"
            }`}
          >
            <p className="text-xs font-semibold text-ink-600">
              {result.difference >= 0 ? "Selling for cash nets you" : "Listing traditionally nets you about"}
            </p>
            <p className={`text-2xl font-extrabold ${result.difference >= 0 ? "text-cash-700" : "text-ink-900"}`}>
              {formatCurrency(Math.abs(result.difference))} {result.difference >= 0 ? "more" : "more, on paper"}
            </p>
            <p className="mt-1 text-xs text-ink-500">
              {result.difference >= 0
                ? "— without the repair bills, showings, financing risk, or months of waiting."
                : "— but that assumes no financing fall-through, no re-negotiation after inspection, and selling in exactly the time estimated above."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

function MoneyInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">$</span>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} pl-6`} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-600">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: "cash" }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "font-semibold text-ink-900" : "text-ink-500"}>{label}</span>
      <span className={`${bold ? "text-base font-extrabold" : "font-medium"} ${accent === "cash" ? "text-cash-700" : "text-ink-900"}`}>
        {value}
      </span>
    </div>
  );
}
