import {useState} from "react"
import {useForm} from "react-hook-form"
import {useUpdatePayment} from "@/hooks/usePayments"
import {useAgreementCycles} from "@/hooks/useAgreements"
import {Alert, AmountInput, Button, DateField, Dialog, FormField, Input, Textarea, toast} from "@/components/ui"
import CyclePicker from "./CyclePicker"
import {formatUGX, nullIfEmpty} from "@/lib/format"
import {getErrorMessage} from "@/utils/errorMessage"

/**
 * Corrects a payment already posted — a mis-typed amount, the wrong date, the
 * wrong billing period.
 *
 * <p>Deliberately not a mode of RecordPaymentModal: that component carries a
 * tenant picker, a receipt-number draw and a manual-receipt tab, none of which
 * an edit wants. The tenant is fixed here because the API refuses to move a
 * payment between agreements — a payment on the wrong tenant is deleted and
 * recorded again, which keeps both properties' activity feeds honest.
 */
export default function EditPaymentModal({payment, onClose}) {
    const updatePayment = useUpdatePayment()
    const [error, setError] = useState("")

    const {data: cycles = [], isLoading: cyclesLoading} = useAgreementCycles(payment.agreementId)

    const [pickedCycle, setPickedCycle] = useState({
        start: payment.periodStartDate,
        end: payment.periodEndDate,
    })

    const {register, control, handleSubmit, watch, formState: {errors}} = useForm({
        defaultValues: {
            paymentDate: payment.paymentDate,
            amount: payment.amount,
            reference: payment.reference ?? "",
            notes: payment.notes ?? "",
        },
    })

    const amountNum = Number(watch("amount")) || 0
    const expected = Number(payment.expectedAmount) || 0
    const overpayment = amountNum > expected ? amountNum - expected : 0

    const onSubmit = async (data) => {
        setError("")
        if (!pickedCycle) {
            setError("Please select a payment period")
            return
        }
        try {
            await updatePayment.mutateAsync({
                id: payment.id,
                data: {
                    agreementId: payment.agreementId,
                    paymentDate: data.paymentDate,
                    amount: data.amount,
                    method: payment.method,
                    periodStartDate: pickedCycle.start,
                    periodEndDate: pickedCycle.end,
                    reference: nullIfEmpty(data.reference),
                    notes: nullIfEmpty(data.notes),
                },
            })
            toast.success("Payment updated", "Cycle balances have been recalculated.")
            onClose()
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    return (
        <Dialog
            title="Edit Payment"
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="edit-payment" loading={updatePayment.isPending}>
                        Save changes
                    </Button>
                </>
            }
        >
            <form id="edit-payment" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="rounded-lg bg-neutral-0 px-3.5 py-2.5 text-sm text-neutral-50">
                    <strong className="text-neutral-90">{payment.tenantName}</strong>
                    {" — Unit "}{payment.roomNumber}
                    <p className="mt-0.5 text-2xs text-neutral-40">
                        To move this payment to a different tenant, delete it and record it again.
                    </p>
                </div>

                <CyclePicker
                    cycles={cycles}
                    isLoading={cyclesLoading}
                    selected={pickedCycle}
                    onSelect={setPickedCycle}
                />

                <div>
                    <FormField label="Amount (UGX)" error={errors.amount?.message} required
                               hint={expected > 0 ? `Expected ${formatUGX(expected)}` : undefined}>
                        <AmountInput
                            name="amount"
                            control={control}
                            rules={{
                                required: "Amount is required",
                                min: {value: 1, message: "Must be greater than 0"},
                            }}
                            invalid={!!errors.amount}
                        />
                    </FormField>

                    {overpayment > 0 && (
                        <div className="mt-2 rounded-lg border-l-[3px] border-warning-500 bg-warning-50 px-3.5 py-2.5 text-sm text-warning-700">
                            Overpayment of <span className="tabular-nums">{formatUGX(overpayment)}</span> — will roll
                            over to later cycles
                        </div>
                    )}
                </div>

                <FormField label="Payment date" error={errors.paymentDate?.message} required>
                    <DateField
                        {...register("paymentDate", {required: "Payment date is required"})}
                        invalid={!!errors.paymentDate}
                    />
                </FormField>

                <FormField label="Reference" hint="Optional">
                    <Input {...register("reference")} placeholder="RCP-001"/>
                </FormField>

                <FormField label="Notes" hint="Optional">
                    <Textarea {...register("notes")} rows={2}/>
                </FormField>

                <p className="text-2xs text-neutral-40">
                    Saving recalculates this tenant&rsquo;s cycle balances and any credit carried forward. A receipt
                    already issued for this payment is not reprinted.
                </p>

                {error && <Alert>{error}</Alert>}
            </form>
        </Dialog>
    )
}
