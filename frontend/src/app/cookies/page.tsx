import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cookiepolitik" };

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">Cookiepolitik</h1>
      <p className="mb-6 text-gray-500">Sidst opdateret: {new Date().getFullYear()}</p>

      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Hvad er cookies?</h2>
          <p>Cookies er små tekstfiler der gemmes i din browser. Vi bruger kun nødvendige cookies.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Cookies vi bruger</h2>
          <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Navn</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Formål</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Varighed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">access_token</td>
                  <td className="px-4 py-2">Godkendelse (login)</td>
                  <td className="px-4 py-2">15 minutter</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">refresh_token</td>
                  <td className="px-4 py-2">Fornyelse af login</td>
                  <td className="px-4 py-2">7 dage</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-gray-500">Begge cookies er HttpOnly og kan ikke tilgås af scripts — de bruges udelukkende til sikker godkendelse.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Tredjeparts cookies</h2>
          <p>Stripe kan sætte cookies i forbindelse med betaling. Se <a href="https://stripe.com/cookie-settings" className="text-brand-red underline" target="_blank" rel="noopener noreferrer">Stripes cookiepolitik</a>.</p>
        </section>
      </div>
    </div>
  );
}
