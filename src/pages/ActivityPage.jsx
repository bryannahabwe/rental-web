import {useEffect, useState} from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import {useActivity} from "@/hooks/useActivity"
import {Building2, CreditCard, FileText, Home, LogIn, UserCog, Users} from "lucide-react"

const MODULES = [
    {value: "", label: "All activity"},
    {value: "PAYMENT", label: "Payments"},
    {value: "TENANT", label: "Tenants"},
    {value: "UNIT", label: "Units"},
    {value: "RENTAL_AGREEMENT", label: "Agreements"},
    {value: "PROPERTY", label: "Properties"},
    {value: "USER", label: "Users"},
    {value: "AUTHENTICATION", label: "Sign-ins"},
]

const MODULE_ICON = {
    TENANT: Users,
    UNIT: Building2,
    RENTAL_AGREEMENT: FileText,
    PAYMENT: CreditCard,
    PROPERTY: Home,
    USER: UserCog,
    AUTHENTICATION: LogIn,
}

const MODULE_TINT = {
    TENANT: "#E1F5EE", UNIT: "#eef2ff", RENTAL_AGREEMENT: "#fef9c3",
    PAYMENT: "#dcfce7", PROPERTY: "#E1F5EE", USER: "#f3e8ff", AUTHENTICATION: "#f1f5f9",
}
const MODULE_COLOR = {
    TENANT: "#0F6E56", UNIT: "#4338ca", RENTAL_AGREEMENT: "#854d0e",
    PAYMENT: "#15803d", PROPERTY: "#0F6E56", USER: "#7e22ce", AUTHENTICATION: "#475569",
}

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
    const [module, setModule] = useState("")
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(0)
        }, 400)
        return () => clearTimeout(t)
    }, [search])

    const {data, isLoading} = useActivity({
        page, size: 20,
        module: module || undefined,
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
                    value={module}
                    onChange={e => {
                        setModule(e.target.value)
                        setPage(0)
                    }}
                    style={{
                        padding: "10px 14px", fontSize: "14px", borderRadius: "8px",
                        border: "1px solid #e5e7eb", outline: "none",
                        fontFamily: "'DM Sans', sans-serif", color: "#374151", backgroundColor: "#fff",
                    }}
                >
                    {MODULES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
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
                            const Icon = MODULE_ICON[e.module] || FileText
                            const time = formatTime(e.createdAt)
                            return (
                                <div key={e.id} style={{
                                    display: "flex", gap: "14px", padding: "14px 20px",
                                    borderTop: i === 0 ? "none" : "1px solid #f5f5f5",
                                }}>
                                    <div style={{
                                        width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                                        backgroundColor: MODULE_TINT[e.module] || "#f1f5f9",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <Icon size={17} color={MODULE_COLOR[e.module] || "#475569"}/>
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
