import api from "./api"

export const paymentsService = {
    getAll: (params) => api.get("/payments", {params}),
    getById: (id) => api.get(`/payments/${id}`),
    create: (data) => api.post("/payments", data),
}