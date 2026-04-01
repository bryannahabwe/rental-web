import {useState} from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import {useOccupancy, usePaymentReport, useSummary} from "@/hooks/useReports"
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,} from "recharts"
import {Building2, CreditCard, FileText, Users} from "lucide-react"

const formatUGX = (amount) =>
    amount == null ? "—" : `UGX ${Number(amount).toLocaleString()}`

// Default date range — current month
const today = new Date()
const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString().split("T")[0]
const todayStr = today.toISOString().split("T")[0]

function SummaryCard({icon: Icon, label, value, color}) {
    return (
        <div style={{
            backgroundColor: "#fff", borderRadius: "12px",
            border: "1px solid #f0f0f0", padding: "20px 22px",
            display: "flex", alignItems: "center", gap: "16px",
        }}>
            <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                backgroundColor: color + "18", display: "flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
                <Icon size={20} color={color}/>
            </div>
            <div>
                <div style={{fontSize: "12px", color: "#9ca3af", marginBottom: "4px"}}>
                    {label}
                </div>
                <div style={{fontSize: "22px", fontWeight: "600", color: "#111827", lineHeight: 1}}>
                    {value}
                </div>
            </div>
        </div>
    )
}

const CustomTooltip = ({active, payload, label}) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                backgroundColor: "#fff", border: "1px solid #e5e7eb",
                borderRadius: "8px", padding: "10px 14px",
                fontSize: "13px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}>
                <div style={{color: "#6b7280", marginBottom: "4px"}}>{label}</div>
                <div style={{fontWeight: "600", color: "#111827"}}>
                    {formatUGX(payload[0].value)}
                </div>
            </div>
        )
    }
    return null
}

