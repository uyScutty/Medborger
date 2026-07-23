"use client";

import { useState } from "react";
import type { BilingualSentence, Choice, Question } from "@/types";
import { useLanguage } from "@/lib/language/context";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { ChoiceButton } from "./ChoiceButton";

const difficultyLabel: Record<string, string> = {
  easy: "Let", medium: "Mellem", hard: "Svær",
};
const difficultyBadge: Record<string, "success" | "warning" | "danger"> = {
  easy: "success", medium: "warning", hard: "danger",
};

interface QuestionCardProps {
  question: Question;
  questionNumber?: number;
  totalQuestions?: number;
  onAnswer: (choiceId: number) => Promise<{ is_correct: boolean; question: Question }>;
  onNext: () => void;
}

export function QuestionCard({ question, questionNumber, totalQuestions, onAnswer, onNext }: QuestionCardProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [result, setResult] = useState<{ is_correct: boolean; question: Question } | null>(null);
  const [loading, setLoading] = useState(false);
  const { secondLang, langInfo } = useLanguage();

  const answered = result !== null;
  const resultQuestion = result?.question ?? question;

  async function handleChoiceClick(choice: Choice) {
    if (answered || loading) return;
    setSelectedId(choice.id);
    setLoading(true);
    try {
      const res = await onAnswer(choice.id);
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  function handleNext() {
    setSelectedId(null);
    setResult(null);
    onNext();
  }

  function getChoiceState(choice: Choice) {
    if (!answered) return selectedId === choice.id ? "selected" : "idle";
    if (choice.is_correct) return "revealed-correct";
    if (selectedId === choice.id) return result?.is_correct ? "correct" : "incorrect";
    return "idle";
  }

  return (
    <Card className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Badge>{question.category_name}</Badge>
          {question.subcategory_name && (
            <Badge variant="default" className="text-xs text-gray-500 bg-gray-100 border-gray-200">
              {question.subcategory_name}
            </Badge>
          )}
          <Badge variant={difficultyBadge[question.difficulty]}>{difficultyLabel[question.difficulty]}</Badge>
          {question.status === "updated" && (
            <Badge variant="warning" className="text-xs">Opdateret regel</Badge>
          )}
        </div>
        {questionNumber && totalQuestions && (
          <span className="flex-shrink-0 text-sm text-gray-400">{questionNumber} / {totalQuestions}</span>
        )}
      </div>

      {/* Question text */}
      <div>
        <p className="text-lg font-medium text-gray-900 leading-relaxed">{question.text}</p>
        {secondLang && secondLang !== "da" && question.text_translations?.[secondLang] && (
          <p
            className="mt-1 text-sm text-gray-500 leading-relaxed"
            dir={langInfo?.rtl ? "rtl" : "ltr"}
          >
            {question.text_translations[secondLang]}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {question.choices.map((choice, i) => (
          <ChoiceButton
            key={choice.id}
            choice={answered ? resultQuestion.choices.find((c) => c.id === choice.id) ?? choice : choice}
            state={getChoiceState(choice)}
            index={i}
            onClick={() => handleChoiceClick(choice)}
            disabled={answered || loading}
          />
        ))}
      </div>

      {answered && (
        <div className={`rounded-xl p-5 space-y-4 ${result?.is_correct ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          <p className={`font-semibold text-base ${result?.is_correct ? "text-green-800" : "text-red-800"}`}>
            {result?.is_correct ? "✓ Rigtigt!" : "✗ Forkert"}
          </p>

          {resultQuestion.explanation_sentences && resultQuestion.explanation_sentences.length > 0 ? (
            <div className="space-y-3">
              {resultQuestion.explanation_sentences.map((sentence, i) => (
                <BilingualLine key={i} sentence={sentence} secondLang={secondLang} langInfo={langInfo} />
              ))}
            </div>
          ) : resultQuestion.explanation ? (
            <p className="text-sm text-gray-700 leading-relaxed">{resultQuestion.explanation}</p>
          ) : null}

          {resultQuestion.correct_answer_summary && Object.keys(resultQuestion.correct_answer_summary).length > 0 && (
            <div className="rounded-lg bg-white border border-gray-200 px-4 py-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Det korrekte svar</p>
              <BilingualLine
                sentence={resultQuestion.correct_answer_summary}
                secondLang={secondLang}
                langInfo={langInfo}
                emphasisDa
              />
            </div>
          )}

          {resultQuestion.status === "updated" &&
            resultQuestion.historical_note_sentences &&
            resultQuestion.historical_note_sentences.length > 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 mb-2">
                📜 Historisk note
              </p>
              {resultQuestion.historical_note_sentences.map((sentence, i) => (
                <BilingualLine key={i} sentence={sentence} secondLang={secondLang} langInfo={langInfo} />
              ))}
            </div>
          )}
        </div>
      )}

      {answered && (
        <div className="flex justify-end">
          <Button onClick={handleNext}>Næste spørgsmål →</Button>
        </div>
      )}
    </Card>
  );
}

function BilingualLine({
  sentence,
  secondLang,
  langInfo,
  emphasisDa = false,
}: {
  sentence: BilingualSentence;
  secondLang: string | null;
  langInfo: { rtl: boolean; nativeName: string } | null;
  emphasisDa?: boolean;
}) {
  const translation = secondLang && secondLang !== "da" ? sentence[secondLang] : undefined;
  const rtl = langInfo?.rtl ?? false;

  return (
    <div className="space-y-0.5">
      <p className={`text-sm text-gray-800 leading-relaxed ${emphasisDa ? "font-semibold" : ""}`}>
        {sentence.da}
      </p>
      {translation && (
        <p className="text-sm text-gray-500 leading-relaxed" dir={rtl ? "rtl" : "ltr"}>
          {translation}
        </p>
      )}
    </div>
  );
}
