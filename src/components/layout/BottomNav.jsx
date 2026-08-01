import {NavLink} from "react-router-dom"
import {Building2, CreditCard, FileText, LayoutDashboard, Settings, Users} from "lucide-react"
import useAuthStore from "@/store/authStore"
import {cn} from "@/lib/cn"

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
    const role = useAuthStore((s) => s.role)
    const navItems = role === "PROPERTY_MANAGER" ? managerItems : adminItems

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 bg-secondary-900 pb-[env(safe-area-inset-bottom)] md:hidden">
            {navItems.map(({label, path, icon: Icon}) => (
                <NavLink
                    key={path}
                    to={path}
                    className={({isActive}) =>
                        cn(
                            "flex flex-1 flex-col items-center justify-center gap-1 px-0.5 py-2.5 text-2xs transition-colors",
                            // Label sizes step up from 10px to text-2xs (11px):
                            // 10px body text is below the legibility floor on a phone.
                            isActive ? "text-primary-300" : "text-white/50",
                        )
                    }
                >
                    <Icon size={20}/>
                    {label}
                </NavLink>
            ))}
        </nav>
    )
}
