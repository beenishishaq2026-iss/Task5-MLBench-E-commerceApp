"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SelectDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** shows a red outline + asterisk hint when true and nothing is selected */
  invalid?: boolean;
}

export default function SelectDropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  invalid = false,
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          "flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-left text-sm focus:outline-none " +
          (invalid
            ? "border-red-400"
            : "border-brass/30 focus:border-rust")
        }
      >
        <span className={selected ? "text-ink" : "text-ink/40"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-ink/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-brass/20 bg-white p-1.5 shadow-lg">
          {options.length === 0 && (
            <p className="px-3 py-1.5 text-sm text-ink/40">No options</p>
          )}
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={
                "block w-full rounded-lg px-3 py-1.5 text-left text-sm " +
                (value === opt.value
                  ? "bg-ink text-cream"
                  : "text-ink/70 hover:bg-brass/10")
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}