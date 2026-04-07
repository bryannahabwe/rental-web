import BottomSheet from "./BottomSheet"
import { usePayment } from "@/hooks/usePayments"

const formatUGX = (amount) =>
    amount == null ? "—" : `UGX ${Number(amount).toLocaleString()}`

const formatDate = (dateStr) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-UG", {
        day: "numeric", month: "long", year: "numeric",
    })
}

// Format cycle date: 2026-04-15 → "Apr 15"
const formatCycleDate = (dateStr) => {
    if (!dateStr) return "—"
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-UG", { day: "numeric", month: "short" })
}


// Format full cycle: "Apr 15 – May 14"
const formatCycle = (start, end) => {
    if (!start || !end) return "—"
    return `${formatCycleDate(start)} – ${formatCycleDate(end)}`
}


const getMonthName = (month) =>
    ["January","February","March","April","May","June",
        "July","August","September","October","November","December"][month - 1]

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

export default function PaymentDetailSheet({ paymentId, onClose }) {
    const { data: payment, isLoading } = usePayment(paymentId)

    const statusStyles = {
        PAID:     { bg: "#E1F5EE", color: "#0F6E56" },
        PARTIAL:  { bg: "#FAEEDA", color: "#854F0B" },
        ROLLOVER: { bg: "#E6F1FB", color: "#185FA5" },
    }
    const s = payment ? (statusStyles[payment.periodStatus] || { bg: "#f3f4f6", color: "#6b7280" }) : {}

    return (
        <BottomSheet title="Payment Details" onClose={onClose}>
            {isLoading ? (
                <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px 0" }}>
                    Loading...
                </div>
            ) : payment ? (
                <>
                    {/* Amount header */}
                    <div style={{
                        textAlign: "center", marginBottom: "24px",
                        padding: "20px", backgroundColor: "#f9fafb", borderRadius: "12px",
                    }}>
                        <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "6px" }}>
                            AMOUNT PAID
                        </div>
                        <div style={{ fontSize: "32px", fontWeight: "800", color: "#111827" }}>
                            {formatUGX(payment.amount)}
                        </div>
                        <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "4px" }}>
                            of {formatUGX(payment.expectedAmount)} expected
                        </div>

                        {/* Progress bar */}
                        {payment.expectedAmount > 0 && (
                            <div style={{
                                height: "6px", borderRadius: "6px",
                                backgroundColor: "#e5e7eb", overflow: "hidden",
                                margin: "12px 0 8px",
                            }}>
                                <div style={{
                                    height: "100%", borderRadius: "6px",
                                    backgroundColor:
                                        payment.periodStatus === "PAID" ? "#0F6E56" :
                                            payment.periodStatus === "ROLLOVER" ? "#185FA5" : "#EF9F27",
                                    width: `${Math.min(100, (payment.amount / payment.expectedAmount) * 100)}%`,
                                }} />
                            </div>
                        )}

                        <span style={{
                            display: "inline-block", padding: "4px 12px",
                            borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                            backgroundColor: s.bg, color: s.color,
                        }}>
              {payment.periodStatus}
            </span>
                    </div>

                    {/* Tenant + unit */}
                    <div style={{
                        backgroundColor: "#f9fafb", borderRadius: "12px",
                        padding: "16px", marginBottom: "16px",
                    }}>
                        <p style={{
                            fontSize: "11px", fontWeight: "500", color: "#9ca3af",
                            textTransform: "uppercase", letterSpacing: "0.06em",
                            marginBottom: "14px",
                        }}>
                            Tenant
                        </p>
                        <DetailRow label="Name" value={payment.tenantName} />
                        <div style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                            <span style={{ fontSize: "13px", color: "#9ca3af" }}>Unit</span>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#111827" }}>
                {payment.roomNumber}
              </span>
                        </div>
                    </div>

                    {/* Payment details */}
                    <div style={{
                        backgroundColor: "#f9fafb", borderRadius: "12px",
                        padding: "16px", marginBottom: "16px",
                    }}>
                        <p style={{
                            fontSize: "11px", fontWeight: "500", color: "#9ca3af",
                            textTransform: "uppercase", letterSpacing: "0.06em",
                            marginBottom: "14px",
                        }}>
                            Payment Info
                        </p>
                        <DetailRow
                            label="Period"
                            value={`${formatCycle(p.periodStartDate, p.periodEndDate)}`}
                        />
                        <DetailRow label="Payment Date" value={formatDate(payment.paymentDate)} />
                        <DetailRow label="Method" value={payment.method} />
                        <DetailRow
                            label="Source"
                            value={payment.source}
                            valueColor={payment.source === "ROLLOVER" ? "#185FA5" : "#111827"}
                        />
                        {payment.overpayment > 0 && (
                            <DetailRow
                                label="Rolled Over"
                                value={formatUGX(payment.overpayment)}
                                valueColor="#854F0B"
                            />
                        )}
                    </div>

                    {/* Reference + notes */}
                    {(payment.reference || payment.notes) && (
                        <div style={{
                            backgroundColor: "#f9fafb", borderRadius: "12px",
                            padding: "16px",
                        }}>
                            <p style={{
                                fontSize: "11px", fontWeight: "500", color: "#9ca3af",
                                textTransform: "uppercase", letterSpacing: "0.06em",
                                marginBottom: "14px",
                            }}>
                                Additional Info
                            </p>
                            {payment.reference && (
                                <DetailRow label="Reference" value={payment.reference} />
                            )}
                            {payment.notes && (
                                <div style={{
                                    display: "flex", justifyContent: "space-between",
                                    alignItems: "flex-start", gap: "16px",
                                }}>
                                    <span style={{ fontSize: "13px", color: "#9ca3af", flexShrink: 0 }}>Notes</span>
                                    <span style={{
                                        fontSize: "13px", fontWeight: "500", color: "#111827",
                                        textAlign: "right",
                                    }}>
                    {payment.notes}
                  </span>
                                </div>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px 0" }}>
                    Payment not found
                </div>
            )}
        </BottomSheet>
    )
}