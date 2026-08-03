import {Pencil, Trash2} from "lucide-react"
import {useUnit} from "@/hooks/useUnits"
import Dialog from "./Dialog"
import Button from "./Button"
import Badge from "./Badge"
import {DetailList, DetailRow} from "./DetailRow"
import {EmptyState} from "./States"
import {LoadingPanel} from "./Loader"
import {formatUGX} from "@/lib/format"
import {statusLabel, statusTone} from "@/lib/statusTone"

export default function UnitDetailSheet({
                                            unitId,
                                            canEdit = true,
                                            canDelete = true,
                                            onClose,
                                            onEdit,
                                            onDelete,
                                        }) {
    const {data: unit, isLoading} = useUnit(unitId)

    const status = unit?.isAvailable ? "AVAILABLE" : "OCCUPIED"

    return (
        <Dialog title="Unit Details" onClose={onClose}>
            {isLoading ? (
                <LoadingPanel/>
            ) : !unit ? (
                <EmptyState title="Unit not found" message="It may have been removed."/>
            ) : (
                <>
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p className="font-heading text-3xl font-medium text-neutral-90">{unit.roomNumber}</p>
                            <p className="mt-0.5 text-sm font-medium tabular-nums text-primary-600">
                                {formatUGX(unit.rentAmount)} / month
                            </p>
                        </div>
                        <Badge tone={statusTone("unit", status)}>{statusLabel("unit", status)}</Badge>
                    </div>

                    <div className="mb-5 rounded-lg bg-neutral-0 p-4">
                        <p className="mb-3.5 text-2xs font-medium uppercase tracking-wide text-neutral-40">
                            Details
                        </p>
                        <DetailList columns={2}>
                            <DetailRow label="Room Number" value={unit.roomNumber}/>
                            <DetailRow label="Monthly Rent" value={formatUGX(unit.rentAmount)} numeric/>
                            <DetailRow
                                label="Status"
                                value={statusLabel("unit", status)}
                                tone={unit.isAvailable ? "muted" : "success"}
                            />
                            <DetailRow label="Description" value={unit.description || "—"}/>
                        </DetailList>
                    </div>

                    <div className="flex gap-2.5">
                        {canEdit && (
                            <Button
                                className="flex-1"
                                variant="outline"
                                iconLeft={Pencil}
                                onClick={() => {
                                    onEdit(unit)
                                    onClose()
                                }}
                            >
                                Edit
                            </Button>
                        )}
                        {canDelete && (
                            <Button
                                className="flex-1 text-danger-600 hover:bg-danger-50"
                                variant="outline"
                                iconLeft={Trash2}
                                onClick={() => {
                                    onDelete(unit)
                                    onClose()
                                }}
                            >
                                Delete
                            </Button>
                        )}
                    </div>
                </>
            )}
        </Dialog>
    )
}
