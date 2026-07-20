import api from "./api"

export const tenantsService = {
    getAll: (params) => api.get("/tenants", {params}),
    getById: (id) => api.get(`/tenants/${id}`),
    getLedger: (id) => api.get(`/tenants/${id}/ledger`),
    getTransactions: (id, params) => api.get(`/tenants/${id}/transactions`, {params}),
    create: (data) => api.post("/tenants", data),
    update: (id, data) => api.put(`/tenants/${id}`, data),
    delete: (id) => api.delete(`/tenants/${id}`),
}