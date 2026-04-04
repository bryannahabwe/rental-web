import axios from "axios"
import useAuthStore from "@/store/authStore"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://rental-api.askmoozo.com/api/v1",
    headers: { "Content-Type": "application/json" },
})

// Attach access token to every request
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Handle expired tokens
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // If 401 and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = useAuthStore.getState().refreshToken

                if (!refreshToken) {
                    throw new Error("No refresh token")
                }

                // Try to get a new access token
                const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL || "https://rental-api.askmoozo.com/api/v1"}/auth/refresh`,
                    { refreshToken }
                )

                const { accessToken } = response.data
                useAuthStore.getState().setAccessToken(accessToken)

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                return api(originalRequest)

            } catch (refreshError) {
                // Refresh failed — log out and redirect to login
                useAuthStore.getState().logout()
                window.location.href = "/login"
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default api