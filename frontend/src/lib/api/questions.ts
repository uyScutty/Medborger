import type { Category, OfficialExam, Question } from "@/types";
import { api } from "./client";

export const questionsApi = {
  categories: () => api.get<Category[]>("/content/categories/"),

  list: (params?: { category__slug?: string; difficulty?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
    return api.get<{ results: Question[]; count: number }>(`/content/questions/${qs}`);
  },

  get: (id: number, withAnswer = false) =>
    api.get<Question>(`/content/questions/${id}/${withAnswer ? "?with_answer=1" : ""}`),

  exams: () =>
    api.get<{ results: OfficialExam[] } | OfficialExam[]>("/content/exams/").then((r) =>
      Array.isArray(r) ? r : r.results
    ),

  exam: (id: number) => api.get<OfficialExam & { questions: Question[] }>(`/content/exams/${id}/`),
};
