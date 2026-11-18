"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-ink-100 bg-white p-8 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            OL
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink-900">OfferLup</span>
        </Link>

        {submitted ? (
          <>
            <h1 className="mt-6 text-2xl font-extrabold text-ink-900">Check your email</h1>
            <p className="mt-2 text-sm text-ink-500">
              If an account exists for <span className="font-semibold text-ink-700">{email}</span>, we&apos;ve sent
              a link to reset your password. It expires in 1 hour.
            </p>
            <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-brand-600">
              ← Back to log in
            </Link>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-2xl font-extrabold text-ink-900">Forgot your password?</h1>
            <p className="mt-1 text-sm text-ink-500">
              Enter the email on your account — seller, investor, or admin — and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink-700">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-500">
              <Link href="/login" className="font-semibold text-brand-600">← Back to log in</Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
