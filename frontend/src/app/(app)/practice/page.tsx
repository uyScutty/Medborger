"use client";

import { useRequireAuth } from "@/lib/auth/context";
import { practiceApi } from "@/lib/api/practice";
import { questionsApi } from "@/lib/api/questions";
import { QuestionCard } from "@/components/question/QuestionCard";
import { ResultsSummary } from "@/components/exam/ResultsSummary";
import { ExamTimer } from "@/components/exam/ExamTimer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Category, ExamAttempt, ExamMode, Question } from "@/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type State = "setup" | "running" | "complete";

export default function PracticePage() {
  const user = useRequireAuth();
  const searchParams = useSearchParams();
  const defaultMode = (searchParams.get("mode") ?? "practice") as ExamMode;

  const [state, setState] = useState<State>("setup");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [mode, setMode] = useState<ExamMode>(defaultMode);
  const [numQuestions, setNumQuestions] = useState(20);

  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [questionIds, setQuestionIds] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  useEffect(() => {
    questionsApi.categories().then(setCategories).catch(() => {});
  }, []);

  const loadQuestion = useCallback(async (id: number) => {
    setLoadingQuestion(true);
    try {
      const q = await questionsApi.get(id);
      setCurrentQuestion(q);
    } finally {
      setLoadingQuestion(false);
    }
  }, []);

  useEffect(() => {
    if (state === "running" && questionIds[currentIndex]) {
      loadQuestion(questionIds[currentIndex]);
    }
  }, [state, currentIndex, questionIds, loadQuestion]);

  async function handleStart() {
    const res = await practiceApi.start({
      mode,
      category_slugs: selectedCats.length > 0 ? selectedCats : undefined,
      num_questions: mode === "mock_exam" ? 40 : numQuestions,
    });
    setAttempt(res);
    setQuestionIds(res.question_ids);
    setCurrentIndex(0);
    setState("running");
  }

  async function handleAnswer(choiceId: number) {
    return practiceApi.submitAnswer(attempt!.id, {
      question_id: currentQuestion!.id,
      choice_id: choiceId,
    });
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

  function handleRetry() {
    setAttempt(null);
    setQuestionIds([]);
    setCurrentIndex(0);
    setCurrentQuestion(null);
    setState("setup");
  }

  if (!user) return null;

  if (state === "complete" && attempt) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <ResultsSummary attempt={attempt} onRetry={handleRetry} />
      </div>
    );
  }

  if (state === "running") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <ProgressBar value={currentIndex} max={questionIds.length} color="red" />
          {mode === "mock_exam" && (
            <ExamTimer totalMinutes={45} onTimeUp={handleTimeUp} />
          )}
        </div>
        {loadingQuestion || !currentQuestion ? (
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
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Øvelse</h1>
      <p className="mb-8 text-gray-500">Vælg dine indstillinger og start.</p>

      <div className="space-y-6">
        {/* Mode */}
        <div>
          <p className="mb-3 text-sm font-medium text-gray-700">Tilstand</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {([["practice", "📝", "Øvelse", "Svar i dit eget tempo med forklaringer"],
               ["mock_exam", "⏱️", "Prøveeksamen", "40 spørgsmål · 45 min · Ingen hints"]] as const).map(([val, icon, label, desc]) => (
              <button
                key={val}
                onClick={() => setMode(val)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${mode === val ? "border-brand-red bg-brand-red-light" : "border-gray-200 bg-white hover:border-gray-300"}`}
              >
                <p className="font-semibold text-sm">{icon} {label}</p>
                <p className="mt-1 text-xs text-gray-500">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        {mode === "practice" && (
          <div>
            <p className="mb-3 text-sm font-medium text-gray-700">Kategorier <span className="text-gray-400">(alle hvis ingen er valgt)</span></p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const selected = selectedCats.includes(cat.slug);
                return (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCats((prev) => selected ? prev.filter((s) => s !== cat.slug) : [...prev, cat.slug])}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${selected ? "border-brand-red bg-brand-red text-white" : "border-gray-200 bg-white text-gray-600 hover:border-brand-red"}`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode === "practice" && (
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Antal spørgsmål: <strong>{numQuestions}</strong></p>
            <input
              type="range"
              min={5}
              max={40}
              step={5}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full accent-brand-red"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5</span><span>40</span>
            </div>
          </div>
        )}

        {!user.is_premium && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Du er på gratisplanen. Kun gratis spørgsmål inkluderes.{" "}
            <Link href="/priser" className="underline font-medium">Opgradér for fuld adgang.</Link>
          </div>
        )}

        <Button size="lg" className="w-full" onClick={handleStart}>
          Start {mode === "mock_exam" ? "prøveeksamen" : "øvelse"} →
        </Button>
      </div>
    </div>
  );
}
