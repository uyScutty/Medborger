"use client";

import { clsx } from "clsx";
import type { Choice } from "@/types";
import { useLanguage } from "@/lib/language/context";

type ChoiceState = "idle" | "selected" | "correct" | "incorrect" | "revealed-correct";

interface ChoiceButtonProps {
  choice: Choice;
  state: ChoiceState;
  index: number;
  onClick: () => void;
  disabled?: boolean;
}

const labels = ["A", "B", "C", "D"];

export function ChoiceButton({ choice, state, index, onClick, disabled }: ChoiceButtonProps) {
  const { secondLang, langInfo } = useLanguage();
  const translation = secondLang && secondLang !== "da" ? choice.text_translations?.[secondLang] : undefined;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "w-full rounded-lg border-2 p-4 text-left transition-all duration-200",
        "flex items-start gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red",
        "disabled:cursor-not-allowed",
        {
          "border-gray-200 bg-white hover:border-brand-red hover:bg-brand-red-light": state === "idle",
          "border-brand-red bg-brand-red-light": state === "selected",
          "border-green-500 bg-green-50": state === "correct",
          "border-red-500 bg-red-50": state === "incorrect",
          "border-green-300 bg-green-50/50": state === "revealed-correct",
        },
      )}
    >
      <span
        className={clsx(
          "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold",
          {
            "bg-gray-100 text-gray-600": state === "idle",
            "bg-brand-red text-white": state === "selected",
            "bg-green-500 text-white": state === "correct",
            "bg-red-500 text-white": state === "incorrect",
            "bg-green-200 text-green-800": state === "revealed-correct",
          },
        )}
      >
        {labels[index] ?? index + 1}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-sm text-gray-800 leading-relaxed">{choice.text}</span>
        {translation && (
          <span
            className="text-xs text-gray-500 leading-relaxed"
            dir={langInfo?.rtl ? "rtl" : "ltr"}
          >
            {translation}
          </span>
        )}
      </span>
    </button>
  );
}
