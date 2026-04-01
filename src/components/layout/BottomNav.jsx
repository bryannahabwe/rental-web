import {NavLink} from "react-router-dom"
import {BarChart3, Building2, CreditCard, FileText, LayoutDashboard, Users} from "lucide-react"

const navItems = [
    {label: "Dashboard", path: "/dashboard", icon: LayoutDashboard},
    {label: "Tenants", path: "/tenants", icon: Users},
    {label: "Units", path: "/units", icon: Building2},
    {label: "Agreements", path: "/agreements", icon: FileText},
    {label: "Payments", path: "/payments", icon: CreditCard},
    {label: "Reports", path: "/reports", icon: BarChart3},
]

export default function BottomNav() {
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
                        padding: "8px 2px", textDecoration: "none",
                        color: isActive ? "#5DCAA5" : "rgba(255,255,255,0.45)",
                        fontSize: "9px", fontFamily: "'DM Sans', sans-serif",
                        gap: "3px",
                    })}
                >
                    <Icon size={18}/>
                    {label}
                </NavLink>
            ))}
        </nav>
    )
}