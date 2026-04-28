import type { Metadata } from "next";

export const metadata: Metadata = { title: "Vilkår og betingelser" };

export default function VilkaarPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">Vilkår og betingelser</h1>
      <p className="mb-6 text-gray-500">Sidst opdateret: {new Date().getFullYear()}</p>

      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Tjenesten</h2>
          <p>Medborger er en læringsplatform til forberedelse til den danske indfødsretsprøve. Vi er ikke tilknyttet SIRI eller Udlændinge- og Integrationsministeriet.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Abonnement</h2>
          <p>Premium-abonnementet fornyes automatisk månedligt eller årligt. Du kan opsige når som helst via din kontoadministration — opsigelsen træder i kraft ved periodens udløb.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Ansvarsfraskrivelse</h2>
          <p>Medborger garanterer ikke at indholdet afspejler det aktuelle eksamensindhold præcist. Brug tjenesten som supplement til officielle studiematerialer.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Kontakt</h2>
          <p>Spørgsmål? Skriv til <a href="mailto:kontakt@medborger.dk" className="text-brand-red underline">kontakt@medborger.dk</a>.</p>
        </section>
      </div>
    </div>
  );
}
