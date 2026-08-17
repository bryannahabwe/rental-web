import {useState} from "react"
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts"
import {Scale, TrendingDown, Wallet} from "lucide-react"
import AppShell from "@/components/layout/AppShell"
import {useFinances} from "@/hooks/useReports"
import {Button, Card, ChartTooltip, DateField, LoadingPanel, SummaryCard} from "@/components/ui"
import {formatUGX, formatUGXShort} from "@/lib/format"
import {axisProps, CHART_SEMANTIC, CHART_SERIES, gridProps} from "@/lib/chartTheme"

const today = new Date()
const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1)
    .toISOString().split("T")[0]
const todayStr = today.toISOString().split("T")[0]

export default function FinancesPage() {
    const [from, setFrom] = useState(sixMonthsAgo)
    const [to, setTo] = useState(todayStr)
    const [appliedFrom, setAppliedFrom] = useState(sixMonthsAgo)
    const [appliedTo, setAppliedTo] = useState(todayStr)

    const {data: finances, isLoading} = useFinances({from: appliedFrom, to: appliedTo})

    const handleApply = () => {
        setAppliedFrom(from)
        setAppliedTo(to)
    }

    const net = finances?.net ?? 0
    const chartData = (finances?.monthly || []).map((m) => ({
        name: m.label, income: m.income || 0, expenses: m.expenses || 0,
    }))
    const hasChartData = !isLoading && chartData.some((m) => m.income > 0 || m.expenses > 0)

    return (
        <AppShell title="Finances" subtitle="Income, expenses and net over time" showBack>
            {isLoading ? (
                <LoadingPanel/>
            ) : (
                <div className="grid grid-cols-1 gap-3 md:gap-4 sm:grid-cols-3">
                    <SummaryCard icon={Wallet} tone="primary"
                                 label="Total Income" value={formatUGX(finances?.totalIncome)}
                                 valueShort={formatUGXShort(finances?.totalIncome)}
                                 hint={`Rent ${formatUGXShort(finances?.totalRent)} · Other ${formatUGXShort(finances?.totalOtherIncome)}`}/>
                    <SummaryCard icon={TrendingDown} tone="danger"
                                 label="Total Expenses" value={formatUGX(finances?.totalExpenses)}
                                 valueShort={formatUGXShort(finances?.totalExpenses)}/>
                    <SummaryCard icon={Scale} tone={net >= 0 ? "success" : "danger"}
                                 label="Net" value={formatUGX(net)}
                                 valueShort={formatUGXShort(net)}
                                 hint={net >= 0 ? "Surplus" : "Deficit"}/>
                </div>
            )}

            <Card className="mt-6" bodyClass="p-4 md:p-5">
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <p className="text-sm font-semibold text-neutral-90">Income vs Expenses</p>
                    <div className="flex flex-wrap items-end gap-2">
                        <label className="flex-1 md:flex-none">
                            <span className="mb-1.5 block text-xs text-neutral-40">From</span>
                            <DateField className="md:w-44" value={from} onChange={(e) => setFrom(e.target.value)}/>
                        </label>
                        <label className="flex-1 md:flex-none">
                            <span className="mb-1.5 block text-xs text-neutral-40">To</span>
                            <DateField className="md:w-44" value={to} onChange={(e) => setTo(e.target.value)}/>
                        </label>
                        <Button onClick={handleApply}>Apply</Button>
                    </div>
                </div>

                {hasChartData ? (
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={chartData} barGap={4}>
                            <CartesianGrid {...gridProps} strokeDasharray="3 3"/>
                            <XAxis dataKey="name" {...axisProps}/>
                            <YAxis {...axisProps} width={52} tickFormatter={formatUGXShort}/>
                            <Tooltip
                                cursor={{fill: "rgb(15 110 86 / 0.06)"}}
                                content={<ChartTooltip formatter={formatUGX}/>}
                            />
                            <Legend wrapperStyle={{fontSize: 12, paddingTop: 8}}/>
                            <Bar name="Income" dataKey="income" fill={CHART_SERIES[0]}
                                 radius={[6, 6, 0, 0]} isAnimationActive={false}/>
                            <Bar name="Expenses" dataKey="expenses" fill={CHART_SEMANTIC.danger}
                                 radius={[6, 6, 0, 0]} isAnimationActive={false}/>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-30 items-center justify-center rounded-lg bg-neutral-0 text-sm text-neutral-40">
                        {isLoading ? "Loading…" : "No income or expenses in this period"}
                    </div>
                )}
            </Card>
        </AppShell>
    )
}
