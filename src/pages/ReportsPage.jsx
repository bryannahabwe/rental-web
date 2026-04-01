import { useState } from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import { useSummary, useOccupancy, usePaymentReport } from "@/hooks/useReports"
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid,
} from "recharts"
import { Building2, Users, FileText, CreditCard } from "lucide-react"

const formatUGX = (amount) =>
    amount == null ? "—" : `UGX ${Number(amount).toLocaleString()}`

const today = new Date()
const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString().split("T")[0]
const todayStr = today.toISOString().split("T")[0]

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                backgroundColor: "#fff", border: "1px solid #e5e7eb",
                borderRadius: "8px", padding: "10px 14px",
                fontSize: "13px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}>
                <div style={{ color: "#6b7280", marginBottom: "4px" }}>{label}</div>
                <div style={{ fontWeight: "600", color: "#111827" }}>
                    {formatUGX(payload[0].value)}
                </div>
            </div>
        )
    }
    return null
}

function SummaryCard({ icon: Icon, label, value, color }) {
    return (
        <div style={{
            backgroundColor: "#fff", borderRadius: "12px",
            border: "1px solid #f0f0f0", padding: "20px 22px",
            display: "flex", alignItems: "center", gap: "16px",
        }}>
            <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                backgroundColor: color + "18",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
            }}>
                <Icon size={20} color={color} />
            </div>
            <div>
                <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px" }}>
                    {label}
                </div>
                <div style={{ fontSize: "22px", fontWeight: "600", color: "#111827", lineHeight: 1 }}>
                    {value}
                </div>
            </div>
        </div>
    )
}

