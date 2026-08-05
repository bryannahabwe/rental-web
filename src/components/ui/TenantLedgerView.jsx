import {useMemo, useState} from "react"
import {Check} from "lucide-react"
import {useTenantLedger} from "@/hooks/useTenants"
import {tenantsService} from "@/services/tenantsService"
import Badge from "./Badge"
import Button from "./Button"
import DataTable from "./DataTable"
import {EmptyState, ErrorState} from "./States"
import {LoadingPanel} from "./Loader"
import {formatDate, formatUGX} from "@/lib/format"
import {statusTone} from "@/lib/statusTone"
import {cn} from "@/lib/cn"

const TRANSACTIONS_PAGE_SIZE = 15

/** A compact figure in the summary strip. */
function Stat({label, value, tone = "default"}) {
    return (
        <div>
            <p className="mb-1 text-2xs uppercase tracking-wide text-neutral-40">{label}</p>
            <p
                className={cn(
                    "text-base font-semibold tabular-nums",
                    tone === "danger" ? "text-danger-600"
                        : tone === "success" ? "text-success-600"
                            : "text-neutral-90",
                )}
            >
                {value}
            </p>
        </div>
    )
}

const ARREARS_CHIP =
    "inline-block whitespace-nowrap rounded-full border border-danger-100 bg-white px-3 py-1 text-xs font-semibold text-danger-700"

/**
 * The ledger & arrears body for a tenant: arrears banner, summary stats,
 * billing-cycle table, and paginated transaction history. Shared by the
 * ledger modal (wrapped in modal chrome) and the tenant detail page (inline).
 */
