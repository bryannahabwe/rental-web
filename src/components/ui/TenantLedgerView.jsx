import { useEffect, useState } from "react"
import { useTenantLedger } from "@/hooks/useTenants"
import { tenantsService } from "@/services/tenantsService"

const TRANSACTIONS_PAGE_SIZE = 15

const formatUGX = (amount) =>
    amount == null ? "—" : `UGX ${Number(amount).toLocaleString()}`

const formatDate = (dateStr) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" })
}

const statusStyles = {
    PAID:     { bg: "#E1F5EE", color: "#0F6E56" },
    PARTIAL:  { bg: "#FAEEDA", color: "#854F0B" },
    UNPAID:   { bg: "#FCEBEB", color: "#A32D2D" },
    ROLLOVER: { bg: "#E8EEFB", color: "#2C4C9B" },
}

function Pill({ label }) {
    const s = statusStyles[label] || { bg: "#f3f4f6", color: "#6b7280" }
    return (
        <span style={{
            display: "inline-block", padding: "3px 10px",
            borderRadius: "20px", fontSize: "12px", fontWeight: "500",
            backgroundColor: s.bg, color: s.color, whiteSpace: "nowrap",
        }}>
            {label}
        </span>
    )
}

const arrearsChip = {
    display: "inline-block", padding: "5px 12px", borderRadius: "20px",
    fontSize: "12px", fontWeight: "600", backgroundColor: "#fff",
    border: "1px solid #fecaca", color: "#A32D2D", whiteSpace: "nowrap",
}

function SummaryStat({ label, value, color }) {
    return (
        <div>
            <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {label}
            </div>
            <div style={{ fontSize: "15px", fontWeight: "600", color: color || "#111827" }}>
                {value}
            </div>
        </div>
    )
}

/**
 * The ledger & arrears body for a tenant: arrears banner, summary stats,
 * billing-cycle table, and paginated transaction history. Shared by the
 * ledger modal (wrapped in modal chrome) and the tenant detail page (inline).
 */
