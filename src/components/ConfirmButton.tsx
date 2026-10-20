"use client";

import { useEffect, useRef, useState } from "react";

/**
 * window.confirm()/prompt() are unreliable inside embedded browser contexts
 * (they can silently no-op), so destructive actions get an inline two-step
 * confirmation instead of a native dialog.
 */
export function ConfirmButton({
  onConfirm,
  disabled,
  className,
  confirmClassName,
  children,
  confirmLabel = "Confirm?",
}: {
  onConfirm: () => void;
  disabled?: boolean;
  className?: string;
  confirmClassName?: string;
  children: React.ReactNode;
  confirmLabel?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setConfirming(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            onConfirm();
          }}
          className={confirmClassName ?? "rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"}
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          }}
          className="text-sm font-medium text-ink-500 hover:text-ink-700"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        setConfirming(true);
        timeoutRef.current = setTimeout(() => setConfirming(false), 5000);
      }}
      className={className}
    >
      {children}
    </button>
  );
}
