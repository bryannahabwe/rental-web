import {useRef, useState} from "react"
import {useForm} from "react-hook-form"
import {Paperclip, X} from "lucide-react"
import {useCreateExpense, useUpdateExpense} from "@/hooks/useExpenses"
import {useProperties} from "@/hooks/useProperties"
import {useAllUnits} from "@/hooks/useUnits"
import {useCategories} from "@/hooks/useCategories"
import {usePaymentMethods} from "@/hooks/usePaymentMethods"
import {uploadsService} from "@/services/uploadsService"
import usePropertyStore from "@/store/propertyStore"
import {Alert, AmountInput, Button, DateField, Dialog, FormField, Input, Select, Textarea, toast} from "@/components/ui"
import {nullIfEmpty, todayStr} from "@/lib/format"
import {getErrorMessage} from "@/utils/errorMessage"

export default function RecordExpenseModal({expense, onClose}) {
    const isEdit = !!expense
    const createExpense = useCreateExpense()
    const updateExpense = useUpdateExpense()
    const [error, setError] = useState("")
    const [uploading, setUploading] = useState(false)
    const fileRef = useRef(null)

    const selectedPropertyId = usePropertyStore(s => s.selectedPropertyId)
    const {data: properties = [], isLoading: propertiesLoading} = useProperties()
    const {data: allUnits = []} = useAllUnits()
    const {data: categories = []} = useCategories()
    const {data: methods = []} = usePaymentMethods()

    // Active options, but keep the currently-selected value visible when editing
    // even if it was since retired.
    const categoryOptions = categories.filter((c) => c.active || c.id === expense?.categoryId)
    const methodOptions = methods.filter((m) => m.active || m.name === expense?.method)

    const {register, control, handleSubmit, watch, setValue, formState: {errors}} = useForm({
        defaultValues: {
            propertyId: expense?.propertyId ?? selectedPropertyId ?? "",
            unitId: expense?.unitId ?? "",
            categoryId: expense?.categoryId ?? "",
            expenseDate: expense?.expenseDate ?? todayStr(),
            amount: expense?.amount ?? undefined,
            method: expense?.method ?? "",
            paidBy: expense?.paidBy ?? "",
            receiptUrl: expense?.receiptUrl ?? "",
            notes: expense?.notes ?? "",
        },
    })

    const formPropertyId = watch("propertyId")
    const receiptUrl = watch("receiptUrl")
    const unitOptions = allUnits.filter((u) => u.propertyId === formPropertyId)

    const handleReceiptChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith("image/")) {
            toast.error("Please choose an image (JPEG, PNG or WebP)")
            return
        }
        if (file.size > 20 * 1024 * 1024) {
            toast.error("Image is too large", "Maximum size is 20 MB.")
            return
        }
        setUploading(true)
        try {
            const res = await uploadsService.upload(file, "receipts")
            setValue("receiptUrl", res.data.url, {shouldDirty: true})
            toast.success("Receipt attached")
        } catch (err) {
            toast.error("Upload failed", getErrorMessage(err, "Please try again."))
        } finally {
            setUploading(false)
            if (fileRef.current) fileRef.current.value = ""
        }
    }

    const onSubmit = async (data) => {
        setError("")
        const payload = {
            propertyId: data.propertyId,
            unitId: nullIfEmpty(data.unitId),
            categoryId: data.categoryId,
            expenseDate: data.expenseDate,
            amount: data.amount,
            method: data.method,
            paidBy: nullIfEmpty(data.paidBy),
            receiptUrl: nullIfEmpty(data.receiptUrl),
            notes: nullIfEmpty(data.notes),
        }
        try {
            if (isEdit) {
                await updateExpense.mutateAsync({id: expense.id, data: payload})
                toast.success("Expense updated")
            } else {
                await createExpense.mutateAsync(payload)
                toast.success("Expense recorded")
            }
            onClose()
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    const saving = createExpense.isPending || updateExpense.isPending

    return (
        <Dialog
            title={isEdit ? "Edit Expense" : "Record Expense"}
            onClose={onClose}
            bodyClass="px-5 pb-5 pt-0 md:px-6"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="expense-form" loading={saving}>
                        {isEdit ? "Save changes" : "Record expense"}
                    </Button>
                </>
            }
        >
            <form id="expense-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField label="Property" error={errors.propertyId?.message} required>
                    <Select
                        {...register("propertyId", {required: "Please select a property"})}
                        invalid={!!errors.propertyId}
                        placeholder={propertiesLoading ? "Loading…" : "Select property"}
                        options={properties.map((p) => ({label: p.name, value: p.id}))}
                    />
                </FormField>

                <FormField label="Category" error={errors.categoryId?.message} required
                           hint="Manage the list in Settings → Expense Categories">
                    <Select
                        {...register("categoryId", {required: "Please select a category"})}
                        invalid={!!errors.categoryId}
                        placeholder="Select category"
                        options={categoryOptions.map((c) => ({label: c.name, value: c.id}))}
                    />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Amount (UGX)" error={errors.amount?.message} required>
                        <AmountInput
                            name="amount"
                            control={control}
                            rules={{required: "Amount is required", min: {value: 1, message: "Must be greater than 0"}}}
                            invalid={!!errors.amount} placeholder="50,000"
                        />
                    </FormField>

                    <FormField label="Date" error={errors.expenseDate?.message} required>
                        <DateField
                            {...register("expenseDate", {required: "Date is required"})}
                            invalid={!!errors.expenseDate}
                        />
                    </FormField>
                </div>

                <FormField label="Payment method" error={errors.method?.message} required
                           hint="Manage the list in Settings → Payment Methods">
                    <Select
                        {...register("method", {required: "Please select a payment method"})}
                        invalid={!!errors.method}
                        placeholder="Select method"
                        options={methodOptions.map((m) => ({label: m.name, value: m.name}))}
                    />
                </FormField>

                <FormField label="Paid by" hint="Optional — who made the payment">
                    <Input {...register("paidBy")} placeholder="e.g. John, or petty cash"/>
                </FormField>

                <FormField label="Unit" hint="Optional — leave blank for a property-wide cost">
                    <Select
                        {...register("unitId")}
                        placeholder="No specific unit"
                        options={unitOptions.map((u) => ({label: `Unit ${u.roomNumber}`, value: u.id}))}
                    />
                </FormField>

                <FormField label="Receipt" hint="Optional — a photo of the receipt (JPEG, PNG or WebP)">
                    <input type="hidden" {...register("receiptUrl")}/>
                    {receiptUrl ? (
                        <div className="flex items-center gap-3">
                            <a href={receiptUrl} target="_blank" rel="noreferrer"
                               className="shrink-0" title="Open receipt">
                                <img src={receiptUrl} alt="Receipt"
                                     className="h-16 w-16 rounded-lg border border-neutral-10 object-cover"/>
                            </a>
                            <Button type="button" size="sm" variant="ghost" iconLeft={X}
                                    className="text-danger-600 hover:bg-danger-50"
                                    onClick={() => setValue("receiptUrl", "", {shouldDirty: true})}>
                                Remove
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <input ref={fileRef} type="file" accept="image/*"
                                   className="hidden" onChange={handleReceiptChange}/>
                            <Button type="button" variant="outline" size="sm" iconLeft={Paperclip}
                                    loading={uploading} onClick={() => fileRef.current?.click()}>
                                {uploading ? "Uploading…" : "Attach receipt"}
                            </Button>
                        </div>
                    )}
                </FormField>

                <FormField label="Notes" hint="Optional">
                    <Textarea {...register("notes")} rows={2} placeholder="What was this for…"/>
                </FormField>

                {error && <Alert>{error}</Alert>}
            </form>
        </Dialog>
    )
}
