import {NavLink, useNavigate} from "react-router-dom"
import {
    Activity, BarChart3, Building2, CreditCard, FileText, Home, LayoutDashboard, LogOut, Settings, UserCog, Users,
} from "lucide-react"
import useAuthStore from "@/store/authStore"
import useSettingsStore from "@/store/settingsStore"
import PropertySwitcher from "./PropertySwitcher"
import {Avatar} from "@/components/ui"
import {cn} from "@/lib/cn"

// managerOk = visible to PROPERTY_MANAGERs; everything else is admin/owner-only.
const mainLinks = [
    {label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, managerOk: false},
    {label: "Tenants", path: "/tenants", icon: Users, managerOk: true},
]

const financialLinks = [
    {label: "Payments", path: "/payments", icon: CreditCard, managerOk: true},
    {label: "Reports", path: "/reports", icon: BarChart3, managerOk: false},
]

const manageLinks = [
    {label: "Properties", path: "/properties", icon: Home, managerOk: false},
    {label: "Units", path: "/units", icon: Building2, managerOk: true},
    {label: "Agreements", path: "/agreements", icon: FileText, managerOk: true},
    {label: "Users", path: "/users", icon: UserCog, managerOk: false},
    {label: "Activity", path: "/activity", icon: Activity, managerOk: false},
    {label: "Settings", path: "/settings", icon: Settings, managerOk: false},
]

/**
 * Dark-surface hierarchy is built from white alphas over secondary-900,
 * exactly as the design system prescribes. The one accent is primary-300,
 * NOT primary-500: our brand green is dark, and primary-500 on
 * secondary-900 is 1.65:1 — effectively invisible.
 */
function SidebarSection({label, links}) {
    if (links.length === 0) return null
    return (
        <div className="mb-2">
            <p className="mb-1 px-4 text-2xs font-medium uppercase tracking-[0.08em] text-white/30">
                {label}
            </p>
            {links.map(({label: text, path, icon: Icon}) => (
                <NavLink
                    key={path}
                    to={path}
                    className={({isActive}) =>
                        cn(
                            "flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                            isActive
                                ? "bg-white/10 text-white"
                                : "text-white/60 hover:bg-white/5 hover:text-white",
                        )
                    }
                >
                    {({isActive}) => (
                        <>
                            <Icon size={16} className={isActive ? "text-primary-300" : undefined}/>
                            {text}
                        </>
                    )}
                </NavLink>
            ))}
        </div>
    )
}

export default function Sidebar() {
    const {landlord, logout, role} = useAuthStore()
    const {settings, clearSettings} = useSettingsStore()
    const navigate = useNavigate()

    // Managers only see the sections they're allowed to act on.
    const isManager = role === "PROPERTY_MANAGER"
    const visible = (links) => links.filter((l) => !isManager || l.managerOk)

    const companyName = settings?.companyName || "RentFlow"
    const logoUrl = settings?.logoUrl || null

    const handleLogout = () => {
        logout()
        clearSettings()
        navigate("/login")
    }

    return (
        <aside
            className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col overflow-y-auto bg-secondary-900 md:flex">
            {/* Brand */}
            <div className="px-5 pb-5 pt-6">
                {logoUrl ? (
                    <>
                        <img src={logoUrl} alt={companyName} className="mb-1 h-11 max-w-40 object-contain"/>
                        <p className="mt-1 text-2xs text-white/40">{companyName}</p>
                    </>
                ) : (
                    <>
                        <h1 className="truncate font-heading text-2xl leading-none text-white">{companyName}</h1>
                        <p className="mt-1 text-2xs text-white/40">Property Management</p>
                    </>
                )}
            </div>

            <div className="px-4 pb-3">
                <PropertySwitcher/>
            </div>

            <div className="mx-4 h-px bg-white/10"/>

            <nav className="flex-1 px-2 py-4">
                <SidebarSection label="Main" links={visible(mainLinks)}/>
                <SidebarSection label="Financials" links={visible(financialLinks)}/>
                <SidebarSection label="Manage" links={visible(manageLinks)}/>
            </nav>

            <div className="mx-4 h-px bg-white/10"/>

            <div className="px-2 py-4">
                <div className="mb-1 flex items-center gap-2.5 rounded-lg bg-white/5 px-4 py-2.5">
                    <Avatar name={landlord?.name} size={32} className="bg-primary-400 text-white"/>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                            {landlord?.name || "Landlord"}
                        </p>
                        <p className="truncate text-2xs text-white/40">{landlord?.phoneNumber || ""}</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                >
                    <LogOut size={16}/>
                    Sign out
                </button>
            </div>
        </aside>
    )
}
