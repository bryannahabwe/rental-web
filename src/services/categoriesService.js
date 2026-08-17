import api from "./api"

export const categoriesService = {
    getAll: () => api.get("/categories"),
    create: (data) => api.post("/categories", data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    remove: (id) => api.delete(`/categories/${id}`),
}
