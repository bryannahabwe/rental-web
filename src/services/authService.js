import api from "./api.js"

export const authService = {
    register: (data) => api.post("/auth/register", data),
    login: (data) => api.post("/auth/login", data),
    refresh: (refreshToken) => api.post("/auth/refresh", {refreshToken}),
    getInvite: (token) => api.get(`/auth/invite/${token}`),
    acceptInvite: (data) => api.post("/auth/accept-invite", data),
    requestPasswordReset: (data) => api.post("/auth/request-password-reset", data),
    resetPassword: (data) => api.post("/auth/reset-password", data),
}