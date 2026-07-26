import {create} from "zustand"
import {persist} from "zustand/middleware"
import usePropertyStore from "@/store/propertyStore"

// Decode JWT expiry without a library
const getTokenExpiry = (token) => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        return payload.exp * 1000 // convert to ms
    } catch {
        return null
    }
}

const useAuthStore = create(
    persist(
        (set, get) => ({
            accessToken: null,
            refreshToken: null,
            landlord: null,
            role: null,
            userId: null,

            setAuth: (data) => set({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                role: data.role,
                userId: data.userId,
                landlord: {
                    name: data.name,
                    phoneNumber: data.phoneNumber,
                    email: data.email,
                },
            }),

            setAccessToken: (accessToken) => set({accessToken}),

            isManager: () => get().role === "PROPERTY_MANAGER",
            isAdmin: () => get().role === "ADMIN" || get().role === "SUPER_ADMIN",

            logout: () => {
                // Clear the active-property selection too, so the next account
                // that logs in doesn't inherit a stale property context.
                usePropertyStore.getState().reset()
                set({
                    accessToken: null,
                    refreshToken: null,
                    landlord: null,
                    role: null,
                    userId: null,
                })
            },

            // Returns true if access token is expired or missing
            isTokenExpired: () => {
                const token = get().accessToken
                if (!token) return true
                const expiry = getTokenExpiry(token)
                if (!expiry) return true
                // Add 10 second buffer
                return Date.now() >= expiry - 10_000
            },

            // Returns true if refresh token is also expired
            isRefreshTokenExpired: () => {
                const token = get().refreshToken
                if (!token) return true
                const expiry = getTokenExpiry(token)
                if (!expiry) return true
                return Date.now() >= expiry - 10_000
            },
        }),
        {name: "rentflow-auth"}
    )
)

export default useAuthStore