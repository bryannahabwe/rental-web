import {NavLink, useNavigate} from "react-router-dom"
import {ChevronRight, LogOut} from "lucide-react"
import AppShell from "@/components/layout/AppShell"
import useAuthStore from "@/store/authStore"
import useSettingsStore from "@/store/settingsStore"
import {useCan, useAccountRole} from "@/hooks/usePermissions"
import {Avatar, Card} from "@/components/ui"
import {roleLabel} from "@/lib/roles"
import {NAV_DESTINATIONS, PRIMARY_TABS} from "@/lib/nav"
import {cn} from "@/lib/cn"

/**
 * The mobile "More" hub. Everything the bottom nav couldn't fit as a tab lives
 * here, grouped into sections — the same destination list the bottom nav reads,
 * so the two can't drift. Desktop users navigate by the sidebar and never land
 * here.
 */
export default function MorePage() {
    const can = useCan()
    const navigate = useNavigate()
    const landlord = useAuthStore((s) => s.landlord)
    const role = useAccountRole()
    const logout = useAuthStore((s) => s.logout)
    const clearSettings = useSettingsStore((s) => s.clearSettings)

    // The overflow: reachable destinations that aren't primary tabs, grouped in
    // list order by their section.
    const overflow = NAV_DESTINATIONS.filter((d) => can(d.can)).slice(PRIMARY_TABS)
    const groups = overflow.reduce((acc, dest) => {
        (acc[dest.group] ??= []).push(dest)
        return acc
    }, {})

    const handleLogout = () => {
        logout()
        clearSettings()
        navigate("/login")
    }

    return (
        <AppShell title="More" subtitle="Everything else">
            <div className="mx-auto flex max-w-lg flex-col gap-5">
                {/* Profile card */}
                <Card>
                    <div className="flex items-center gap-4">
                        <Avatar name={landlord?.name} size={52} className="bg-secondary-900 text-white"/>
                        <div className="min-w-0">
                            <p className="truncate font-heading text-lg font-medium text-neutral-90">
                                {landlord?.name || "Account"}
                            </p>
                            <p className="text-2xs font-medium uppercase tracking-wide text-neutral-40">
                                {roleLabel(role)}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Grouped destination lists */}
                {Object.entries(groups).map(([group, items]) => (
                    <section key={group}>
                        <p className="mb-2 px-1 text-2xs font-medium uppercase tracking-[0.08em] text-neutral-40">
                            {group}
                        </p>
                        <Card bodyClass="p-0">
                            {items.map(({label, path, icon: Icon, description}) => (
                                <NavLink
                                    key={path}
                                    to={path}
                                    className={({isActive}) =>
                                        cn(
                                            "flex items-center gap-3.5 border-b border-neutral-5 px-4 py-3.5 transition-colors last:border-0",
                                            isActive ? "bg-primary-50/60" : "hover:bg-neutral-0",
                                        )
                                    }
                                >
                                    <span
                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                                        <Icon size={20}/>
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-neutral-90">{label}</p>
                                        <p className="truncate text-sm text-neutral-40">{description}</p>
                                    </div>
                                    <ChevronRight size={18} className="shrink-0 text-neutral-30"/>
                                </NavLink>
                            ))}
                        </Card>
                    </section>
                ))}

                {/* Sign out */}
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2.5 rounded-lg border border-neutral-5 bg-white px-4 py-3.5 text-sm font-medium text-danger-600 shadow-card transition-colors hover:bg-danger-50"
                >
                    <LogOut size={18}/>
                    Sign out
                </button>
            </div>
        </AppShell>
    )
}
