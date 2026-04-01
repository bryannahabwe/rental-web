import api from "./api"

export const tenantsService = {
    getAll: (params) => api.get("/tenants", { params }),
    getById: (id) => api.get(`/tenants/${id}`),
    create: (data) => api.post("/tenants", data),
    update: (id, data) => api.put(`/tenants/${id}`, data),
    delete: (id) => api.delete(`/tenants/${id}`),
}