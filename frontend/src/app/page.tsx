import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

const features = [
  {
    icon: "📝",
    title: "Øvelsesopgaver",
    description: "Træn med hundredvis af spørgsmål fra alle kategorier. Få forklaringer til hvert svar, så du forstår — ikke bare husker.",
  },
  {
    icon: "📋",
    title: "Tidligere prøver",
    description: "Løs alle tidligere officielle indfødsretsprøver under realistiske betingelser med tidtagning og bedømmelse.",
  },
  {
    icon: "📊",
    title: "Fremskridtsovervågning",
    description: "Se dine stærke og svage kategorier på ét overblik, og fokusér din studietid der, hvor det tæller.",
  },
  {
    icon: "⏱️",
    title: "Prøveeksamen",
    description: "Simulér den rigtige prøve: 40 spørgsmål, 45 minutter, og bestå med mindst 32 rigtige.",
  },
];

const categories = [
  { icon: "🏰", name: "Danmarks Historie" },
  { icon: "🤝", name: "Det danske samfund" },
  { icon: "🗳️", name: "Demokrati & Rettigheder" },
  { icon: "🎭", name: "Dansk kultur" },
  { icon: "🏡", name: "Hverdagsliv i Danmark" },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-white via-brand-red-light to-white py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-red/20 bg-white px-4 py-1.5 text-sm text-brand-red shadow-sm">
            <span>🇩🇰</span> Forberedelse til indfødsretsprøven
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
            Bestå prøven med{" "}
            <span className="text-brand-red">selvtillid</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 leading-relaxed">
            Medborger hjælper dig med at forberede dig til den danske indfødsretsprøve med strukturerede øvelser,
            alle tidligere prøver og forklaringer, der giver rigtig forståelse.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Start gratis i dag</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link href="#priser">Se priserne</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-gray-400">Ingen kreditkort kræves. Gratis for altid.</p>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900">5 emneområder at mestre</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <span key={cat.name} className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                {cat.icon} {cat.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Alt du behøver for at klare prøven</h2>
            <p className="mt-3 text-gray-500">Bygget specifikt til indfødsretsprøven — ingen unødvendige distraktioner.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Card key={f.title} className="space-y-3">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="priser" className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Enkle, ærlige priser</h2>
            <p className="mt-3 text-gray-500">Start gratis — opgrader kun når du er klar.</p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {/* Free */}
            <Card className="space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Gratis</p>
                <p className="mt-1 text-4xl font-bold text-gray-900">0 kr</p>
                <p className="mt-1 text-sm text-gray-400">for evigt</p>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                {["10 øvelsesopgaver pr. dag", "1 tidligere officiel prøve", "Grundlæggende statistik"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> {item}
                  </li>
                ))}
              </ul>
              <Button variant="ghost" size="lg" className="w-full" asChild>
                <Link href="/register">Kom i gang</Link>
              </Button>
            </Card>

            {/* Premium */}
            <Card className="space-y-5 border-brand-red ring-2 ring-brand-red">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-wide text-brand-red">Premium</p>
                  <span className="rounded-full bg-brand-red px-2.5 py-0.5 text-xs font-semibold text-white">Anbefalet</span>
                </div>
                <p className="mt-1 text-4xl font-bold text-gray-900">79 kr</p>
                <p className="mt-1 text-sm text-gray-400">pr. måned — eller 499 kr/år</p>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  "Ubegrænset øvelse med alle spørgsmål",
                  "Alle tidligere prøver",
                  "Detaljerede forklaringer",
                  "Tidstagning og prøveeksamen",
                  "Fremskridtsanalyse per kategori",
                  "Personlige anbefalinger",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-brand-red">✓</span> {item}
                  </li>
                ))}
              </ul>
              <Button size="lg" className="w-full" asChild>
                <Link href="/register">Prøv 7 dage gratis</Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-red py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-white">Klar til at tage det næste skridt?</h2>
          <p className="mt-3 text-brand-red-light opacity-90">
            Tilmeld dig gratis og start øve dig i dag. Over tusinde spørgsmål venter.
          </p>
          <Button size="lg" variant="secondary" className="mt-8 bg-white text-brand-red hover:bg-gray-50" asChild>
            <Link href="/register">Opret gratis konto →</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
