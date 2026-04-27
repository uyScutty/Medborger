import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-bold text-brand-red text-lg">Medborger</p>
            <p className="mt-2 text-sm text-gray-500">
              Forbered dig til indfødsretsprøven med tryghed og struktur.
            </p>
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-700 mb-3">Indhold</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/practice" className="hover:text-brand-red">Øvelsestilstand</Link></li>
              <li><Link href="/exams" className="hover:text-brand-red">Tidligere prøver</Link></li>
              <li><Link href="/priser" className="hover:text-brand-red">Priser</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-700 mb-3">Juridisk</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/privatlivspolitik" className="hover:text-brand-red">Privatlivspolitik</Link></li>
              <li><Link href="/vilkaar" className="hover:text-brand-red">Vilkår og betingelser</Link></li>
              <li><Link href="/cookies" className="hover:text-brand-red">Cookies</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Medborger. Ikke tilknyttet SIRI eller Udlændinge- og Integrationsministeriet.
        </p>
      </div>
    </footer>
  );
}
