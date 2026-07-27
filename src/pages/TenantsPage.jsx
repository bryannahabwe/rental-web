import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import PageWrapper from "@/components/layout/PageWrapper"
import { useTenants } from "@/hooks/useTenants"
import useAuthStore from "@/store/authStore"
import { ChevronRight, Eye, ListTree, Pencil, Plus, Trash2 } from "lucide-react"
import TenantModal from "@/components/ui/TenantFormModal"
import DeleteConfirm from "@/components/ui/DeleteTenantConfirm"
import TenantLedgerModal from "@/components/ui/TenantLedgerModal"

const formatUGX = (amount) =>
    amount == null ? "—" : `UGX ${Number(amount).toLocaleString()}`

const formatCycleDate = (dateStr) => {
    if (!dateStr) return "—"
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-UG", { day: "numeric", month: "short" })
}

function StatusPill({ status }) {
    if (!status) return (
        <span style={{ color: "#9ca3af", fontSize: "13px" }}>No agreement</span>
    )
    const styles = {
        PAID:    { bg: "#E1F5EE", color: "#0F6E56" },
        PARTIAL: { bg: "#FAEEDA", color: "#854F0B" },
        UNPAID:  { bg: "#FCEBEB", color: "#A32D2D" },
    }
    const s = styles[status] || { bg: "#f3f4f6", color: "#6b7280" }
    return (
        <span style={{
            display: "inline-block", padding: "3px 10px",
            borderRadius: "20px", fontSize: "12px", fontWeight: "500",
            backgroundColor: s.bg, color: s.color,
        }}>
            {status}
        </span>
    )
}

// ── Balance card — shared between desktop and mobile ─────
function BalanceCard({ tenant }) {
    const balance = Number(tenant.currentBalance || 0)
    const openingArrears = Number(tenant.openingArrears || 0)
    const remainingHistorical = Math.min(balance, openingArrears)
    const cycleArrears = Math.max(0, balance - openingArrears)

    if (tenant.currentBalance == null) return null

    if (balance <= 0) {
        return (
            <div style={{
                backgroundColor: "#E1F5EE", borderRadius: "8px",
                padding: "10px 12px",
            }}>
                <span style={{ fontSize: "13px", fontWeight: "500", color: "#0F6E56" }}>
                    ✓ Fully paid up
                </span>
            </div>
        )
    }

    // Real paid/owed totals from the backend (same figures the Ledger view
    // shows) — not a client-side approximation, so the two can't disagree.
    const totalEverOwed = Number(tenant.totalEverOwed || 0)
    const totalPaid = Number(tenant.totalEverPaid || 0)
    const pct = totalEverOwed > 0
        ? Math.round((totalPaid / totalEverOwed) * 100)
        : 0

    return (
        <div style={{
            backgroundColor: "#fef2f2", borderRadius: "8px",
            padding: "10px 12px",
        }}>
            {/* Outstanding label + total */}
            <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: "6px",
            }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#dc2626" }}>
                    Outstanding
                </span>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#dc2626" }}>
                    {formatUGX(balance)}
                </span>
            </div>

            {/* Progress bar */}
            <div style={{
                height: "4px", borderRadius: "4px",
                backgroundColor: "#fca5a5", overflow: "hidden",
                marginBottom: "6px",
            }}>
                <div style={{
                    height: "100%", borderRadius: "4px",
                    backgroundColor: "#dc2626",
                    width: `${Math.max(0, 100 - pct)}%`,
                }} />
            </div>

            {/* Paid vs total */}
            <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: "11px", color: "#9ca3af",
                marginBottom: openingArrears > 0 ? "8px" : "0",
            }}>
                <span>Paid: {formatUGX(totalPaid)}</span>
                <span>of {formatUGX(totalEverOwed)}</span>
            </div>

            {/* Opening arrears breakdown */}
            {openingArrears > 0 && (
                <div style={{
                    borderTop: "1px solid #fca5a5",
                    paddingTop: "8px",
                    display: "flex", flexDirection: "column", gap: "3px",
                }}>
                    <div style={{
                        display: "flex", justifyContent: "space-between",
                        fontSize: "11px",
                    }}>
                        <span style={{ color: "#9ca3af" }}>
                            ├ Historical arrears
                        </span>
                        <span style={{ color: "#dc2626", fontWeight: "600" }}>
                           {formatUGX(remainingHistorical)}
                        </span>
                    </div>
                    <div style={{
                        display: "flex", justifyContent: "space-between",
                        fontSize: "11px",
                    }}>
                        <span style={{ color: "#9ca3af" }}>
                            └ Current cycles
                        </span>
                        <span style={{ color: "#dc2626", fontWeight: "600" }}>
                            {formatUGX(cycleArrears)}
                        </span>
                    </div>
                    <div style={{
                        fontSize: "10px", color: "#9ca3af",
                        marginTop: "4px", fontStyle: "italic",
                    }}>
                        To clear historical: Edit Agreement → Opening Balance
                    </div>
                </div>
            )}
        </div>
    )
}

