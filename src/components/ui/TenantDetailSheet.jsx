import BottomSheet from "./BottomSheet"
import { useTenant } from "@/hooks/useTenants"
import { Pencil, Trash2 } from "lucide-react"

const formatUGX = (amount) =>
    amount == null ? "—" : `UGX ${Number(amount).toLocaleString()}`

const getMonthName = (month) =>
    ["Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"][month - 1]

function DetailRow({ label, value, valueColor }) {
    return (
        <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", gap: "16px",
            paddingBottom: "14px", marginBottom: "14px",
            borderBottom: "1px solid #f3f4f6",
        }}>
      <span style={{ fontSize: "13px", color: "#9ca3af", flexShrink: 0 }}>
        {label}
      </span>
            <span style={{
                fontSize: "13px", fontWeight: "500",
                color: valueColor || "#111827",
                textAlign: "right",
            }}>
        {value}
      </span>
        </div>
    )
}

function StatusPill({ status }) {
    if (!status) return <span style={{ color: "#9ca3af", fontSize: "13px" }}>No agreement</span>
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

export default function TenantDetailSheet({ tenantId, onClose, onEdit, onDelete }) {
    const { data: tenant, isLoading } = useTenant(tenantId)

    return (
        <BottomSheet title="Tenant Details" onClose={onClose}>
            {isLoading ? (
                <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px 0" }}>
                    Loading...
                </div>
            ) : tenant ? (
                <>
                    {/* Avatar + name */}
                    <div style={{
                        display: "flex", alignItems: "center",
                        gap: "14px", marginBottom: "24px",
                    }}>
                        <div style={{
                            width: "52px", height: "52px", borderRadius: "50%",
                            backgroundColor: "#0a4a38",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "18px", color: "#fff", fontWeight: "600", flexShrink: 0,
                        }}>
                            {tenant.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                            <div style={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>
                                {tenant.name}
                            </div>
                            <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "2px" }}>
                                {tenant.phone}
                            </div>
                        </div>
                    </div>

                    {/* Contact details */}
                    <div style={{
                        backgroundColor: "#f9fafb", borderRadius: "12px",
                        padding: "16px", marginBottom: "20px",
                    }}>
                        <p style={{
                            fontSize: "11px", fontWeight: "500", color: "#9ca3af",
                            textTransform: "uppercase", letterSpacing: "0.06em",
                            marginBottom: "14px",
                        }}>
                            Contact
                        </p>
                        <DetailRow label="Phone" value={tenant.phone} />
                        <DetailRow label="Email" value={tenant.email || "—"} />
                        <DetailRow
                            label="Address"
                            value={tenant.address || "—"}
                        />
                    </div>

                    {/* Current tenancy */}
                    {tenant.currentUnit && (
                        <div style={{
                            backgroundColor: "#f9fafb", borderRadius: "12px",
                            padding: "16px", marginBottom: "20px",
                        }}>
                            <p style={{
                                fontSize: "11px", fontWeight: "500", color: "#9ca3af",
                                textTransform: "uppercase", letterSpacing: "0.06em",
                                marginBottom: "14px",
                            }}>
                                Current Tenancy
                            </p>
                            <DetailRow label="Unit" value={tenant.currentUnit} />
                            <DetailRow
                                label="Monthly Rent"
                                value={formatUGX(tenant.monthlyRent)}
                            />
                            <DetailRow
                                label="Period"
                                value={tenant.currentPeriodMonth
                                    ? `${getMonthName(tenant.currentPeriodMonth)} ${tenant.currentPeriodYear}`
                                    : "—"}
                            />
                            <DetailRow
                                label="Outstanding"
                                value={tenant.currentBalance > 0
                                    ? formatUGX(tenant.currentBalance)
                                    : "Paid up"}
                                valueColor={tenant.currentBalance > 0 ? "#dc2626" : "#0F6E56"}
                            />
                            <div style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                            }}>
                                <span style={{ fontSize: "13px", color: "#9ca3af" }}>Status</span>
                                <StatusPill status={tenant.periodStatus} />
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                        <button
                            onClick={() => { onEdit(tenant); onClose() }}
                            style={{
                                flex: 1, padding: "12px", borderRadius: "10px",
                                border: "1px solid #e5e7eb", backgroundColor: "#fff",
                                color: "#374151", cursor: "pointer", fontSize: "14px",
                                fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                            }}
                        >
                            <Pencil size={15} /> Edit
                        </button>
                        <button
                            onClick={() => { onDelete(tenant); onClose() }}
                            style={{
                                flex: 1, padding: "12px", borderRadius: "10px",
                                border: "1px solid #fee2e2", backgroundColor: "#fff",
                                color: "#dc2626", cursor: "pointer", fontSize: "14px",
                                fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                            }}
                        >
                            <Trash2 size={15} /> Delete
                        </button>
                    </div>
                </>
            ) : (
                <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px 0" }}>
                    Tenant not found
                </div>
            )}
        </BottomSheet>
    )
}