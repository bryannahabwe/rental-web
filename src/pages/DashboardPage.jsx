import {useMemo} from "react"
import {Link} from "react-router-dom"
import {Building2, CreditCard, TrendingUp, Users, Wallet} from "lucide-react"
import AppShell from "@/components/layout/AppShell"
import {useOccupancy, usePaymentReport, useSummary} from "@/hooks/useReports"
import {usePayments} from "@/hooks/usePayments"
import {useTenants} from "@/hooks/useTenants"
import {Badge, Card, DataTable, ProgressBar, SummaryCard} from "@/components/ui"
import {formatCycle, formatDate, formatUGX, todayStr} from "@/lib/format"
import {statusTone} from "@/lib/statusTone"
import {cn} from "@/lib/cn"

const firstOfMonthStr = () => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0]
}

/** Section header with a "view all" link, shared by the two list cards. */
function SectionHeader({title, count, countTone = "danger", to, linkLabel = "View all"}) {
    return (
        <div className="flex items-center justify-between gap-3 border-b border-neutral-5 px-4 py-3.5">
            <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-90">{title}</span>
                {count != null && <Badge size="sm" tone={countTone}>{count}</Badge>}
            </div>
            <Link to={to} className="text-xs font-medium text-primary-600 hover:text-primary-700">
                {linkLabel} →
            </Link>
        </div>
    )
}

