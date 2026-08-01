import {useState} from "react"
import {useForm} from "react-hook-form"
import {useCreateUnit, useUpdateUnit} from "@/hooks/useUnits"
import {useProperties} from "@/hooks/useProperties"
import usePropertyStore from "@/store/propertyStore"
import {Button, Dialog, FormField, Input, Textarea, Select, Toggle, toast} from "@/components/ui"
import {nullIfEmpty} from "@/lib/format"
import {getErrorMessage} from "@/utils/errorMessage"

/** Create/edit a unit. Extracted from UnitsPage, which declared it inline. */
export default function UnitModal({unit, onClose}) {
    const isEdit = !!unit
    const createUnit = useCreateUnit()
    const updateUnit = useUpdateUnit()
    const selectedPropertyId = usePropertyStore((s) => s.selectedPropertyId)
    const {data: properties = []} = useProperties()
    const [error, setError] = useState("")
    const [isAvailable, setIsAvailable] = useState(unit ? unit.isAvailable : true)

    // Which property this unit belongs to. On edit it's fixed. On create it's
    // the active property, unless "All properties" is selected — then the
    // landlord must pick one here.
    const needsPropertyChoice = !isEdit && !selectedPropertyId

    const {register, handleSubmit, formState: {errors}} = useForm({
        defaultValues: unit
            ? {roomNumber: unit.roomNumber, description: unit.description, rentAmount: unit.rentAmount}
            : {},
    })

    const onSubmit = async (data) => {
        setError("")
        try {
            const propertyId = isEdit ? unit.propertyId : selectedPropertyId || data.propertyId
            const payload = {
                propertyId,
                roomNumber: data.roomNumber,
                description: nullIfEmpty(data.description),
                rentAmount: parseFloat(data.rentAmount),
                isAvailable,
            }
            if (isEdit) {
                await updateUnit.mutateAsync({id: unit.id, data: payload})
                toast.success("Unit updated", `Unit ${payload.roomNumber} saved.`)
            } else {
                await createUnit.mutateAsync(payload)
                toast.success("Unit added", `Unit ${payload.roomNumber} created.`)
            }
            onClose()
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    const loading = createUnit.isPending || updateUnit.isPending

    return (
        <Dialog
            title={isEdit ? "Edit Unit" : "Add New Unit"}
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="unit-form" loading={loading}>
                        {isEdit ? "Save changes" : "Add unit"}
                    </Button>
                </>
            }
        >
            <form id="unit-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                {needsPropertyChoice && (
                    <FormField label="Property" error={errors.propertyId?.message} required>
                        <Select
                            {...register("propertyId", {required: "Please choose a property"})}
                            defaultValue=""
                            invalid={!!errors.propertyId}
                            placeholder="Select a property…"
                            options={properties.map((p) => ({label: p.name, value: p.id}))}
                        />
                    </FormField>
                )}

                <FormField label="Room number" error={errors.roomNumber?.message} required>
                    <Input
                        {...register("roomNumber", {required: "Room number is required"})}
                        invalid={!!errors.roomNumber}
                        placeholder="A1"
                    />
                </FormField>

                <FormField label="Monthly rent (UGX)" error={errors.rentAmount?.message} required>
                    <Input
                        {...register("rentAmount", {
                            required: "Rent amount is required",
                            min: {value: 1, message: "Must be greater than 0"},
                        })}
                        type="number"
                        inputMode="numeric"
                        invalid={!!errors.rentAmount}
                        placeholder="180000"
                    />
                </FormField>

                <FormField label="Description" hint="Optional">
                    <Textarea {...register("description")} rows={3}
                              placeholder="Single room with bathroom…"/>
                </FormField>

                <div
                    className="flex items-center justify-between gap-4 rounded-lg border border-neutral-5 bg-neutral-0 px-4 py-3.5">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-70">Available for rent</p>
                        <p className="mt-0.5 text-xs text-neutral-40">Turn off if the unit is already occupied</p>
                    </div>
                    <Toggle checked={isAvailable} onChange={setIsAvailable} ariaLabel="Available for rent"/>
                </div>

                {error && (
                    <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-600">{error}</p>
                )}
            </form>
        </Dialog>
    )
}
