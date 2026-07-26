import api from "./api"

export const usersService = {
    getAll: () => api.get("/users"),
    me: () => api.get("/users/me"),
    invite: (data) => api.post("/users/invite", data),
    update: (id, data) => api.put(`/users/${id}`, data),
    deactivate: (id) => api.post(`/users/${id}/deactivate`),
}