export default function ReportsPage() {
    const [from, setFrom] = useState(firstOfMonth)
    const [to, setTo] = useState(todayStr)
    const [appliedFrom, setAppliedFrom] = useState(firstOfMonth)
    const [appliedTo, setAppliedTo] = useState(todayStr)

    const {data: summary, isLoading: summaryLoading} = useSummary()
    const {data: occupancy, isLoading: occupancyLoading} = useOccupancy()
    const {data: paymentReport, isLoading: reportLoading} = usePaymentReport({
        from: appliedFrom,
        to: appliedTo,
    })

    const handleApply = () => {
        setAppliedFrom(from)
        setAppliedTo(to)
    }

    // Build simple bar chart data from payment report
    const chartData = paymentReport ? [
        {name: "Total Collected", amount: paymentReport.totalAmount || 0},
    ] : []

    const inputStyle = {
        padding: "8px 12px", fontSize: "13px",
        borderRadius: "8px", border: "1px solid #d1d5db",
        outline: "none", fontFamily: "'DM Sans', sans-serif",
        color: "#111827", backgroundColor: "#fff",
    }

    return (
        <PageWrapper title="Reports">

            {/* Summary cards */}
            <div style={{marginBottom: "12px"}}>
                <p style={{
                    fontSize: "12px", fontWeight: "500", color: "#9ca3af",
                    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px"
                }}>
                    Overview
                </p>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "12px", marginBottom: "28px",
                }}>
                    <SummaryCard
                        icon={Building2} color="#0F6E56" label="Total Units"
                        value={summaryLoading ? "—" : summary?.totalUnits ?? "—"}
                    />
                    <SummaryCard
                        icon={Building2} color="#1D9E75" label="Available Units"
                        value={summaryLoading ? "—" : summary?.availableUnits ?? "—"}
                    />
                    <SummaryCard
                        icon={Users} color="#085041" label="Total Tenants"
                        value={summaryLoading ? "—" : summary?.totalTenants ?? "—"}
                    />
                    <SummaryCard
                        icon={FileText} color="#0a4a38" label="Active Agreements"
                        value={summaryLoading ? "—" : summary?.activeAgreements ?? "—"}
                    />
                    <SummaryCard
                        icon={FileText} color="#6b7280" label="Terminated"
                        value={summaryLoading ? "—" : summary?.terminatedAgreements ?? "—"}
                    />
                    <SummaryCard
                        icon={CreditCard} color="#0F6E56" label="All-time Revenue"
                        value={summaryLoading ? "—" : formatUGX(summary?.totalRevenueAllTime)}
                    />
                </div>
            </div>

            {/* Occupancy */}
            <div style={{
                backgroundColor: "#fff", borderRadius: "12px",
                border: "1px solid #f0f0f0", padding: "22px",
                marginBottom: "20px",
            }}>
                <p style={{
                    fontSize: "13px", fontWeight: "600", color: "#111827",
                    margin: "0 0 16px"
                }}>
                    Occupancy
                </p>
                <div style={{display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap"}}>
                    <div style={{flex: 1, minWidth: "200px"}}>
                        {/* Occupancy bar */}
                        <div style={{
                            display: "flex", justifyContent: "space-between",
                            fontSize: "13px", color: "#6b7280", marginBottom: "8px"
                        }}>
                            <span>{occupancy?.occupiedUnits ?? "—"} occupied</span>
                            <span>{occupancy?.availableUnits ?? "—"} available</span>
                        </div>
                        <div style={{
                            height: "10px", borderRadius: "10px",
                            backgroundColor: "#f3f4f6", overflow: "hidden",
                        }}>
                            <div style={{
                                height: "100%", borderRadius: "10px",
                                backgroundColor: "#0F6E56",
                                width: `${occupancy?.occupancyRate ?? 0}%`,
                                transition: "width 0.5s ease",
                            }}/>
                        </div>
                        <div style={{fontSize: "12px", color: "#9ca3af", marginTop: "6px"}}>
                            {occupancy?.totalUnits ?? "—"} total units
                        </div>
                    </div>
                    <div style={{
                        fontSize: "36px", fontWeight: "700", color: "#0F6E56",
                        flexShrink: 0,
                    }}>
                        {occupancyLoading ? "—" : `${occupancy?.occupancyRate ?? 0}%`}
                    </div>
                </div>
            </div>

            {/* Payment report */}
            <div style={{
                backgroundColor: "#fff", borderRadius: "12px",
                border: "1px solid #f0f0f0", padding: "22px",
            }}>
                <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", flexWrap: "wrap",
                    gap: "12px", marginBottom: "20px",
                }}>
                    <p style={{fontSize: "13px", fontWeight: "600", color: "#111827", margin: 0}}>
                        Payment Report
                    </p>
                    {/* Date range filter */}
                    <div style={{display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap"}}>
                        <span style={{fontSize: "13px", color: "#6b7280"}}>From</span>
                        <input
                            type="date" value={from}
                            onChange={e => setFrom(e.target.value)}
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = "#0F6E56"}
                            onBlur={e => e.target.style.borderColor = "#d1d5db"}
                        />
                        <span style={{fontSize: "13px", color: "#6b7280"}}>To</span>
                        <input
                            type="date" value={to}
                            onChange={e => setTo(e.target.value)}
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = "#0F6E56"}
                            onBlur={e => e.target.style.borderColor = "#d1d5db"}
                        />
                        <button
                            onClick={handleApply}
                            style={{
                                padding: "8px 16px", borderRadius: "8px", fontSize: "13px",
                                backgroundColor: "#0F6E56", color: "#fff", border: "none",
                                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                            }}
                        >
                            Apply
                        </button>
                    </div>
                </div>

                {/* Stats row */}
                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "12px", marginBottom: "24px",
                }}>
                    <div style={{
                        backgroundColor: "#f9fafb", borderRadius: "10px",
                        padding: "16px", textAlign: "center",
                    }}>
                        <div style={{fontSize: "12px", color: "#9ca3af", marginBottom: "6px"}}>
                            Total Payments
                        </div>
                        <div style={{fontSize: "24px", fontWeight: "600", color: "#111827"}}>
                            {reportLoading ? "—" : paymentReport?.totalPayments ?? "—"}
                        </div>
                    </div>
                    <div style={{
                        backgroundColor: "#f9fafb", borderRadius: "10px",
                        padding: "16px", textAlign: "center",
                    }}>
                        <div style={{fontSize: "12px", color: "#9ca3af", marginBottom: "6px"}}>
                            Total Collected
                        </div>
                        <div style={{fontSize: "24px", fontWeight: "600", color: "#0F6E56"}}>
                            {reportLoading ? "—" : formatUGX(paymentReport?.totalAmount)}
                        </div>
                    </div>
                    <div style={{
                        backgroundColor: "#f9fafb", borderRadius: "10px",
                        padding: "16px", textAlign: "center",
                    }}>
                        <div style={{fontSize: "12px", color: "#9ca3af", marginBottom: "6px"}}>
                            Period
                        </div>
                        <div style={{fontSize: "14px", fontWeight: "500", color: "#111827"}}>
                            {appliedFrom} → {appliedTo}
                        </div>
                    </div>
                </div>

                {/* Bar chart */}
                {!reportLoading && paymentReport?.totalAmount > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData} barSize={60}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
                            <XAxis dataKey="name" tick={{fontSize: 12, fill: "#9ca3af"}} axisLine={false}
                                   tickLine={false}/>
                            <YAxis tick={{fontSize: 12, fill: "#9ca3af"}} axisLine={false} tickLine={false}
                                   tickFormatter={v => `${(v / 1000).toFixed(0)}K`}/>
                            <Tooltip content={<CustomTooltip/>}/>
                            <Bar dataKey="amount" fill="#0F6E56" radius={[6, 6, 0, 0]}/>
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