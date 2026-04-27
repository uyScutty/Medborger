import type { SubscriptionPlan } from "@/types";
import { api } from "./client";

export const paymentsApi = {
  plans: () => api.get<SubscriptionPlan[]>("/payments/plans/"),

  checkout: (planId: number) => api.post<{ url: string }>("/payments/checkout/", { plan_id: planId }),

  portal: () => api.post<{ url: string }>("/payments/portal/"),
};
