import api from "./api"

export const unitsService = {
    getAll: (params) => api.get("/units", {params}),
    getById: (id) => api.get(`/units/${id}`),
    create: (data) => api.post("/units", data),
    update: (id, data) => api.put(`/units/${id}`, data),
    delete: (id) => api.delete(`/units/${id}`),
}