import type { AttemptDetail, ExamAttempt, ExamMode, Progress, Question } from "@/types";
import { api } from "./client";

export const practiceApi = {
  start: (data: {
    mode: ExamMode;
    official_exam_id?: number;
    category_slugs?: string[];
    num_questions?: number;
  }) =>
    api.post<ExamAttempt & { question_ids: number[] }>("/practice/attempts/start/", data),

  submitAnswer: (
    attemptId: number,
    data: { question_id: number; choice_id: number | null; time_taken_seconds?: number },
  ) =>
    api.post<{ is_correct: boolean; question: Question }>(`/practice/attempts/${attemptId}/answer/`, data),

  complete: (attemptId: number) => api.post<ExamAttempt>(`/practice/attempts/${attemptId}/complete/`),

  attempt: (id: number) => api.get<AttemptDetail>(`/practice/attempts/${id}/`),

  history: () => api.get<{ results: ExamAttempt[]; count: number }>("/practice/attempts/"),

  progress: () => api.get<Progress>("/practice/progress/"),
};
