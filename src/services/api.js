import axios from "axios"
import useAuthStore from "@/store/authStore"
import usePropertyStore from "@/store/propertyStore"

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://rental-api.askmoozo.com/api/v1"

const api = axios.create({
    baseURL: BASE_URL,
    headers: {"Content-Type": "application/json"},
})

// A page load fires several requests in parallel (Dashboard alone fires ~5).
// If the access token has expired, they'd otherwise each kick off their own
// /auth/refresh. Share a single in-flight refresh across all of them — both the
// proactive (request-time) and reactive (401) paths below go through this, so a
// page needs one refresh round-trip, not N. Uses raw axios so it never recurses
// through these interceptors. Resolves to the fresh access token.
let refreshPromise = null

function refreshAccessToken() {
    if (!refreshPromise) {
        const {refreshToken} = useAuthStore.getState()
        refreshPromise = axios
            .post(`${BASE_URL}/auth/refresh`, {refreshToken})
            .then((response) => {
                // The API rotates the refresh token on refresh — persist both so
                // the refresh window keeps sliding with activity.
                const {accessToken, refreshToken: rotated} = response.data
                useAuthStore.getState().setTokens({accessToken, refreshToken: rotated})
                return accessToken
            })
            .finally(() => {
                refreshPromise = null
            })
    }
    return refreshPromise
}

// Attach access token + active property to every request. Proactively refresh
// an access token that's already expired (but whose refresh token is still
// valid) BEFORE sending, so a stale-token page load doesn't have to eat a 401
// per request first — the reactive handler below is the fallback, not the
// primary path.
api.interceptors.request.use(async (config) => {
    const store = useAuthStore.getState()
    let token = store.accessToken

    if (token && store.isTokenExpired()
        && store.refreshToken && !store.isRefreshTokenExpired()) {
        try {
            token = await refreshAccessToken()
        } catch {
            // Refresh failed — send the stale token and let the 401 path below
            // handle logout/redirect uniformly.
        }
    }

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

// Handle expired tokens reactively — a token that expired mid-flight, or that
// the proactive check above missed (e.g. clock skew).
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            const {refreshToken, isRefreshTokenExpired, logout} = useAuthStore.getState()

            // Don't try refresh if the refresh token is already expired.
            if (!refreshToken || isRefreshTokenExpired()) {
                logout()
                window.location.href = "/login"
                return Promise.reject(error)
            }

            try {
                const accessToken = await refreshAccessToken()
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
