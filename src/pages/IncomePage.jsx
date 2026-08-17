import {useMemo, useState} from "react"
import {Banknote, Pencil, Plus, Trash2, TrendingUp, Wallet, X} from "lucide-react"
import AppShell from "@/components/layout/AppShell"
import {useIncome, useDeleteOtherIncome} from "@/hooks/useIncome"
import {useFinances} from "@/hooks/useReports"
import useDebouncedValue from "@/hooks/useDebouncedValue"
import {useCan} from "@/hooks/usePermissions"
import {
    Badge, Button, Card, DataTable, DateField, Pagination, SearchInput, SummaryCard, Toolbar, toast, useConfirm,
} from "@/components/ui"
import {formatDate, formatUGX, formatUGXShort} from "@/lib/format"
import {getErrorMessage} from "@/utils/errorMessage"
import AddOtherIncomeModal from "@/components/feature/income/AddOtherIncomeModal"

const today = new Date()
const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1)
    .toISOString().split("T")[0]
const todayStr = today.toISOString().split("T")[0]

const METHOD_LABELS = {
    CASH: "Cash", MOBILE_MONEY: "Mobile Money", BANK_TRANSFER: "Bank Transfer", CHEQUE: "Cheque",
}

export default function IncomePage() {
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState("")
    const [fromDate, setFromDate] = useState(sixMonthsAgo)
    const [toDate, setToDate] = useState(todayStr)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)

    const can = useCan()
    const canAdd = can("recordPayments")
    // Totals come from the finance-gated /reports/finances endpoint, so only
    // report-capable users load them; everyone else still sees the ledger.
    const canViewTotals = can("viewReports")
    const confirm = useConfirm()
    const deleteIncome = useDeleteOtherIncome()

    const query = useDebouncedValue(search)

    const onSearchChange = (value) => {
        setSearch(value)
        setPage(0)
    }

    const listParams = {
        page, size: 10, sortBy: "incomeDate", sortDir: "desc",
        search: query || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
    }
    const {data, isLoading, error, refetch} = useIncome(listParams)
    const {data: finances} = useFinances(
        {from: fromDate || undefined, to: toDate || undefined},
        {enabled: canViewTotals},
    )

    const rows = data?.content || []
    const totalPages = data?.totalPages || 0

    const openCreate = () => {
        setEditing(null)
        setShowModal(true)
    }

    const openEdit = (entry) => {
        setEditing(entry)
        setShowModal(true)
    }

    const handleDelete = async (entry) => {
        const label = `${entry.category} — ${formatUGX(entry.amount)}`
        if (!(await confirm.askDelete("income entry", label))) return
        try {
            await deleteIncome.mutateAsync(entry.id)
            toast.success("Income deleted")
        } catch (err) {
            toast.error("Couldn't delete the income entry", getErrorMessage(err, "Please try again."))
        }
    }

    const columns = useMemo(() => [
        {
            key: "category", header: "Source", card: "title",
            cellClass: "whitespace-nowrap",
            cell: (e) => (
                <span className="flex items-center gap-2">
                    <Badge tone={e.source === "RENT" ? "primary" : "info"}>
                        {e.source === "RENT" ? "Rent" : "Other"}
                    </Badge>
                    {e.source !== "RENT" && (
                        <span className="text-sm text-neutral-70">{e.category}</span>
                    )}
                </span>
            ),
        },
        {
            key: "tenantName", header: "Tenant", card: "meta", cellClass: "whitespace-nowrap",
            cell: (e) => e.tenantName || "—",
        },
        {
            key: "propertyName", header: "Property", card: "meta", cellClass: "whitespace-nowrap",
            cell: (e) => e.propertyName || "—",
        },
        {
            key: "amount", header: "Amount", align: "right",
            cellClass: "whitespace-nowrap font-medium tabular-nums text-neutral-90",
            card: "block", cardLabel: "Amount",
            cell: (e) => formatUGX(e.amount),
        },
        {
            key: "method", header: "Method", card: "meta", cardLabel: null, cellClass: "whitespace-nowrap",
            cell: (e) => METHOD_LABELS[e.method] || e.method || "—",
        },
        {
            key: "incomeDate", header: "Date", cellClass: "whitespace-nowrap",
            card: "meta", cardLabel: "Date",
            cell: (e) => formatDate(e.incomeDate),
        },
    ], [])

    return (
        <AppShell
            title="Income"
            subtitle="Rent and other income across your properties"
            actions={canAdd &&
                <Button iconLeft={Plus} onClick={openCreate}>Add Other Income</Button>}
            mobileAction={
                canAdd && (
                    <button
                        type="button"
                        onClick={openCreate}
                        aria-label="Add other income"
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-fab transition-colors hover:bg-primary-600"
                    >
                        <Plus size={26}/>
                    </button>
                )
            }
        >
            {/* Rent auto-populates income; these totals reflect the selected period. */}
            {canViewTotals && (
                <div className="mb-4 grid grid-cols-3 gap-3 md:gap-4">
                    <SummaryCard icon={Wallet} tone="primary"
                                 label="Total Income" value={formatUGX(finances?.totalIncome)}
                                 valueShort={formatUGXShort(finances?.totalIncome)}/>
                    <SummaryCard icon={Banknote} tone="success"
                                 label="Rent" value={formatUGX(finances?.totalRent)}
                                 valueShort={formatUGXShort(finances?.totalRent)}/>
                    <SummaryCard icon={TrendingUp} tone="info"
                                 label="Other Income" value={formatUGX(finances?.totalOtherIncome)}
                                 valueShort={formatUGXShort(finances?.totalOtherIncome)}/>
                </div>
            )}

            <Card bodyClass="p-0" header={
                <Toolbar>
                    <SearchInput value={search} onChange={onSearchChange}
                                 placeholder="Search by category or tenant…" className="md:w-72"/>
                    <div className="flex flex-wrap items-center gap-2">
                        <DateField className="w-full sm:w-40" value={fromDate}
                                   onChange={(e) => {
                                       setFromDate(e.target.value)
                                       setPage(0)
                                   }} aria-label="From date"/>
                        <span aria-hidden="true" className="hidden text-sm text-neutral-30 sm:inline">→</span>
                        <DateField className="w-full sm:w-40" value={toDate}
                                   onChange={(e) => {
                                       setToDate(e.target.value)
                                       setPage(0)
                                   }} aria-label="To date"/>
                    </div>
                </Toolbar>
            }>
                <DataTable
                    columns={columns}
                    rows={rows}
                    rowKey="id"
                    loading={isLoading}
                    error={error}
                    onRetry={refetch}
                    actions={canAdd ? (e) => (
                        e.source === "RENT" ? (
                            <span className="text-2xs text-neutral-30">Rent payment</span>
                        ) : (
                            <div className="flex justify-end gap-1.5">
                                <Button size="sm" variant="outline" iconLeft={Pencil}
                                        title="Edit income" aria-label="Edit income"
                                        onClick={() => openEdit(e)}>Edit</Button>
                                <Button size="sm" variant="ghost" iconLeft={Trash2}
                                        className="text-danger-600 hover:bg-danger-50"
                                        title="Delete income" aria-label="Delete income"
                                        onClick={() => handleDelete(e)}/>
                            </div>
                        )
                    ) : undefined}
                    emptyTitle="No income in this period"
                    emptyMessage="Rent payments show here automatically. Widen the dates or add other income."
                    emptyAction={
                        canAdd && (
                            <Button iconLeft={Plus} onClick={openCreate}>Add Other Income</Button>
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

            {showModal && (
                <AddOtherIncomeModal entry={editing} onClose={() => setShowModal(false)}/>
            )}
        </AppShell>
    )
}
