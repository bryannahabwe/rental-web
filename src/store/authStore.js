import { create } from "zustand"
import { persist } from "zustand/middleware"

const useAuthStore = create(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            landlord: null,

            setAuth: (data) => set({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                landlord: {
                    name: data.name,
                    phoneNumber: data.phoneNumber,
                    email: data.email,
                },
            }),

            setAccessToken: (accessToken) => set({ accessToken }),

            logout: () => set({
                accessToken: null,
                refreshToken: null,
                landlord: null,
            }),
        }),
        {
            name: "rentflow-auth",
        }
    )
)

export default useAuthStore