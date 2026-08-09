import {NavLink, useLocation} from "react-router-dom"
import {MoreHorizontal} from "lucide-react"
import {useCan} from "@/hooks/usePermissions"
import {MORE_PATH, NAV_DESTINATIONS, PRIMARY_TABS, ownsPath} from "@/lib/nav"
import {cn} from "@/lib/cn"

const ITEM_BASE =
    "flex flex-1 flex-col items-center justify-center gap-1 px-0.5 py-2.5 text-2xs transition-colors"

/**
 * The first PRIMARY_TABS destinations a user can reach become tabs; everything
 * else lives on the More page. "More" highlights whenever the current page is
 * one of those overflow destinations (or the More page itself), so on every
 * page exactly one tab is active instead of the bar going blank.
 */
export default function BottomNav() {
    const can = useCan()
    const {pathname} = useLocation()

    const reachable = NAV_DESTINATIONS.filter((d) => can(d.can))
    const tabs = reachable.slice(0, PRIMARY_TABS)
    const overflow = reachable.slice(PRIMARY_TABS)

    const moreActive = pathname === MORE_PATH || overflow.some((d) => ownsPath(pathname, d.path))

    return (
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
                <NavLink
                    to={MORE_PATH}
                    className={cn(ITEM_BASE, moreActive ? "text-primary-300" : "text-white/50")}
                >
                    <MoreHorizontal size={20}/>
                    More
                </NavLink>
            )}
        </nav>
    )
}
