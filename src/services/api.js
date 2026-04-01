import axios from "axios"
import useAuthStore from "@/store/authStore"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api/v1",
    headers: { "Content-Type": "application/json" },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true
            try {
                const refreshToken = useAuthStore.getState().refreshToken
                const { data } = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api/v1"}/auth/refresh`,
                    { refreshToken }
                )
                useAuthStore.getState().setTokens(data.accessToken, data.refreshToken)
                original.headers.Authorization = `Bearer ${data.accessToken}`
                return api(original)
            } catch {
                useAuthStore.getState().logout()
                window.location.href = "/login"
            }
        }
        return Promise.reject(error)
    }
)

export default api