import {useEffect, useState} from "react"
import {NavLink, useLocation} from "react-router-dom"
import {
    Activity, BarChart3, Building2, CreditCard, FileText, Home,
    LayoutDashboard, MoreHorizontal, Settings, UserCog, Users, X,
} from "lucide-react"
import {useCan} from "@/hooks/usePermissions"
import {cn} from "@/lib/cn"

// Up to this many destinations become tabs; the rest live behind "More". Three
// tabs + a More tab is four slots — the frequently-used pages stay one tap away
// and everything else (including Units, which rarely changes) sits under More.
const MAX_TABS = 3

// Every destination the app has, in priority order and tagged with the
// capability it needs — the same source of truth the sidebar navigates by, so
// mobile and desktop can't drift apart. The first MAX_TABS a user can reach
// become tabs; everything else is reachable under "More". This guarantees that
// on every page exactly one tab is active (a primary tab, or "More"), instead
// of the old bar going blank on any page it didn't happen to list.
const destinations = [
    {label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, can: "viewReports"},
    {label: "Tenants", path: "/tenants", icon: Users, can: "viewOperations"},
    {label: "Payments", path: "/payments", icon: CreditCard, can: "viewOperations"},
    {label: "Units", path: "/units", icon: Building2, can: "viewOperations"},
    {label: "Agreements", path: "/agreements", icon: FileText, can: "viewOperations"},
    {label: "Properties", path: "/properties", icon: Home, can: "manageProperties"},
    {label: "Reports", path: "/reports", icon: BarChart3, can: "viewReports"},
    {label: "Users", path: "/users", icon: UserCog, can: "manageUsers"},
    {label: "Activity", path: "/activity", icon: Activity, can: "viewActivity"},
    {label: "Settings", path: "/settings", icon: Settings, can: "manageBranding"},
]

// A destination owns the current page when the path matches it or nests under
// it — so /tenants/123 keeps Tenants active and /settings/profile keeps
// Settings active.
const owns = (pathname, path) => pathname === path || pathname.startsWith(path + "/")

const ITEM_BASE =
    "flex flex-1 flex-col items-center justify-center gap-1 px-0.5 py-2.5 text-2xs transition-colors"

export default function BottomNav() {
    const can = useCan()
    const {pathname} = useLocation()
    const [moreOpen, setMoreOpen] = useState(false)

    const reachable = destinations.filter((d) => can(d.can))
    const tabs = reachable.slice(0, MAX_TABS)
    const overflow = reachable.slice(MAX_TABS)

    const moreActive = overflow.some((d) => owns(pathname, d.path))

    return (
        <>
            {moreOpen && (
                <MoreSheet items={overflow} pathname={pathname} onClose={() => setMoreOpen(false)}/>
            )}

            <nav
                className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 bg-secondary-900 pb-[env(safe-area-inset-bottom)] md:hidden">
                {tabs.map(({label, path, icon: Icon}) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({isActive}) =>
                            cn(ITEM_BASE, isActive ? "text-primary-300" : "text-white/50")
                        }
                    >
                        <Icon size={20}/>
                        {label}
                    </NavLink>
                ))}

                {overflow.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setMoreOpen(true)}
                        aria-haspopup="menu"
                        aria-expanded={moreOpen}
                        className={cn(ITEM_BASE, moreActive || moreOpen ? "text-primary-300" : "text-white/50")}
                    >
                        <MoreHorizontal size={20}/>
                        More
                    </button>
                )}
            </nav>
        </>
    )
}

/** Bottom sheet listing the destinations that didn't fit as tabs. */
function MoreSheet({items, pathname, onClose}) {
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose()
        }
        document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
    }, [onClose])

    return (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-label="More navigation">
            <div className="absolute inset-0 bg-neutral-95/50 animate-fade-in" onClick={onClose}/>

            <div
                className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-white/10 bg-secondary-900 pb-[env(safe-area-inset-bottom)] animate-slide-up">
                <div className="flex items-center justify-between px-5 pb-2 pt-4">
                    <p className="text-2xs font-medium uppercase tracking-[0.08em] text-white/40">More</p>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="-mr-1 flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                    >
                        <X size={18}/>
                    </button>
                </div>

                <nav className="grid grid-cols-3 gap-1 px-3 pb-4">
                    {items.map(({label, path, icon: Icon}) => {
                        const active = owns(pathname, path)
                        return (
                            <NavLink
                                key={path}
                                to={path}
                                onClick={onClose}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-4 text-xs transition-colors",
                                    active
                                        ? "bg-white/10 text-primary-300"
                                        : "text-white/60 hover:bg-white/5 hover:text-white",
                                )}
                            >
                                <Icon size={22}/>
                                {label}
                            </NavLink>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}
