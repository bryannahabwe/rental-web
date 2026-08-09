import {useEffect, useRef, useState} from "react"
import {useNavigate} from "react-router-dom"
import {Building2, Check, ChevronsUpDown, Plus} from "lucide-react"
import usePropertyStore from "@/store/propertyStore"
import {useHasMultipleProperties, useIsPropertyScoped} from "@/hooks/usePermissions"
import {useProperties} from "@/hooks/useProperties"
import {cn} from "@/lib/cn"

const ALL = "__all__"

const TRIGGER_CLASS =
    "flex w-full items-center gap-2.5 rounded-lg border border-white/15 bg-white/8 px-3 py-2.5 text-left text-white"

/** The icon + "Property" label + name, shared by the interactive trigger and
 *  the static single-property label. */
function SwitcherFace({label}) {
    return (
        <>
            <span
                className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-md bg-white/15 text-white">
                <Building2 size={15}/>
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-2xs uppercase tracking-[0.06em] text-white/50">Property</span>
                <span className="block truncate text-sm font-semibold text-white">{label}</span>
            </span>
        </>
    )
}

/**
 * Workspace-style property switcher. Lists the landlord's properties plus an
 * "All properties" aggregate option, and lets them jump to the manage screen.
 * Rendered on the dark secondary-900 sidebar/top-bar, so the trigger uses the
 * white-alpha system while the dropdown itself is a light popover.
 *
 * With a single property there's nothing to switch to, so it collapses to a
 * static label — the property name stays as context/identity, but without a
 * dropdown affordance that would do nothing.
 */
export default function PropertySwitcher() {
    const navigate = useNavigate()
    const {data: properties = []} = useProperties()
    const selectedPropertyId = usePropertyStore((s) => s.selectedPropertyId)
    const setSelectedProperty = usePropertyStore((s) => s.setSelectedProperty)
    // Deliberately the ACCOUNT role, not the effective one: no property-scoped
    // user has the "All properties" aggregate, and deriving this from the
    // effective role would make the switcher's options depend on the selection
    // the switcher itself controls.
    const isScoped = useIsPropertyScoped()
    const interactive = useHasMultipleProperties()
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    // Selection validity (auto-pick, stale fallback) lives in
    // usePropertySelectionSync, mounted app-wide.
    const current = properties.find((p) => p.id === selectedPropertyId)
    const label = current ? current.name : "All properties"

    const choose = (id) => {
        setSelectedProperty(id === ALL ? null : id)
        setOpen(false)
    }

    // Single property → static label. Keep the property's identity visible, but
    // drop the dropdown that would only ever offer the one option.
    if (!interactive) {
        const only = current ?? properties[0]
        if (!only) return null
        return (
            <div className={TRIGGER_CLASS}>
                <SwitcherFace label={only.name}/>
            </div>
        )
    }

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={cn(TRIGGER_CLASS, "transition-colors hover:bg-white/12")}
            >
                <SwitcherFace label={label}/>
                <ChevronsUpDown size={15} className="shrink-0 text-white/60"/>
            </button>

            {open && (
                <div
                    role="listbox"
                    className="absolute inset-x-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-neutral-5 bg-white shadow-dialog animate-scale-in"
                >
                    <div className="max-h-65 overflow-y-auto p-1.5">
                        {!isScoped && (
                            <SwitchRow
                                active={selectedPropertyId === null}
                                title="All properties"
                                subtitle="Combined view"
                                onClick={() => choose(ALL)}
                            />
                        )}
                        {properties.map((p) => (
                            <SwitchRow
                                key={p.id}
                                active={p.id === selectedPropertyId}
                                title={p.name}
                                subtitle={`${p.unitCount} unit${p.unitCount === 1 ? "" : "s"} · ${p.tenantCount} tenant${p.tenantCount === 1 ? "" : "s"}`}
                                onClick={() => choose(p.id)}
                            />
                        ))}
                    </div>

                    {!isScoped && (
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false)
                                navigate("/properties")
                            }}
                            className="flex w-full items-center gap-2 border-t border-neutral-5 px-3.5 py-2.5 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
                        >
                            <Plus size={15}/> Manage properties
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

function SwitchRow({active, title, subtitle, onClick}) {
    return (
        <button
            type="button"
            role="option"
            aria-selected={active}
            onClick={onClick}
            className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                active ? "bg-primary-50" : "hover:bg-neutral-5",
            )}
        >
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-neutral-90">{title}</span>
                <span className="block truncate text-2xs text-neutral-40">{subtitle}</span>
            </span>
            {active && <Check size={15} className="shrink-0 text-primary-600"/>}
        </button>
    )
}
