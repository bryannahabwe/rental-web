import BottomSheet from "./BottomSheet"
import { useAgreement } from "@/hooks/useAgreements"
import { LogOut } from "lucide-react"

const formatUGX = (amount) =>
    amount == null ? "—" : `UGX ${Number(amount).toLocaleString()}`

const formatDate = (dateStr) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-UG", {
        day: "numeric", month: "long", year: "numeric",
    })
}

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
                color: valueColor || "#111827", textAlign: "right",
            }}>
        {value}
      </span>
        </div>
    )
}

export default function AgreementDetailSheet({ agreementId, onClose, onMoveOut, onEdit }) {
    const { data: ag, isLoading } = useAgreement(agreementId)

    return (
        <BottomSheet title="Agreement Details" onClose={onClose}>
            {isLoading ? (
                <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px 0" }}>
                    Loading...
                </div>
            ) : ag ? (
                <>
                    {/* Header */}
                    <div style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between", marginBottom: "24px",
                    }}>
                        <div>
                            <div style={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>
                                {ag.tenantName}
                            </div>
                            <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "2px" }}>
                                Unit {ag.roomNumber}
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
              <span style={{
                  display: "inline-block", padding: "3px 10px",
                  borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                  backgroundColor: ag.status === "ACTIVE" ? "#E1F5EE" : "#f3f4f6",
                  color: ag.status === "ACTIVE" ? "#0F6E56" : "#6b7280",
              }}>
                {ag.status === "ACTIVE" ? "Active" : "Terminated"}
              </span>
                            <span style={{
                                display: "inline-block", padding: "3px 10px",
                                borderRadius: "20px", fontSize: "11px", fontWeight: "500",
                                backgroundColor: ag.tenantType === "NEW" ? "#E6F1FB" : "#FAEEDA",
                                color: ag.tenantType === "NEW" ? "#185FA5" : "#854F0B",
                            }}>
                {ag.tenantType}
              </span>
                        </div>
                    </div>

                    {/* Tenancy details */}
                    <div style={{
                        backgroundColor: "#f9fafb", borderRadius: "12px",
                        padding: "16px", marginBottom: "16px",
                    }}>
                        <p style={{
                            fontSize: "11px", fontWeight: "500", color: "#9ca3af",
                            textTransform: "uppercase", letterSpacing: "0.06em",
                            marginBottom: "14px",
                        }}>
                            Tenancy
                        </p>
                        <DetailRow label="Tenant" value={ag.tenantName} />
                        <DetailRow label="Unit" value={ag.roomNumber} />
                        <DetailRow label="Move-in Date" value={formatDate(ag.startDate)} />
                        {ag.moveOutDate && (
                            <DetailRow label="Move-out Date" value={formatDate(ag.moveOutDate)} />
                        )}
                    </div>

                    {/* Financial details */}
                    <div style={{
                        backgroundColor: "#f9fafb", borderRadius: "12px",
                        padding: "16px", marginBottom: "20px",
                    }}>
                        <p style={{
                            fontSize: "11px", fontWeight: "500", color: "#9ca3af",
                            textTransform: "uppercase", letterSpacing: "0.06em",
                            marginBottom: "14px",
                        }}>
                            Financials
                        </p>
                        <DetailRow label="Monthly Rent" value={formatUGX(ag.rentAmount)} />
                        <DetailRow
                            label="Deposit"
                            value={ag.depositAmount ? formatUGX(ag.depositAmount) : "—"}
                        />
                        <DetailRow
                            label="Opening Balance"
                            value={ag.openingBalance !== 0
                                ? `${ag.openingBalance > 0 ? "+" : ""}${formatUGX(Math.abs(ag.openingBalance))}`
                                : "—"}
                            valueColor={ag.openingBalance < 0 ? "#dc2626" : ag.openingBalance > 0 ? "#0F6E56" : "#111827"}
                        />
                    </div>

                    {/* Edit button — always shown */}
                    <button
                        onClick={() => { onEdit(ag); onClose() }}
                        style={{
                            width: "100%", padding: "13px", borderRadius: "10px",
                            border: "1px solid #e5e7eb", backgroundColor: "#fff",
                            color: "#374151", cursor: "pointer", fontSize: "14px",
                            fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            gap: "8px", marginBottom: "8px",
                        }}
                    >
                        <Pencil size={16} /> Edit Agreement
                    </button>

                    {/* Move-out button */}
                    {ag.status === "ACTIVE" && (
                        <button
                            onClick={() => { onMoveOut(ag); onClose() }}
                            style={{
                                width: "100%", padding: "13px", borderRadius: "10px",
                                border: "1px solid #fee2e2", backgroundColor: "#fff",
                                color: "#dc2626", cursor: "pointer", fontSize: "14px",
                                fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                            }}
                        >
                            <LogOut size={16} /> Record Move-Out
                        </button>
                    )}
                </>
            ) : (
                <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px 0" }}>
                    Agreement not found
                </div>
            )}
        </BottomSheet>
    )
}