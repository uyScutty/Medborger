"use client";

import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "Noget gik galt. Prøv igen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Velkommen tilbage</h1>
          <p className="mt-2 text-gray-500">Log ind for at fortsætte din forberedelse</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                placeholder="din@email.dk"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Adgangskode
                </label>
                <Link href="/glemt-adgangskode" className="text-xs text-brand-red hover:underline">
                  Glemt adgangskode?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                placeholder="••••••••••"
              />
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Log ind
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Ingen konto?{" "}
            <Link href="/register" className="font-medium text-brand-red hover:underline">
              Opret gratis konto
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
