"use client";

import { useRequireAuth } from "@/lib/auth/context";
import { practiceApi } from "@/lib/api/practice";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { AttemptDetail } from "@/types";
import Link from "next/link";
import { use, useEffect, useState } from "react";

export default function ResultaterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user = useRequireAuth();
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    practiceApi
      .attempt(Number(id))
      .then(setAttempt)
      .catch(() => setError("Kunne ikke hente resultater."))
      .finally(() => setLoading(false));
  }, [id]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">Indlæser resultater…</div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="text-gray-500">{error || "Forsøget blev ikke fundet."}</p>
        <Button className="mt-4" asChild variant="ghost">
          <Link href="/dashboard">Tilbage</Link>
        </Button>
      </div>
    );
  }

  const score = attempt.score ?? 0;
  const correct = attempt.answers.filter((a) => a.is_correct).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-brand-red">← Dashboard</Link>
        <span className="text-sm text-gray-500">{correct} / {attempt.total_questions} rigtige</span>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-gray-900">Gennemgang af svar</h1>
      <p className="mb-8 text-gray-500">
        {attempt.passed ? "Du bestod! " : "Du bestod ikke. "}
        Score: {attempt.score_percentage ?? 0}%
      </p>

      <div className="space-y-6">
        {attempt.answers.map((answer, i) => {
          const q = answer.question;
          return (
            <Card key={q.id} className={`space-y-3 border-l-4 ${answer.is_correct ? "border-l-green-400" : "border-l-red-400"}`}>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-lg">{answer.is_correct ? "✓" : "✗"}</span>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">Spørgsmål {i + 1}</p>
                  <p className="font-medium text-gray-900">{q.text}</p>
                </div>
              </div>

              <div className="space-y-1.5 pl-7">
                {q.choices.map((choice) => {
                  const wasChosen = choice.id === answer.chosen_choice_id;
                  const isCorrect = choice.is_correct;
                  let cls = "rounded-lg border px-3 py-2 text-sm ";
                  if (isCorrect) cls += "border-green-300 bg-green-50 text-green-800";
                  else if (wasChosen && !isCorrect) cls += "border-red-300 bg-red-50 text-red-800";
                  else cls += "border-gray-100 bg-gray-50 text-gray-600";

                  return (
                    <div key={choice.id} className={cls}>
                      {wasChosen && !isCorrect && <span className="mr-1">✗</span>}
                      {isCorrect && <span className="mr-1">✓</span>}
                      {choice.text}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className="pl-7 rounded-lg bg-brand-navy-light border border-brand-navy/10 px-3 py-2 text-sm text-brand-navy">
                  <span className="font-medium">Forklaring: </span>{q.explanation}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="mt-8 flex gap-3">
        <Button asChild variant="ghost">
          <Link href="/practice">Øv igen</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
