import { NavLink, useNavigate } from "react-router-dom"
import useAuthStore from "@/store/authStore"
import {
    LayoutDashboard, Users, Building2, FileText, CreditCard, BarChart3, LogOut,
} from "lucide-react"

const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Tenants", path: "/tenants", icon: Users },
    { label: "Units", path: "/units", icon: Building2 },
    { label: "Agreements", path: "/agreements", icon: FileText },
    { label: "Payments", path: "/payments", icon: CreditCard },
    { label: "Reports", path: "/reports", icon: BarChart3 },
]

export default function Sidebar() {
    const { landlord, logout } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const initials = landlord?.name
        ? landlord.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : "RL"

    return (
        <aside className="sidebar-desktop" style={{
            width: "240px",
            minHeight: "100vh",
            backgroundColor: "#0a4a38",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 100,
        }}>

            {/* Logo */}
            <div style={{
                padding: "24px 20px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}>
                <div style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: "22px",
                    color: "#ffffff",
                    lineHeight: 1.2,
                }}>RentFlow</div>
                <div style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginTop: "3px",
                }}>Property Management</div>
            </div>

            {/* Nav */}
            <nav style={{ padding: "16px 12px", flex: 1 }}>
                <div style={{
                    fontSize: "10px", color: "rgba(255,255,255,0.3)",
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    padding: "8px 8px 8px", marginBottom: "4px",
                }}>
                    Main
                </div>

                {navItems.slice(0, 4).map(({ label, path, icon: Icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        style={({ isActive }) => ({
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "9px 10px", borderRadius: "8px", marginBottom: "2px",
                            textDecoration: "none", fontSize: "14px",
                            fontFamily: "'DM Sans', sans-serif",
                            backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                            color: isActive ? "#ffffff" : "rgba(255,255,255,0.6)",
                            fontWeight: isActive ? "500" : "400",
                            transition: "all 0.15s",
                        })}
                    >
                        <Icon size={16} />
                        {label}
                    </NavLink>
                ))}

                <div style={{
                    fontSize: "10px", color: "rgba(255,255,255,0.3)",
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    padding: "8px 8px 8px", marginTop: "12px", marginBottom: "4px",
                }}>
                    Financials
                </div>

                {navItems.slice(4).map(({ label, path, icon: Icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        style={({ isActive }) => ({
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "9px 10px", borderRadius: "8px", marginBottom: "2px",
                            textDecoration: "none", fontSize: "14px",
                            fontFamily: "'DM Sans', sans-serif",
                            backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                            color: isActive ? "#ffffff" : "rgba(255,255,255,0.6)",
                            fontWeight: isActive ? "500" : "400",
                            transition: "all 0.15s",
                        })}
                    >
                        <Icon size={16} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* User footer */}
            <div style={{
                padding: "16px 12px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
            }}>
                {/* User info */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <div style={{
                        width: "34px", height: "34px", borderRadius: "50%",
                        backgroundColor: "#1D9E75", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: "12px", color: "#fff", fontWeight: "600", flexShrink: 0,
                    }}>
                        {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: "13px", color: "#ffffff", fontWeight: "500",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                            {landlord?.name || "Landlord"}
                        </div>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
                            {landlord?.phoneNumber || ""}
                        </div>
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        width: "100%", padding: "8px 10px", borderRadius: "8px",
                        backgroundColor: "transparent", border: "none",
                        color: "rgba(255,255,255,0.4)", fontSize: "13px",
                        fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                        transition: "all 0.15s",
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"
                        e.currentTarget.style.color = "rgba(255,255,255,0.7)"
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = "transparent"
                        e.currentTarget.style.color = "rgba(255,255,255,0.4)"
                    }}
                >
                    <LogOut size={14} />
                    Sign out
                </button>
            </div>
        </aside>
    )
}