export default function ReportsPage() {
    const [from, setFrom] = useState(firstOfMonth)
    const [to, setTo] = useState(todayStr)
    const [appliedFrom, setAppliedFrom] = useState(firstOfMonth)
    const [appliedTo, setAppliedTo] = useState(todayStr)

    const { data: summary, isLoading: summaryLoading } = useSummary()
    const { data: occupancy, isLoading: occupancyLoading } = useOccupancy()
    const { data: paymentReport, isLoading: reportLoading } = usePaymentReport({
        from: appliedFrom, to: appliedTo,
    })

    const handleApply = () => {
        setAppliedFrom(from)
        setAppliedTo(to)
    }

    const chartData = paymentReport ? [
        { name: "Total Collected", amount: paymentReport.totalAmount || 0 },
    ] : []

    return (
        <PageWrapper title="Reports">

            {/* ── Summary cards ── */}
            <div style={{ marginBottom: "12px" }}>
                <p style={{
                    fontSize: "12px", fontWeight: "500", color: "#9ca3af",
                    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px",
                }}>
                    Overview
                </p>

                {summaryLoading ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
                        Loading...
                    </div>
                ) : (
                    <>
                        {/* Desktop grid — 3 columns */}
                        <div className="desktop-table">
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: "16px", marginBottom: "20px",
                            }}>
                                <SummaryCard icon={Building2} color="#0F6E56"
                                             label="Total Units" value={summary?.totalUnits ?? "—"} />
                                <SummaryCard icon={Building2} color="#1D9E75"
                                             label="Available Units" value={summary?.availableUnits ?? "—"} />
                                <SummaryCard icon={Users} color="#085041"
                                             label="Total Tenants" value={summary?.totalTenants ?? "—"} />
                                <SummaryCard icon={FileText} color="#0a4a38"
                                             label="Active Agreements" value={summary?.activeAgreements ?? "—"} />
                                <SummaryCard icon={FileText} color="#6b7280"
                                             label="Terminated" value={summary?.terminatedAgreements ?? "—"} />
                                <SummaryCard icon={CreditCard} color="#0F6E56"
                                             label="All-time Revenue" value={formatUGX(summary?.totalRevenueAllTime)} />
                            </div>
                        </div>

                        {/* Mobile grid — 2 columns */}
                        <div className="mobile-cards">
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gap: "10px", marginBottom: "16px", width: "100%",
                            }}>
                                {[
                                    { icon: Building2, color: "#0F6E56", label: "Total Units", value: summary?.totalUnits ?? "—" },
                                    { icon: Building2, color: "#1D9E75", label: "Available", value: summary?.availableUnits ?? "—" },
                                    { icon: Users, color: "#085041", label: "Tenants", value: summary?.totalTenants ?? "—" },
                                    { icon: FileText, color: "#0a4a38", label: "Active", value: summary?.activeAgreements ?? "—" },
                                    { icon: FileText, color: "#6b7280", label: "Terminated", value: summary?.terminatedAgreements ?? "—" },
                                ].map((card, i) => (
                                    <div key={i} style={{
                                        backgroundColor: "#fff", borderRadius: "12px",
                                        border: "1px solid #f0f0f0", padding: "14px",
                                        display: "flex", flexDirection: "column", gap: "8px",
                                    }}>
                                        <div style={{
                                            width: "32px", height: "32px", borderRadius: "8px",
                                            backgroundColor: card.color + "18",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <card.icon size={16} color={card.color} />
                                        </div>
                                        <div style={{ fontSize: "22px", fontWeight: "700", color: "#111827", lineHeight: 1 }}>
                                            {card.value}
                                        </div>
                                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>{card.label}</div>
                                    </div>
                                ))}

                                {/* All-time revenue — full width */}
                                <div style={{
                                    gridColumn: "1 / -1",
                                    backgroundColor: "#fff", borderRadius: "12px",
                                    border: "1px solid #f0f0f0", padding: "14px",
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div style={{
                                            width: "32px", height: "32px", borderRadius: "8px",
                                            backgroundColor: "#0F6E5618",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <CreditCard size={16} color="#0F6E56" />
                                        </div>
                                        <span style={{ fontSize: "13px", color: "#6b7280" }}>All-time Revenue</span>
                                    </div>
                                    <span style={{ fontSize: "18px", fontWeight: "700", color: "#0F6E56" }}>
              {formatUGX(summary?.totalRevenueAllTime)}
            </span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ── Occupancy ── */}
            <div style={{
                backgroundColor: "#fff", borderRadius: "12px",
                border: "1px solid #f0f0f0", padding: "22px",
                marginBottom: "20px",
            }}>
                <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", marginBottom: "16px",
                }}>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "#111827", margin: 0 }}>
                        Occupancy
                    </p>
                    <span style={{ fontSize: "28px", fontWeight: "700", color: "#0F6E56" }}>
            {occupancyLoading ? "—" : `${occupancy?.occupancyRate ?? 0}%`}
          </span>
                </div>

                <div style={{
                    height: "10px", borderRadius: "10px",
                    backgroundColor: "#f3f4f6", overflow: "hidden", marginBottom: "8px",
                }}>
                    <div style={{
                        height: "100%", borderRadius: "10px", backgroundColor: "#0F6E56",
                        width: `${occupancy?.occupancyRate ?? 0}%`,
                        transition: "width 0.5s ease",
                    }} />
                </div>

                <div style={{
                    display: "flex", justifyContent: "space-between",
                    fontSize: "12px", color: "#9ca3af",
                }}>
                    <span>{occupancy?.occupiedUnits ?? "—"} occupied</span>
                    <span>{occupancy?.availableUnits ?? "—"} available</span>
                    <span>{occupancy?.totalUnits ?? "—"} total units</span>
                </div>
            </div>

            {/* ── Payment report ── */}
            <div style={{
                backgroundColor: "#fff", borderRadius: "12px",
                border: "1px solid #f0f0f0", padding: "22px",
            }}>
                {/* Header + date filter */}
                <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", flexWrap: "wrap",
                    gap: "12px", marginBottom: "20px",
                }}>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "#111827", margin: 0 }}>
                        Payment Report
                    </p>

                    {/* Desktop date filter */}
                    <div className="desktop-table">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "13px", color: "#6b7280" }}>From</span>
                            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                                   style={{
                                       padding: "8px 12px", fontSize: "13px", borderRadius: "8px",
                                       border: "1px solid #e5e7eb", outline: "none",
                                       fontFamily: "'DM Sans', sans-serif", color: "#111827", backgroundColor: "#fff",
                                   }}
                                   onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                   onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                            />
                            <span style={{ fontSize: "13px", color: "#6b7280" }}>To</span>
                            <input type="date" value={to} onChange={e => setTo(e.target.value)}
                                   style={{
                                       padding: "8px 12px", fontSize: "13px", borderRadius: "8px",
                                       border: "1px solid #e5e7eb", outline: "none",
                                       fontFamily: "'DM Sans', sans-serif", color: "#111827", backgroundColor: "#fff",
                                   }}
                                   onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                   onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                            />
                            <button onClick={handleApply} style={{
                                padding: "8px 16px", borderRadius: "8px", fontSize: "13px",
                                backgroundColor: "#0F6E56", color: "#fff", border: "none",
                                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                            }}>
                                Apply
                            </button>
                        </div>
                    </div>

                    {/* Mobile date filter */}
                    <div className="mobile-cards">
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "13px", color: "#6b7280", minWidth: "34px" }}>From</span>
                                <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                                       style={{
                                           flex: 1, padding: "9px 12px", fontSize: "13px", borderRadius: "8px",
                                           border: "1px solid #e5e7eb", outline: "none",
                                           fontFamily: "'DM Sans', sans-serif", color: "#111827", backgroundColor: "#fff",
                                       }}
                                />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "13px", color: "#6b7280", minWidth: "34px" }}>To</span>
                                <input type="date" value={to} onChange={e => setTo(e.target.value)}
                                       style={{
                                           flex: 1, padding: "9px 12px", fontSize: "13px", borderRadius: "8px",
                                           border: "1px solid #e5e7eb", outline: "none",
                                           fontFamily: "'DM Sans', sans-serif", color: "#111827", backgroundColor: "#fff",
                                       }}
                                />
                            </div>
                            <button onClick={handleApply} style={{
                                padding: "10px", borderRadius: "8px", fontSize: "14px",
                                backgroundColor: "#0F6E56", color: "#fff", border: "none",
                                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                            }}>
                                Apply
                            </button>
                        </div>
                    </div>

                    {/* Mobile date filter — stacked */}
                    <div className="mobile-cards" style={{
                        display: "none", flexDirection: "column", gap: "8px", width: "100%",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "13px", color: "#6b7280", minWidth: "34px" }}>From</span>
                            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                                   style={{
                                       flex: 1, padding: "9px 12px", fontSize: "13px", borderRadius: "8px",
                                       border: "1px solid #e5e7eb", outline: "none",
                                       fontFamily: "'DM Sans', sans-serif", color: "#111827", backgroundColor: "#fff",
                                   }}
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "13px", color: "#6b7280", minWidth: "34px" }}>To</span>
                            <input type="date" value={to} onChange={e => setTo(e.target.value)}
                                   style={{
                                       flex: 1, padding: "9px 12px", fontSize: "13px", borderRadius: "8px",
                                       border: "1px solid #e5e7eb", outline: "none",
                                       fontFamily: "'DM Sans', sans-serif", color: "#111827", backgroundColor: "#fff",
                                   }}
                            />
                        </div>
                        <button onClick={handleApply} style={{
                            padding: "10px", borderRadius: "8px", fontSize: "14px",
                            backgroundColor: "#0F6E56", color: "#fff", border: "none",
                            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                        }}>
                            Apply
                        </button>
                    </div>
                </div>

                {/* Stats row */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "12px", marginBottom: "24px",
                }}>
                    <div style={{
                        backgroundColor: "#f9fafb", borderRadius: "10px",
                        padding: "16px", textAlign: "center",
                    }}>
                        <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>
                            Total Payments
                        </div>
                        <div style={{ fontSize: "24px", fontWeight: "600", color: "#111827" }}>
                            {reportLoading ? "—" : paymentReport?.totalPayments ?? "—"}
                        </div>
                    </div>
                    <div style={{
                        backgroundColor: "#f9fafb", borderRadius: "10px",
                        padding: "16px", textAlign: "center",
                    }}>
                        <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>
                            Total Collected
                        </div>
                        <div style={{
                            fontSize: "22px", fontWeight: "600", color: "#0F6E56",
                            wordBreak: "break-word",
                        }}>
                            {reportLoading ? "—" : formatUGX(paymentReport?.totalAmount)}
                        </div>
                    </div>
                    <div style={{
                        backgroundColor: "#f9fafb", borderRadius: "10px",
                        padding: "16px", textAlign: "center",
                    }}>
                        <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>
                            Period
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: "500", color: "#111827" }}>
                            {appliedFrom} → {appliedTo}
                        </div>
                    </div>
                </div>

                {/* Chart */}
                {!reportLoading && paymentReport?.totalAmount > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData} barSize={60}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }}
                                   axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }}
                                   axisLine={false} tickLine={false} width={45}
                                   tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="amount" fill="#0F6E56" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{
                        height: "120px", display: "flex", alignItems: "center",
                        justifyContent: "center", color: "#9ca3af", fontSize: "14px",
                        backgroundColor: "#f9fafb", borderRadius: "10px",
                    }}>
                        {reportLoading ? "Loading..." : "No payments in this period"}
                    </div>
                )}
            </div>

        </PageWrapper>
    )
}