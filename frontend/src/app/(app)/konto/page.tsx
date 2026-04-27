"use client";

import { useAuth, useRequireAuth } from "@/lib/auth/context";
import { paymentsApi } from "@/lib/api/payments";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { useState } from "react";

export default function KontoPage() {
  const user = useRequireAuth();
  const { logout } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);

  async function openPortal() {
    setPortalLoading(true);
    try {
      const { url } = await paymentsApi.portal();
      window.location.href = url;
    } finally {
      setPortalLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Min konto</h1>

      <div className="space-y-6">
        {/* Profile */}
        <Card>
          <h2 className="mb-4 font-semibold text-gray-900">Profiloplysninger</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Navn</dt>
              <dd className="font-medium text-gray-900">{user.display_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-gray-900">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Medlem siden</dt>
              <dd className="font-medium text-gray-900">
                {new Date(user.date_joined).toLocaleDateString("da-DK", { year: "numeric", month: "long", day: "numeric" })}
              </dd>
            </div>
          </dl>
        </Card>

        {/* Subscription */}
        <Card>
          <h2 className="mb-4 font-semibold text-gray-900">Abonnement</h2>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant={user.is_premium ? "premium" : "default"} className="text-sm px-3 py-1">
              {user.is_premium ? "Premium" : "Gratis"}
            </Badge>
            {user.subscription_expires_at && (
              <span className="text-sm text-gray-500">
                Udløber {new Date(user.subscription_expires_at).toLocaleDateString("da-DK")}
              </span>
            )}
          </div>

          {user.is_premium ? (
            <Button variant="ghost" size="sm" onClick={openPortal} loading={portalLoading}>
              Administrer abonnement (fakturaer, annullering)
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Opgradér for ubegrænset adgang til alle spørgsmål, prøver og forklaringer.
              </p>
              <Button asChild>
                <Link href="/priser">Se Premium-planer →</Link>
              </Button>
            </div>
          )}
        </Card>

        {/* Security */}
        <Card>
          <h2 className="mb-4 font-semibold text-gray-900">Sikkerhed</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/konto/skift-adgangskode">Skift adgangskode</Link>
          </Button>
        </Card>

        {/* Danger zone */}
        <Card className="border-red-200">
          <h2 className="mb-4 font-semibold text-red-700">Logout</h2>
          <Button variant="danger" size="sm" onClick={() => logout()}>
            Log ud af alle enheder
          </Button>
        </Card>
      </div>
    </div>
  );
}
