import api from "./api"

export const agreementsService = {
    getAll: (params) => api.get("/agreements", { params }),
    getById: (id) => api.get(`/agreements/${id}`),
    create: (data) => api.post("/agreements", data),
    update: (id, data) => api.put(`/agreements/${id}`, data),
    moveOut: (id, data) => api.patch(`/agreements/${id}/moveout`, data),
}