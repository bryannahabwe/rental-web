import {useMemo, useState} from "react"
import {Eye, Plus, X} from "lucide-react"
import AppShell from "@/components/layout/AppShell"
import {usePayments} from "@/hooks/usePayments"
import useDebouncedValue from "@/hooks/useDebouncedValue"
import {useCan} from "@/hooks/usePermissions"
import {
    Badge, Button, Card, DataTable, DateField, Pagination, PaymentAmount, SearchInput, Toolbar,
} from "@/components/ui"
import {formatCycle, formatDate} from "@/lib/format"
import {statusTone} from "@/lib/statusTone"
import RecordPaymentModal from "@/components/feature/payments/RecordPaymentModal"
import PaymentDetailSheet from "@/components/ui/PaymentDetailSheet"

export default function PaymentsPage() {
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState("")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [selectedPaymentId, setSelectedPaymentId] = useState(null)
    const canRecord = useCan()("recordPayments")

    const query = useDebouncedValue(search)
    const hasFilters = !!(search || fromDate || toDate)

    const onSearchChange = (value) => {
        setSearch(value)
        setPage(0)
    }

    const clearFilters = () => {
        setSearch("")
        setFromDate("")
        setToDate("")
        setPage(0)
    }

    const {data, isLoading, error, refetch} = usePayments({
        page, size: 10, sortBy: "paymentDate", sortDir: "desc",
        search: query || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
    })

    const payments = data?.content || []
    const totalPages = data?.totalPages || 0

    const columns = useMemo(() => [
        {
            key: "tenantName", header: "Tenant", card: "title",
            cellClass: "whitespace-nowrap font-medium text-neutral-90",
        },
        {
            key: "roomNumber", header: "Unit", card: "meta", cellClass: "whitespace-nowrap",
            cell: (p) => `Unit ${p.roomNumber}`,
        },
        {
            key: "period", header: "Period", card: "meta", cardLabel: null, cellClass: "whitespace-nowrap",
            cell: (p) => formatCycle(p.periodStartDate, p.periodEndDate),
        },
        {
            key: "amount", header: "Amount", align: "right",
            cellClass: "whitespace-nowrap font-medium tabular-nums text-neutral-90",
            card: "block", cardLabel: "Amount",
            cell: (p) => <PaymentAmount payment={p}/>,
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
        {
            key: "reference", header: "Reference", cellClass: "whitespace-nowrap",
            card: "meta", cardLabel: null,
            cell: (p) => p.reference || "—",
        },
    ], [])

    return (
        <AppShell
            title="Payments"
            subtitle="Every rent payment recorded across your properties"
            actions={canRecord &&
                <Button iconLeft={Plus} onClick={() => setShowModal(true)}>Record Payment</Button>}
            mobileAction={
                canRecord && (
                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        aria-label="Record payment"
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-fab transition-colors hover:bg-primary-600"
                    >
                        <Plus size={26}/>
                    </button>
                )
            }
        >
            <Card bodyClass="p-0" header={
                <Toolbar>
                    <SearchInput value={search} onChange={onSearchChange}
                                 placeholder="Search by tenant, unit or reference…" className="md:w-72"/>
                    <div className="flex flex-wrap items-center gap-2">
                        <DateField
                            className="w-full sm:w-40"
                            value={fromDate}
                            onChange={(e) => {
                                setFromDate(e.target.value)
                                setPage(0)
                            }}
                            aria-label="From date"
                        />
                        <span aria-hidden="true" className="hidden text-sm text-neutral-30 sm:inline">→</span>
                        <DateField
                            className="w-full sm:w-40"
                            value={toDate}
                            onChange={(e) => {
                                setToDate(e.target.value)
                                setPage(0)
                            }}
                            aria-label="To date"
                        />
                        {hasFilters && (
                            <Button size="sm" variant="ghost" iconLeft={X} onClick={clearFilters}>Clear</Button>
                        )}
                    </div>
                </Toolbar>
            }>
                <DataTable
                    columns={columns}
                    rows={payments}
                    rowKey="id"
                    loading={isLoading}
                    error={error}
                    onRetry={refetch}
                    rowClickable
                    onRowClick={(p) => setSelectedPaymentId(p.id)}
                    actions={(p) => (
                        <Button size="sm" variant="outline" iconLeft={Eye}
                                title="View payment" aria-label={`View payment from ${p.tenantName}`}
                                onClick={() => setSelectedPaymentId(p.id)}>
                            View
                        </Button>
                    )}
                    emptyTitle={hasFilters ? "No payments match those filters" : "No payments recorded yet"}
                    emptyMessage={
                        hasFilters
                            ? "Try widening the date range or clearing the search."
                            : "Record the first payment to get started."
                    }
                    emptyAction={
                        !hasFilters && canRecord && (
                            <Button iconLeft={Plus} onClick={() => setShowModal(true)}>Record Payment</Button>
                        )
                    }
                />

                {totalPages > 1 && (
                    <Pagination
                        className="border-t border-neutral-5 px-4 py-2"
                        page={page}
                        pageSize={10}
                        totalPages={totalPages}
                        totalElements={data?.totalElements}
                        onPageChange={setPage}
                    />
                )}
            </Card>

            {showModal && <RecordPaymentModal onClose={() => setShowModal(false)}/>}
            {selectedPaymentId && (
                <PaymentDetailSheet
                    paymentId={selectedPaymentId}
                    onClose={() => setSelectedPaymentId(null)}
                />
            )}
        </AppShell>
    )
}
