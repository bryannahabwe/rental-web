import {create} from "zustand"
import {persist} from "zustand/middleware"

const useAuthStore = create(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            landlord: null,
            setTokens: (accessToken, refreshToken) => set({accessToken, refreshToken}),
            setLandlord: (landlord) => set({landlord}),
            logout: () => set({accessToken: null, refreshToken: null, landlord: null}),
        }),
        {name: "auth-storage"}
    )
)

export default useAuthStore