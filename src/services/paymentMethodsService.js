import api from "./api"

export const paymentMethodsService = {
    getAll: () => api.get("/payment-methods"),
    create: (data) => api.post("/payment-methods", data),
    update: (id, data) => api.put(`/payment-methods/${id}`, data),
    remove: (id) => api.delete(`/payment-methods/${id}`),
}
