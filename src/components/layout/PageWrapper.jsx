import { useState, useRef, useEffect } from "react"
import Sidebar from "./Sidebar"
import BottomNav from "./BottomNav"
import useAuthStore from "@/store/authStore"
import { useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"

// ── Avatar dropdown ──────────────────────────────────────
function AvatarMenu() {
    const { landlord, logout } = useAuthStore()
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    const initials = landlord?.name
        ? landlord.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : "RL"

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    return (
        <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
            {/* Avatar circle */}
            <div
                onClick={() => setOpen(v => !v)}
                style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    backgroundColor: "#1D9E75",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", color: "#fff", fontWeight: "600",
                    cursor: "pointer",
                    border: open ? "2px solid #5DCAA5" : "2px solid transparent",
                    transition: "border-color 0.15s",
                }}
            >
                {initials}
            </div>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: "absolute", top: "44px", right: 0,
                    backgroundColor: "#fff", borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    minWidth: "220px", zIndex: 300,
                    border: "1px solid #f0f0f0",
                    overflow: "hidden",
                }}>
                    {/* User info */}
                    <div style={{
                        padding: "14px 16px",
                        borderBottom: "1px solid #f3f4f6",
                        display: "flex", alignItems: "center", gap: "12px",
                    }}>
                        <div style={{
                            width: "38px", height: "38px", borderRadius: "50%",
                            backgroundColor: "#0a4a38",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "14px", color: "#fff", fontWeight: "600", flexShrink: 0,
                        }}>
                            {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: "14px", fontWeight: "600", color: "#111827",
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}>
                                {landlord?.name || "Landlord"}
                            </div>
                            <div style={{
                                fontSize: "12px", color: "#9ca3af",
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}>
                                {landlord?.phoneNumber || ""}
                            </div>
                        </div>
                    </div>

                    {/* RentFlow brand line */}
                    <div style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid #f3f4f6",
                        display: "flex", alignItems: "center", gap: "10px",
                    }}>
                        <div style={{
                            width: "28px", height: "28px", borderRadius: "8px",
                            backgroundColor: "#E1F5EE",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                        }}>
              <span style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "12px", color: "#0F6E56",
              }}>R</span>
                        </div>
                        <div>
                            <div style={{
                                fontFamily: "'DM Serif Display', serif",
                                fontSize: "13px", color: "#0a4a38", lineHeight: 1,
                            }}>
                                RentFlow
                            </div>
                            <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>
                                Property Management
                            </div>
                        </div>
                    </div>

                    {/* Sign out */}
                    <button
                        onClick={() => { logout(); navigate("/login") }}
                        style={{
                            width: "100%", padding: "13px 16px",
                            display: "flex", alignItems: "center", gap: "10px",
                            backgroundColor: "#fff", border: "none",
                            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                            fontSize: "14px", color: "#dc2626", textAlign: "left",
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fef2f2"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}
                    >
                        <LogOut size={16} color="#dc2626" />
                        Sign out
                    </button>
                </div>
            )}
        </div>
    )
}

// ── Main PageWrapper ─────────────────────────────────────
export default function PageWrapper({ title, actions, mobileAction, children }) {
    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8faf9" }}>

            {/* Sidebar — desktop only */}
            <Sidebar />

            {/* Main area */}
            <div
                className="main-content"
                style={{
                    flex: 1,
                    marginLeft: "240px",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                }}
            >

                {/* Desktop top bar */}
                <div
                    className="desktop-topbar"
                    style={{
                        height: "56px",
                        backgroundColor: "#ffffff",
                        borderBottom: "1px solid #f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 28px",
                        flexShrink: 0,
                        position: "sticky",
                        top: 0,
                        zIndex: 50,
                    }}
                >
                    <h1 style={{
                        fontSize: "15px", fontWeight: "600",
                        color: "#111827", margin: 0,
                        fontFamily: "'DM Sans', sans-serif",
                    }}>
                        {title}
                    </h1>
                    {actions && (
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            {actions}
                        </div>
                    )}
                </div>

                {/* Mobile top bar — two-line: RentFlow + page title */}
                <div
                    className="mobile-topbar"
                    style={{
                        backgroundColor: "#0a4a38",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 16px",
                        flexShrink: 0,
                        position: "sticky",
                        top: 0,
                        zIndex: 50,
                        minHeight: "60px",
                    }}
                >
                    {/* Left — brand + page title stacked */}
                    <div>
                        <div style={{
                            fontFamily: "'DM Serif Display', serif",
                            fontSize: "16px",
                            color: "#ffffff",
                            lineHeight: 1,
                            letterSpacing: "0.01em",
                        }}>
                            RentFlow
                        </div>
                        <div style={{
                            fontSize: "12px",
                            color: "rgba(255,255,255,0.55)",
                            marginTop: "3px",
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: "400",
                        }}>
                            {title}
                        </div>
                    </div>

                    {/* Right — avatar */}
                    <AvatarMenu />
                </div>

                {/* Page content */}
                <div
                    className="page-content"
                    style={{
                        flex: 1,
                        padding: "20px 28px",
                        paddingBottom: "40px",
                    }}
                >
                    {children}
                </div>

            </div>

            {/* Mobile FAB */}
            {mobileAction && (
                <div
                    className="mobile-topbar"
                    style={{
                        display: "none",
                        position: "fixed",
                        bottom: "80px",
                        right: "20px",
                        zIndex: 150,
                    }}
                >
                    {mobileAction}
                </div>
            )}

            {/* Bottom nav — mobile only */}
            <BottomNav />

        </div>
    )
}