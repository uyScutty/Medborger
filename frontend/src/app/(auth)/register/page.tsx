"use client";

import { authApi } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const { refresh } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "", password2: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await authApi.register(form);
      await refresh();
      router.push("/dashboard");
    } catch (err: unknown) {
      const data = (err as { data?: Record<string, string | string[]> }).data ?? {};
      const mapped: Record<string, string> = {};
      for (const [k, v] of Object.entries(data)) {
        mapped[k] = Array.isArray(v) ? v[0] : (v as string);
      }
      setErrors(mapped);
    } finally {
      setLoading(false);
    }
  }

  const field = (id: keyof typeof form, label: string, type = "text", autocomplete = id) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        id={id}
        type={type}
        autoComplete={autocomplete}
        required
        value={form[id]}
        onChange={(e) => set(id, e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
      />
      {errors[id] && <p className="mt-1 text-xs text-red-600">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Opret din konto</h1>
          <p className="mt-2 text-gray-500">Gratis for altid — ingen kreditkort kræves</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {errors.non_field_errors && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {errors.non_field_errors}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {field("first_name", "Fornavn", "text", "given-name")}
              {field("last_name", "Efternavn", "text", "family-name")}
            </div>
            {field("email", "Email", "email", "email")}
            {field("password", "Adgangskode (min. 10 tegn)", "password", "new-password")}
            {field("password2", "Bekræft adgangskode", "password", "new-password")}

            <p className="text-xs text-gray-400">
              Ved at oprette en konto accepterer du vores{" "}
              <Link href="/vilkaar" className="underline">vilkår</Link> og{" "}
              <Link href="/privatlivspolitik" className="underline">privatlivspolitik</Link>.
            </p>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Opret konto
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Har du allerede en konto?{" "}
            <Link href="/login" className="font-medium text-brand-red hover:underline">Log ind</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
