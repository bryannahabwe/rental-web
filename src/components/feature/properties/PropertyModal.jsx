import {useState} from "react"
import {useForm} from "react-hook-form"
import {useCreateProperty, useUpdateProperty} from "@/hooks/useProperties"
import {Button, Dialog, FormField, Input, Textarea, toast} from "@/components/ui"
import {nullIfEmpty} from "@/lib/format"
import {getErrorMessage} from "@/utils/errorMessage"

export default function PropertyModal({property, onClose}) {
    const isEdit = !!property
    const createProperty = useCreateProperty()
    const updateProperty = useUpdateProperty()
    const [error, setError] = useState("")

    const {register, handleSubmit, formState: {errors}} = useForm({
        defaultValues: property
            ? {name: property.name, address: property.address, description: property.description}
            : {},
    })

    const onSubmit = async (data) => {
        setError("")
        try {
            const payload = {
                name: data.name,
                address: nullIfEmpty(data.address),
                description: nullIfEmpty(data.description),
            }
            if (isEdit) {
                await updateProperty.mutateAsync({id: property.id, data: payload})
                toast.success("Property updated", payload.name)
            } else {
                await createProperty.mutateAsync(payload)
                toast.success("Property added", payload.name)
            }
            onClose()
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    const loading = createProperty.isPending || updateProperty.isPending

    return (
        <Dialog
            title={isEdit ? "Edit Property" : "Add New Property"}
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="property-form" loading={loading}>
                        {isEdit ? "Save changes" : "Add property"}
                    </Button>
                </>
            }
        >
            <form id="property-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField label="Property name" error={errors.name?.message} required>
                    <Input {...register("name", {required: "Property name is required"})}
                           invalid={!!errors.name} placeholder="e.g. Nansana Apartments"/>
                </FormField>

                <FormField label="Address" hint="Optional">
                    <Input {...register("address")} placeholder="e.g. Plot 14, Kira Road"/>
                </FormField>

                <FormField label="Description" hint="Optional">
                    <Textarea {...register("description")} rows={3} placeholder="Anything worth noting…"/>
                </FormField>

                {error && <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-600">{error}</p>}
            </form>
        </Dialog>
    )
}