export default function TenantsPage() {
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [showModal, setShowModal] = useState(false)
    const [editTenant, setEditTenant] = useState(null)
    const [deleteTenant, setDeleteTenant] = useState(null)
    const [ledgerTenantId, setLedgerTenantId] = useState(null)
    const canDelete = useAuthStore((s) => s.role === "SUPER_ADMIN")
    const navigate = useNavigate()

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(0)
        }, 400)
        return () => clearTimeout(timer)
    }, [search])

    const { data, isLoading } = useTenants({
        page, size: 10, sortBy: "createdAt", sortDir: "desc",
        search: debouncedSearch || undefined,
    })

    const allTenants = data?.content || []
    const tenants = statusFilter === "ALL"
        ? allTenants
        : allTenants.filter(t => t.periodStatus === statusFilter ||
            (statusFilter === "NO_AGREEMENT" && !t.periodStatus))

    const totalPages = data?.totalPages || 0

    const actions = (
        <button
            onClick={() => setShowModal(true)}
            style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "9px 16px", borderRadius: "8px", fontSize: "14px",
                backgroundColor: "#0F6E56", color: "#fff", border: "none",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
            }}
        >
            <Plus size={16} /> Add Tenant
        </button>
    )

    const mobileAction = (
        <button
            onClick={() => setShowModal(true)}
            style={{
                width: "54px", height: "54px", borderRadius: "50%",
                backgroundColor: "#0F6E56", color: "#fff", border: "none",
                cursor: "pointer", fontSize: "28px", fontWeight: "300",
                boxShadow: "0 4px 16px rgba(15,110,86,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}
        >
            +
        </button>
    )

    return (
        <PageWrapper title="Tenants" actions={actions} mobileAction={mobileAction}>

            {/* Search + status filter */}
            <div style={{
                marginBottom: "16px", display: "flex",
                gap: "12px", alignItems: "center", flexWrap: "wrap",
            }}>
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, phone or email..."
                    style={{
                        flex: 1, minWidth: "200px", maxWidth: "360px",
                        padding: "10px 14px", fontSize: "14px",
                        borderRadius: "8px", border: "1px solid #e5e7eb",
                        outline: "none", boxSizing: "border-box",
                        fontFamily: "'DM Sans', sans-serif",
                        color: "#111827", backgroundColor: "#fff",
                    }}
                    onFocus={e => e.target.style.borderColor = "#0F6E56"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                />

                {["ALL", "PAID", "PARTIAL", "UNPAID"].map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        style={{
                            padding: "9px 14px", borderRadius: "8px", fontSize: "13px",
                            fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                            border: "1px solid",
                            borderColor: statusFilter === s ? "#0F6E56" : "#e5e7eb",
                            backgroundColor: statusFilter === s ? "#0F6E56" : "#fff",
                            color: statusFilter === s ? "#fff" : "#6b7280",
                            fontWeight: statusFilter === s ? "500" : "400",
                        }}
                    >
                        {s === "ALL" ? "All" : s}
                    </button>
                ))}

                {search && (
                    <button
                        onClick={() => setSearch("")}
                        style={{
                            padding: "10px 14px", borderRadius: "8px", fontSize: "13px",
                            border: "1px solid #e5e7eb", backgroundColor: "#fff",
                            color: "#6b7280", cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>

            <div style={{
                backgroundColor: "#fff", borderRadius: "12px",
                border: "1px solid #f0f0f0", overflow: "hidden",
            }}>
                {isLoading ? (
                    <div style={{ padding: "60px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
                        Loading tenants...
                    </div>
                ) : tenants.length === 0 ? (
                    <div style={{ padding: "60px", textAlign: "center" }}>
                        <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "16px" }}>
                            {search
                                ? `No tenants found for "${search}"`
                                : "No tenants yet. Add your first tenant to get started."}
                        </p>
                        {!search && (
                            <button
                                onClick={() => setShowModal(true)}
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: "6px",
                                    padding: "9px 16px", borderRadius: "8px", fontSize: "14px",
                                    backgroundColor: "#0F6E56", color: "#fff", border: "none",
                                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                                }}
                            >
                                <Plus size={16} /> Add Tenant
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* ── Desktop table ── */}
                        <div className="desktop-table" style={{ overflow: "hidden" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                <tr style={{ backgroundColor: "#f9fafb" }}>
                                    {["Name", "Phone", "Unit", "Period", "Expected", "Balance", "Status", ""].map((h, i) => (
                                        <th key={i} style={{
                                            padding: "11px 20px", textAlign: "left",
                                            fontSize: "11px", fontWeight: "500", color: "#9ca3af",
                                            textTransform: "uppercase", letterSpacing: "0.05em",
                                        }}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {tenants.map((tenant) => (
                                    <tr
                                        key={tenant.id}
                                        onClick={() => navigate(`/tenants/${tenant.id}`)}
                                        style={{ borderTop: "1px solid #f9f9f9", cursor: "pointer" }}
                                    >
                                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#111827", fontWeight: "500" }}>
                                            {tenant.name}
                                        </td>
                                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#6b7280" }}>
                                            {tenant.phone}
                                        </td>
                                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#6b7280" }}>
                                            {tenant.currentUnit || "—"}
                                        </td>
                                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#6b7280" }}>
                                            {tenant.currentCycleStart
                                                ? `${formatCycleDate(tenant.currentCycleStart)} – ${formatCycleDate(tenant.currentCycleEnd)}`
                                                : "—"}
                                        </td>
                                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#6b7280" }}>
                                            {formatUGX(tenant.monthlyRent)}
                                        </td>
                                        <td style={{ padding: "14px 20px" }}>
                                            <BalanceCard tenant={tenant} />
                                        </td>
                                        <td style={{ padding: "14px 20px" }}>
                                            <StatusPill status={tenant.periodStatus} />
                                        </td>
                                        <td style={{ padding: "14px 20px" }} onClick={(e) => e.stopPropagation()}>
                                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                <button
                                                    onClick={() => navigate(`/tenants/${tenant.id}`)}
                                                    title="View tenant details"
                                                    style={{
                                                        padding: "6px 12px", borderRadius: "6px", fontSize: "13px",
                                                        border: "1px solid #e5e7eb", backgroundColor: "#fff",
                                                        color: "#374151", cursor: "pointer",
                                                        display: "flex", alignItems: "center", gap: "4px",
                                                    }}
                                                >
                                                    <Eye size={13} /> View
                                                </button>
                                                {tenant.currentUnit && (
                                                    <button
                                                        onClick={() => setLedgerTenantId(tenant.id)}
                                                        title="View transactions & arrears"
                                                        style={{
                                                            padding: "6px 12px", borderRadius: "6px", fontSize: "13px",
                                                            border: "1px solid #e5e7eb", backgroundColor: "#fff",
                                                            color: "#374151", cursor: "pointer",
                                                            display: "flex", alignItems: "center", gap: "4px",
                                                        }}
                                                    >
                                                        <ListTree size={13} /> Ledger
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setEditTenant(tenant)}
                                                    style={{
                                                        padding: "6px 12px", borderRadius: "6px", fontSize: "13px",
                                                        border: "1px solid #e5e7eb", backgroundColor: "#fff",
                                                        color: "#374151", cursor: "pointer",
                                                        display: "flex", alignItems: "center", gap: "4px",
                                                    }}
                                                >
                                                    <Pencil size={13} /> Edit
                                                </button>
                                                {canDelete && (
                                                    <button
                                                        onClick={() => setDeleteTenant(tenant)}
                                                        style={{
                                                            padding: "6px 12px", borderRadius: "6px", fontSize: "13px",
                                                            border: "1px solid #fee2e2", backgroundColor: "#fff",
                                                            color: "#dc2626", cursor: "pointer",
                                                            display: "flex", alignItems: "center", gap: "4px",
                                                        }}
                                                    >
                                                        <Trash2 size={13} /> Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Mobile cards ── */}
                        <div className="mobile-cards" style={{ display: "none", flexDirection: "column" }}>
                            {tenants.map((tenant, i) => (
                                <div
                                    key={tenant.id}
                                    onClick={() => navigate(`/tenants/${tenant.id}`)}
                                    style={{
                                        padding: "14px 16px",
                                        borderTop: i === 0 ? "none" : "1px solid #f3f4f6",
                                        cursor: "pointer",
                                    }}
                                >
                                    {/* Row 1 — name + status + chevron */}
                                    <div style={{
                                        display: "flex", alignItems: "center",
                                        justifyContent: "space-between", marginBottom: "4px",
                                    }}>
                                        <span style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>
                                            {tenant.name}
                                        </span>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <StatusPill status={tenant.periodStatus} />
                                            <ChevronRight size={16} color="#9ca3af" />
                                        </div>
                                    </div>

                                    {/* Row 2 — unit + period */}
                                    <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
                                        {tenant.currentUnit
                                            ? `Unit ${tenant.currentUnit} · ${tenant.currentCycleStart
                                                ? `${formatCycleDate(tenant.currentCycleStart)} – ${formatCycleDate(tenant.currentCycleEnd)}`
                                                : ""}`
                                            : "No active agreement"}
                                    </div>

                                    {/* Row 3 — balance card */}
                                    <BalanceCard tenant={tenant} />

                                    {tenant.currentUnit && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setLedgerTenantId(tenant.id)
                                            }}
                                            style={{
                                                marginTop: "8px", padding: "6px 0", border: "none",
                                                background: "none", color: "#0F6E56", cursor: "pointer",
                                                fontSize: "12px", fontWeight: "500",
                                                display: "flex", alignItems: "center", gap: "4px",
                                            }}
                                        >
                                            <ListTree size={13} /> View transactions & arrears
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "14px 20px", borderTop: "1px solid #f3f4f6",
                            }}>
                                <span style={{ fontSize: "13px", color: "#9ca3af" }}>
                                    Page {page + 1} of {totalPages}
                                </span>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                        style={{
                                            padding: "6px 14px", borderRadius: "6px", fontSize: "13px",
                                            border: "1px solid #e5e7eb", backgroundColor: "#fff",
                                            color: page === 0 ? "#d1d5db" : "#374151",
                                            cursor: page === 0 ? "not-allowed" : "pointer",
                                        }}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page >= totalPages - 1}
                                        style={{
                                            padding: "6px 14px", borderRadius: "6px", fontSize: "13px",
                                            border: "1px solid #e5e7eb", backgroundColor: "#fff",
                                            color: page >= totalPages - 1 ? "#d1d5db" : "#374151",
                                            cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                                        }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {showModal && <TenantModal onClose={() => setShowModal(false)} />}
            {editTenant && <TenantModal tenant={editTenant} onClose={() => setEditTenant(null)} />}
            {deleteTenant && <DeleteConfirm tenant={deleteTenant} onClose={() => setDeleteTenant(null)} />}
            {ledgerTenantId && (
                <TenantLedgerModal
                    tenantId={ledgerTenantId}
                    onClose={() => setLedgerTenantId(null)}
                />
            )}
        </PageWrapper>
    )
}