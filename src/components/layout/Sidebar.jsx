import { NavLink } from "react-router-dom"
import {
    LayoutDashboard, Users, Building2,
    FileText, CreditCard, BarChart3,
    Settings, LogOut,
} from "lucide-react"
import useAuthStore from "@/store/authStore"
import { useNavigate } from "react-router-dom"

const mainLinks = [
    { label: "Dashboard",  path: "/dashboard",  icon: LayoutDashboard },
    { label: "Tenants",    path: "/tenants",    icon: Users },
]

const financialLinks = [
    { label: "Payments",   path: "/payments",   icon: CreditCard },
    { label: "Reports",    path: "/reports",    icon: BarChart3 },
]

const manageLinks = [
    { label: "Units",       path: "/units",       icon: Building2 },
    { label: "Agreements",  path: "/agreements",  icon: FileText },
]

const linkStyle = (isActive) => ({
    display: "flex", alignItems: "center", gap: "10px",
    padding: "9px 16px", borderRadius: "8px",
    textDecoration: "none", fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
    color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
    backgroundColor: isActive ? "rgba(255,255,255,0.1)" : "transparent",
    transition: "all 0.15s",
})

function SidebarSection({ label, links }) {
    return (
        <div style={{ marginBottom: "8px" }}>
            <p style={{
                fontSize: "10px", fontWeight: "500", color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase", letterSpacing: "0.08em",
                padding: "0 16px", marginBottom: "4px",
            }}>
                {label}
            </p>
            {links.map(({ label, path, icon: Icon }) => (
                <NavLink key={path} to={path} style={({ isActive }) => linkStyle(isActive)}>
                    <Icon size={16} />
                    {label}
                </NavLink>
            ))}
        </div>
    )
}

export default function Sidebar() {
    const { landlord, logout } = useAuthStore()
    const navigate = useNavigate()

    const initials = landlord?.name
        ? landlord.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : "RL"

    return (
        <aside className="sidebar-desktop" style={{
            width: "240px", backgroundColor: "#0a4a38",
            position: "fixed", top: 0, left: 0, bottom: 0,
            display: "flex", flexDirection: "column",
            zIndex: 100, overflowY: "auto",
        }}>
            {/* Brand */}
            <div style={{ padding: "24px 20px 20px" }}>
                <h1 style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: "22px", color: "#fff", margin: 0, lineHeight: 1,
                }}>
                    RentFlow
                </h1>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>
                    Property Management
                </p>
            </div>

            <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.08)", margin: "0 16px" }} />

            {/* Nav links */}
            <nav style={{ flex: 1, padding: "16px 8px" }}>
                <SidebarSection label="Main" links={mainLinks} />
                <SidebarSection label="Financials" links={financialLinks} />
                <SidebarSection label="Manage" links={manageLinks} />
            </nav>

            <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.08)", margin: "0 16px" }} />

            {/* User + sign out */}
            <div style={{ padding: "16px 8px" }}>
                <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 16px", borderRadius: "8px",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    marginBottom: "4px",
                }}>
                    <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        backgroundColor: "#1D9E75",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "12px", color: "#fff", fontWeight: "600", flexShrink: 0,
                    }}>
                        {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: "13px", fontWeight: "600", color: "#fff",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                            {landlord?.name || "Landlord"}
                        </div>
                        <div style={{
                            fontSize: "11px", color: "rgba(255,255,255,0.4)",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                            {landlord?.phoneNumber || ""}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => { logout(); navigate("/login") }}
                    style={{
                        width: "100%", display: "flex", alignItems: "center", gap: "10px",
                        padding: "9px 16px", borderRadius: "8px",
                        backgroundColor: "transparent", border: "none",
                        color: "rgba(255,255,255,0.5)", fontSize: "14px",
                        fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                        transition: "all 0.15s",
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"
                        e.currentTarget.style.color = "#fff"
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = "transparent"
                        e.currentTarget.style.color = "rgba(255,255,255,0.5)"
                    }}
                >
                    <LogOut size={16} />
                    Sign out
                </button>
            </div>
        </aside>
    )
}