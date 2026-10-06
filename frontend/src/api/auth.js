import api, { unwrap } from "./client";

export const authApi = {
  register: (payload) => api.post("/auth/register", payload).then(unwrap),
  login: (payload) => api.post("/auth/login", payload).then(unwrap),
  logout: () => api.post("/auth/logout").then(unwrap),
  // Backend registers this route as POST (PRD lists GET)
  currentUser: () => api.post("/auth/current-user").then(unwrap),
  changePassword: (payload) => api.post("/auth/change-password", payload).then(unwrap),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`).then(unwrap),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }).then(unwrap),
  resetPassword: (token, newPassword) => api.post(`/auth/reset-password/${token}`, { newPassword }).then(unwrap),
  // Backend route is spelled "resend-email-varification"
  resendVerification: () => api.post("/auth/resend-email-varification").then(unwrap),
  healthcheck: () => api.get("/healthcheck").then(unwrap),
};
