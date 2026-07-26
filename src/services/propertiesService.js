import api from "./api"

export const propertiesService = {
    getAll: () => api.get("/properties"),
    getById: (id) => api.get(`/properties/${id}`),
    create: (data) => api.post("/properties", data),
    update: (id, data) => api.put(`/properties/${id}`, data),
    delete: (id) => api.delete(`/properties/${id}`),
}
