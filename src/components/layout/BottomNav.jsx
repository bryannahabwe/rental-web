import {NavLink} from "react-router-dom"
import {Building2, CreditCard, FileText, LayoutDashboard, Settings, Users} from "lucide-react"
import {useCan} from "@/hooks/usePermissions"
import {cn} from "@/lib/cn"

// One list in priority order, each entry tagged with the capability it needs;
// the bar shows the first MAX_ITEMS a user can actually reach. Two hardcoded
// arrays can't express five roles, and a role that matched neither used to fall
// through to the admin bar.
const MAX_ITEMS = 4

const navCandidates = [
    {label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, can: "viewReports"},
    {label: "Tenants", path: "/tenants", icon: Users, can: "viewOperations"},
    {label: "Payments", path: "/payments", icon: CreditCard, can: "viewOperations"},
    {label: "Units", path: "/units", icon: Building2, can: "viewOperations"},
    {label: "Agreements", path: "/agreements", icon: FileText, can: "viewOperations"},
    {label: "Settings", path: "/settings", icon: Settings, can: "manageBranding"},
]

export default function BottomNav() {
    const can = useCan()
    const navItems = navCandidates.filter((i) => can(i.can)).slice(0, MAX_ITEMS)

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
