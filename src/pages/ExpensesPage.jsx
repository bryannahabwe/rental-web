import {useMemo, useState} from "react"
import {Paperclip, Pencil, Plus, Trash2, X} from "lucide-react"
import AppShell from "@/components/layout/AppShell"
import {useDeleteExpense, useExpenses} from "@/hooks/useExpenses"
import useDebouncedValue from "@/hooks/useDebouncedValue"
import {useCan} from "@/hooks/usePermissions"
import {
    Badge, Button, Card, DataTable, DateField, Pagination, SearchInput, Toolbar, toast, useConfirm,
} from "@/components/ui"
import {formatDate, formatUGX} from "@/lib/format"
import {getErrorMessage} from "@/utils/errorMessage"
import RecordExpenseModal from "@/components/feature/expenses/RecordExpenseModal"

export default function ExpensesPage() {
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState("")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const canRecord = useCan()("recordExpenses")
    const confirm = useConfirm()
    const deleteExpense = useDeleteExpense()

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

    const {data, isLoading, error, refetch} = useExpenses({
        page, size: 10, sortBy: "expenseDate", sortDir: "desc",
        search: query || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
    })

    const expenses = data?.content || []
    const totalPages = data?.totalPages || 0

    const openCreate = () => {
        setEditing(null)
        setShowModal(true)
    }

    const openEdit = (expense) => {
        setEditing(expense)
        setShowModal(true)
    }

    const handleDelete = async (expense) => {
        const label = `${expense.categoryName} — ${formatUGX(expense.amount)}`
        if (!(await confirm.askDelete("expense", label))) return
        try {
            await deleteExpense.mutateAsync(expense.id)
            toast.success("Expense deleted")
        } catch (err) {
            toast.error("Couldn't delete the expense", getErrorMessage(err, "Please try again."))
        }
    }

    const columns = useMemo(() => [
        {
            key: "category", header: "Category", card: "title",
            cellClass: "whitespace-nowrap font-medium text-neutral-90",
            cell: (e) => <Badge tone="neutral">{e.categoryName}</Badge>,
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
            key: "method", header: "Method", card: "meta", cellClass: "whitespace-nowrap",
            cell: (e) => e.method || "—",
        },
        {
            key: "paidBy", header: "Paid by", card: "meta", cardLabel: "Paid by", cellClass: "whitespace-nowrap",
            cell: (e) => e.paidBy || "—",
        },
        {
            key: "receiptUrl", header: "Receipt", card: "meta", cardLabel: "Receipt", cellClass: "whitespace-nowrap",
            cell: (e) => e.receiptUrl ? (
                <a href={e.receiptUrl} target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700">
                    <Paperclip size={14}/> View
                </a>
            ) : <span className="text-neutral-30">—</span>,
        },
        {
            key: "expenseDate", header: "Date", cellClass: "whitespace-nowrap",
            card: "meta", cardLabel: "Date",
            cell: (e) => formatDate(e.expenseDate),
        },
    ], [])

    return (
        <AppShell
            title="Expenses"
            subtitle="Costs recorded across your properties"
            actions={canRecord &&
                <Button iconLeft={Plus} onClick={openCreate}>Record Expense</Button>}
            mobileAction={
                canRecord && (
                    <button
                        type="button"
                        onClick={openCreate}
                        aria-label="Record expense"
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
                                 placeholder="Search by category, paid by or method…" className="md:w-72"/>
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
                        {hasFilters && (
                            <Button size="sm" variant="ghost" iconLeft={X} onClick={clearFilters}>Clear</Button>
                        )}
                    </div>
                </Toolbar>
            }>
                <DataTable
                    columns={columns}
                    rows={expenses}
                    rowKey="id"
                    loading={isLoading}
                    error={error}
                    onRetry={refetch}
                    renderCard={(e) => (
                        <div className="flex flex-col gap-2 px-4 py-3.5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <Badge tone="neutral">{e.categoryName}</Badge>
                                    <p className="mt-1.5 truncate text-xs text-neutral-50">
                                        {e.propertyName}{e.roomNumber ? ` · Unit ${e.roomNumber}` : ""}
                                    </p>
                                </div>
                                <p className="shrink-0 font-heading text-base font-semibold tabular-nums text-neutral-90">
                                    {formatUGX(e.amount)}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-neutral-50">
                                <span>{formatDate(e.expenseDate)}</span>
                                <span aria-hidden="true" className="text-neutral-20">·</span>
                                <span>{e.method}</span>
                                {e.paidBy && (
                                    <>
                                        <span aria-hidden="true" className="text-neutral-20">·</span>
                                        <span>Paid by {e.paidBy}</span>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center justify-between gap-2">
                                {e.receiptUrl ? (
                                    <a href={e.receiptUrl} target="_blank" rel="noreferrer"
                                       className="inline-flex items-center gap-1 text-xs font-medium text-primary-600"
                                       onClick={(ev) => ev.stopPropagation()}>
                                        <Paperclip size={13}/> View receipt
                                    </a>
                                ) : <span/>}
                                {canRecord && (
                                    <div className="flex items-center gap-1.5"
                                         onClick={(ev) => ev.stopPropagation()}>
                                        <Button size="sm" variant="outline" iconLeft={Pencil}
                                                aria-label="Edit expense" onClick={() => openEdit(e)}>Edit</Button>
                                        <Button size="sm" variant="ghost" iconLeft={Trash2}
                                                className="text-danger-600 hover:bg-danger-50"
                                                aria-label="Delete expense" onClick={() => handleDelete(e)}/>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    actions={canRecord ? (e) => (
                        <div className="flex justify-end gap-1.5">
                            <Button size="sm" variant="outline" iconLeft={Pencil}
                                    title="Edit expense" aria-label="Edit expense"
                                    onClick={() => openEdit(e)}>Edit</Button>
                            <Button size="sm" variant="ghost" iconLeft={Trash2}
                                    className="text-danger-600 hover:bg-danger-50"
                                    title="Delete expense" aria-label="Delete expense"
                                    onClick={() => handleDelete(e)}/>
                        </div>
                    ) : undefined}
                    emptyTitle={hasFilters ? "No expenses match those filters" : "No expenses recorded yet"}
                    emptyMessage={
                        hasFilters
                            ? "Try widening the date range or clearing the search."
                            : "Record the first expense to start tracking costs."
                    }
                    emptyAction={
                        !hasFilters && canRecord && (
                            <Button iconLeft={Plus} onClick={openCreate}>Record Expense</Button>
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
                <RecordExpenseModal expense={editing} onClose={() => setShowModal(false)}/>
            )}
        </AppShell>
    )
}
