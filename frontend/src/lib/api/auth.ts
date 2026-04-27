import type { User } from "@/types";
import { api } from "./client";

export const authApi = {
  register: (data: { email: string; first_name: string; last_name: string; password: string; password2: string }) =>
    api.post<User>("/auth/register/", data),

  login: (email: string, password: string) => api.post<User>("/auth/login/", { email, password }),

  logout: () => api.post<void>("/auth/logout/"),

  me: () => api.get<User>("/auth/me/"),

  refresh: () => api.post<void>("/auth/refresh/"),

  changePassword: (current_password: string, new_password: string, new_password2: string) =>
    api.post<void>("/auth/change-password/", { current_password, new_password, new_password2 }),

  updateMe: (data: Partial<Pick<User, "first_name" | "last_name">>) => api.patch<User>("/auth/me/", data),
};
