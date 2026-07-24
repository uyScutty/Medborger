import { PublicExam } from "@/components/exam/PublicExam";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      {/* Hero + Exam */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-10 sm:py-14">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-red/20 bg-white px-4 py-1.5 text-sm text-brand-red shadow-sm">
              <span>🇩🇰</span> Forberedelse til indfødsretsprøven
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Bestå prøven med <span className="text-brand-red">selvtillid</span>
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-base text-gray-500">
              Tag den officielle 2016-eksamen direkte her — vælg dit modersmål og se spørgsmål på to sprog side om side.
            </p>
          </div>

          {/* The exam — this is the main content */}
          <PublicExam />
        </div>
      </section>

      {/* Pricing — short and to the point */}
      <section id="priser" className="border-t border-gray-100 bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Vil du have adgang til mere?</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Free */}
            <Card className="space-y-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Gratis</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">0 kr</p>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  "2016-prøven — ingen konto kræves",
                  "Tosproglig visning (8 sprog)",
                  "Forklaringer og faktaark",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> {item}
                  </li>
                ))}
              </ul>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/register">Opret konto</Link>
              </Button>
            </Card>

            {/* Premium */}
            <Card className="space-y-4 border-brand-red ring-2 ring-brand-red">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-wide text-brand-red">Premium</p>
                  <span className="rounded-full bg-brand-red px-2.5 py-0.5 text-xs font-semibold text-white">Anbefalet</span>
                </div>
                <p className="mt-1 text-3xl font-bold text-gray-900">79 kr</p>
                <p className="text-sm text-gray-400">pr. måned</p>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  "Alle tidligere officielle prøver",
                  "Tilpassede sessioner — vælg kategorier",
                  "Fremskridtsanalyse per kategori",
                  "Tosproglig visning (8 sprog)",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-brand-red">✓</span> {item}
                  </li>
                ))}
              </ul>
              <Button className="w-full" asChild>
                <Link href="/register">Prøv 7 dage gratis</Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
