import {useMemo, useState} from "react"
import {useNavigate} from "react-router-dom"
import {ListTree, Pencil, Plus, Trash2} from "lucide-react"
import AppShell from "@/components/layout/AppShell"
import {useTenants} from "@/hooks/useTenants"
import {useCan} from "@/hooks/usePermissions"
import useDebouncedValue from "@/hooks/useDebouncedValue"
import {
    Badge, Button, Card, DataTable, Pagination, SearchInput, SegmentedFilter, Toolbar,
} from "@/components/ui"
import {formatCycleDate, formatUGX} from "@/lib/format"
import {statusTone} from "@/lib/statusTone"
import BalanceCard from "@/components/feature/tenants/BalanceCard"
import TenantModal from "@/components/ui/TenantFormModal"
import DeleteConfirm from "@/components/ui/DeleteTenantConfirm"
import TenantLedgerModal from "@/components/ui/TenantLedgerModal"

const STATUS_OPTIONS = [
    {value: "ALL", label: "All"},
    {value: "PAID", label: "Paid"},
    {value: "PARTIAL", label: "Partial"},
    {value: "UNPAID", label: "Unpaid"},
]

export default function TenantsPage() {
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [showModal, setShowModal] = useState(false)
    const [editTenant, setEditTenant] = useState(null)
    const [deleteTenant, setDeleteTenant] = useState(null)
    const [ledgerTenantId, setLedgerTenantId] = useState(null)
    const can = useCan()
    const canWrite = can("writeTenants")
    const canDelete = can("deleteRecords")
    const navigate = useNavigate()

    const query = useDebouncedValue(search)

    // Reset pagination on the input event rather than in an effect on `query`:
    // by the time the debounced query fires, page is already 0.
    const onSearchChange = (value) => {
        setSearch(value)
        setPage(0)
    }

    const {data, isLoading, error, refetch} = useTenants({
        page, size: 10, sortBy: "createdAt", sortDir: "desc",
        search: query || undefined,
    })

    const allTenants = data?.content || []
    const tenants = statusFilter === "ALL"
        ? allTenants
        : allTenants.filter((t) => t.periodStatus === statusFilter)

    const totalPages = data?.totalPages || 0

    // One definition drives the desktop table AND the mobile cards.
    const columns = useMemo(() => [
        // `whitespace-nowrap` on the narrow columns matters: without it they
        // wrap and steal width from the Balance panel, which is the widest
        // and least compressible cell in the row.
        {
            key: "name", header: "Name", card: "title",
            cellClass: "whitespace-nowrap font-medium text-neutral-90",
        },
        {key: "phone", header: "Phone", card: "meta", cellClass: "whitespace-nowrap tabular-nums"},
        {
            key: "currentUnit", header: "Unit", card: "meta",
            cellClass: "whitespace-nowrap",
            cell: (t) => (t.currentUnit ? `Unit ${t.currentUnit}` : "—"),
        },
        {
            key: "period", header: "Period", card: "meta",
            cellClass: "whitespace-nowrap",
            cell: (t) => t.currentCycleStart
                ? `${formatCycleDate(t.currentCycleStart)} – ${formatCycleDate(t.currentCycleEnd)}`
                : "—",
        },
        {
            // Desktop-only: BalanceCard already carries the money story on mobile.
            key: "monthlyRent", header: "Expected", align: "right",
            cellClass: "whitespace-nowrap tabular-nums", cell: (t) => formatUGX(t.monthlyRent),
        },
        {
            key: "balance", header: "Balance", width: "w-72",
            card: "block", cardLabel: null, // the panel is self-labelling
            cell: (t) => <BalanceCard tenant={t}/>,
        },
        {
            key: "periodStatus", header: "Status", card: "badge",
            cell: (t) => t.periodStatus
                ? <Badge tone={statusTone("period", t.periodStatus)}>{t.periodStatus}</Badge>
                : <span className="whitespace-nowrap text-sm text-neutral-30">No agreement</span>,
        },
    ], [])

    /**
     * `actions` is rendered into both trees, and the labels show in both — an
     * unlabelled icon is a guess, and these three are destructive or navigational
     * enough to be worth the width. The cost is real: the actions cell is sticky,
     * so on a narrow desktop (~1280 with the sidebar) it pins over the balance
     * column until the table is scrolled. Above ~1500 everything fits.
     *
     * There is no "View" action: the row/card is clickable and carries a
     * chevron affordance, which is exactly what that column is for.
     */
    const rowActions = (t) => (
        <>
            {t.currentUnit && (
                <Button size="sm" variant="outline" iconLeft={ListTree}
                        title="View transactions & arrears"
                        aria-label={`View ledger for ${t.name}`}
                        onClick={() => setLedgerTenantId(t.id)}>
                    Ledger
                </Button>
            )}
            {canWrite && (
                <Button size="sm" variant="outline" iconLeft={Pencil}
                        title="Edit tenant"
                        aria-label={`Edit ${t.name}`}
                        onClick={() => setEditTenant(t)}>
                    Edit
                </Button>
            )}
            {canDelete && (
                <Button size="sm" variant="ghost" iconLeft={Trash2}
                        title="Delete tenant"
                        aria-label={`Delete ${t.name}`}
                        className="text-danger-600 hover:bg-danger-50"
                        onClick={() => setDeleteTenant(t)}>
                    Delete
                </Button>
            )}
        </>
    )

    return (
        <AppShell
            title="Tenants"
            subtitle="Everyone renting across your properties"
            actions={
                canWrite && <Button iconLeft={Plus} onClick={() => setShowModal(true)}>Add Tenant</Button>
            }
            mobileAction={
                canWrite && (
                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        aria-label="Add tenant"
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-fab transition-colors hover:bg-primary-600"
                    >
                        <Plus size={26}/>
                    </button>
                )
            }
        >
            <Card bodyClass="p-0" header={
                <Toolbar>
                    <SearchInput
                        value={search}
                        onChange={onSearchChange}
                        placeholder="Search by name, phone or email…"
                        className="md:w-80"
                    />
                    <SegmentedFilter
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={STATUS_OPTIONS}
                    />
                </Toolbar>
            }>
                <DataTable
                    columns={columns}
                    rows={tenants}
                    rowKey="id"
                    loading={isLoading}
                    error={error}
                    onRetry={refetch}
                    rowClickable
                    onRowClick={(t) => navigate(`/tenants/${t.id}`)}
                    actions={rowActions}
                    emptyTitle={search ? `No tenants found for "${search}"` : "No tenants yet"}
                    emptyMessage={
                        search
                            ? "Try adjusting your search or filters."
                            : "Add your first tenant to get started."
                    }
                    emptyAction={
                        !search && canWrite && (
                            <Button iconLeft={Plus} onClick={() => setShowModal(true)}>Add Tenant</Button>
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

            {showModal && <TenantModal onClose={() => setShowModal(false)}/>}
            {editTenant && <TenantModal tenant={editTenant} onClose={() => setEditTenant(null)}/>}
            {deleteTenant && <DeleteConfirm tenant={deleteTenant} onClose={() => setDeleteTenant(null)}/>}
            {ledgerTenantId && (
                <TenantLedgerModal tenantId={ledgerTenantId} onClose={() => setLedgerTenantId(null)}/>
            )}
        </AppShell>
    )
}
