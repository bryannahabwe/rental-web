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
import MorePage from "@/pages/MorePage"
import useAuthStore from "@/store/authStore"
import {useCan} from "@/hooks/usePermissions"
import {ConfirmProvider, ToastHost} from "@/components/ui"
import BusinessProfilePage from "@/pages/BusinessProfilePage"
import ReceiptSettingsPage from "@/pages/ReceiptSettingsPage"
import ProfilePage from "@/pages/ProfilePage"

// ── Token guard — checks on PWA resume ──────────────────
function TokenGuard() {
    const navigate = useNavigate()
    // Individual selectors — TokenGuard mounts at the app root, so a whole-store
    // subscription would re-run it on every auth change.
    const accessToken = useAuthStore((s) => s.accessToken)
    const isRefreshTokenExpired = useAuthStore((s) => s.isRefreshTokenExpired)
    const logout = useAuthStore((s) => s.logout)

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

/**
 * Gates a route on a capability, redirecting to the user's own landing page
 * rather than showing a page whose every request would 403.
 *
 * Capability rather than role: five roles don't split into "admin" and "not",
 * and the capability the route needs is resolved against the property currently
 * active in the switcher.
 */
function Require({can: capability, children}) {
    const can = useCan()
    if (!can(capability)) return <HomeRedirect/>
    return children
}

// Anyone who can see portfolio figures lands on the Dashboard; everyone else
// (property managers, caretakers) on Tenants, which is their home screen.
function HomeRedirect() {
    const can = useCan()
    return <Navigate to={can("viewReports") ? "/dashboard" : "/tenants"} replace/>
}

export default function App() {
    return (
        <ConfirmProvider>
            <TokenGuard/>
            {/* Mounted once — toast() is callable from anywhere, including
                mutation callbacks that fire outside a component. */}
            <ToastHost/>
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/accept-invite" element={<AcceptInvitePage/>}/>
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <Routes>
                                <Route path="/dashboard" element={<Require can="viewReports"><DashboardPage/></Require>}/>
                                <Route path="/tenants" element={<TenantsPage/>}/>
                                <Route path="/tenants/:id" element={<TenantDetailPage/>}/>
                                <Route path="/units" element={<UnitsPage/>}/>
                                <Route path="/properties" element={<Require can="manageProperties"><PropertiesPage/></Require>}/>
                                <Route path="/users" element={<Require can="manageUsers"><UsersPage/></Require>}/>
                                <Route path="/activity" element={<Require can="viewActivity"><ActivityPage/></Require>}/>
                                <Route path="/agreements" element={<AgreementsPage/>}/>
                                <Route path="/payments" element={<PaymentsPage/>}/>
                                <Route path="/reports" element={<Require can="viewReports"><ReportsPage/></Require>}/>
                                <Route path="/settings" element={<Require can="manageBranding"><SettingsPage/></Require>}/>
                                <Route path="/settings/profile" element={<ProfilePage/>}/>
                                <Route path="/settings/business-profile" element={<Require can="manageBranding"><BusinessProfilePage/></Require>}/>
                                <Route path="/settings/receipt-settings" element={<Require can="manageBranding"><ReceiptSettingsPage/></Require>}/>
                                {/* Mobile "More" hub — everything the bottom nav can't fit as a tab. */}
                                <Route path="/more" element={<MorePage/>}/>
                                <Route path="*" element={<HomeRedirect/>}/>
                            </Routes>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </ConfirmProvider>
    )
}