export default function DashboardPage() {
    const {data: summary, isLoading: summaryLoading} = useSummary()
    const {data: occupancy, isLoading: occupancyLoading} = useOccupancy()
    const {data: paymentsData, isLoading: paymentsLoading} = usePayments({
        page: 0, size: 5, sortBy: "paymentDate", sortDir: "desc",
    })
    // The dashboard totals and the outstanding table both need every tenant,
    // not a page of them — a truncated fetch would silently understate
    // "Total Outstanding". 500 is the practical ceiling for one property.
    const {data: tenantsData, isLoading: tenantsLoading} = useTenants({
        page: 0, size: 500, sortBy: "createdAt", sortDir: "desc",
    })
    // Cash actually received this calendar month — the same computation the
    // Reports page uses. Billing-cycle dates (currentCycleStart) don't align
    // with calendar months (they depend on each tenant's billingDay and
    // ADVANCE/ARREARS model), so they can't answer "how much came in this
    // month" — that mismatch was why this widget used to be wrong.
    const {data: monthReport, isLoading: monthReportLoading} = usePaymentReport({
        from: firstOfMonthStr(), to: todayStr(),
    })

    const payments = paymentsData?.content || []
    const allTenants = tenantsData?.content || []

    const outstandingTenants = allTenants.filter(
        (t) => t.periodStatus === "UNPAID" || t.periodStatus === "PARTIAL",
    )

    const tenantsWithAgreements = allTenants.filter((t) => t.monthlyRent != null)

    const totalMonthlyRent = tenantsWithAgreements
        .reduce((sum, t) => sum + Number(t.monthlyRent), 0)

    // Cumulative outstanding (may exceed monthly rent due to arrears)
    const totalOutstanding = outstandingTenants
        .reduce((sum, t) => sum + Number(t.currentBalance || 0), 0)

    const paidThisMonth = Number(monthReport?.totalAmount || 0)

    const collectionPct = totalMonthlyRent > 0
        ? Math.round((paidThisMonth / totalMonthlyRent) * 100)
        : 0

    const outstandingColumns = useMemo(() => [
        {
            key: "name", header: "Tenant", card: "title",
            cellClass: "whitespace-nowrap font-medium text-neutral-90",
        },
        {
            key: "currentUnit", header: "Unit", card: "meta", cellClass: "whitespace-nowrap",
            cell: (t) => (t.currentUnit ? `Unit ${t.currentUnit}` : "—"),
        },
        {
            key: "cycle", header: "Current Cycle", card: "meta", cardLabel: null,
            cellClass: "whitespace-nowrap",
            cell: (t) => formatCycle(t.currentCycleStart, t.currentCycleEnd),
        },
        {
            key: "monthlyRent", header: "Monthly Rent", align: "right",
            cellClass: "whitespace-nowrap tabular-nums", cell: (t) => formatUGX(t.monthlyRent),
        },
        {
            key: "currentBalance", header: "Total Outstanding", align: "right",
            card: "meta", cardLabel: "Outstanding",
            cellClass: "whitespace-nowrap font-medium tabular-nums text-danger-600",
            cell: (t) => formatUGX(t.currentBalance),
        },
        {
            key: "periodStatus", header: "Status", card: "badge",
            cell: (t) => <Badge tone={statusTone("period", t.periodStatus)}>{t.periodStatus}</Badge>,
        },
    ], [])

    const paymentColumns = useMemo(() => [
        {
            key: "tenantName", header: "Tenant", card: "title",
            cellClass: "whitespace-nowrap font-medium text-neutral-90",
        },
        {
            key: "roomNumber", header: "Unit", card: "meta", cellClass: "whitespace-nowrap",
            cell: (p) => (p.roomNumber ? `Unit ${p.roomNumber}` : "—"),
        },
        {
            key: "period", header: "Period", card: "meta", cardLabel: null,
            cellClass: "whitespace-nowrap",
            cell: (p) => formatCycle(p.periodStartDate, p.periodEndDate),
        },
        {
            key: "amount", header: "Amount", align: "right",
            cellClass: "whitespace-nowrap font-semibold tabular-nums text-neutral-90",
            card: "meta", cardLabel: "Amount",
            cell: (p) => formatUGX(p.amount),
        },
        {
            key: "periodStatus", header: "Status", card: "badge",
            cell: (p) => p.periodStatus
                ? <Badge tone={statusTone("period", p.periodStatus)}>{p.periodStatus}</Badge>
                : <span className="text-sm text-neutral-30">—</span>,
        },
        {
            key: "paymentDate", header: "Date", cellClass: "whitespace-nowrap",
            card: "meta", cardLabel: "Paid",
            cell: (p) => formatDate(p.paymentDate),
        },
    ], [])

    return (
        <AppShell title="Dashboard" subtitle="How collection is tracking right now">
            {/* One responsive KPI strip — this replaces the separate desktop and
                mobile stat-card components the page rendered side by side. */}
            {/* 3 + 2 rather than a single row of five: at five across the tile
                is ~248px and a full UGX figure truncates, which would have
                clipped Total Revenue as well as the new tile. */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
                <SummaryCard
                    icon={Building2} tone="primary" label="Total Units"
                    value={summaryLoading ? "—" : summary?.totalUnits ?? "—"}
                    hint={`${summary?.availableUnits ?? "—"} available`}
                />
                <SummaryCard
                    icon={Users} tone="info" label="Active Tenants"
                    value={summaryLoading ? "—" : summary?.totalTenants ?? "—"}
                    hint={`${summary?.activeAgreements ?? "—"} active agreements`}
                />
                <SummaryCard
                    icon={CreditCard} tone="success" label="Total Revenue"
                    value={summaryLoading ? "—" : formatUGX(summary?.totalRevenueAllTime)}
                    hint="All time collected"
                />
                <SummaryCard
                    icon={TrendingUp} tone="primary" label="Occupancy Rate"
                    value={occupancyLoading ? "—" : `${occupancy?.occupancyRate ?? "—"}%`}
                    hint={`${occupancy?.occupiedUnits ?? "—"} of ${occupancy?.totalUnits ?? "—"} units`}
                />
                {/* Cumulative arrears across every tenant, not just this cycle's
                    shortfall — the same figure the Outstanding Tenants table sums. */}
                <SummaryCard
                    className="col-span-2 lg:col-span-1"
                    icon={Wallet}
                    tone={tenantsLoading ? "neutral" : totalOutstanding > 0 ? "danger" : "success"}
                    label="Total Outstanding"
                    value={tenantsLoading ? "—" : formatUGX(totalOutstanding)}
                    hint={
                        tenantsLoading
                            ? "Across all tenants"
                            : outstandingTenants.length === 0
                                ? "All tenants paid up"
                                : `${outstandingTenants.length} tenant${outstandingTenants.length === 1 ? "" : "s"} owing`
                    }
                />
            </div>

            {!tenantsLoading && tenantsWithAgreements.length > 0 && (
                <Card className="mt-4" bodyClass="px-4 py-4 md:px-5">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-neutral-90">
                            This Month&apos;s Collection
                        </span>
                        <span
                            className={cn(
                                "text-xs font-semibold tabular-nums",
                                collectionPct >= 100 ? "text-success-600" : "text-warning-700",
                            )}
                        >
                            {monthReportLoading ? "—" : `${collectionPct}% collected this month`}
                        </span>
                    </div>

                    <ProgressBar
                        className="mb-3"
                        value={collectionPct}
                        tone={collectionPct >= 100 ? "success" : "primary"}
                        label="Share of monthly rent collected"
                    />

                    {/* One row at every width — these figures are short enough
                        that the desktop/mobile split wasn't buying anything. */}
                    <dl className="grid grid-cols-3 gap-3 text-right md:flex md:justify-end md:gap-6">
                        <div>
                            <dt className="text-2xs uppercase tracking-wide text-neutral-40">Monthly Rent</dt>
                            <dd className="mt-0.5 text-sm font-semibold tabular-nums text-neutral-90">
                                {formatUGX(totalMonthlyRent)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-2xs uppercase tracking-wide text-neutral-40">Collected</dt>
                            <dd className="mt-0.5 text-sm font-semibold tabular-nums text-success-600">
                                {monthReportLoading ? "—" : formatUGX(paidThisMonth)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-2xs uppercase tracking-wide text-neutral-40">Outstanding</dt>
                            <dd
                                className={cn(
                                    "mt-0.5 text-sm font-semibold tabular-nums",
                                    totalOutstanding > 0 ? "text-danger-600" : "text-success-600",
                                )}
                            >
                                {formatUGX(totalOutstanding)}
                            </dd>
                        </div>
                    </dl>
                </Card>
            )}

            <Card
                className="mt-4"
                bodyClass="p-0"
                header={
                    <SectionHeader
                        title="Outstanding Tenants"
                        count={outstandingTenants.length}
                        to="/tenants"
                    />
                }
            >
                <DataTable
                    columns={outstandingColumns}
                    rows={outstandingTenants}
                    rowKey="id"
                    loading={tenantsLoading}
                    skeletonRows={4}
                    cardSkeletonRows={3}
                    emptyTitle="Everyone is paid up"
                    emptyMessage="No tenant currently owes rent."
                />
            </Card>

            <Card
                className="mt-4"
                bodyClass="p-0"
                header={<SectionHeader title="Recent Payments" to="/payments"/>}
            >
                <DataTable
                    columns={paymentColumns}
                    rows={payments}
                    rowKey="id"
                    loading={paymentsLoading}
                    skeletonRows={5}
                    cardSkeletonRows={3}
                    emptyTitle="No payments recorded yet"
                    emptyMessage="Payments will appear here as they come in."
                />
            </Card>
        </AppShell>
    )
}
