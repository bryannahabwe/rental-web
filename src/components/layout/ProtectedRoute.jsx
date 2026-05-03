import { Navigate } from "react-router-dom"
import useAuthStore from "@/store/authStore"

export default function ProtectedRoute({ children }) {
    const { accessToken, isRefreshTokenExpired, logout } = useAuthStore()

    // No token at all → login
    if (!accessToken) {
        return <Navigate to="/login" replace />
    }

    // Refresh token expired → both tokens are dead → logout + login
    if (isRefreshTokenExpired()) {
        logout()
        return <Navigate to="/login" replace />
    }

    return children
}