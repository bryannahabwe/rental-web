import {useState} from "react"
import {useForm} from "react-hook-form"
import {useCreateTenant, useUpdateTenant} from "@/hooks/useTenants"
import {useProperties} from "@/hooks/useProperties"
import usePropertyStore from "@/store/propertyStore"
import Dialog from "./Dialog"
import Button from "./Button"
import FormField from "./FormField"
import Input from "./Input"
import Textarea from "./Textarea"
import Select from "./Select"
import Alert from "./Alert"
import {toast} from "./toastStore"
import {nullIfEmpty} from "@/lib/format"
import {getErrorMessage} from "@/utils/errorMessage"

/** Create/edit tenant modal. Pass a `tenant` to edit; omit it to create. */
export default function TenantFormModal({tenant, onClose}) {
    const isEdit = !!tenant
    const createTenant = useCreateTenant()
    const updateTenant = useUpdateTenant()
    const selectedPropertyId = usePropertyStore((s) => s.selectedPropertyId)
    const {data: properties = []} = useProperties()
    const [error, setError] = useState("")

    // Property the tenant belongs to — fixed on edit; the active property on
    // create, or a required choice when "All properties" is selected.
    const needsPropertyChoice = !isEdit && !selectedPropertyId

    const {register, handleSubmit, formState: {errors}} = useForm({
        defaultValues: tenant || {},
    })

    const onSubmit = async (data) => {
        setError("")
        const fields = {
            name: data.name,
            phone: data.phone,
            email: nullIfEmpty(data.email),
            address: nullIfEmpty(data.address),
        }
        try {
            if (isEdit) {
                await updateTenant.mutateAsync({
                    id: tenant.id,
                    data: {propertyId: tenant.propertyId, ...fields},
                })
                toast.success("Tenant updated", fields.name)
            } else {
                await createTenant.mutateAsync({
                    propertyId: selectedPropertyId || data.propertyId,
                    ...fields,
                })
                toast.success("Tenant added", fields.name)
            }
            onClose()
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    const loading = createTenant.isPending || updateTenant.isPending

    return (
        <Dialog
            title={isEdit ? "Edit Tenant" : "Add New Tenant"}
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="tenant-form" loading={loading}>
                        {isEdit ? "Save changes" : "Add tenant"}
                    </Button>
                </>
            }
        >
            <form id="tenant-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

                <FormField label="Full name" error={errors.name?.message} required>
                    <Input {...register("name", {required: "Name is required"})}
                           invalid={!!errors.name} placeholder="Jane Namukasa"/>
                </FormField>

                <FormField label="Phone number" error={errors.phone?.message} required>
                    <Input {...register("phone", {required: "Phone is required"})}
                           type="tel" invalid={!!errors.phone} placeholder="0771234567"/>
                </FormField>

                <FormField label="Email" hint="Optional">
                    <Input {...register("email")} type="email" placeholder="jane@example.com"/>
                </FormField>

                <FormField label="Address" hint="Optional">
                    <Textarea {...register("address")} rows={2} placeholder="Home village or next-of-kin address"/>
                </FormField>

                {error && <Alert>{error}</Alert>}
            </form>
        </Dialog>
    )
}
