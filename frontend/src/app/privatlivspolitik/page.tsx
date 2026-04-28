import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privatlivspolitik" };

export default function PrivatlivspolitikPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">Privatlivspolitik</h1>
      <p className="mb-6 text-gray-500">Sidst opdateret: {new Date().getFullYear()}</p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Hvilke data vi indsamler</h2>
          <p>Vi indsamler din email-adresse og navn ved oprettelse af konto, samt data om din brug af tjenesten (besvarede spørgsmål, resultater).</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Formål</h2>
          <p>Data bruges udelukkende til at levere og forbedre tjenesten, herunder fremskridtsovervågning og tilpasning af øvelsesindhold.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Tredjeparter</h2>
          <p>Vi bruger Stripe til betalingshåndtering. Betalingsoplysninger deles aldrig med os direkte. Se <a href="https://stripe.com/privacy" className="text-brand-red underline" target="_blank" rel="noopener noreferrer">Stripes privatlivspolitik</a>.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Sletning af data</h2>
          <p>Du kan til enhver tid anmode om sletning af din konto og data ved at kontakte os.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Kontakt</h2>
          <p>Spørgsmål? Skriv til <a href="mailto:kontakt@medborger.dk" className="text-brand-red underline">kontakt@medborger.dk</a>.</p>
        </section>
      </div>
    </div>
  );
}
