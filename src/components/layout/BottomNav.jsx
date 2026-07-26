import {NavLink} from "react-router-dom"
import {Building2, CreditCard, FileText, LayoutDashboard, Settings, Users} from "lucide-react"
import useAuthStore from "@/store/authStore"

const adminItems = [
    {label: "Dashboard", path: "/dashboard", icon: LayoutDashboard},
    {label: "Tenants", path: "/tenants", icon: Users},
    {label: "Payments", path: "/payments", icon: CreditCard},
    {label: "Settings", path: "/settings", icon: Settings},
]

const managerItems = [
    {label: "Tenants", path: "/tenants", icon: Users},
    {label: "Units", path: "/units", icon: Building2},
    {label: "Payments", path: "/payments", icon: CreditCard},
    {label: "Agreements", path: "/agreements", icon: FileText},
]

export default function BottomNav() {
    const role = useAuthStore(s => s.role)
    const navItems = role === "PROPERTY_MANAGER" ? managerItems : adminItems

    return (
        <nav className="bottom-nav" style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            backgroundColor: "#0a4a38",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex", zIndex: 100,
            paddingBottom: "env(safe-area-inset-bottom)",
        }}>
            {navItems.map(({label, path, icon: Icon}) => (
                <NavLink
                    key={path}
                    to={path}
                    style={({isActive}) => ({
                        flex: 1, display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        padding: "10px 2px", textDecoration: "none",
                        color: isActive ? "#5DCAA5" : "rgba(255,255,255,0.45)",
                        fontSize: "10px", fontFamily: "'DM Sans', sans-serif",
                        gap: "4px",
                    })}
                >
                    <Icon size={20}/>
                    {label}
                </NavLink>
            ))}
        </nav>
    )
}
