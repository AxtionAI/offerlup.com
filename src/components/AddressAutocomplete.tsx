"use client";

import { useEffect, useId, useRef, useState } from "react";

type Suggestion = {
  placeId: string;
  text: string;
  mainText: string;
  secondaryText: string;
};

type ParsedAddress = {
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  county: string;
};

export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: ParsedAddress) => void;
  placeholder?: string;
  className: string;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [loading, setLoading] = useState(false);
  const sessionTokenRef = useRef<string>(crypto.randomUUID());
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listboxId = useId();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInputChange(next: string) {
    onChange(next);
    setHighlighted(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (next.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/places/autocomplete?input=${encodeURIComponent(next)}&sessionToken=${sessionTokenRef.current}`
        );
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
        setOpen((data.suggestions ?? []).length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  async function selectSuggestion(s: Suggestion) {
    setOpen(false);
    onChange(s.mainText || s.text);
    try {
      const res = await fetch(
        `/api/places/details?placeId=${encodeURIComponent(s.placeId)}&sessionToken=${sessionTokenRef.current}`
      );
      const data = await res.json();
      if (data.address) {
        onAddressSelect(data.address);
      }
    } catch {
      // Keep the typed text if details lookup fails; the seller can still fill the rest manually.
    } finally {
      sessionTokenRef.current = crypto.randomUUID();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(suggestions.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      if (highlighted >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[highlighted]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <input
        className={className}
        value={value}
        placeholder={placeholder}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={listboxId}
      />
      {loading && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-400">…</span>
      )}
      {open && suggestions.length > 0 && (
        <ul id={listboxId} role="listbox" className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-ink-200 bg-white shadow-lg">
          {suggestions.map((s, i) => (
            <li key={s.placeId} role="option" aria-selected={i === highlighted}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(s)}
                className={`block w-full px-3.5 py-2.5 text-left text-sm ${
                  i === highlighted ? "bg-brand-50" : "hover:bg-ink-50"
                }`}
              >
                <span className="font-medium text-ink-900">{s.mainText}</span>
                {s.secondaryText && <span className="ml-1 text-ink-500">{s.secondaryText}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
