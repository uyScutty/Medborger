"use client";

import { useRequireAuth } from "@/lib/auth/context";
import { practiceApi } from "@/lib/api/practice";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Progress } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const user = useRequireAuth();
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    practiceApi.progress().then(setProgress).catch(() => {});
  }, []);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hej, {user.display_name} 👋</h1>
          <p className="mt-1 text-gray-500">
            {user.is_premium
              ? "Du har Premium-adgang. Klar til at øve?"
              : "Du er på gratisplanen. Opgradér for ubegrænset adgang."}
          </p>
        </div>
        {!user.is_premium && (
          <Button asChild>
            <Link href="/priser">Opgradér til Premium →</Link>
          </Button>
        )}
      </div>

      {/* Quick actions */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <QuickAction
          icon="📋"
          title="Tag en officiel prøve"
          description="Løs tidligere indfødsretsprøver under realistiske betingelser med timer og bedømmelse"
          href="/exams"
          cta="Gå til prøver"
          highlight
        />
        <QuickAction
          icon="✏️"
          title="Yderligere spørgsmål"
          description="Lav din egen tilpassede øvelse — vælg kategorier og antal spørgsmål"
          href="/exams"
          cta={user.is_premium ? "Start øvelse" : "Lås op med Premium"}
          locked={!user.is_premium}
        />
      </div>

      {/* Stats */}
      {progress && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Samlede forsøg" value={progress.total_attempts} />
          <StatCard label="Prøveeksamener" value={progress.mock_attempts_count} />
          <StatCard label="Besvaret i alt" value={progress.total_answered} />
          <StatCard label="Præcision" value={`${progress.accuracy_percentage}%`} />
        </div>
      )}

      {/* Category performance */}
      {progress && progress.category_performance.length > 0 && (
        <Card>
          <h2 className="mb-4 font-semibold text-gray-900">Præstation per kategori</h2>
          <div className="space-y-4">
            {progress.category_performance.map((cat) => (
              <ProgressBar
                key={cat.category_id}
                value={cat.correct}
                max={cat.total}
                label={`${cat.category_name} (${cat.correct}/${cat.total})`}
                color={cat.percentage >= 80 ? "green" : cat.percentage >= 60 ? "amber" : "red"}
                showValue
              />
            ))}
          </div>
        </Card>
      )}

      {!progress && (
        <Card className="py-12 text-center text-gray-400">
          <p className="text-4xl mb-3">🚀</p>
          <p className="font-medium">Ingen aktivitet endnu</p>
          <p className="text-sm mt-1">Start din første øvelse for at se dine fremskridt her.</p>
        </Card>
      )}
    </div>
  );
}

function QuickAction({
  icon, title, description, href, cta, highlight, locked,
}: {
  icon: string; title: string; description: string; href: string; cta: string; highlight?: boolean; locked?: boolean;
}) {
  return (
    <Card className={`flex flex-col gap-3 ${highlight ? "border-brand-red ring-1 ring-brand-red" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl">{icon}</span>
        {highlight && <Badge variant="danger">Anbefalet</Badge>}
        {locked && <Badge variant="premium">Premium</Badge>}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <div className="mt-auto pt-2">
        <Button
          size="sm"
          variant={highlight ? "primary" : "ghost"}
          className={locked ? "opacity-60 pointer-events-none" : ""}
          asChild
        >
          <Link href={locked ? "/priser" : href}>{locked ? "Lås op" : cta}</Link>
        </Button>
      </div>
    </Card>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card padding="sm" className="text-center">
      <p className="text-3xl font-bold text-brand-red">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </Card>
  );
}
