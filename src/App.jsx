import {Navigate, Route, Routes} from "react-router-dom"
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

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <Routes>
                            <Route path="/dashboard" element={<DashboardPage/>}/>
                            <Route path="/tenants" element={<TenantsPage/>}/>
                            <Route path="/units" element={<UnitsPage/>}/>
                            <Route path="/agreements" element={<AgreementsPage/>}/>
                            <Route path="/payments" element={<PaymentsPage/>}/>
                            <Route path="/reports" element={<ReportsPage/>}/>
                            <Route path="/settings" element={<SettingsPage/>}/>
                            <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
                        </Routes>
                    </ProtectedRoute>
                }
            />
        </Routes>
    )
}