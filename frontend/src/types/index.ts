export type SubscriptionTier = "free" | "premium";

export type QuestionStatus = "valid" | "updated" | "retired";
export type SupportedLanguage = "da" | "en" | "ar" | "tr" | "uk" | "th" | "tl" | "fa";

export interface BilingualSentence {
  da: string;
  en?: string;
  ar?: string;
  so?: string;
  tr?: string;
  ur?: string;
  [lang: string]: string | undefined;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  is_premium: boolean;
  date_joined: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  question_count: number;
}

export interface FactSheetStub {
  factsheet_id: string;
  title: Record<string, string>;
  audio_urls: Record<string, string>;
  is_premium: boolean;
}

export interface Choice {
  id: number;
  text: string;
  text_translations?: Record<string, string>;
  order: number;
  is_correct?: boolean;
}

export interface Question {
  id: number;
  text: string;
  text_translations?: Record<string, string>;
  category: number;
  category_name: string;
  subcategory?: number | null;
  subcategory_name?: string | null;
  difficulty: "easy" | "medium" | "hard";
  image: string | null;
  is_free: boolean;
  status: QuestionStatus;
  choices: Choice[];
  explanation?: string;
  explanation_sentences?: BilingualSentence[];
  correct_answer_summary?: BilingualSentence;
  historical_note_sentences?: BilingualSentence[];
  original_correct_text?: string;
  factsheet?: FactSheetStub | null;
}

export type ExamMode = "practice" | "mock_exam" | "official_exam";

export interface OfficialExam {
  id: number;
  title: string;
  year: number;
  month: number;
  description: string;
  pass_score: number;
  total_time_minutes: number;
  is_free: boolean;
  question_count: number;
}

export interface ExamAttempt {
  id: number;
  mode: ExamMode;
  official_exam: number | null;
  started_at: string;
  completed_at: string | null;
  score: number | null;
  total_questions: number;
  passed: boolean | null;
  score_percentage: number | null;
  duration_seconds: number | null;
  is_complete: boolean;
}

export interface AttemptAnswer {
  question: Question;
  chosen_choice_id: number | null;
  is_correct: boolean;
  time_taken_seconds: number | null;
}

export interface AttemptDetail extends ExamAttempt {
  answers: AttemptAnswer[];
}

export interface CategoryPerformance {
  category_id: number;
  category_name: string;
  total: number;
  correct: number;
  percentage: number;
}

export interface Progress {
  total_attempts: number;
  mock_attempts_count: number;
  best_score: number | null;
  total_answered: number;
  total_correct: number;
  accuracy_percentage: number;
  category_performance: CategoryPerformance[];
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  stripe_price_id: string;
  price_dkk: string;
  interval: "month" | "year" | "one_time";
  order: number;
}

export interface ApiError {
  detail?: string;
  [key: string]: string | string[] | undefined;
}
