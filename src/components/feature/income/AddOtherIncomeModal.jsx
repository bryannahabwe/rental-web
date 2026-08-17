import {useState} from "react"
import {useForm} from "react-hook-form"
import {useCreateOtherIncome, useUpdateOtherIncome} from "@/hooks/useIncome"
import {useProperties} from "@/hooks/useProperties"
import {useAllTenants} from "@/hooks/useTenants"
import usePropertyStore from "@/store/propertyStore"
import {Alert, AmountInput, Button, DateField, Dialog, FormField, Input, Select, Textarea, toast} from "@/components/ui"
import {nullIfEmpty, todayStr} from "@/lib/format"
import {getErrorMessage} from "@/utils/errorMessage"

const METHOD_OPTIONS = [
    {label: "Cash", value: "CASH"},
    {label: "Mobile Money", value: "MOBILE_MONEY"},
    {label: "Bank Transfer", value: "BANK_TRANSFER"},
    {label: "Cheque", value: "CHEQUE"},
]

const CATEGORY_SUGGESTIONS = [
    "Deposit forfeiture", "Late fee", "Damage charge", "Utility reimbursement", "Other",
]

/**
 * Records (or edits) a manual non-rent income entry. `entry` is an income-ledger
 * row of source OTHER — only those are editable here (rent lives in Payments).
 */
export default function AddOtherIncomeModal({entry, onClose}) {
    const isEdit = !!entry
    const createIncome = useCreateOtherIncome()
    const updateIncome = useUpdateOtherIncome()
    const [error, setError] = useState("")

    const selectedPropertyId = usePropertyStore(s => s.selectedPropertyId)
    const {data: properties = [], isLoading: propertiesLoading} = useProperties()
    const {data: tenants = []} = useAllTenants()

    const {register, control, handleSubmit, formState: {errors}} = useForm({
        defaultValues: {
            propertyId: entry?.propertyId ?? selectedPropertyId ?? "",
            tenantId: entry?.tenantId ?? "",
            incomeDate: entry?.incomeDate ?? todayStr(),
            amount: entry?.amount ?? undefined,
            category: entry?.category ?? "",
            method: entry?.method ?? "CASH",
            reference: entry?.reference ?? "",
            notes: entry?.notes ?? "",
        },
    })

    const onSubmit = async (data) => {
        setError("")
        const payload = {
            propertyId: data.propertyId,
            tenantId: nullIfEmpty(data.tenantId),
            incomeDate: data.incomeDate,
            amount: data.amount,
            category: data.category,
            method: data.method,
            reference: nullIfEmpty(data.reference),
            notes: nullIfEmpty(data.notes),
        }
        try {
            if (isEdit) {
                await updateIncome.mutateAsync({id: entry.id, data: payload})
                toast.success("Income updated")
            } else {
                await createIncome.mutateAsync(payload)
                toast.success("Income recorded")
            }
            onClose()
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    const saving = createIncome.isPending || updateIncome.isPending

    return (
        <Dialog
            title={isEdit ? "Edit Income" : "Add Other Income"}
            onClose={onClose}
            bodyClass="px-5 pb-5 pt-0 md:px-6"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="other-income-form" loading={saving}>
                        {isEdit ? "Save changes" : "Add income"}
                    </Button>
                </>
            }
        >
            <form id="other-income-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField label="Property" error={errors.propertyId?.message} required>
                    <Select
                        {...register("propertyId", {required: "Please select a property"})}
                        invalid={!!errors.propertyId}
                        placeholder={propertiesLoading ? "Loading…" : "Select property"}
                        options={properties.map((p) => ({label: p.name, value: p.id}))}
                    />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Amount (UGX)" error={errors.amount?.message} required>
                        <AmountInput
                            name="amount"
                            control={control}
                            rules={{required: "Amount is required", min: {value: 1, message: "Must be greater than 0"}}}
                            invalid={!!errors.amount} placeholder="100,000"
                        />
                    </FormField>

                    <FormField label="Date" error={errors.incomeDate?.message} required>
                        <DateField
                            {...register("incomeDate", {required: "Date is required"})}
                            invalid={!!errors.incomeDate}
                        />
                    </FormField>
                </div>

                <FormField label="Category" error={errors.category?.message} required
                           hint="e.g. Deposit forfeiture, Late fee">
                    <Input
                        {...register("category", {required: "Category is required"})}
                        invalid={!!errors.category}
                        list="income-categories"
                        placeholder="Deposit forfeiture"
                    />
                    <datalist id="income-categories">
                        {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c}/>)}
                    </datalist>
                </FormField>

                <FormField label="Received by">
                    <Select {...register("method")} options={METHOD_OPTIONS}/>
                </FormField>

                <FormField label="Tenant" hint="Optional — link this income to a tenant">
                    <Select
                        {...register("tenantId")}
                        placeholder="No specific tenant"
                        options={tenants.map((t) => ({label: t.name, value: t.id}))}
                    />
                </FormField>

                <FormField label="Reference" hint="Optional">
                    <Input {...register("reference")} placeholder="Receipt or note no."/>
                </FormField>

                <FormField label="Notes" hint="Optional">
                    <Textarea {...register("notes")} rows={2} placeholder="What was this for…"/>
                </FormField>

                {error && <Alert>{error}</Alert>}
            </form>
        </Dialog>
    )
}
