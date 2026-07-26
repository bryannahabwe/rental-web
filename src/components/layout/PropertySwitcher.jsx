import {useEffect, useRef, useState} from "react"
import {useNavigate} from "react-router-dom"
import {Building2, Check, ChevronsUpDown, Plus} from "lucide-react"
import usePropertyStore from "@/store/propertyStore"
import useAuthStore from "@/store/authStore"
import {useProperties} from "@/hooks/useProperties"

const ALL = "__all__"

/**
 * Workspace-style property switcher. Lists the landlord's properties plus an
 * "All properties" aggregate option, and lets them jump to the manage screen.
 * Rendered on the dark green sidebar/top-bar, so the trigger is styled for a
 * dark background while the dropdown itself is light.
 */
export default function PropertySwitcher() {
    const navigate = useNavigate()
    const {data: properties = []} = useProperties()
    const selectedPropertyId = usePropertyStore(s => s.selectedPropertyId)
    const setSelectedProperty = usePropertyStore(s => s.setSelectedProperty)
    const isManager = useAuthStore(s => s.role === "PROPERTY_MANAGER")
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
        const stillValid = selectedPropertyId
            && properties.some(p => p.id === selectedPropertyId)
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

    const current = properties.find(p => p.id === selectedPropertyId)
    const label = current ? current.name : "All properties"

    const choose = (id) => {
        setSelectedProperty(id === ALL ? null : id)
        setOpen(false)
    }

    return (
        <div ref={ref} style={{position: "relative"}}>
            <button
                onClick={() => setOpen(v => !v)}
                style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "10px",
                    padding: "9px 12px", borderRadius: "8px", cursor: "pointer",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff", fontFamily: "'DM Sans', sans-serif",
                    textAlign: "left",
                }}
            >
                <div style={{
                    width: "26px", height: "26px", borderRadius: "6px", flexShrink: 0,
                    backgroundColor: "rgba(255,255,255,0.14)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Building2 size={15}/>
                </div>
                <div style={{flex: 1, minWidth: 0}}>
                    <div style={{
                        fontSize: "10px", color: "rgba(255,255,255,0.5)",
                        textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>
                        Property
                    </div>
                    <div style={{
                        fontSize: "13px", fontWeight: 600, color: "#fff",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                        {label}
                    </div>
                </div>
                <ChevronsUpDown size={15} color="rgba(255,255,255,0.6)"/>
            </button>

            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                    backgroundColor: "#fff", borderRadius: "10px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
                    border: "1px solid #eef0ef", zIndex: 400, overflow: "hidden",
                }}>
                    <div style={{maxHeight: "260px", overflowY: "auto", padding: "6px"}}>
                        {!isManager && (
                            <SwitchRow
                                active={selectedPropertyId === null}
                                title="All properties"
                                subtitle="Combined view"
                                onClick={() => choose(ALL)}
                            />
                        )}
                        {properties.map(p => (
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
                            onClick={() => {
                                setOpen(false)
                                navigate("/properties")
                            }}
                            style={{
                                width: "100%", display: "flex", alignItems: "center", gap: "8px",
                                padding: "11px 14px", borderTop: "1px solid #f3f4f6",
                                backgroundColor: "#fff", border: "none", cursor: "pointer",
                                fontSize: "13px", color: "#0F6E56", fontWeight: 500,
                                fontFamily: "'DM Sans', sans-serif",
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f6fbf9"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}
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
            onClick={onClick}
            style={{
                width: "100%", display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 10px", borderRadius: "8px", cursor: "pointer",
                backgroundColor: active ? "#E1F5EE" : "transparent",
                border: "none", textAlign: "left",
                fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={e => {
                if (!active) e.currentTarget.style.backgroundColor = "#f6f7f7"
            }}
            onMouseLeave={e => {
                if (!active) e.currentTarget.style.backgroundColor = "transparent"
            }}
        >
            <div style={{flex: 1, minWidth: 0}}>
                <div style={{
                    fontSize: "13px", fontWeight: 600, color: "#111827",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                    {title}
                </div>
                <div style={{fontSize: "11px", color: "#9ca3af"}}>{subtitle}</div>
            </div>
            {active && <Check size={15} color="#0F6E56"/>}
        </button>
    )
}
