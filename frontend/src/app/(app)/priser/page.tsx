"use client";

import { useAuth } from "@/lib/auth/context";
import { paymentsApi } from "@/lib/api/payments";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useState } from "react";

const FREE_FEATURES = [
  "10 øvelsesopgaver pr. dag",
  "1 tidligere officiel prøve",
  "Grundlæggende statistik",
];

const PREMIUM_FEATURES = [
  "Ubegrænset øvelse med alle spørgsmål",
  "Alle tidligere prøver",
  "Detaljerede forklaringer til hvert svar",
  "Tidstagning og prøveeksamen",
  "Fremskridtsanalyse per kategori",
  "Personlige anbefalinger",
];

export default function PriserPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);
  const [error, setError] = useState("");

  async function handleCheckout(interval: "monthly" | "yearly") {
    if (!user) return;
    setLoading(interval);
    setError("");
    try {
      const { url } = await paymentsApi.checkout(interval === "monthly" ? 1 : 2);
      window.location.href = url;
    } catch {
      setError("Noget gik galt. Prøv igen eller kontakt support.");
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">Enkle, ærlige priser</h1>
        <p className="mt-3 text-gray-500">Start gratis — opgradér kun når du er klar.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-center">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Free */}
        <Card className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Gratis</p>
            <p className="mt-1 text-4xl font-bold text-gray-900">0 kr</p>
            <p className="mt-1 text-sm text-gray-400">for altid</p>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            {FREE_FEATURES.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-green-500">✓</span> {item}
              </li>
            ))}
          </ul>
          {user ? (
            <Button variant="ghost" size="lg" className="w-full" asChild>
              <Link href="/dashboard">Gå til dashboard</Link>
            </Button>
          ) : (
            <Button variant="ghost" size="lg" className="w-full" asChild>
              <Link href="/register">Opret gratis konto</Link>
            </Button>
          )}
        </Card>

        {/* Premium */}
        <Card className="space-y-5 border-brand-red ring-2 ring-brand-red">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-red">Premium</p>
              <span className="rounded-full bg-brand-red px-2.5 py-0.5 text-xs font-semibold text-white">Anbefalet</span>
            </div>
            <p className="mt-1 text-4xl font-bold text-gray-900">79 kr</p>
            <p className="mt-1 text-sm text-gray-400">pr. måned — eller 499 kr/år (spar 25%)</p>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            {PREMIUM_FEATURES.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-brand-red">✓</span> {item}
              </li>
            ))}
          </ul>

          {user?.is_premium ? (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 text-center">
              Du har allerede Premium ✓
            </div>
          ) : user ? (
            <div className="space-y-2">
              <Button
                size="lg"
                className="w-full"
                loading={loading === "monthly"}
                onClick={() => handleCheckout("monthly")}
              >
                Start med 79 kr/md
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="w-full"
                loading={loading === "yearly"}
                onClick={() => handleCheckout("yearly")}
              >
                Betal 499 kr/år (bedst)
              </Button>
            </div>
          ) : (
            <Button size="lg" className="w-full" asChild>
              <Link href="/register">Prøv 7 dage gratis</Link>
            </Button>
          )}
        </Card>
      </div>

      <p className="mt-8 text-center text-sm text-gray-400">
        Betaling håndteres sikkert via Stripe. Ingen binding — opsig når som helst.
      </p>
    </div>
  );
}
