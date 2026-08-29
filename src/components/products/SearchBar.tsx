"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = "Search products...",
  className = "",
}: SearchBarProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(value);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={
        "flex w-full items-center gap-3 rounded-full border border-brass/30 bg-white px-5 py-3 shadow-sm transition-colors focus-within:border-rust " +
        className
      }
    >
      <Search size={18} className="shrink-0 text-ink/40" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="shrink-0 text-ink/40 transition-colors hover:text-rust"
        >
          <X size={16} />
        </button>
      )}
    </form>
  );
}