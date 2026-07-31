import {useEffect, useState} from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import {useActivity} from "@/hooks/useActivity"
import {
    BarChart3, Building2, CreditCard, FileText, Home, LogIn,
    Receipt, Settings, ShieldAlert, UserCog, Users,
} from "lucide-react"

// Each entry is a filter preset: a module, optionally narrowed to one action.
const FILTERS = [
    {id: "", label: "All activity"},
    {id: "PAYMENT", label: "Payments", module: "PAYMENT"},
    {id: "TENANT", label: "Tenants", module: "TENANT"},
    {id: "UNIT", label: "Units", module: "UNIT"},
    {id: "RENTAL_AGREEMENT", label: "Agreements", module: "RENTAL_AGREEMENT"},
    {id: "PROPERTY", label: "Properties", module: "PROPERTY"},
    {id: "USER", label: "Users", module: "USER"},
    {id: "SETTINGS", label: "Settings & receipts", module: "SETTINGS"},
    {id: "REPORT", label: "Reports", module: "REPORT"},
    {id: "AUTHENTICATION", label: "Sign-ins", module: "AUTHENTICATION"},
    {id: "LOGIN_FAILED", label: "Failed sign-ins", module: "AUTHENTICATION", action: "LOGIN_FAILED"},
]

const MODULE_ICON = {
    TENANT: Users,
    UNIT: Building2,
    RENTAL_AGREEMENT: FileText,
    PAYMENT: CreditCard,
    PROPERTY: Home,
    USER: UserCog,
    SETTINGS: Settings,
    REPORT: BarChart3,
    AUTHENTICATION: LogIn,
}

const MODULE_TINT = {
    TENANT: "#E1F5EE", UNIT: "#eef2ff", RENTAL_AGREEMENT: "#fef9c3",
    PAYMENT: "#dcfce7", PROPERTY: "#E1F5EE", USER: "#f3e8ff",
    SETTINGS: "#fef3c7", REPORT: "#e0f2fe", AUTHENTICATION: "#f1f5f9",
}
const MODULE_COLOR = {
    TENANT: "#0F6E56", UNIT: "#4338ca", RENTAL_AGREEMENT: "#854d0e",
    PAYMENT: "#15803d", PROPERTY: "#0F6E56", USER: "#7e22ce",
    SETTINGS: "#854F0B", REPORT: "#0369a1", AUTHENTICATION: "#475569",
}

// A few actions read better with their own mark than their module's — a
// rejected sign-in especially, which shouldn't look like a routine one.
const ACTION_ICON = {LOGIN_FAILED: ShieldAlert, ISSUE_RECEIPT: Receipt, VIEW_REPORT: BarChart3}
const ACTION_TINT = {LOGIN_FAILED: "#fee2e2"}
const ACTION_COLOR = {LOGIN_FAILED: "#b91c1c"}

function formatTime(iso) {
    const d = new Date(iso)
    if (isNaN(d)) return ""
    const diffMs = Date.now() - d.getTime()
    const mins = Math.round(diffMs / 60000)
    let rel
    if (mins < 1) rel = "just now"
    else if (mins < 60) rel = `${mins}m ago`
    else if (mins < 1440) rel = `${Math.round(mins / 60)}h ago`
    else rel = `${Math.round(mins / 1440)}d ago`
    const abs = d.toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    })
    return {rel, abs}
}

export default function ActivityPage() {
    const [page, setPage] = useState(0)
    const [filterId, setFilterId] = useState("")
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(0)
        }, 400)
        return () => clearTimeout(t)
    }, [search])

    const filter = FILTERS.find(f => f.id === filterId) || FILTERS[0]

    const {data, isLoading} = useActivity({
        page, size: 20,
        module: filter.module,
        action: filter.action,
        search: debouncedSearch || undefined,
    })

    const entries = data?.content || []
    const totalPages = data?.totalPages || 0

    return (
        <PageWrapper title="Activity" showBack>
            {/* Filters */}
            <div style={{
                marginBottom: "16px", display: "flex", gap: "10px",
                alignItems: "center", flexWrap: "wrap",
            }}>
                <input
                    type="text" value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search activity..."
                    style={{
                        flex: 1, minWidth: "160px", maxWidth: "360px",
                        padding: "10px 14px", fontSize: "14px", borderRadius: "8px",
                        border: "1px solid #e5e7eb", outline: "none", boxSizing: "border-box",
                        fontFamily: "'DM Sans', sans-serif", color: "#111827", backgroundColor: "#fff",
                    }}
                    onFocus={e => e.target.style.borderColor = "#0F6E56"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                />
                <select
                    value={filterId}
                    onChange={e => {
                        setFilterId(e.target.value)
                        setPage(0)
                    }}
                    style={{
                        padding: "10px 14px", fontSize: "14px", borderRadius: "8px",
                        border: "1px solid #e5e7eb", outline: "none",
                        fontFamily: "'DM Sans', sans-serif", color: "#374151", backgroundColor: "#fff",
                    }}
                >
                    {FILTERS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
            </div>

            <div style={{
                backgroundColor: "#fff", borderRadius: "12px",
                border: "1px solid #f0f0f0", overflow: "hidden",
            }}>
                {isLoading ? (
                    <div style={{padding: "60px", textAlign: "center", color: "#9ca3af", fontSize: "14px"}}>
                        Loading activity...
                    </div>
                ) : entries.length === 0 ? (
                    <div style={{padding: "60px", textAlign: "center", color: "#9ca3af", fontSize: "14px"}}>
                        No activity yet.
                    </div>
                ) : (
                    <>
                        {entries.map((e, i) => {
                            const Icon = ACTION_ICON[e.action] || MODULE_ICON[e.module] || FileText
                            const tint = ACTION_TINT[e.action] || MODULE_TINT[e.module] || "#f1f5f9"
                            const color = ACTION_COLOR[e.action] || MODULE_COLOR[e.module] || "#475569"
                            const time = formatTime(e.createdAt)
                            return (
                                <div key={e.id} style={{
                                    display: "flex", gap: "14px", padding: "14px 20px",
                                    borderTop: i === 0 ? "none" : "1px solid #f5f5f5",
                                }}>
                                    <div style={{
                                        width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                                        backgroundColor: tint,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <Icon size={17} color={color}/>
                                    </div>
                                    <div style={{flex: 1, minWidth: 0}}>
                                        <div style={{fontSize: "14px", color: "#111827", lineHeight: 1.5}}>
                                            {e.statement}
                                        </div>
                                        <div style={{fontSize: "12px", color: "#9ca3af", marginTop: "3px"}}
                                             title={time.abs}>
                                            {e.actingUserName} · {time.rel}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {totalPages > 1 && (
                            <div style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "14px 20px", borderTop: "1px solid #f3f4f6",
                            }}>
                                <span style={{fontSize: "13px", color: "#9ca3af"}}>
                                    Page {page + 1} of {totalPages}
                                </span>
                                <div style={{display: "flex", gap: "8px"}}>
                                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                                            style={pageBtn(page === 0)}>Previous</button>
                                    <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                                            style={pageBtn(page >= totalPages - 1)}>Next</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </PageWrapper>
    )
}

const pageBtn = (disabled) => ({
    padding: "6px 14px", borderRadius: "6px", fontSize: "13px",
    border: "1px solid #e5e7eb", backgroundColor: "#fff",
    color: disabled ? "#d1d5db" : "#374151",
    cursor: disabled ? "not-allowed" : "pointer",
})
