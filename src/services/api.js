import axios from "axios"
import useAuthStore from "@/store/authStore"
import usePropertyStore from "@/store/propertyStore"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://rental-api.askmoozo.com/api/v1",
    headers: {"Content-Type": "application/json"},
})

// Attach access token + active property to every request
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    // Scope reads to the selected property. Omitted when "All properties"
    // (null) is active, which the API treats as the landlord-wide view.
    const propertyId = usePropertyStore.getState().selectedPropertyId
    if (propertyId) {
        config.headers["X-Property-Id"] = propertyId
    }
    return config
})

// A page load fires several requests in parallel (Dashboard alone fires ~5).
// If the access token has expired, every one of them 401s at once — without
// this, each would independently kick off its own /auth/refresh call. Share
// a single in-flight refresh across all of them instead, so a page that
// would otherwise need N redundant round-trips (and stay in a longer
// "loading"/zeroed-out state while they all serialize) only needs one.
let refreshPromise = null

// Handle expired tokens
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            const {refreshToken, isRefreshTokenExpired, logout, setTokens} =
                useAuthStore.getState()

            // Don't try refresh if refresh token is already expired
            if (!refreshToken || isRefreshTokenExpired()) {
                logout()
                window.location.href = "/login"
                return Promise.reject(error)
            }

            try {
                if (!refreshPromise) {
                    refreshPromise = axios.post(
                        `${import.meta.env.VITE_API_BASE_URL || "https://rental-api.askmoozo.com/api/v1"}/auth/refresh`,
                        {refreshToken}
                    ).finally(() => {
                        refreshPromise = null
                    })
                }

                const response = await refreshPromise
                // The API rotates the refresh token on refresh — persist both so
                // the refresh window keeps sliding with activity.
                const {accessToken, refreshToken: rotatedRefreshToken} = response.data
                setTokens({accessToken, refreshToken: rotatedRefreshToken})
                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                return api(originalRequest)

            } catch (refreshError) {
                useAuthStore.getState().logout()
                window.location.href = "/login"
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default api