import {useMemo, useState} from "react"
import {LogOut, Pencil, Plus} from "lucide-react"
import AppShell from "@/components/layout/AppShell"
import {useAgreements} from "@/hooks/useAgreements"
import useDebouncedValue from "@/hooks/useDebouncedValue"
import {
    Badge, Button, Card, DataTable, Pagination, SearchInput, SegmentedFilter, Toolbar,
} from "@/components/ui"
import {formatDate, formatUGX} from "@/lib/format"
import {statusLabel, statusTone} from "@/lib/statusTone"
import CreateAgreementModal from "@/components/feature/agreements/CreateAgreementModal"
import EditAgreementModal from "@/components/feature/agreements/EditAgreementModal"
import MoveOutModal from "@/components/feature/agreements/MoveOutModal"
import AgreementDetailSheet from "@/components/ui/AgreementDetailSheet"

const STATUS_OPTIONS = [
    {value: "ACTIVE", label: "Active"},
    {value: "TERMINATED", label: "Terminated"},
    {value: "", label: "All"},
]

export default function AgreementsPage() {
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("ACTIVE")
    const [showCreate, setShowCreate] = useState(false)
    const [moveOutAgreement, setMoveOutAgreement] = useState(null)
    const [editAgreement, setEditAgreement] = useState(null)
    const [selectedAgreementId, setSelectedAgreementId] = useState(null)

    const query = useDebouncedValue(search)

    const onSearchChange = (value) => {
        setSearch(value)
        setPage(0)
    }

    const onStatusChange = (value) => {
        setStatusFilter(value)
        setPage(0)
    }

    const {data, isLoading, error, refetch} = useAgreements({
        page, size: 10, sortBy: "createdAt", sortDir: "desc",
        status: statusFilter || undefined,
        search: query || undefined,
    })

    const agreements = data?.content || []
    const totalPages = data?.totalPages || 0

    const columns = useMemo(() => [
        {
            key: "tenantName", header: "Tenant", card: "title",
            cellClass: "whitespace-nowrap font-medium text-neutral-90",
        },
        {
            key: "roomNumber", header: "Unit", card: "meta", cellClass: "whitespace-nowrap",
            cell: (ag) => `Unit ${ag.roomNumber}`,
        },
        {
            key: "billing", header: "Billing", card: "meta", cardLabel: null,
            cell: (ag) => (
                <div className="flex flex-wrap items-center gap-1.5">
                    <Badge size="sm" tone={ag.tenantType === "NEW" ? "info" : "warning"}>{ag.tenantType}</Badge>
                    <Badge size="sm" tone="neutral">{ag.billingModel || "ADVANCE"}</Badge>
                </div>
            ),
        },
        {
            key: "rentAmount", header: "Rent / Month", align: "right", card: "meta", cardLabel: null,
            cellClass: "whitespace-nowrap tabular-nums text-neutral-90",
            cell: (ag) => formatUGX(ag.rentAmount),
        },
        {
            key: "startDate", header: "Move-in", cellClass: "whitespace-nowrap",
            card: "meta", cardLabel: "Move-in",
            cell: (ag) => formatDate(ag.startDate),
        },
        {
            key: "moveOutDate", header: "Move-out", cellClass: "whitespace-nowrap",
            cell: (ag) => formatDate(ag.moveOutDate),
        },
        {
            key: "status", header: "Status", card: "badge",
            cell: (ag) => (
                <Badge tone={statusTone("agreement", ag.status)}>{statusLabel("agreement", ag.status)}</Badge>
            ),
        },
    ], [])

    const rowActions = (ag) => (
        <>
            <Button size="sm" variant="outline" iconLeft={Pencil}
                    title="Edit agreement" aria-label={`Edit agreement for ${ag.tenantName}`}
                    onClick={() => setEditAgreement(ag)}>
                <span className="md:hidden">Edit</span>
            </Button>
            {ag.status === "ACTIVE" && (
                <Button size="sm" variant="ghost" iconLeft={LogOut}
                        title="Record move-out" aria-label={`Record move-out for ${ag.tenantName}`}
                        className="text-danger-600 hover:bg-danger-50"
                        onClick={() => setMoveOutAgreement(ag)}>
                    <span className="md:hidden">Move-out</span>
                </Button>
            )}
        </>
    )

    return (
        <AppShell
            title="Agreements"
            subtitle="Tenancies, billing models and move-outs"
            showBack
            actions={<Button iconLeft={Plus} onClick={() => setShowCreate(true)}>New Agreement</Button>}
            mobileAction={
                <button
                    type="button"
                    onClick={() => setShowCreate(true)}
                    aria-label="New agreement"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-fab transition-colors hover:bg-primary-600"
                >
                    <Plus size={26}/>
                </button>
            }
        >
            <Card bodyClass="p-0" header={
                <Toolbar>
                    <SearchInput value={search} onChange={onSearchChange}
                                 placeholder="Search by tenant name or unit…" className="md:w-80"/>
                    <SegmentedFilter value={statusFilter} onChange={onStatusChange} options={STATUS_OPTIONS}/>
                </Toolbar>
            }>
                <DataTable
                    columns={columns}
                    rows={agreements}
                    rowKey="id"
                    loading={isLoading}
                    error={error}
                    onRetry={refetch}
                    rowClickable
                    onRowClick={(ag) => setSelectedAgreementId(ag.id)}
                    actions={rowActions}
                    emptyTitle={search ? `No agreements found for "${search}"` : "No agreements found"}
                    emptyMessage={
                        search ? "Try adjusting your search or filters." : "Create the first agreement to get started."
                    }
                    emptyAction={
                        !search && statusFilter === "ACTIVE" && (
                            <Button iconLeft={Plus} onClick={() => setShowCreate(true)}>New Agreement</Button>
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

            {showCreate && <CreateAgreementModal onClose={() => setShowCreate(false)}/>}
            {moveOutAgreement && (
                <MoveOutModal agreement={moveOutAgreement} onClose={() => setMoveOutAgreement(null)}/>
            )}
            {editAgreement && (
                <EditAgreementModal agreement={editAgreement} onClose={() => setEditAgreement(null)}/>
            )}
            {selectedAgreementId && (
                <AgreementDetailSheet
                    agreementId={selectedAgreementId}
                    onClose={() => setSelectedAgreementId(null)}
                    onMoveOut={(ag) => {
                        setMoveOutAgreement(ag)
                        setSelectedAgreementId(null)
                    }}
                    onEdit={(ag) => {
                        setEditAgreement(ag)
                        setSelectedAgreementId(null)
                    }}
                />
            )}
        </AppShell>
    )
}
