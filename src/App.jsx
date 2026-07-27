import {Navigate, Route, Routes, useNavigate} from "react-router-dom"
import {useEffect} from "react"
import ProtectedRoute from "@/components/layout/ProtectedRoute"
import LoginPage from "@/pages/LoginPage"
import RegisterPage from "@/pages/RegisterPage"
import AcceptInvitePage from "@/pages/AcceptInvitePage"
import DashboardPage from "@/pages/DashboardPage"
import TenantsPage from "@/pages/TenantsPage"
import TenantDetailPage from "@/pages/TenantDetailPage"
import UnitsPage from "@/pages/UnitsPage"
import PropertiesPage from "@/pages/PropertiesPage"
import UsersPage from "@/pages/UsersPage"
import ActivityPage from "@/pages/ActivityPage"
import AgreementsPage from "@/pages/AgreementsPage"
import PaymentsPage from "@/pages/PaymentsPage"
import ReportsPage from "@/pages/ReportsPage"
import SettingsPage from "@/pages/SettingsPage"
import useAuthStore from "@/store/authStore"
import BusinessProfilePage from "@/pages/BusinessProfilePage"
import ReceiptSettingsPage from "@/pages/ReceiptSettingsPage"

// ── Token guard — checks on PWA resume ──────────────────
function TokenGuard() {
    const navigate = useNavigate()
    const {isRefreshTokenExpired, logout, accessToken} = useAuthStore()

    useEffect(() => {
        const checkToken = () => {
            if (document.visibilityState === "visible" && accessToken) {
                if (isRefreshTokenExpired()) {
                    logout()
                    navigate("/login", {replace: true})
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

// Admin/owner-only pages redirect PROPERTY_MANAGERs to their landing page.
function AdminOnly({children}) {
    const role = useAuthStore(s => s.role)
    if (role === "PROPERTY_MANAGER") return <Navigate to="/tenants" replace/>
    return children
}

// Managers land on Tenants (Dashboard/Reports are admin-only); everyone else
// on the Dashboard.
function HomeRedirect() {
    const role = useAuthStore(s => s.role)
    return <Navigate to={role === "PROPERTY_MANAGER" ? "/tenants" : "/dashboard"} replace/>
}

export default function App() {
    return (
        <>
            <TokenGuard/>
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/accept-invite" element={<AcceptInvitePage/>}/>
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <Routes>
                                <Route path="/dashboard" element={<AdminOnly><DashboardPage/></AdminOnly>}/>
                                <Route path="/tenants" element={<TenantsPage/>}/>
                                <Route path="/tenants/:id" element={<TenantDetailPage/>}/>
                                <Route path="/units" element={<UnitsPage/>}/>
                                <Route path="/properties" element={<AdminOnly><PropertiesPage/></AdminOnly>}/>
                                <Route path="/users" element={<AdminOnly><UsersPage/></AdminOnly>}/>
                                <Route path="/activity" element={<AdminOnly><ActivityPage/></AdminOnly>}/>
                                <Route path="/agreements" element={<AgreementsPage/>}/>
                                <Route path="/payments" element={<PaymentsPage/>}/>
                                <Route path="/reports" element={<AdminOnly><ReportsPage/></AdminOnly>}/>
                                <Route path="/settings" element={<AdminOnly><SettingsPage/></AdminOnly>}/>
                                <Route path="/settings/business-profile" element={<AdminOnly><BusinessProfilePage/></AdminOnly>}/>
                                <Route path="/settings/receipt-settings" element={<AdminOnly><ReceiptSettingsPage/></AdminOnly>}/>
                                <Route path="*" element={<HomeRedirect/>}/>
                            </Routes>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    )
}
