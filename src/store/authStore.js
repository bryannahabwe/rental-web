import {create} from "zustand"
import {persist} from "zustand/middleware"
import usePropertyStore from "@/store/propertyStore"
import useSettingsStore from "@/store/settingsStore"

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
            // The account role — the same for every property. The role that
            // actually applies depends on the active property; derive it with
            // useEffectiveRole() rather than reading this directly.
            role: null,
            // propertyId -> role held there. Empty for account-wide roles, which
            // reach every property as `role`.
            propertyRoles: {},
            assignedPropertyIds: [],
            userId: null,

            setAuth: (data) => set({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                role: data.role,
                propertyRoles: data.propertyRoles || {},
                assignedPropertyIds: data.assignedPropertyIds || [],
                userId: data.userId,
                landlord: {
                    name: data.name,
                    phoneNumber: data.phoneNumber,
                    email: data.email,
                },
            }),

            // Re-sync permissions from GET /users/me. The API applies a role
            // change on the very next request, but our copy would stay stale
            // until the next sign-in — so refresh it on app mount.
            setPermissions: ({role, propertyRoles, assignedPropertyIds}) => set({
                role,
                propertyRoles: propertyRoles || {},
                assignedPropertyIds: assignedPropertyIds || [],
            }),

            setAccessToken: (accessToken) => set({accessToken}),

            // Persist tokens after a refresh. The API rotates the refresh token
            // on every /auth/refresh, so dropping it would freeze the refresh
            // window at login time and force a logout 7 days later regardless of
            // activity. Only overwrite fields the response actually carried.
            setTokens: ({accessToken, refreshToken}) => set(state => ({
                accessToken: accessToken ?? state.accessToken,
                refreshToken: refreshToken ?? state.refreshToken,
            })),

            // Patch the cached profile after a self-update (name / phone).
            updateLandlord: (patch) => set(state => ({
                landlord: {...state.landlord, ...patch},
            })),

            logout: () => {
                // Clear the active-property selection too, so the next account
                // that logs in doesn't inherit a stale property context.
                usePropertyStore.getState().reset()
                // Clear cached business settings (name, logo, receipt config) so
                // they can't leak onto the next account's receipts on a shared
                // device before its own settings load.
                useSettingsStore.getState().clearSettings()
                set({
                    accessToken: null,
                    refreshToken: null,
                    landlord: null,
                    role: null,
                    propertyRoles: {},
                    assignedPropertyIds: [],
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