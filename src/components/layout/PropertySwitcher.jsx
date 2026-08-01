import {useEffect, useRef, useState} from "react"
import {useNavigate} from "react-router-dom"
import {Building2, Check, ChevronsUpDown, Plus} from "lucide-react"
import usePropertyStore from "@/store/propertyStore"
import useAuthStore from "@/store/authStore"
import {useProperties} from "@/hooks/useProperties"
import {cn} from "@/lib/cn"

const ALL = "__all__"

/**
 * Workspace-style property switcher. Lists the landlord's properties plus an
 * "All properties" aggregate option, and lets them jump to the manage screen.
 * Rendered on the dark secondary-900 sidebar/top-bar, so the trigger uses the
 * white-alpha system while the dropdown itself is a light popover.
 */
export default function PropertySwitcher() {
    const navigate = useNavigate()
    const {data: properties = []} = useProperties()
    const selectedPropertyId = usePropertyStore((s) => s.selectedPropertyId)
    const setSelectedProperty = usePropertyStore((s) => s.setSelectedProperty)
    const isManager = useAuthStore((s) => s.role === "PROPERTY_MANAGER")
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    // Keep the selection valid: if the active property was deleted (or the
    // account changed), fall back to "All properties" so we don't send a stale
    // X-Property-Id that silently filters everything to nothing. Also auto-pick
    // the single property when a landlord only has one.
    useEffect(() => {
        if (!properties.length) return
        const stillValid = selectedPropertyId && properties.some((p) => p.id === selectedPropertyId)
        if (isManager) {
            // Managers have no aggregate view — always land on an assigned property.
            if (!stillValid) setSelectedProperty(properties[0].id)
        } else if (selectedPropertyId && !stillValid) {
            // Selected property was deleted / account changed → back to "All".
            setSelectedProperty(null)
        } else if (selectedPropertyId === null && properties.length === 1) {
            setSelectedProperty(properties[0].id)
        }
    }, [properties, selectedPropertyId, setSelectedProperty, isManager])

    const current = properties.find((p) => p.id === selectedPropertyId)
    const label = current ? current.name : "All properties"

    const choose = (id) => {
        setSelectedProperty(id === ALL ? null : id)
        setOpen(false)
    }

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="flex w-full items-center gap-2.5 rounded-lg border border-white/15 bg-white/8 px-3 py-2.5 text-left text-white transition-colors hover:bg-white/12"
            >
                <span
                    className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-md bg-white/15 text-white">
                    <Building2 size={15}/>
                </span>
                <span className="min-w-0 flex-1">
                    <span
                        className="block text-2xs uppercase tracking-[0.06em] text-white/50">Property</span>
                    <span className="block truncate text-sm font-semibold text-white">{label}</span>
                </span>
                <ChevronsUpDown size={15} className="shrink-0 text-white/60"/>
            </button>

            {open && (
                <div
                    role="listbox"
                    className="absolute inset-x-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-neutral-5 bg-white shadow-dialog animate-scale-in"
                >
                    <div className="max-h-65 overflow-y-auto p-1.5">
                        {!isManager && (
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

                    {!isManager && (
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
