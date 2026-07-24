"use client";

import { useAuth } from "@/lib/auth/context";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/Button";
import { LanguageSelector } from "../ui/LanguageSelector";

export function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-red">
          <DanishFlag />
          Medborger
        </Link>

        <nav className="hidden items-center gap-4 sm:flex">
          <LanguageSelector />
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-brand-red transition-colors">Dashboard</Link>
              <Link href="/exams" className="text-sm text-gray-600 hover:text-brand-red transition-colors">Prøver</Link>
              <Link href="/konto" className="text-sm text-gray-600 hover:text-brand-red transition-colors">Konto</Link>
              <Button variant="ghost" size="sm" onClick={() => logout()}>Log ud</Button>
            </>
          ) : (
            <>
              <Link href="/prøve" className="text-sm text-gray-600 hover:text-brand-red transition-colors">Prøv gratis</Link>
              <Link href="/login" className="text-sm text-gray-600 hover:text-brand-red transition-colors">Log ind</Link>
              <Button size="sm" asChild>
                <Link href="/register">Kom i gang</Link>
              </Button>
            </>
          )}
        </nav>

        <button
          className="sm:hidden rounded p-1 text-gray-600 hover:bg-gray-100"
          aria-label="Menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 sm:hidden">
          <nav className="flex flex-col gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <Link href="/exams" className="text-sm" onClick={() => setMenuOpen(false)}>Prøver</Link>
                <Link href="/konto" className="text-sm" onClick={() => setMenuOpen(false)}>Konto</Link>
                <button className="text-left text-sm text-gray-500" onClick={() => logout()}>Log ud</button>
              </>
            ) : (
              <>
                <Link href="/prøve" className="text-sm" onClick={() => setMenuOpen(false)}>Prøv gratis</Link>
                <Link href="/login" className="text-sm" onClick={() => setMenuOpen(false)}>Log ind</Link>
                <Link href="/register" className="text-sm font-medium text-brand-red" onClick={() => setMenuOpen(false)}>Opret konto</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function DanishFlag() {
  return (
    <svg width="24" height="18" viewBox="0 0 28 20" className="rounded-sm">
      <rect width="28" height="20" fill="#C60C30" />
      <rect x="10" width="4" height="20" fill="white" />
      <rect y="8" width="28" height="4" fill="white" />
    </svg>
  );
}