export default function TenantLedgerView({tenantId}) {
    const {data: ledger, isLoading, isError, refetch} = useTenantLedger(tenantId)

    // Extra pages are tagged with the tenant they belong to, so switching
    // tenants discards them during render — no reset effect needed.
    const [extra, setExtra] = useState({tenantId: null, rows: [], nextPage: 1})
    const [loadingMore, setLoadingMore] = useState(false)

    const isSameTenant = extra.tenantId === tenantId
    const extraRows = isSameTenant ? extra.rows : []
    const nextPage = isSameTenant ? extra.nextPage : 1

    const transactions = ledger ? [...ledger.transactions, ...extraRows] : []
    const hasMore = ledger && transactions.length < ledger.transactionsTotal

    // A cycle is overdue when it's due and its OWN rent isn't fully covered
    // (status UNPAID/PARTIAL) — not when the cumulative running balance is
    // positive, which can happen on a fully-paid cycle (e.g. arrears-billing
    // timing lag or opening arrears carried forward).
    const overdueCycles = ledger ? ledger.cycles.filter((c) => c.due && c.status !== "PAID") : []
    const inArrears = ledger && ledger.outstanding > 0

    const loadMore = async () => {
        setLoadingMore(true)
        try {
            const res = await tenantsService.getTransactions(tenantId, {
                page: nextPage, size: TRANSACTIONS_PAGE_SIZE,
            })
            setExtra({tenantId, rows: [...extraRows, ...res.data.content], nextPage: nextPage + 1})
        } finally {
            setLoadingMore(false)
        }
    }

    const cycleColumns = useMemo(() => [
        {
            key: "period", header: "Period", card: "title", cellClass: "whitespace-nowrap text-neutral-90",
            cell: (c) => `${formatDate(c.periodStartDate)} – ${formatDate(c.periodEndDate)}`,
        },
        {
            key: "expectedAmount", header: "Expected", align: "right", card: "meta",
            cellClass: "whitespace-nowrap tabular-nums", cell: (c) => formatUGX(c.expectedAmount),
        },
        {
            key: "paidAmount", header: "Paid", align: "right", card: "meta",
            cellClass: "whitespace-nowrap tabular-nums", cell: (c) => formatUGX(c.paidAmount),
        },
        {
            key: "balance", header: "Balance", align: "right", card: "meta", cardLabel: "Balance",
            cellClass: "whitespace-nowrap font-medium tabular-nums",
            cell: (c) => {
                // Per-cycle balance: what THIS period still owes — always
                // expected − paid, so it agrees with the Status column. A
                // not-yet-due cycle that's been partly prepaid (e.g. a rollover
                // covering 120k of a 180k month) reads PARTIAL with 60k left,
                // NOT a 120k credit, which zeroing out expected used to produce.
                // Negative = overpaid (a credit on this cycle).
                const balance = Number(c.expectedAmount) - Number(c.paidAmount)
                // Owed-but-overdue is the only alarming case (red). A positive
                // balance on a not-yet-due cycle is simply rent still to come,
                // so it stays neutral; settled (0) and credits stay green.
                const tone = balance <= 0 ? "text-success-600"
                    : c.due ? "text-danger-600"
                        : "text-neutral-90"
                return (
                    <span className={tone}>
                        {balance < 0 ? `${formatUGX(Math.abs(balance))} cr` : formatUGX(balance)}
                    </span>
                )
            },
        },
        {
            // The due marker lives in this cell rather than its own column: the
            // row is already tinted for overdue and dimmed for not-yet-due, and
            // a seventh column pushed the table past its card and clipped.
            key: "status", header: "Status", card: "badge",
            cellClass: "whitespace-nowrap",
            cell: (c) => (
                <span className="inline-flex items-center gap-1.5">
                    <Badge tone={statusTone("period", c.status)}>{c.status}</Badge>
                    {!c.due ? (
                        <span className="text-2xs text-neutral-40">not yet due</span>
                    ) : c.status !== "PAID" ? (
                        <span className="text-2xs font-semibold text-danger-600">overdue</span>
                    ) : null}
                </span>
            ),
        },
    ], [])

    const txColumns = useMemo(() => [
        {
            key: "paymentDate", header: "Date", card: "title", cellClass: "whitespace-nowrap text-neutral-90",
            cell: (t) => formatDate(t.paymentDate),
        },
        {
            key: "amount", header: "Amount", align: "right", card: "block", cardLabel: "Amount",
            cellClass: "whitespace-nowrap font-medium tabular-nums text-neutral-90",
            cell: (t) => {
                // Mirror the Payments table exactly (PaymentsPage amount cell):
                // lead with what this payment put toward its OWN period
                // (received − rolled over) so the headline agrees with "For
                // Period", move the gross to a caption, and — for a row that
                // fell short of the period's rent (e.g. a partial rollover) —
                // show "of X expected" for the same context the Payments page gives.
                const short = t.expectedAmount != null && t.amount < t.expectedAmount
                const applied = t.overpayment > 0 ? t.amount - t.overpayment : t.amount
                return (
                    <div>
                        <span className="tabular-nums">{formatUGX(applied)}</span>
                        {t.overpayment > 0 ? (
                            <p className="mt-0.5 text-2xs font-normal tabular-nums text-info-600">
                                {formatUGX(t.amount)} received · {formatUGX(t.overpayment)} rolled over
                            </p>
                        ) : short ? (
                            <p className="mt-0.5 text-2xs font-normal tabular-nums text-neutral-40">
                                of {formatUGX(t.expectedAmount)} expected
                            </p>
                        ) : null}
                    </div>
                )
            },
        },
        {
            key: "period", header: "For Period", card: "meta", cardLabel: null,
            cellClass: "whitespace-nowrap",
            cell: (t) => `${formatDate(t.periodStartDate)} – ${formatDate(t.periodEndDate)}`,
        },
        {key: "method", header: "Method", card: "meta", cardLabel: null, cellClass: "whitespace-nowrap"},
        {
            key: "source", header: "Source", card: "badge",
            cell: (t) => <Badge size="sm" tone={statusTone("payment", t.source)}>{t.source}</Badge>,
        },
        {
            key: "reference", header: "Reference", cellClass: "whitespace-nowrap",
            cell: (t) => t.reference || "—",
        },
    ], [])

    if (isLoading) return <LoadingPanel/>
    if (isError || !ledger) {
        return (
            <ErrorState
                title="Could not load ledger"
                message="This tenant may not have an active agreement."
                onRetry={refetch}
            />
        )
    }

    return (
        <>
            {/* Arrears banner — the headline "how much is owed" at a glance */}
            {inArrears ? (
                <div
                    className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-danger-100 bg-danger-50 px-4 py-4">
                    <div>
                        <p className="mb-1 text-2xs font-semibold uppercase tracking-wide text-danger-700">
                            In Arrears
                        </p>
                        <p className="font-heading text-2xl font-medium leading-none tabular-nums text-danger-600">
                            {formatUGX(ledger.outstanding)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {overdueCycles.length > 0 && (
                            <span className={ARREARS_CHIP}>
                                {overdueCycles.length} cycle{overdueCycles.length > 1 ? "s" : ""} overdue
                            </span>
                        )}
                        {ledger.openingArrears > 0 && (
                            <span className={ARREARS_CHIP}>
                                {formatUGX(ledger.openingArrears)} opening arrears
                            </span>
                        )}
                    </div>
                </div>
            ) : (
                <div
                    className="mb-5 flex items-center gap-2 rounded-lg border border-success-100 bg-success-50 px-4 py-3.5 text-sm font-semibold text-success-700">
                    <Check size={16} strokeWidth={3}/>
                    Fully paid up
                    {ledger.openingCredit > 0 && ` · ${formatUGX(ledger.openingCredit)} credit on file`}
                </div>
            )}

            <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-neutral-0 p-4 sm:grid-cols-3">
                <Stat label="Total Expected" value={formatUGX(ledger.totalExpected)}/>
                <Stat label="Total Paid" value={formatUGX(ledger.totalPaid)}/>
                <Stat label="Outstanding" value={formatUGX(ledger.outstanding)}
                      tone={ledger.outstanding > 0 ? "danger" : "success"}/>
                {ledger.openingArrears > 0 && (
                    <Stat label="Opening Arrears" value={formatUGX(ledger.openingArrears)} tone="danger"/>
                )}
                {ledger.openingCredit > 0 && (
                    <Stat label="Opening Credit" value={formatUGX(ledger.openingCredit)} tone="success"/>
                )}
            </div>

            <h3 className="mb-2.5 text-sm font-semibold text-neutral-70">Billing Cycles</h3>
            <div className="mb-7 overflow-hidden rounded-lg border border-neutral-5">
                <DataTable
                    columns={cycleColumns}
                    rows={ledger.cycles}
                    rowKey={(c) => c.periodStartDate}
                    rowClass={(c) =>
                        c.due && c.status !== "PAID" ? "bg-danger-50" : !c.due ? "opacity-55" : undefined
                    }
                    emptyTitle="No billing cycles"
                    emptyMessage="Cycles appear once the agreement starts."
                />
            </div>

            <div className="mb-2.5 flex items-baseline justify-between gap-3">
                <h3 className="text-sm font-semibold text-neutral-70">Transaction History</h3>
                <span className="text-xs tabular-nums text-neutral-40">
                    {transactions.length} of {ledger.transactionsTotal}
                </span>
            </div>

            {transactions.length === 0 ? (
                <EmptyState title="No payments yet" message="Recorded payments will appear here."/>
            ) : (
                <>
                    <div className="overflow-hidden rounded-lg border border-neutral-5">
                        <DataTable columns={txColumns} rows={transactions} rowKey="id"/>
                    </div>
                    {hasMore && (
                        <div className="mt-3 text-center">
                            <Button size="sm" variant="outline" loading={loadingMore} onClick={loadMore}>
                                Load more
                            </Button>
                        </div>
                    )}
                </>
            )}
        </>
    )
}