export default function TenantLedgerView({ tenantId }) {
    const { data: ledger, isLoading, isError } = useTenantLedger(tenantId)
    const [extraTransactions, setExtraTransactions] = useState([])
    const [nextPage, setNextPage] = useState(1)
    const [loadingMore, setLoadingMore] = useState(false)

    useEffect(() => {
        setExtraTransactions([])
        setNextPage(1)
    }, [tenantId])

    const transactions = ledger ? [...ledger.transactions, ...extraTransactions] : []
    const hasMore = ledger && transactions.length < ledger.transactionsTotal

    const overdueCycles = ledger ? ledger.cycles.filter(c => c.due && c.balance > 0) : []
    const inArrears = ledger && ledger.outstanding > 0

    const loadMore = async () => {
        setLoadingMore(true)
        try {
            const res = await tenantsService.getTransactions(tenantId, { page: nextPage, size: TRANSACTIONS_PAGE_SIZE })
            setExtraTransactions(prev => [...prev, ...res.data.content])
            setNextPage(p => p + 1)
        } finally {
            setLoadingMore(false)
        }
    }

    if (isLoading) {
        return <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px 0" }}>Loading...</div>
    }
    if (isError || !ledger) {
        return (
            <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px 0" }}>
                Could not load ledger — this tenant may not have an active agreement.
            </div>
        )
    }

    return (
        <>
            {/* Arrears banner — the headline "how much is owed" at a glance */}
            {inArrears ? (
                <div style={{
                    backgroundColor: "#fef2f2", border: "1px solid #fee2e2",
                    borderRadius: "12px", padding: "16px 18px", marginBottom: "20px",
                    display: "flex", flexWrap: "wrap", alignItems: "center",
                    justifyContent: "space-between", gap: "12px",
                }}>
                    <div>
                        <div style={{
                            fontSize: "11px", fontWeight: "600", color: "#A32D2D",
                            textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px",
                        }}>
                            In Arrears
                        </div>
                        <div style={{ fontSize: "24px", fontWeight: "700", color: "#dc2626", lineHeight: 1.1 }}>
                            {formatUGX(ledger.outstanding)}
                        </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {overdueCycles.length > 0 && (
                            <span style={arrearsChip}>
                                {overdueCycles.length} cycle{overdueCycles.length > 1 ? "s" : ""} overdue
                            </span>
                        )}
                        {ledger.openingArrears > 0 && (
                            <span style={arrearsChip}>
                                {formatUGX(ledger.openingArrears)} opening arrears
                            </span>
                        )}
                    </div>
                </div>
            ) : (
                <div style={{
                    backgroundColor: "#E1F5EE", border: "1px solid #d1e9e1",
                    borderRadius: "12px", padding: "14px 18px", marginBottom: "20px",
                    fontSize: "14px", fontWeight: "600", color: "#0F6E56",
                }}>
                    ✓ Fully paid up{ledger.openingCredit > 0 ? ` · ${formatUGX(ledger.openingCredit)} credit on file` : ""}
                </div>
            )}

            {/* Summary */}
            <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: "16px", backgroundColor: "#f9fafb", borderRadius: "12px",
                padding: "16px", marginBottom: "24px",
            }}>
                <SummaryStat label="Total Expected" value={formatUGX(ledger.totalExpected)} />
                <SummaryStat label="Total Paid" value={formatUGX(ledger.totalPaid)} />
                <SummaryStat
                    label="Outstanding"
                    value={formatUGX(ledger.outstanding)}
                    color={ledger.outstanding > 0 ? "#dc2626" : "#0F6E56"}
                />
                {ledger.openingArrears > 0 && (
                    <SummaryStat label="Opening Arrears" value={formatUGX(ledger.openingArrears)} color="#dc2626" />
                )}
                {ledger.openingCredit > 0 && (
                    <SummaryStat label="Opening Credit" value={formatUGX(ledger.openingCredit)} color="#0F6E56" />
                )}
            </div>

            {/* Cycles table */}
            <h3 style={{ fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "10px" }}>
                Billing Cycles
            </h3>
            <div style={{ overflowX: "auto", marginBottom: "28px", border: "1px solid #f0f0f0", borderRadius: "10px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "560px" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f9fafb" }}>
                            {["Period", "Expected", "Paid", "Running Balance", "Status", ""].map((h) => (
                                <th key={h} style={{
                                    padding: "9px 14px", textAlign: "left", fontSize: "11px",
                                    fontWeight: "500", color: "#9ca3af", textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {ledger.cycles.map((c, i) => {
                            const isOverdue = c.due && c.balance > 0
                            return (
                            <tr key={i} style={{
                                borderTop: "1px solid #f9f9f9",
                                opacity: c.due ? 1 : 0.55,
                                backgroundColor: isOverdue ? "#fef2f2" : "transparent",
                            }}>
                                <td style={{ padding: "10px 14px", fontSize: "13px", color: "#111827" }}>
                                    {formatDate(c.periodStartDate)} – {formatDate(c.periodEndDate)}
                                </td>
                                <td style={{ padding: "10px 14px", fontSize: "13px", color: "#6b7280" }}>
                                    {formatUGX(c.expectedAmount)}
                                </td>
                                <td style={{ padding: "10px 14px", fontSize: "13px", color: "#6b7280" }}>
                                    {formatUGX(c.paidAmount)}
                                </td>
                                <td style={{
                                    padding: "10px 14px", fontSize: "13px", fontWeight: "500",
                                    color: c.balance > 0 ? "#dc2626" : "#0F6E56",
                                }}>
                                    {formatUGX(c.balance)}
                                </td>
                                <td style={{ padding: "10px 14px" }}>
                                    <Pill label={c.status} />
                                </td>
                                <td style={{ padding: "10px 14px", fontSize: "11px", color: "#9ca3af" }}>
                                    {!c.due ? (
                                        "not yet due"
                                    ) : isOverdue ? (
                                        <span style={{ color: "#dc2626", fontWeight: "600" }}>overdue</span>
                                    ) : ""}
                                </td>
                            </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Transactions table */}
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "10px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: "600", color: "#374151", margin: 0 }}>
                    Transaction History
                </h3>
                <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                    {transactions.length} of {ledger.transactionsTotal}
                </span>
            </div>
            {transactions.length === 0 ? (
                <div style={{ fontSize: "13px", color: "#9ca3af", padding: "20px 0", textAlign: "center" }}>
                    No payments recorded yet.
                </div>
            ) : (
                <>
                    <div style={{ overflowX: "auto", border: "1px solid #f0f0f0", borderRadius: "10px" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "620px" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f9fafb" }}>
                                    {["Date", "Amount", "For Period", "Method", "Source", "Reference"].map((h) => (
                                        <th key={h} style={{
                                            padding: "9px 14px", textAlign: "left", fontSize: "11px",
                                            fontWeight: "500", color: "#9ca3af", textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((t) => (
                                    <tr key={t.id} style={{ borderTop: "1px solid #f9f9f9" }}>
                                        <td style={{ padding: "10px 14px", fontSize: "13px", color: "#111827" }}>
                                            {formatDate(t.paymentDate)}
                                        </td>
                                        <td style={{ padding: "10px 14px", fontSize: "13px", fontWeight: "500", color: "#111827" }}>
                                            {formatUGX(t.amount)}
                                        </td>
                                        <td style={{ padding: "10px 14px", fontSize: "13px", color: "#6b7280" }}>
                                            {formatDate(t.periodStartDate)} – {formatDate(t.periodEndDate)}
                                        </td>
                                        <td style={{ padding: "10px 14px", fontSize: "13px", color: "#6b7280" }}>
                                            {t.method}
                                        </td>
                                        <td style={{ padding: "10px 14px" }}>
                                            <Pill label={t.source} />
                                        </td>
                                        <td style={{ padding: "10px 14px", fontSize: "13px", color: "#6b7280" }}>
                                            {t.reference || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {hasMore && (
                        <div style={{ textAlign: "center", marginTop: "12px" }}>
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                style={{
                                    padding: "8px 16px", borderRadius: "8px", fontSize: "13px",
                                    border: "1px solid #e5e7eb", backgroundColor: "#fff",
                                    color: "#374151", cursor: loadingMore ? "default" : "pointer",
                                    fontFamily: "'DM Sans', sans-serif",
                                }}
                            >
                                {loadingMore ? "Loading..." : "Load more"}
                            </button>
                        </div>
                    )}
                </>
            )}
        </>
    )
}
