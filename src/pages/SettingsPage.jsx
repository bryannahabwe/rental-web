import {useNavigate} from "react-router-dom"
import PageWrapper from "@/components/layout/PageWrapper"
import useAuthStore from "@/store/authStore"
import useSettingsStore from "@/store/settingsStore"
import {Activity, BarChart3, Briefcase, Building, Building2, ChevronRight, FileText, LogOut, Receipt, UserCircle, Users,} from "lucide-react"

export default function SettingsPage() {
    const navigate = useNavigate()
    const {landlord, logout} = useAuthStore()
    const {settings, clearSettings} = useSettingsStore()

    const initials = landlord?.name
        ? landlord.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : "RL"

    const handleLogout = () => {
        logout()
        clearSettings()
        navigate("/login")
    }

    const sections = [
        {
            label: "ACCOUNT",
            items: [
                {
                    icon: UserCircle,
                    label: "My Profile",
                    description: "Your name and phone number",
                    path: "/settings/profile",
                    color: "#185FA5",
                },
                {
                    icon: Briefcase,
                    label: "Business Profile",
                    description: "Company name, logo and address",
                    path: "/settings/business-profile",
                    color: "#0F6E56",
                },
                {
                    icon: Receipt,
                    label: "Receipt Settings",
                    description: "Prefix, numbering and style",
                    path: "/settings/receipt-settings",
                    color: "#854F0B",
                },
            ],
        },
        {
            label: "MANAGE",
            items: [
                {
                    icon: Building,
                    label: "Properties",
                    description: "Add and manage properties",
                    path: "/properties",
                    color: "#7C3AED",
                },
                {
                    icon: Building2,
                    label: "Units",
                    description: "Manage your rental units",
                    path: "/units",
                    color: "#185FA5",
                },
                {
                    icon: FileText,
                    label: "Agreements",
                    description: "Tenant agreements & billing",
                    path: "/agreements",
                    color: "#0a4a38",
                },
            ],
        },
        {
            label: "ADMINISTRATION",
            items: [
                {
                    icon: Users,
                    label: "User Management",
                    description: "Invite and manage team members",
                    path: "/users",
                    color: "#0F6E56",
                },
                {
                    icon: Activity,
                    label: "Activity Log",
                    description: "Audit trail of account actions",
                    path: "/activity",
                    color: "#854F0B",
                },
            ],
        },
        {
            label: "REPORTS",
            items: [
                {
                    icon: BarChart3,
                    label: "Reports",
                    description: "Revenue & occupancy analytics",
                    path: "/reports",
                    color: "#6b7280",
                },
            ],
        },
    ]

    return (
        <PageWrapper title="Settings">

            {/* Landlord profile card */}
            <div style={{
                backgroundColor: "#fff", borderRadius: "12px",
                border: "1px solid #f0f0f0", padding: "20px",
                marginBottom: "20px",
                display: "flex", alignItems: "center", gap: "16px",
            }}>
                {settings?.logoUrl ? (
                    <img
                        src={settings.logoUrl}
                        alt={settings.companyName || "Logo"}
                        style={{
                            width: "56px", height: "56px", borderRadius: "12px",
                            objectFit: "contain", border: "1px solid #f0f0f0",
                        }}
                    />
                ) : (
                    <div style={{
                        width: "56px", height: "56px", borderRadius: "50%",
                        backgroundColor: "#0a4a38",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "20px", color: "#fff", fontWeight: "600", flexShrink: 0,
                    }}>
                        {initials}
                    </div>
                )}
                <div style={{flex: 1, minWidth: 0}}>
                    <div style={{
                        fontSize: "17px", fontWeight: "700", color: "#111827",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                        {settings?.companyName || landlord?.name || "Landlord"}
                    </div>
                    <div style={{fontSize: "13px", color: "#9ca3af", marginTop: "2px"}}>
                        {landlord?.phoneNumber || ""}
                    </div>
                    {landlord?.email && (
                        <div style={{fontSize: "13px", color: "#9ca3af"}}>
                            {landlord.email}
                        </div>
                    )}
                </div>
            </div>

            {/* Menu sections */}
            {sections.map((section) => (
                <div key={section.label} style={{marginBottom: "20px"}}>
                    <p style={{
                        fontSize: "11px", fontWeight: "500", color: "#9ca3af",
                        textTransform: "uppercase", letterSpacing: "0.08em",
                        marginBottom: "8px", paddingLeft: "4px",
                    }}>
                        {section.label}
                    </p>
                    <div style={{
                        backgroundColor: "#fff", borderRadius: "12px",
                        border: "1px solid #f0f0f0", overflow: "hidden",
                    }}>
                        {section.items.map((item, i) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                style={{
                                    width: "100%", padding: "16px 20px",
                                    display: "flex", alignItems: "center", gap: "14px",
                                    backgroundColor: "#fff", border: "none",
                                    borderTop: i === 0 ? "none" : "1px solid #f3f4f6",
                                    cursor: "pointer", textAlign: "left",
                                    fontFamily: "'DM Sans', sans-serif",
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f9fafb"}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}
                            >
                                <div style={{
                                    width: "40px", height: "40px", borderRadius: "10px",
                                    backgroundColor: item.color + "15",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0,
                                }}>
                                    <item.icon size={18} color={item.color}/>
                                </div>
                                <div style={{flex: 1}}>
                                    <div style={{fontSize: "14px", fontWeight: "600", color: "#111827"}}>
                                        {item.label}
                                    </div>
                                    <div style={{fontSize: "12px", color: "#9ca3af", marginTop: "2px"}}>
                                        {item.description}
                                    </div>
                                </div>
                                <ChevronRight size={16} color="#9ca3af"/>
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            {/* Sign out */}
            <div style={{marginBottom: "20px"}}>
                <p style={{
                    fontSize: "11px", fontWeight: "500", color: "#9ca3af",
                    textTransform: "uppercase", letterSpacing: "0.08em",
                    marginBottom: "8px", paddingLeft: "4px",
                }}>
                    DANGER ZONE
                </p>
                <div style={{
                    backgroundColor: "#fff", borderRadius: "12px",
                    border: "1px solid #f0f0f0", overflow: "hidden",
                }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: "100%", padding: "16px 20px",
                            display: "flex", alignItems: "center", gap: "14px",
                            backgroundColor: "#fff", border: "none",
                            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fef2f2"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}
                    >
                        <div style={{
                            width: "40px", height: "40px", borderRadius: "10px",
                            backgroundColor: "#fef2f2",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                        }}>
                            <LogOut size={18} color="#dc2626"/>
                        </div>
                        <div style={{flex: 1}}>
                            <div style={{fontSize: "14px", fontWeight: "600", color: "#dc2626"}}>
                                Sign out
                            </div>
                            <div style={{fontSize: "12px", color: "#9ca3af", marginTop: "2px"}}>
                                Log out of your account
                            </div>
                        </div>
                        <ChevronRight size={16} color="#9ca3af"/>
                    </button>
                </div>
            </div>

            <p style={{
                textAlign: "center", fontSize: "12px",
                color: "#d1d5db", marginTop: "8px",
            }}>
                RentFlow · Property Management · v1.0
            </p>

        </PageWrapper>
    )
}