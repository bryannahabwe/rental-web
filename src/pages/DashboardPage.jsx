import PageWrapper from "@/components/layout/PageWrapper"
import { useSummary, useOccupancy } from "@/hooks/useReports"
import { usePayments } from "@/hooks/usePayments"
import { Building2, Users, CreditCard, TrendingUp } from "lucide-react"

const formatUGX = (amount) =>
    amount == null ? "—" : `UGX ${Number(amount).toLocaleString()}`

const formatDate = (dateStr) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-UG", {
        day: "numeric", month: "short", year: "numeric",
    })
}

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

export default function DashboardPage() {
    const { data: summary, isLoading: summaryLoading } = useSummary()
    const { data: occupancy, isLoading: occupancyLoading } = useOccupancy()
    const { data: paymentsData, isLoading: paymentsLoading } = usePayments({
        page: 0, size: 6, sortBy: "paymentDate", sortDir: "desc",
    })

    const payments = paymentsData?.content || []

    return (
        <PageWrapper title="Dashboard">

            {/* Stat cards */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px", marginBottom: "28px",
            }}>
                <StatCard
                    icon={Building2}
                    label="Total Units"
                    color="#0F6E56"
                    value={summaryLoading ? "—" : summary?.totalUnits ?? "—"}
                    sub={`${summary?.availableUnits ?? "—"} available`}
                />
                <StatCard
                    icon={Users}
                    label="Active Tenants"
                    color="#1D9E75"
                    value={summaryLoading ? "—" : summary?.totalTenants ?? "—"}
                    sub={`${summary?.activeAgreements ?? "—"} active agreements`}
                />
                <StatCard
                    icon={CreditCard}
                    label="Total Revenue"
                    color="#085041"
                    value={summaryLoading ? "—" : formatUGX(summary?.totalRevenueAllTime)}
                    sub="All time collected"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Occupancy Rate"
                    color="#0a4a38"
                    value={occupancyLoading ? "—" : `${occupancy?.occupancyRate ?? "—"}%`}
                    sub={`${occupancy?.occupiedUnits ?? "—"} of ${occupancy?.totalUnits ?? "—"} units`}
                />
            </div>

            {/* Recent payments table */}
            <div style={{
                backgroundColor: "#ffffff", borderRadius: "12px",
                border: "1px solid #f0f0f0", overflow: "hidden",
            }}>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "18px 22px", borderBottom: "1px solid #f9f9f9",
                }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
            Recent Payments
          </span>
                    <a href="/payments" style={{
                        fontSize: "13px", color: "#0F6E56", textDecoration: "none", fontWeight: "500",
                    }}>
                        View all →
                    </a>
                </div>

                {paymentsLoading ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
                        Loading...
                    </div>
                ) : payments.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
                        No payments recorded yet
                    </div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                        <tr style={{ backgroundColor: "#f9fafb" }}>
                            {["Tenant", "Unit", "Amount", "Date", "Status"].map(h => (
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
                                <td style={{ padding: "14px 22px", fontSize: "14px", color: "#111827", fontWeight: "500" }}>
                                    {formatUGX(p.amount)}
                                </td>
                                <td style={{ padding: "14px 22px", fontSize: "14px", color: "#6b7280" }}>
                                    {formatDate(p.paymentDate)}
                                </td>
                                <td style={{ padding: "14px 22px" }}>
                    <span style={{
                        display: "inline-block", padding: "3px 10px",
                        borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                        backgroundColor: "#E1F5EE", color: "#0F6E56",
                    }}>
                      Paid
                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </PageWrapper>
    )
}