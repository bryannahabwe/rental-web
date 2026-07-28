import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import PageWrapper from "@/components/layout/PageWrapper"
import { useTenant } from "@/hooks/useTenants"
import useAuthStore from "@/store/authStore"
import { Pencil, Trash2 } from "lucide-react"
import TenantLedgerView from "@/components/ui/TenantLedgerView"
import TenantFormModal from "@/components/ui/TenantFormModal"
import DeleteTenantConfirm from "@/components/ui/DeleteTenantConfirm"

const formatUGX = (amount) =>
    amount == null ? "—" : `UGX ${Number(amount).toLocaleString()}`

const formatCycleDate = (dateStr) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-UG", { day: "numeric", month: "short" })
}

const formatCycle = (start, end) =>
    (!start || !end) ? "—" : `${formatCycleDate(start)} – ${formatCycleDate(end)}`

function DetailRow({ label, value, valueColor }) {
    return (
        <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            gap: "16px", paddingBottom: "14px", marginBottom: "14px",
            borderBottom: "1px solid #f3f4f6",
        }}>
            <span style={{ fontSize: "13px", color: "#9ca3af", flexShrink: 0 }}>{label}</span>
            <span style={{ fontSize: "13px", fontWeight: "500", color: valueColor || "#111827", textAlign: "right" }}>
                {value}
            </span>
        </div>
    )
}

function StatusPill({ status }) {
    if (!status) return <span style={{ color: "#9ca3af", fontSize: "13px" }}>No agreement</span>
    const styles = {
        PAID: { bg: "#E1F5EE", color: "#0F6E56" },
        PARTIAL: { bg: "#FAEEDA", color: "#854F0B" },
        UNPAID: { bg: "#FCEBEB", color: "#A32D2D" },
    }
    const s = styles[status] || { bg: "#f3f4f6", color: "#6b7280" }
    return (
        <span style={{
            display: "inline-block", padding: "3px 10px", borderRadius: "20px",
            fontSize: "12px", fontWeight: "500", backgroundColor: s.bg, color: s.color,
        }}>
            {status}
        </span>
    )
}

const cardStyle = {
    backgroundColor: "#fff", borderRadius: "12px",
    border: "1px solid #f0f0f0", padding: "20px",
}

const sectionLabel = {
    fontSize: "11px", fontWeight: "500", color: "#9ca3af",
    textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 14px",
}

export default function TenantDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data: tenant, isLoading } = useTenant(id)
    const canDelete = useAuthStore((s) => s.role === "SUPER_ADMIN")
    const [editing, setEditing] = useState(false)
    const [deleting, setDeleting] = useState(false)

    return (
        <PageWrapper title={tenant?.name || "Tenant"} showBack>
            {isLoading ? (
                <div style={{ padding: "60px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
                    Loading…
                </div>
            ) : !tenant ? (
                <div style={{ padding: "60px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
                    Tenant not found.
                </div>
            ) : (
                <div className="tdp-wrap" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    <style>{`
                        .tdp-wrap { max-width: 1180px; margin: 0 auto; }
                        .tdp-grid { display: flex; flex-direction: column; gap: 16px; }
                        .tdp-side { display: flex; flex-direction: column; gap: 16px; }
                        @media (min-width: 960px) {
                            .tdp-grid { flex-direction: row; align-items: flex-start; }
                            .tdp-side { width: 360px; flex-shrink: 0; }
                            .tdp-main { flex: 1; min-width: 0; }
                        }
                    `}</style>

                    {/* Header card — identity + actions */}
                    <div style={{ ...cardStyle, marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <div style={{
                                width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "#0a4a38",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "18px", color: "#fff", fontWeight: "600", flexShrink: 0,
                            }}>
                                {tenant.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                                <div style={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>{tenant.name}</div>
                                <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "2px" }}>{tenant.phone}</div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={() => setEditing(true)} style={{
                                padding: "10px 16px", borderRadius: "10px",
                                border: "1px solid #e5e7eb", backgroundColor: "#fff",
                                color: "#374151", cursor: "pointer", fontSize: "14px",
                                fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                                display: "flex", alignItems: "center", gap: "6px",
                            }}>
                                <Pencil size={15} /> Edit
                            </button>
                            {canDelete && (
                                <button onClick={() => setDeleting(true)} style={{
                                    padding: "10px 16px", borderRadius: "10px",
                                    border: "1px solid #fee2e2", backgroundColor: "#fff",
                                    color: "#dc2626", cursor: "pointer", fontSize: "14px",
                                    fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                                    display: "flex", alignItems: "center", gap: "6px",
                                }}>
                                    <Trash2 size={15} /> Delete
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Two-column on desktop: info on the left, ledger on the right */}
                    <div className="tdp-grid">
                        <div className="tdp-side">
                            {/* Contact */}
                            <div style={cardStyle}>
                                <p style={sectionLabel}>Contact</p>
                                <DetailRow label="Phone" value={tenant.phone} />
                                <DetailRow label="Email" value={tenant.email || "—"} />
                                <DetailRow label="Address" value={tenant.address || "—"} />
                            </div>

                            {/* Current tenancy */}
                            {tenant.currentUnit ? (
                                <div style={cardStyle}>
                                    <p style={sectionLabel}>Current Tenancy</p>
                                    <DetailRow label="Unit" value={tenant.currentUnit} />
                                    <DetailRow label="Monthly Rent" value={formatUGX(tenant.monthlyRent)} />
                                    <DetailRow label="Period" value={formatCycle(tenant.currentCycleStart, tenant.currentCycleEnd)} />
                                    <DetailRow
                                        label="Outstanding"
                                        value={tenant.currentBalance > 0 ? formatUGX(tenant.currentBalance) : "Paid up"}
                                        valueColor={tenant.currentBalance > 0 ? "#dc2626" : "#0F6E56"}
                                    />
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontSize: "13px", color: "#9ca3af" }}>Account status</span>
                                        <StatusPill status={tenant.periodStatus} />
                                    </div>
                                </div>
                            ) : (
                                <div style={{ ...cardStyle, fontSize: "13px", color: "#9ca3af" }}>
                                    No active agreement for this tenant.
                                </div>
                            )}
                        </div>

                        {/* Ledger & arrears */}
                        {tenant.currentUnit && (
                            <div className="tdp-main">
                                <div style={cardStyle}>
                                    <p style={sectionLabel}>Ledger &amp; Arrears</p>
                                    <TenantLedgerView tenantId={id} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {editing && <TenantFormModal tenant={tenant} onClose={() => setEditing(false)} />}
            {deleting && (
                <DeleteTenantConfirm
                    tenant={tenant}
                    onClose={() => setDeleting(false)}
                    onDeleted={() => navigate("/tenants")}
                />
            )}
        </PageWrapper>
    )
}
