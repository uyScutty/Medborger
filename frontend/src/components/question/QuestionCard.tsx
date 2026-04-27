"use client";

import { useState } from "react";
import type { Choice, Question } from "@/types";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { ChoiceButton } from "./ChoiceButton";

const difficultyLabel: Record<string, string> = {
  easy: "Let",
  medium: "Mellem",
  hard: "Svær",
};

const difficultyBadge: Record<string, "success" | "warning" | "danger"> = {
  easy: "success",
  medium: "warning",
  hard: "danger",
};

interface QuestionCardProps {
  question: Question;
  questionNumber?: number;
  totalQuestions?: number;
  onAnswer: (choiceId: number) => Promise<{ is_correct: boolean; question: Question }>;
  onNext: () => void;
  showTimer?: boolean;
}

export function QuestionCard({ question, questionNumber, totalQuestions, onAnswer, onNext }: QuestionCardProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [result, setResult] = useState<{ is_correct: boolean; question: Question } | null>(null);
  const [loading, setLoading] = useState(false);

  const answered = result !== null;

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

  const resultQuestion = result?.question ?? question;

  return (
    <Card className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Badge>{question.category_name}</Badge>
          <Badge variant={difficultyBadge[question.difficulty]}>{difficultyLabel[question.difficulty]}</Badge>
        </div>
        {questionNumber && totalQuestions && (
          <span className="flex-shrink-0 text-sm text-gray-400">
            {questionNumber} / {totalQuestions}
          </span>
        )}
      </div>

      <p className="text-lg font-medium text-gray-900 leading-relaxed">{question.text}</p>

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
        <div
          className={`rounded-lg p-4 ${result?.is_correct ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
        >
          <p className={`font-semibold mb-1 ${result?.is_correct ? "text-green-800" : "text-red-800"}`}>
            {result?.is_correct ? "✓ Rigtigt!" : "✗ Forkert"}
          </p>
          {resultQuestion.explanation && (
            <p className="text-sm text-gray-700 leading-relaxed">{resultQuestion.explanation}</p>
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
