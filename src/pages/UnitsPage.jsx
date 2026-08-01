import {useMemo, useState} from "react"
import {Pencil, Plus, Trash2} from "lucide-react"
import AppShell from "@/components/layout/AppShell"
import {useDeleteUnit, useUnits} from "@/hooks/useUnits"
import useAuthStore from "@/store/authStore"
import useDebouncedValue from "@/hooks/useDebouncedValue"
import {
    Badge, Button, Card, DataTable, Pagination, SearchInput, SegmentedFilter, Toolbar, toast, useConfirm,
} from "@/components/ui"
import {formatUGX} from "@/lib/format"
import {statusTone, statusLabel} from "@/lib/statusTone"
import UnitModal from "@/components/feature/units/UnitModal"
import UnitDetailSheet from "@/components/ui/UnitDetailSheet"
import {getErrorMessage} from "@/utils/errorMessage"

const AVAILABILITY_OPTIONS = [
    {value: "ALL", label: "All"},
    {value: "AVAILABLE", label: "Available"},
    {value: "OCCUPIED", label: "Occupied"},
]

// The API takes a tri-state boolean; the filter chips speak in status words.
const toApiFlag = (value) => (value === "ALL" ? null : value === "AVAILABLE")

export default function UnitsPage() {
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState("")
    const [availability, setAvailability] = useState("ALL")
    const [showModal, setShowModal] = useState(false)
    const [editUnit, setEditUnit] = useState(null)
    const [selectedUnitId, setSelectedUnitId] = useState(null)
    const canDelete = useAuthStore((s) => s.role === "SUPER_ADMIN")
    const confirm = useConfirm()
    const deleteUnit = useDeleteUnit()

    const query = useDebouncedValue(search)

    const onSearchChange = (value) => {
        setSearch(value)
        setPage(0)
    }

    const onAvailabilityChange = (value) => {
        setAvailability(value)
        setPage(0)
    }

    const {data, isLoading, error, refetch} = useUnits({
        page, size: 10, sortBy: "createdAt", sortDir: "desc",
        search: query || undefined,
        isAvailable: toApiFlag(availability),
    })

    const units = data?.content || []
    const totalPages = data?.totalPages || 0

    const handleDelete = async (unit) => {
        if (!(await confirm.askDelete("unit", unit.roomNumber))) return
        try {
            await deleteUnit.mutateAsync(unit.id)
            toast.success("Unit deleted", `Unit ${unit.roomNumber} removed.`)
        } catch (err) {
            toast.error("Couldn't delete unit", getErrorMessage(err, "Please try again."))
        }
    }

    const columns = useMemo(() => [
        {
            key: "roomNumber", header: "Room", card: "title",
            cellClass: "whitespace-nowrap font-semibold text-neutral-90",
        },
        {
            key: "rentAmount", header: "Rent / Month", align: "right",
            cellClass: "whitespace-nowrap font-medium tabular-nums text-neutral-90",
            card: "meta",
            cell: (u) => formatUGX(u.rentAmount),
            cardLabel: null,
        },
        {
            key: "description", header: "Description", card: "meta", cardLabel: null,
            cell: (u) => u.description || "—",
        },
        {
            key: "isAvailable", header: "Status", card: "badge",
            cell: (u) => {
                const status = u.isAvailable ? "AVAILABLE" : "OCCUPIED"
                return <Badge tone={statusTone("unit", status)}>{statusLabel("unit", status)}</Badge>
            },
        },
    ], [])

    const rowActions = (u) => (
        <>
            <Button size="sm" variant="outline" iconLeft={Pencil}
                    title="Edit unit" aria-label={`Edit unit ${u.roomNumber}`}
                    onClick={() => setEditUnit(u)}>
                <span className="md:hidden">Edit</span>
            </Button>
            {canDelete && (
                <Button size="sm" variant="ghost" iconLeft={Trash2}
                        title="Delete unit" aria-label={`Delete unit ${u.roomNumber}`}
                        className="text-danger-600 hover:bg-danger-50"
                        onClick={() => handleDelete(u)}>
                    <span className="md:hidden">Delete</span>
                </Button>
            )}
        </>
    )

    return (
        <AppShell
            title="Units"
            subtitle="Every rentable space across your properties"
            showBack
            actions={<Button iconLeft={Plus} onClick={() => setShowModal(true)}>Add Unit</Button>}
            mobileAction={
                <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    aria-label="Add unit"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-fab transition-colors hover:bg-primary-600"
                >
                    <Plus size={26}/>
                </button>
            }
        >
            <Card bodyClass="p-0" header={
                <Toolbar>
                    <SearchInput value={search} onChange={onSearchChange}
                                 placeholder="Search by room number…" className="md:w-80"/>
                    <SegmentedFilter value={availability} onChange={onAvailabilityChange}
                                     options={AVAILABILITY_OPTIONS}/>
                </Toolbar>
            }>
                <DataTable
                    columns={columns}
                    rows={units}
                    rowKey="id"
                    loading={isLoading}
                    error={error}
                    onRetry={refetch}
                    rowClickable
                    onRowClick={(u) => setSelectedUnitId(u.id)}
                    actions={rowActions}
                    emptyTitle={search ? `No units found for "${search}"` : "No units yet"}
                    emptyMessage={
                        search ? "Try adjusting your search or filters." : "Add your first unit to get started."
                    }
                    emptyAction={
                        !search && <Button iconLeft={Plus} onClick={() => setShowModal(true)}>Add Unit</Button>
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

            {showModal && <UnitModal onClose={() => setShowModal(false)}/>}
            {editUnit && <UnitModal unit={editUnit} onClose={() => setEditUnit(null)}/>}
            {selectedUnitId && (
                <UnitDetailSheet
                    unitId={selectedUnitId}
                    canDelete={canDelete}
                    onClose={() => setSelectedUnitId(null)}
                    onEdit={(unit) => setEditUnit(unit)}
                    onDelete={(unit) => handleDelete(unit)}
                />
            )}
        </AppShell>
    )
}
