import api from "./api"

export const expensesService = {
    getAll: (params) => api.get("/expenses", {params}),
    getById: (id) => api.get(`/expenses/${id}`),
    create: (data) => api.post("/expenses", data),
    update: (id, data) => api.put(`/expenses/${id}`, data),
    remove: (id) => api.delete(`/expenses/${id}`),
}
