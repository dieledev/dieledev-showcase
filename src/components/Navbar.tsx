"use client";

import Link from "next/link";
import { useState } from "react";
import { NavItem } from "@/lib/types";

export function Navbar({
  items,
  brandName = "dieledev",
}: {
  items: NavItem[];
  brandName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 bg-black/70 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-violet-500 hover:text-violet-400 transition-colors"
        >
          {brandName}
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="text-[13px] font-medium uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden relative w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {open ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-black/95 border-t border-white/[0.06] animate-fade-in">
          <div className="px-6 py-4 space-y-1">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-sm font-medium uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
