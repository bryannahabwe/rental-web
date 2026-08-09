import {Navigate} from "react-router-dom"
import useAuthStore from "@/store/authStore"
import {usePropertySelectionSync, useSyncPermissions} from "@/hooks/usePermissions"

export default function ProtectedRoute({children}) {
    // Select individual slices, not the whole store — this component wraps the
    // entire authenticated app, and subscribing to the whole store re-rendered
    // the tree on every token refresh (and every landlord/permission change).
    const accessToken = useAuthStore((s) => s.accessToken)
    const isRefreshTokenExpired = useAuthStore((s) => s.isRefreshTokenExpired)
    const logout = useAuthStore((s) => s.logout)

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
    usePropertySelectionSync()
    return children
}