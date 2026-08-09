import {useEffect, useState} from "react"
import {NavLink, useLocation} from "react-router-dom"
import {ArrowRight, MoreHorizontal, X} from "lucide-react"
import {useCan} from "@/hooks/usePermissions"
import {MORE_PATH, NAV_DESTINATIONS, PRIMARY_TABS, ownsPath} from "@/lib/nav"
import {cn} from "@/lib/cn"

const ITEM_BASE =
    "flex flex-1 flex-col items-center justify-center gap-1 px-0.5 py-2.5 text-2xs transition-colors"

/**
 * The first PRIMARY_TABS destinations a user can reach become tabs; everything
 * else lives behind "More". Tapping More opens a quick bottom sheet of those
 * destinations, and the sheet's "View all" opens the full More page. "More"
 * stays highlighted whenever the current page is an overflow destination (or
 * the More page, or the sheet is open), so exactly one tab is always active.
 */
export default function BottomNav() {
    const can = useCan()
    const {pathname} = useLocation()
    const [moreOpen, setMoreOpen] = useState(false)

    const reachable = NAV_DESTINATIONS.filter((d) => can(d.can))
    const tabs = reachable.slice(0, PRIMARY_TABS)
    const overflow = reachable.slice(PRIMARY_TABS)

    const moreActive =
        pathname === MORE_PATH || overflow.some((d) => ownsPath(pathname, d.path))

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

/** Quick bottom sheet of the overflow destinations, plus "View all". */
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

                <nav className="grid grid-cols-3 gap-1 px-3">
                    {items.map(({label, path, icon: Icon}) => {
                        const active = ownsPath(pathname, path)
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

                {/* Into the full hub — profile, descriptions and sign-out live there. */}
                <NavLink
                    to={MORE_PATH}
                    onClick={onClose}
                    className="mt-2 flex items-center justify-center gap-1.5 border-t border-white/10 px-5 py-3.5 text-sm font-medium text-primary-300 transition-colors hover:bg-white/5"
                >
                    View all
                    <ArrowRight size={16}/>
                </NavLink>
            </div>
        </div>
    )
}
