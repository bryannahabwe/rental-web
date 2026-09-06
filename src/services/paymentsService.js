import api from "./api"

export const paymentsService = {
    getAll: (params) => api.get("/payments", {params}),
    getById: (id) => api.get(`/payments/${id}`),
    create: (data) => api.post("/payments", data),
    // Correcting a posted payment. Admin/owner only on the API — a payment
    // rewrites the tenant's whole cycle history, so amending one is narrower
    // than recording one.
    update: (id, data) => api.put(`/payments/${id}`, data),
    remove: (id) => api.delete(`/payments/${id}`),
    // Idempotent: draws a number from the account's sequence the first time and
    // returns that same one ever after, so re-printing a receipt reproduces the
    // tenant's copy rather than burning a new number.
    issueReceipt: (id) => api.post(`/payments/${id}/receipt`),
}
