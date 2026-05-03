import { Navigate, Route, Routes, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import ProtectedRoute from "@/components/layout/ProtectedRoute"
import LoginPage from "@/pages/LoginPage"
import RegisterPage from "@/pages/RegisterPage"
import DashboardPage from "@/pages/DashboardPage"
import TenantsPage from "@/pages/TenantsPage"
import UnitsPage from "@/pages/UnitsPage"
import AgreementsPage from "@/pages/AgreementsPage"
import PaymentsPage from "@/pages/PaymentsPage"
import ReportsPage from "@/pages/ReportsPage"
import SettingsPage from "@/pages/SettingsPage"
import useAuthStore from "@/store/authStore"

// ── Token guard — checks on PWA resume ──────────────────
function TokenGuard() {
    const navigate = useNavigate()
    const { isRefreshTokenExpired, logout, accessToken } = useAuthStore()

    useEffect(() => {
        const checkToken = () => {
            if (document.visibilityState === "visible" && accessToken) {
                if (isRefreshTokenExpired()) {
                    logout()
                    navigate("/login", { replace: true })
                }
            }
        }

        // Check immediately on mount
        checkToken()

        // Check every time user returns to the app
        document.addEventListener("visibilitychange", checkToken)
        return () => document.removeEventListener("visibilitychange", checkToken)
    }, [accessToken, isRefreshTokenExpired, logout, navigate])

    return null
}

export default function App() {
    return (
        <>
            <TokenGuard />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <Routes>
                                <Route path="/dashboard"  element={<DashboardPage />} />
                                <Route path="/tenants"    element={<TenantsPage />} />
                                <Route path="/units"      element={<UnitsPage />} />
                                <Route path="/agreements" element={<AgreementsPage />} />
                                <Route path="/payments"   element={<PaymentsPage />} />
                                <Route path="/reports"    element={<ReportsPage />} />
                                <Route path="/settings"   element={<SettingsPage />} />
                                <Route path="*"           element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    )
}