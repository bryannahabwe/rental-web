import {useState} from "react"
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts"
import {Building2, CreditCard, FileText, TrendingUp, Users} from "lucide-react"
import AppShell from "@/components/layout/AppShell"
import {useMonthlyCollection, useOccupancy, usePaymentReport, useSummary} from "@/hooks/useReports"
import {Button, Card, ChartTooltip, DateField, LoadingPanel, SummaryCard} from "@/components/ui"
import {formatDate, formatUGX, formatUGXShort} from "@/lib/format"
import {axisProps, CHART_SERIES, gridProps} from "@/lib/chartTheme"

const today = new Date()
// Default to a 6-month window so the trend chart is useful out of the box —
// a single month range only ever produces one bar, which isn't a trend.
const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1)
    .toISOString().split("T")[0]
const todayStr = today.toISOString().split("T")[0]

const SECTION = "mb-3 text-2xs font-medium uppercase tracking-wide text-neutral-40"

/** A centred figure in the payment-report strip. */
function Stat({label, value, tone = "default"}) {
    return (
        <div className="rounded-lg bg-neutral-0 p-4 text-center">
            <p className="mb-1.5 text-xs text-neutral-40">{label}</p>
            <p
                className={
                    tone === "success"
                        ? "break-words font-heading text-xl font-medium tabular-nums text-success-600"
                        : "break-words font-heading text-xl font-medium tabular-nums text-neutral-90"
                }
            >
                {value}
            </p>
        </div>
    )
}

export default function ReportsPage() {
    const [from, setFrom] = useState(sixMonthsAgo)
    const [to, setTo] = useState(todayStr)
    const [appliedFrom, setAppliedFrom] = useState(sixMonthsAgo)
    const [appliedTo, setAppliedTo] = useState(todayStr)

    const {data: summary, isLoading: summaryLoading} = useSummary()
    const {data: occupancy} = useOccupancy()
    const {data: paymentReport, isLoading: reportLoading} = usePaymentReport({
        from: appliedFrom, to: appliedTo,
    })
    const {data: monthlyCollection, isLoading: monthlyLoading} = useMonthlyCollection({
        from: appliedFrom, to: appliedTo,
    })

    const handleApply = () => {
        setAppliedFrom(from)
        setAppliedTo(to)
    }

    const chartData = (monthlyCollection || []).map((m) => ({
        name: m.label, amount: m.totalAmount || 0,
    }))

    const hasChartData = !monthlyLoading && chartData.some((m) => m.amount > 0)

    return (
        <AppShell title="Reports" subtitle="Collection performance over time" showBack>
            <p className={SECTION}>Overview</p>

            {summaryLoading ? (
                <LoadingPanel/>
            ) : (
                /* 4-up on desktop with revenue spanning two columns: the money
                   figure is the only long value here and the rest are small
                   counts, so a uniform 3-up left most cards mostly empty.
                   Occupancy gets its own tile rather than riding along as a
                   hint on an unrelated card. */
                <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
                    <SummaryCard className="col-span-2 lg:col-span-2"
                                 icon={CreditCard} tone="primary"
                                 label="All-time Revenue" value={formatUGX(summary?.totalRevenueAllTime)}
                                 valueShort={formatUGXShort(summary?.totalRevenueAllTime)}/>
                    <SummaryCard icon={Building2} tone="primary"
                                 label="Total Units" value={summary?.totalUnits ?? "—"}/>
                    <SummaryCard icon={Users} tone="primary"
                                 label="Total Tenants" value={summary?.totalTenants ?? "—"}/>
                    <SummaryCard icon={Building2} tone="info"
                                 label="Available Units" value={summary?.availableUnits ?? "—"}/>
                    <SummaryCard icon={TrendingUp} tone="success"
                                 label="Occupancy Rate"
                                 value={occupancy ? `${occupancy.occupancyRate}%` : "—"}
                                 hint={occupancy
                                     ? `${occupancy.occupiedUnits} of ${occupancy.totalUnits} units`
                                     : undefined}/>
                    <SummaryCard icon={FileText} tone="success"
                                 label="Active Agreements" value={summary?.activeAgreements ?? "—"}/>
                    <SummaryCard icon={FileText} tone="neutral"
                                 label="Terminated" value={summary?.terminatedAgreements ?? "—"}/>
                </div>
            )}

            <Card className="mt-6" bodyClass="p-4 md:p-5">
                {/* One date filter at every width — it used to be duplicated
                    across a desktop block and a mobile block. */}
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <p className="text-sm font-semibold text-neutral-90">Payment Report</p>

                    <div className="flex flex-wrap items-end gap-2">
                        <label className="flex-1 md:flex-none">
                            <span className="mb-1.5 block text-xs text-neutral-40">From</span>
                            <DateField className="md:w-44" value={from}
                                       onChange={(e) => setFrom(e.target.value)}/>
                        </label>
                        <label className="flex-1 md:flex-none">
                            <span className="mb-1.5 block text-xs text-neutral-40">To</span>
                            <DateField className="md:w-44" value={to}
                                       onChange={(e) => setTo(e.target.value)}/>
                        </label>
                        <Button onClick={handleApply}>Apply</Button>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Stat label="Total Payments"
                          value={reportLoading ? "—" : paymentReport?.totalPayments ?? "—"}/>
                    <Stat label="Total Collected" tone="success"
                          value={reportLoading ? "—" : formatUGX(paymentReport?.totalAmount)}/>
                    {/* Formatted, not raw ISO — every other date in the app
                        reads "28 Feb 2026". */}
                    <Stat label="Period" value={
                        <span className="text-sm font-medium">
                            {formatDate(appliedFrom)} → {formatDate(appliedTo)}
                        </span>
                    }/>
                </div>

                {/* One bar per month in the selected range. Colours come from
                    lib/chartTheme so charts can't drift off-palette. */}
                {hasChartData ? (
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={chartData} barSize={40}>
                            <CartesianGrid {...gridProps} strokeDasharray="3 3"/>
                            <XAxis dataKey="name" {...axisProps} />
                            <YAxis {...axisProps} width={52} tickFormatter={formatUGXShort}/>
                            <Tooltip
                                cursor={{fill: "rgb(15 110 86 / 0.06)"}}
                                content={<ChartTooltip formatter={formatUGX}/>}
                            />
                            {/* isAnimationActive={false}: recharts' entry animation
                                grows bars from zero height, and if the rAF loop is
                                throttled (background tab, reduced-motion, slow
                                paint) they can stay collapsed and the chart reads
                                as empty. The design system's charts are static
                                SVG anyway. */}
                            <Bar dataKey="amount" fill={CHART_SERIES[0]} radius={[6, 6, 0, 0]}
                                 isAnimationActive={false}/>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div
                        className="flex h-30 items-center justify-center rounded-lg bg-neutral-0 text-sm text-neutral-40">
                        {monthlyLoading ? "Loading…" : "No payments in this period"}
                    </div>
                )}
            </Card>
        </AppShell>
    )
}
