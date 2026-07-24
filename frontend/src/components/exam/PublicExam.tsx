"use client";

import { useCallback, useEffect, useState } from "react";
import { questionsApi } from "@/lib/api/questions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { QuestionCard } from "@/components/question/QuestionCard";
import { LANGUAGES, useLanguage } from "@/lib/language/context";
import type { OfficialExam, Question, SupportedLanguage } from "@/types";
import Link from "next/link";

type State = "intro" | "running" | "complete";

export function PublicExam() {
  const { secondLang, setSecondLang } = useLanguage();

  const [exam, setExam] = useState<OfficialExam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [state, setState] = useState<State>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    questionsApi
      .exams()
      .then((list) => {
        const free = list[0] ?? null;
        if (!free) return undefined;
        setExam(free);
        return questionsApi.examDetail(free.id);
      })
      .then((detail) => {
        if (detail) setQuestions(detail.questions ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAnswer = useCallback(
    async (choiceId: number): Promise<{ is_correct: boolean; question: Question }> => {
      const q = questions[currentIndex];
      const withAnswer = await questionsApi.get(q.id, true);
      const selected = withAnswer.choices.find((c) => c.id === choiceId);
      const is_correct = selected?.is_correct ?? false;
      if (is_correct) setCorrectCount((n) => n + 1);
      return { is_correct, question: withAnswer };
    },
    [questions, currentIndex],
  );

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      setState("complete");
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handleRestart() {
    setCurrentIndex(0);
    setCorrectCount(0);
    setState("intro");
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-gray-400">Indlæser prøve…</div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">Prøven er ikke tilgængelig i øjeblikket.</div>
    );
  }

  /* ── Complete ── */
  if (state === "complete") {
    const pct = Math.round((correctCount / questions.length) * 100);
    const passed = correctCount >= exam.pass_score;
    return (
      <Card className="space-y-6 text-center">
        <p className="text-5xl">{passed ? "🎉" : "📚"}</p>
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {correctCount} / {questions.length} rigtige
          </p>
          <p className="mt-1 text-gray-500">{pct}% korrekt</p>
        </div>
        <Badge variant={passed ? "success" : "danger"} className="mx-auto text-sm px-4 py-1">
          {passed ? "Bestået" : "Ikke bestået"}
        </Badge>
        <p className="text-sm text-gray-500">
          Beståelsesgrænse: {exam.pass_score} ud af {questions.length} spørgsmål
        </p>
        <div className="flex flex-col items-center gap-3 pt-2">
          <Button onClick={handleRestart}>Tag prøven igen</Button>
          <Button variant="ghost" asChild>
            <Link href="/register">Opret konto for at gemme dine fremskridt →</Link>
          </Button>
        </div>
      </Card>
    );
  }

  /* ── Running ── */
  if (state === "running") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-gray-700">{exam.title}</p>
          <ProgressBar value={currentIndex} max={questions.length} color="red" />
        </div>
        <QuestionCard
          question={questions[currentIndex]}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      </div>
    );
  }

  /* ── Intro ── */
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Badge variant="success" className="mb-2">Gratis · ingen konto kræves</Badge>
        <h2 className="mt-2 text-2xl font-extrabold text-gray-900">{exam.title}</h2>
        <p className="mt-2 text-gray-500">
          {questions.length} spørgsmål · bestå med {exam.pass_score}+ rigtige
        </p>
      </div>

      {/* Language picker */}
      <Card className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">Vælg dit modersmål (valgfrit)</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSecondLang(null)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              !secondLang ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Kun dansk
          </button>
          {LANGUAGES.filter((l) => l.code !== "da").map((l) => (
            <button
              key={l.code}
              onClick={() => setSecondLang(l.code as SupportedLanguage)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                secondLang === l.code
                  ? "bg-brand-red text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {l.nativeName}
            </button>
          ))}
        </div>
        {secondLang && (
          <p className="text-xs text-gray-400">
            Spørgsmål vises på dansk +{" "}
            {LANGUAGES.find((l) => l.code === secondLang)?.name ?? secondLang} side om side
          </p>
        )}
      </Card>

      <Button size="lg" onClick={() => setState("running")} className="w-full">
        Start prøven →
      </Button>

      <p className="text-center text-sm text-gray-400">
        <Link href="/register" className="text-brand-red underline">Opret konto</Link>
        {" "}for at gemme fremskridt og få adgang til alle prøver
      </p>
    </div>
  );
}
