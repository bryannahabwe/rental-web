import {Navigate} from "react-router-dom"
import useAuthStore from "@/store/authStore"
import {useSyncPermissions} from "@/hooks/usePermissions"

export default function ProtectedRoute({children}) {
    const {accessToken, isRefreshTokenExpired, logout} = useAuthStore()

    // No token at all → login
    if (!accessToken) {
        return <Navigate to="/login" replace/>
    }

    // Refresh token expired → both tokens are dead → logout + login
    if (isRefreshTokenExpired()) {
        logout()
        return <Navigate to="/login" replace/>
    }

    return <Authenticated>{children}</Authenticated>
}

/**
 * Split out so the permissions sync only runs once we know there's a live
 * session — a hook above the token checks would fire /users/me on the way to
 * the login redirect.
 */
function Authenticated({children}) {
    useSyncPermissions()
    return children
}