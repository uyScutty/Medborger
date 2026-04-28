"use client";

import { useRequireAuth } from "@/lib/auth/context";
import { questionsApi } from "@/lib/api/questions";
import { practiceApi } from "@/lib/api/practice";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ResultsSummary } from "@/components/exam/ResultsSummary";
import { ExamTimer } from "@/components/exam/ExamTimer";
import { QuestionCard } from "@/components/question/QuestionCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { ExamAttempt, OfficialExam, Question } from "@/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type State = "list" | "running" | "complete";

const monthName: Record<number, string> = {
  1: "Januar", 2: "Februar", 3: "Marts", 4: "April",
  5: "Maj", 6: "Juni", 7: "Juli", 8: "August",
  9: "September", 10: "Oktober", 11: "November", 12: "December",
};

export default function ExamsPage() {
  const user = useRequireAuth();
  const [exams, setExams] = useState<OfficialExam[]>([]);
  const [state, setState] = useState<State>("list");
  const [selectedExam, setSelectedExam] = useState<OfficialExam | null>(null);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [questionIds, setQuestionIds] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  useEffect(() => {
    questionsApi.exams().then(setExams).catch(() => {});
  }, []);

  const loadQuestion = useCallback(async (id: number) => {
    const q = await questionsApi.get(id);
    setCurrentQuestion(q);
  }, []);

  useEffect(() => {
    if (state === "running" && questionIds[currentIndex]) {
      loadQuestion(questionIds[currentIndex]);
    }
  }, [state, currentIndex, questionIds, loadQuestion]);

  async function handleStart(exam: OfficialExam) {
    setSelectedExam(exam);
    const res = await practiceApi.start({ mode: "official_exam", official_exam_id: exam.id });
    setAttempt(res);
    setQuestionIds(res.question_ids);
    setCurrentIndex(0);
    setState("running");
  }

  async function handleAnswer(choiceId: number) {
    return practiceApi.submitAnswer(attempt!.id, { question_id: currentQuestion!.id, choice_id: choiceId });
  }

  async function handleNext() {
    if (currentIndex + 1 >= questionIds.length) {
      const completed = await practiceApi.complete(attempt!.id);
      setAttempt(completed);
      setState("complete");
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  async function handleTimeUp() {
    const completed = await practiceApi.complete(attempt!.id);
    setAttempt(completed);
    setState("complete");
  }

  if (!user) return null;

  if (state === "complete" && attempt) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <ResultsSummary attempt={attempt} onRetry={() => setState("list")} />
      </div>
    );
  }

  if (state === "running") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-gray-700">{selectedExam?.title}</p>
          <div className="flex items-center gap-3">
            <ProgressBar value={currentIndex} max={questionIds.length} color="red" />
            <ExamTimer totalMinutes={selectedExam?.total_time_minutes ?? 45} onTimeUp={handleTimeUp} />
          </div>
        </div>
        {!currentQuestion ? (
          <div className="flex h-64 items-center justify-center text-gray-400">Indlæser spørgsmål…</div>
        ) : (
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questionIds.length}
            onAnswer={handleAnswer}
            onNext={handleNext}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tidligere officielle prøver</h1>
        <p className="mt-1 text-gray-500">Løs alle tidligere indfødsretsprøver under realistiske betingelser.</p>
      </div>

      {!user.is_premium && (
        <div className="mb-6 rounded-lg border border-brand-navy/20 bg-brand-navy-light p-4">
          <p className="font-semibold text-brand-navy">Premium-indhold</p>
          <p className="mt-1 text-sm text-brand-navy/80">
            Som Premium-bruger får du adgang til alle tidligere prøver.{" "}
            <Link href="/priser" className="underline font-medium">Opgradér nu →</Link>
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {exams.map((exam) => {
          const locked = !exam.is_free && !user.is_premium;
          return (
            <Card key={exam.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">{exam.title}</p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {monthName[exam.month]} {exam.year} · {exam.question_count} spørgsmål · {exam.total_time_minutes} min
                  </p>
                </div>
                {exam.is_free ? <Badge variant="success">Gratis</Badge> : <Badge variant="premium">Premium</Badge>}
              </div>
              {exam.description && <p className="text-sm text-gray-500">{exam.description}</p>}
              <div className="mt-auto">
                {locked ? (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/priser">Lås op med Premium</Link>
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => handleStart(exam)}>
                    Start prøve →
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
        {exams.length === 0 && (
          <p className="col-span-2 py-12 text-center text-gray-400">Ingen prøver tilgængelige endnu.</p>
        )}
      </div>
    </div>
  );
}
