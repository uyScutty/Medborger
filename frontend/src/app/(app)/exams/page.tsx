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
import type { Category, ExamAttempt, OfficialExam, Question } from "@/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LANGUAGES, useLanguage } from "@/lib/language/context";
import type { SupportedLanguage } from "@/types";

type State = "list" | "running" | "complete";

const monthName: Record<number, string> = {
  1: "Januar", 2: "Februar", 3: "Marts", 4: "April",
  5: "Maj", 6: "Juni", 7: "Juli", 8: "August",
  9: "September", 10: "Oktober", 11: "November", 12: "December",
};

export default function ExamsPage() {
  const user = useRequireAuth();
  const { secondLang, setSecondLang } = useLanguage();

  const [exams, setExams] = useState<OfficialExam[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [numQuestions, setNumQuestions] = useState(20);

  const [state, setState] = useState<State>("list");
  const [sessionTitle, setSessionTitle] = useState("");
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [questionIds, setQuestionIds] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  useEffect(() => {
    questionsApi.exams().then((d) => setExams(Array.isArray(d) ? d : [])).catch(() => {});
    questionsApi.categories().then((d) => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
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

  async function handleStartExam(exam: OfficialExam) {
    setSessionTitle(exam.title);
    setTimerMinutes(exam.total_time_minutes);
    const res = await practiceApi.start({ mode: "official_exam", official_exam_id: exam.id });
    setAttempt(res);
    setQuestionIds(res.question_ids);
    setCurrentIndex(0);
    setState("running");
  }

  async function handleStartCustom() {
    setSessionTitle(`Tilpasset øvelse · ${numQuestions} spørgsmål`);
    setTimerMinutes(null);
    const res = await practiceApi.start({
      mode: "practice",
      category_slugs: selectedCats.length > 0 ? selectedCats : undefined,
      num_questions: numQuestions,
    });
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

  function handleRetry() {
    setAttempt(null);
    setQuestionIds([]);
    setCurrentIndex(0);
    setCurrentQuestion(null);
    setState("list");
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
          <p className="text-sm font-medium text-gray-700">{sessionTitle}</p>
          <div className="flex items-center gap-3">
            <ProgressBar value={currentIndex} max={questionIds.length} color="red" />
            {timerMinutes && (
              <ExamTimer totalMinutes={timerMinutes} onTimeUp={handleTimeUp} />
            )}
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
        <h1 className="text-2xl font-bold text-gray-900">Prøver</h1>
        <p className="mt-1 text-gray-500">Gennemgå officielle prøver eller lav din egen øvelse.</p>
      </div>

      {/* Language selector */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-gray-700">
          Vis spørgsmål på et andet sprog ved siden af dansk
        </p>
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
                secondLang === l.code ? "bg-brand-red text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {l.nativeName}
            </button>
          ))}
        </div>
        {secondLang && (
          <p className="mt-2 text-xs text-gray-400">
            Spørgsmål vises på dansk + {LANGUAGES.find((l) => l.code === secondLang)?.name ?? secondLang}
          </p>
        )}
      </div>

      {/* ── Section 1: Tidligere officielle prøver ── */}
      <div className="mb-10">
        <h2 className="mb-1 text-lg font-bold text-gray-900">Tidligere officielle prøver</h2>
        <p className="mb-4 text-sm text-gray-500">Løs tidligere indfødsretsprøver under realistiske betingelser.</p>

        {!user.is_premium && (
          <div className="mb-4 rounded-lg border border-brand-navy/20 bg-brand-navy-light p-4">
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
                    <Button size="sm" onClick={() => handleStartExam(exam)}>
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

      {/* ── Section 2: Yderligere spørgsmål (premium) ── */}
      <div>
        <div className="mb-1 flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">Yderligere spørgsmål</h2>
          <Badge variant="premium">Premium</Badge>
        </div>
        <p className="mb-4 text-sm text-gray-500">Lav din egen tilpassede øvelse — vælg kategorier og antal spørgsmål.</p>

        {!user.is_premium ? (
          <div className="rounded-lg border border-brand-navy/20 bg-brand-navy-light p-5">
            <p className="font-semibold text-brand-navy">Kun for Premium-brugere</p>
            <p className="mt-1 text-sm text-brand-navy/80">
              Få adgang til ubegrænsede tilpassede øvelser på tværs af alle kategorier.{" "}
              <Link href="/priser" className="underline font-medium">Opgradér nu →</Link>
            </p>
          </div>
        ) : (
          <Card className="space-y-5">
            {/* Category picker */}
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                Kategorier <span className="text-gray-400">(alle hvis ingen er valgt)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const selected = selectedCats.includes(cat.slug);
                  return (
                    <button
                      key={cat.slug}
                      onClick={() =>
                        setSelectedCats((prev) =>
                          selected ? prev.filter((s) => s !== cat.slug) : [...prev, cat.slug]
                        )
                      }
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        selected
                          ? "border-brand-red bg-brand-red text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:border-brand-red"
                      }`}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question count */}
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                Antal spørgsmål: <strong>{numQuestions}</strong>
              </p>
              <input
                type="range"
                min={5}
                max={40}
                step={5}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full accent-brand-red"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-400">
                <span>5</span><span>40</span>
              </div>
            </div>

            <Button onClick={handleStartCustom} className="w-full">
              Start øvelse →
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
