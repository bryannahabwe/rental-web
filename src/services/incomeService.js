import api from "./api"

export const incomeService = {
    // Unified ledger: rent (from payments) + other income.
    getAll: (params) => api.get("/income", {params}),
    // Manual non-rent income entries.
    getOther: (id) => api.get(`/other-income/${id}`),
    createOther: (data) => api.post("/other-income", data),
    updateOther: (id, data) => api.put(`/other-income/${id}`, data),
    removeOther: (id) => api.delete(`/other-income/${id}`),
}
