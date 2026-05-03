api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const { refreshToken, isRefreshTokenExpired, logout, setAccessToken } =
                    useAuthStore.getState()

                // Don't even try if refresh token is expired
                if (!refreshToken || isRefreshTokenExpired()) {
                    logout()
                    window.location.href = "/login"
                    return Promise.reject(error)
                }

                const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL || "https://rental-api.askmoozo.com/api/v1"}/auth/refresh`,
                    { refreshToken }
                )

                const { accessToken } = response.data
                setAccessToken(accessToken)
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