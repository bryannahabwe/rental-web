import PageWrapper from "@/components/layout/PageWrapper"
import { useOccupancy, useSummary } from "@/hooks/useReports"
import { usePayments } from "@/hooks/usePayments"
import { useTenants } from "@/hooks/useTenants"
import { Building2, CreditCard, TrendingUp, Users } from "lucide-react"

const formatUGX = (amount) =>
    amount == null ? "—" : `UGX ${Number(amount).toLocaleString()}`

const formatUGXShort = (amount) => {
    if (amount == null) return "—"
    const n = Number(amount)
    if (n >= 1_000_000) return `UGX ${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `UGX ${(n / 1_000).toFixed(0)}K`
    return `UGX ${n.toLocaleString()}`
}

const formatDate = (dateStr) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-UG", {
        day: "numeric", month: "short", year: "numeric",
    })
}

const getMonthName = (month) =>
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1]

// ── Desktop stat card ──────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }) {
    return (
        <div style={{
            backgroundColor: "#ffffff", borderRadius: "12px",
            border: "1px solid #f0f0f0", padding: "20px 22px",
            display: "flex", flexDirection: "column", gap: "12px",
        }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>{label}</span>
                <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    backgroundColor: color + "18",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Icon size={18} color={color} />
                </div>
            </div>
            <div>
                <div style={{ fontSize: "26px", fontWeight: "600", color: "#111827", lineHeight: 1 }}>
                    {value}
                </div>
                {sub && (
                    <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "6px" }}>{sub}</div>
                )}
            </div>
        </div>
    )
}

// ── Mobile stat card — compact ─────────────────────────
function MobileStatCard({ icon: Icon, label, value, sub, color }) {
    return (
        <div style={{
            backgroundColor: "#ffffff", borderRadius: "12px",
            border: "1px solid #f0f0f0", padding: "14px",
            display: "flex", flexDirection: "column", gap: "6px",
        }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "500" }}>{label}</span>
                <div style={{
                    width: "28px", height: "28px", borderRadius: "8px",
                    backgroundColor: color + "18",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Icon size={14} color={color} />
                </div>
            </div>
            <div style={{ fontSize: "22px", fontWeight: "700", color: "#111827", lineHeight: 1 }}>
                {value}
            </div>
            {sub && (
                <div style={{ fontSize: "10px", color: "#9ca3af" }}>{sub}</div>
            )}
        </div>
    )
}

function PeriodStatusPill({ status }) {
    const styles = {
        PAID:    { bg: "#E1F5EE", color: "#0F6E56" },
        PARTIAL: { bg: "#FAEEDA", color: "#854F0B" },
        UNPAID:  { bg: "#FCEBEB", color: "#A32D2D" },
    }
    const s = styles[status] || { bg: "#f3f4f6", color: "#6b7280" }
    return (
        <span style={{
            display: "inline-block", padding: "2px 8px",
            borderRadius: "20px", fontSize: "11px", fontWeight: "500",
            backgroundColor: s.bg, color: s.color,
        }}>
      {status}
    </span>
    )
}

export default function DashboardPage() {
    const { data: summary, isLoading: summaryLoading } = useSummary()
    const { data: occupancy, isLoading: occupancyLoading } = useOccupancy()
    const { data: paymentsData, isLoading: paymentsLoading } = usePayments({
        page: 0, size: 5, sortBy: "paymentDate", sortDir: "desc",
    })
    const { data: tenantsData, isLoading: tenantsLoading } = useTenants({
        page: 0, size: 100, sortBy: "createdAt", sortDir: "desc",
    })

    const payments = paymentsData?.content || []
    const allTenants = tenantsData?.content || []

    const outstandingTenants = allTenants.filter(
        t => t.periodStatus === "UNPAID" || t.periodStatus === "PARTIAL"
    )

    const totalExpected = allTenants
        .filter(t => t.monthlyRent != null)
        .reduce((sum, t) => sum + Number(t.monthlyRent), 0)

    const totalOutstanding = outstandingTenants
        .reduce((sum, t) => sum + Number(t.currentBalance || 0), 0)

    const totalCollected = totalExpected - totalOutstanding

    const collectionPct = totalExpected > 0
        ? Math.round((totalCollected / totalExpected) * 100)
        : 0

    return (
        <PageWrapper title="Dashboard">

            {/* ── DESKTOP stat cards ── */}
            <div className="desktop-table">
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px", marginBottom: "28px",
                }}>
                    <StatCard
                        icon={Building2} color="#0F6E56" label="Total Units"
                        value={summaryLoading ? "—" : summary?.totalUnits ?? "—"}
                        sub={`${summary?.availableUnits ?? "—"} available`}
                    />
                    <StatCard
                        icon={Users} color="#1D9E75" label="Active Tenants"
                        value={summaryLoading ? "—" : summary?.totalTenants ?? "—"}
                        sub={`${summary?.activeAgreements ?? "—"} active agreements`}
                    />
                    <StatCard
                        icon={CreditCard} color="#085041" label="Total Revenue"
                        value={summaryLoading ? "—" : formatUGX(summary?.totalRevenueAllTime)}
                        sub="All time collected"
                    />
                    <StatCard
                        icon={TrendingUp} color="#0a4a38" label="Occupancy Rate"
                        value={occupancyLoading ? "—" : `${occupancy?.occupancyRate ?? "—"}%`}
                        sub={`${occupancy?.occupiedUnits ?? "—"} of ${occupancy?.totalUnits ?? "—"} units`}
                    />
                </div>
            </div>

            {/* ── MOBILE stat cards — 2x2 compact grid ── */}
            <div className="mobile-cards">
                <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr",
                    gap: "10px", marginBottom: "16px", width: "100%",
                }}>
                    <MobileStatCard
                        icon={Building2} color="#0F6E56" label="Total Units"
                        value={summaryLoading ? "—" : summary?.totalUnits ?? "—"}
                        sub={`${summary?.availableUnits ?? "—"} available`}
                    />
                    <MobileStatCard
                        icon={Users} color="#1D9E75" label="Tenants"
                        value={summaryLoading ? "—" : summary?.totalTenants ?? "—"}
                        sub={`${summary?.activeAgreements ?? "—"} agreements`}
                    />
                    <MobileStatCard
                        icon={TrendingUp} color="#085041" label="Occupancy"
                        value={occupancyLoading ? "—" : `${occupancy?.occupancyRate ?? "—"}%`}
                        sub={`${occupancy?.occupiedUnits ?? "—"} of ${occupancy?.totalUnits ?? "—"}`}
                    />
                    <MobileStatCard
                        icon={CreditCard} color="#0a4a38" label="Revenue"
                        value={summaryLoading ? "—" : formatUGXShort(summary?.totalRevenueAllTime)}
                        sub="All time"
                    />
                </div>
            </div>

            {/* ── This month's collection ── */}
            {!tenantsLoading && allTenants.some(t => t.monthlyRent != null) && (
                <div style={{
                    backgroundColor: "#fff", borderRadius: "12px",
                    border: "1px solid #f0f0f0", padding: "16px 20px",
                    marginBottom: "16px",
                }}>
                    {/* Header row */}
                    <div style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between", marginBottom: "12px",
                    }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>
              This Month's Collection
            </span>
                        <span style={{
                            fontSize: "12px", fontWeight: "600",
                            color: collectionPct >= 100 ? "#0F6E56" : "#854F0B",
                        }}>
              {collectionPct}% collected
            </span>
                    </div>

                    {/* Progress bar */}
                    <div style={{
                        height: "8px", borderRadius: "8px",
                        backgroundColor: "#f3f4f6", overflow: "hidden",
                        marginBottom: "12px",
                    }}>
                        <div style={{
                            height: "100%", borderRadius: "8px",
                            backgroundColor: collectionPct >= 100 ? "#0F6E56" : "#1D9E75",
                            width: `${Math.min(100, Math.max(0, collectionPct))}%`,
                            transition: "width 0.5s ease",
                        }} />
                    </div>

                    {/* ── Desktop — inline stats ── */}
                    <div className="desktop-table">
                        <div style={{ display: "flex", gap: "24px", justifyContent: "flex-end" }}>
                            {[
                                { label: "EXPECTED", value: formatUGX(totalExpected), color: "#111827" },
                                { label: "COLLECTED", value: formatUGX(totalCollected), color: "#0F6E56" },
                                { label: "OUTSTANDING", value: formatUGX(totalOutstanding), color: totalOutstanding > 0 ? "#dc2626" : "#0F6E56" },
                            ].map((s, i) => (
                                <div key={i} style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "2px" }}>
                                        {s.label}
                                    </div>
                                    <div style={{ fontSize: "15px", fontWeight: "600", color: s.color }}>
                                        {s.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Mobile — 3 mini boxes ── */}
                    <div className="mobile-cards">
                        <div style={{
                            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "8px", width: "100%",
                        }}>
                            {[
                                { label: "Expected", value: formatUGXShort(totalExpected), color: "#111827" },
                                { label: "Collected", value: formatUGXShort(totalCollected), color: "#0F6E56" },
                                { label: "Outstanding", value: formatUGXShort(totalOutstanding), color: totalOutstanding > 0 ? "#dc2626" : "#0F6E56" },
                            ].map((s, i) => (
                                <div key={i} style={{
                                    backgroundColor: "#f9fafb", borderRadius: "8px",
                                    padding: "8px 6px", textAlign: "center",
                                }}>
                                    <div style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "3px" }}>
                                        {s.label.toUpperCase()}
                                    </div>
                                    <div style={{
                                        fontSize: "12px", fontWeight: "700",
                                        color: s.color, wordBreak: "break-word",
                                    }}>
                                        {s.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Outstanding tenants ── */}
            {!tenantsLoading && outstandingTenants.length > 0 && (
                <div style={{
                    backgroundColor: "#fff", borderRadius: "12px",
                    border: "1px solid #f0f0f0", overflow: "hidden",
                    marginBottom: "16px",
                }}>
                    {/* Section header */}
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "14px 16px", borderBottom: "1px solid #f9f9f9",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>
                Outstanding
              </span>
                            <span style={{
                                padding: "2px 8px", borderRadius: "20px", fontSize: "11px",
                                fontWeight: "500", backgroundColor: "#FCEBEB", color: "#A32D2D",
                            }}>
                {outstandingTenants.length}
              </span>
                        </div>
                        <a href="/tenants" style={{
                            fontSize: "12px", color: "#0F6E56",
                            textDecoration: "none", fontWeight: "500",
                        }}>
                            View all →
                        </a>
                    </div>

                    {/* ── Desktop — table ── */}
                    <div className="desktop-table">
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                            <tr style={{ backgroundColor: "#f9fafb" }}>
                                {["Tenant", "Unit", "Period", "Expected", "Paid", "Outstanding", "Status"].map((h, i) => (
                                    <th key={i} style={{
                                        padding: "10px 22px", textAlign: "left",
                                        fontSize: "11px", fontWeight: "500", color: "#9ca3af",
                                        textTransform: "uppercase", letterSpacing: "0.05em",
                                    }}>{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {outstandingTenants.map((t, i) => {
                                const paid = Number(t.monthlyRent || 0) - Number(t.currentBalance || 0)
                                return (
                                    <tr key={t.id} style={{ borderTop: i === 0 ? "none" : "1px solid #f9f9f9" }}>
                                        <td style={{ padding: "13px 22px", fontSize: "14px", color: "#111827", fontWeight: "500" }}>
                                            {t.name}
                                        </td>
                                        <td style={{ padding: "13px 22px", fontSize: "14px", color: "#6b7280" }}>
                                            {t.currentUnit || "—"}
                                        </td>
                                        <td style={{ padding: "13px 22px", fontSize: "14px", color: "#6b7280" }}>
                                            {t.currentPeriodMonth
                                                ? `${getMonthName(t.currentPeriodMonth)} ${t.currentPeriodYear}`
                                                : "—"}
                                        </td>
                                        <td style={{ padding: "13px 22px", fontSize: "14px", color: "#6b7280" }}>
                                            {formatUGX(t.monthlyRent)}
                                        </td>
                                        <td style={{ padding: "13px 22px", fontSize: "14px", color: "#0F6E56" }}>
                                            {formatUGX(Math.max(0, paid))}
                                        </td>
                                        <td style={{ padding: "13px 22px", fontSize: "14px", color: "#dc2626", fontWeight: "500" }}>
                                            {formatUGX(t.currentBalance)}
                                        </td>
                                        <td style={{ padding: "13px 22px" }}>
                                            <PeriodStatusPill status={t.periodStatus} />
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Mobile — cards ── */}
                    <div className="mobile-cards">
                        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                            {outstandingTenants.map((t, i) => {
                                const paid = Number(t.monthlyRent || 0) - Number(t.currentBalance || 0)
                                return (
                                    <div key={t.id} style={{
                                        padding: "12px 16px",
                                        borderTop: i === 0 ? "none" : "1px solid #f9f9f9",
                                    }}>
                                        {/* Row 1 — name + status */}
                                        <div style={{
                                            display: "flex", alignItems: "center",
                                            justifyContent: "space-between", marginBottom: "4px",
                                        }}>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                        {t.name}
                      </span>
                                            <PeriodStatusPill status={t.periodStatus} />
                                        </div>

                                        {/* Row 2 — unit + period */}
                                        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>
                                            Unit {t.currentUnit} · {t.currentPeriodMonth
                                            ? `${getMonthName(t.currentPeriodMonth)} ${t.currentPeriodYear}`
                                            : "—"}
                                        </div>

                                        {/* Row 3 — paid vs outstanding boxes */}
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <div style={{
                                                flex: 1, backgroundColor: "#f9fafb",
                                                borderRadius: "8px", padding: "8px",
                                                textAlign: "center",
                                            }}>
                                                <div style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "2px" }}>
                                                    PAID
                                                </div>
                                                <div style={{ fontSize: "13px", fontWeight: "600", color: "#0F6E56" }}>
                                                    {formatUGX(Math.max(0, paid))}
                                                </div>
                                            </div>
                                            <div style={{
                                                flex: 1, backgroundColor: "#fef2f2",
                                                borderRadius: "8px", padding: "8px",
                                                textAlign: "center",
                                            }}>
                                                <div style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "2px" }}>
                                                    OUTSTANDING
                                                </div>
                                                <div style={{ fontSize: "13px", fontWeight: "700", color: "#dc2626" }}>
                                                    {formatUGX(t.currentBalance)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Recent payments ── */}
            <div style={{
                backgroundColor: "#ffffff", borderRadius: "12px",
                border: "1px solid #f0f0f0", overflow: "hidden",
            }}>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 16px", borderBottom: "1px solid #f9f9f9",
                }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>
            Recent Payments
          </span>
                    <a href="/payments" style={{
                        fontSize: "12px", color: "#0F6E56",
                        textDecoration: "none", fontWeight: "500",
                    }}>
                        View all →
                    </a>
                </div>

                {paymentsLoading ? (
                    <div style={{ padding: "30px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
                        Loading...
                    </div>
                ) : payments.length === 0 ? (
                    <div style={{ padding: "30px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
                        No payments recorded yet
                    </div>
                ) : (
                    <>
                        {/* ── Desktop — table ── */}
                        <div className="desktop-table">
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                <tr style={{ backgroundColor: "#f9fafb" }}>
                                    {["Tenant", "Unit", "Period", "Amount", "Status", "Date"].map(h => (
                                        <th key={h} style={{
                                            padding: "10px 22px", textAlign: "left", fontSize: "11px",
                                            fontWeight: "500", color: "#9ca3af",
                                            textTransform: "uppercase", letterSpacing: "0.05em",
                                        }}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {payments.map((p, i) => (
                                    <tr key={p.id} style={{ borderTop: i === 0 ? "none" : "1px solid #f9f9f9" }}>
                                        <td style={{ padding: "14px 22px", fontSize: "14px", color: "#111827", fontWeight: "500" }}>
                                            {p.tenantName}
                                        </td>
                                        <td style={{ padding: "14px 22px", fontSize: "14px", color: "#6b7280" }}>
                                            {p.roomNumber}
                                        </td>
                                        <td style={{ padding: "14px 22px", fontSize: "14px", color: "#6b7280" }}>
                                            {p.periodMonth ? `${getMonthName(p.periodMonth)} ${p.periodYear}` : "—"}
                                        </td>
                                        <td style={{ padding: "14px 22px", fontSize: "14px", color: "#111827", fontWeight: "500" }}>
                                            {formatUGX(p.amount)}
                                        </td>
                                        <td style={{ padding: "14px 22px" }}>
                        <span style={{
                            display: "inline-block", padding: "3px 10px",
                            borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                            backgroundColor:
                                p.periodStatus === "PAID" ? "#E1F5EE" :
                                    p.periodStatus === "PARTIAL" ? "#FAEEDA" :
                                        p.periodStatus === "ROLLOVER" ? "#E6F1FB" : "#f3f4f6",
                            color:
                                p.periodStatus === "PAID" ? "#0F6E56" :
                                    p.periodStatus === "PARTIAL" ? "#854F0B" :
                                        p.periodStatus === "ROLLOVER" ? "#185FA5" : "#6b7280",
                        }}>
                          {p.periodStatus || "Paid"}
                        </span>
                                        </td>
                                        <td style={{ padding: "14px 22px", fontSize: "14px", color: "#6b7280" }}>
                                            {formatDate(p.paymentDate)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Mobile — payment cards ── */}
                        <div className="mobile-cards">
                            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                                {payments.map((p, i) => (
                                    <div key={p.id} style={{
                                        padding: "12px 16px",
                                        borderTop: i === 0 ? "none" : "1px solid #f9f9f9",
                                    }}>
                                        {/* Row 1 — tenant + status */}
                                        <div style={{
                                            display: "flex", alignItems: "center",
                                            justifyContent: "space-between", marginBottom: "4px",
                                        }}>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                        {p.tenantName}
                      </span>
                                            <span style={{
                                                display: "inline-block", padding: "2px 8px",
                                                borderRadius: "20px", fontSize: "11px", fontWeight: "500",
                                                backgroundColor:
                                                    p.periodStatus === "PAID" ? "#E1F5EE" :
                                                        p.periodStatus === "PARTIAL" ? "#FAEEDA" :
                                                            p.periodStatus === "ROLLOVER" ? "#E6F1FB" : "#f3f4f6",
                                                color:
                                                    p.periodStatus === "PAID" ? "#0F6E56" :
                                                        p.periodStatus === "PARTIAL" ? "#854F0B" :
                                                            p.periodStatus === "ROLLOVER" ? "#185FA5" : "#6b7280",
                                            }}>
                        {p.periodStatus || "—"}
                      </span>
                                        </div>

                                        {/* Row 2 — unit + period */}
                                        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>
                                            Unit {p.roomNumber} · {p.periodMonth
                                            ? `${getMonthName(p.periodMonth)} ${p.periodYear}` : "—"}
                                        </div>

                                        {/* Row 3 — amount + date */}
                                        <div style={{
                                            display: "flex", alignItems: "center",
                                            justifyContent: "space-between",
                                        }}>
                      <span style={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>
                        {formatUGX(p.amount)}
                      </span>
                                            <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                        {formatDate(p.paymentDate)}
                      </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

        </PageWrapper>
    )
}