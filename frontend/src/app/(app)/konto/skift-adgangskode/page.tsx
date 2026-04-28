"use client";

import { useRequireAuth } from "@/lib/auth/context";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useState } from "react";

export default function SkiftAdgangskodePage() {
  const user = useRequireAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("De nye adgangskoder matcher ikke.");
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword, confirmPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "Noget gik galt. Prøv igen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/konto" className="text-sm text-gray-500 hover:text-brand-red">← Min konto</Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">Skift adgangskode</h1>

      <Card>
        {success ? (
          <div className="space-y-4 text-center py-4">
            <p className="text-2xl">✓</p>
            <p className="font-medium text-gray-900">Adgangskode opdateret</p>
            <p className="text-sm text-gray-500">Din adgangskode er blevet ændret.</p>
            <Button variant="ghost" asChild>
              <Link href="/konto">Tilbage til konto</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="current" className="block text-sm font-medium text-gray-700 mb-1">
                Nuværende adgangskode
              </label>
              <input
                id="current"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
              />
            </div>

            <div>
              <label htmlFor="new" className="block text-sm font-medium text-gray-700 mb-1">
                Ny adgangskode
              </label>
              <input
                id="new"
                type="password"
                required
                minLength={10}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
                Bekræft ny adgangskode
              </label>
              <input
                id="confirm"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
              />
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Gem ny adgangskode
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
