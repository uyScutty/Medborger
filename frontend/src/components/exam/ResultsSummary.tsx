import type { ExamAttempt } from "@/types";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ProgressBar } from "../ui/ProgressBar";
import Link from "next/link";

interface ResultsSummaryProps {
  attempt: ExamAttempt;
  onRetry?: () => void;
}

export function ResultsSummary({ attempt, onRetry }: ResultsSummaryProps) {
  const passScore = 32;
  const score = attempt.score ?? 0;
  const total = attempt.total_questions;
  const passed = attempt.passed;
  const pct = attempt.score_percentage ?? 0;

  return (
    <Card className="space-y-6 text-center">
      <div className={`inline-flex h-20 w-20 mx-auto items-center justify-center rounded-full text-4xl ${passed ? "bg-green-100" : "bg-red-100"}`}>
        {passed ? "🎉" : "📖"}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {passed ? "Tillykke — Du bestod!" : "Ikke bestået — prøv igen"}
        </h2>
        <p className="mt-1 text-gray-500">
          {passed
            ? "Du er godt på vej mod dansk statsborgerskab."
            : `Du skal bruge mindst ${passScore} rigtige svar for at bestå.`}
        </p>
      </div>

      <div className="rounded-xl bg-gray-50 p-6 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Rigtige svar</span>
          <span className="font-semibold text-gray-900">{score} / {total}</span>
        </div>
        <ProgressBar
          value={score}
          max={total}
          color={passed ? "green" : "red"}
          showValue
        />
        {attempt.duration_seconds && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tid brugt</span>
            <span className="font-semibold text-gray-900">
              {Math.floor(attempt.duration_seconds / 60)}m {attempt.duration_seconds % 60}s
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild variant="secondary">
          <Link href={`/practice/resultater/${attempt.id}`}>Se alle svar</Link>
        </Button>
        {onRetry && <Button onClick={onRetry}>Prøv igen</Button>}
        <Button asChild variant="ghost">
          <Link href="/dashboard">Tilbage til dashboard</Link>
        </Button>
      </div>
    </Card>
  );
}
