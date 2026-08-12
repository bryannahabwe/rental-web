import {useEffect, useState} from "react"
import {useForm} from "react-hook-form"
import {LogOut} from "lucide-react"
import {useMoveOut} from "@/hooks/useAgreements"
import {useTenantLedger} from "@/hooks/useTenants"
import {Alert, AmountInput, Button, DateField, Dialog, FormField, toast} from "@/components/ui"
import {formatUGX} from "@/lib/format"
import {getErrorMessage} from "@/utils/errorMessage"

export default function MoveOutModal({agreement, onClose}) {
    const moveOut = useMoveOut()
    const [error, setError] = useState("")

    const deposit = Number(agreement.depositAmount) || 0
    const hasDeposit = deposit > 0

    // Current outstanding balance drives how much of the deposit can be applied.
    const {data: ledger, isLoading: ledgerLoading} =
        useTenantLedger(hasDeposit ? agreement.tenantId : undefined)
    const outstanding = Number(ledger?.outstanding) || 0
    const maxApplicable = Math.min(deposit, outstanding)
    // With no unpaid rent there's nothing to apply the deposit to — the whole
    // deposit is simply refunded or kept, so the "use toward rent" field is hidden.
    const hasOutstanding = outstanding > 0

    const {register, control, handleSubmit, watch, setValue, formState: {errors}} =
        useForm({defaultValues: {applied: 0, forfeited: 0}})

    // Once the balance is known, apply what we can against it and leave the
    // rest to refund — the user can still edit either field.
    useEffect(() => {
        if (hasDeposit && ledger) {
            setValue("applied", maxApplicable)
            setValue("forfeited", 0)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasDeposit, ledger])

    const applied = Number(watch("applied")) || 0
    const forfeited = Number(watch("forfeited")) || 0
    // Refunded is derived so the three parts always sum to the held deposit.
    const refunded = Math.max(0, deposit - applied - forfeited)
    // What the tenant still owes after the deposit is used toward rent.
    const balanceAfter = Math.max(0, outstanding - applied)

    const overApplied = applied > maxApplicable
    const overAllocated = applied + forfeited > deposit
    const settlementInvalid = hasDeposit && (overApplied || overAllocated)

    const onSubmit = async (data) => {
        setError("")
        if (settlementInvalid) return
        try {
            const payload = {moveOutDate: data.moveOutDate}
            if (hasDeposit) {
                payload.depositApplied = applied
                payload.depositRefunded = refunded
                payload.depositForfeited = forfeited
            }
            await moveOut.mutateAsync({id: agreement.id, data: payload})
            toast.success("Move-out recorded", `${agreement.tenantName} — Unit ${agreement.roomNumber}`)
            onClose()
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    return (
        <Dialog
            onClose={onClose}
            size="sm"
            hideHeader
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="move-out" variant="danger"
                            loading={moveOut.isPending}
                            disabled={settlementInvalid || (hasDeposit && ledgerLoading)}>
                        Confirm move-out
                    </Button>
                </>
            }
        >
            <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger-50 text-danger-600">
                    <LogOut size={18}/>
                </span>
                <h2 className="font-heading text-lg font-medium text-neutral-90">Record Move-Out</h2>
            </div>

            <p className="mb-5 text-sm leading-relaxed text-neutral-50">
                Move-out for <strong className="font-medium text-neutral-80">{agreement.tenantName}</strong> in
                unit <strong className="font-medium text-neutral-80">{agreement.roomNumber}</strong>.
                This will terminate the agreement.
            </p>

            <form id="move-out" onSubmit={handleSubmit(onSubmit)}>
                <FormField label="Move-out date" error={errors.moveOutDate?.message} required>
                    <DateField
                        {...register("moveOutDate", {required: "Move-out date is required"})}
                        invalid={!!errors.moveOutDate}
                    />
                </FormField>

                {hasDeposit && (
                    <div className="mt-5 rounded-lg border border-neutral-5 bg-neutral-0 p-4">
                        <h3 className="mb-1 text-sm font-medium text-neutral-90">Security deposit settlement</h3>

                        {ledgerLoading ? (
                            <p className="text-xs text-neutral-50">Loading balance…</p>
                        ) : (
                            <>
                                <div className="mb-3 flex justify-between text-xs text-neutral-50">
                                    <span>Held: <strong className="text-neutral-80">{formatUGX(deposit)}</strong></span>
                                    {hasOutstanding ? (
                                        <span>Unpaid rent: <strong className="text-neutral-80">{formatUGX(outstanding)}</strong></span>
                                    ) : (
                                        <span>No unpaid rent</span>
                                    )}
                                </div>

                                {hasOutstanding && (
                                    <FormField
                                        label="Use toward unpaid rent"
                                        hint={`Clears rent the tenant owes — up to ${formatUGX(maxApplicable)}`}
                                        error={overApplied ? `Cannot exceed the ${formatUGX(maxApplicable)} owed` : undefined}
                                    >
                                        <AmountInput name="applied" control={control} invalid={overApplied}/>
                                    </FormField>
                                )}

                                <div className={hasOutstanding ? "mt-3" : ""}>
                                    <FormField
                                        label="Keep (damages / penalties)"
                                        hint="Landlord retains this — does not clear rent"
                                    >
                                        <AmountInput name="forfeited" control={control} invalid={overAllocated}/>
                                    </FormField>
                                </div>

                                <div className="mt-3 flex items-center justify-between rounded-md border border-neutral-5 bg-white px-3 py-2 text-sm">
                                    <span className="text-neutral-50">Refund to tenant</span>
                                    <strong className="text-neutral-80">{formatUGX(refunded)}</strong>
                                </div>

                                {overAllocated && (
                                    <p className="mt-2 text-xs text-danger-600">
                                        Used + kept cannot exceed the {formatUGX(deposit)} deposit.
                                    </p>
                                )}

                                {hasOutstanding && (
                                    <div className="mt-3 flex items-center justify-between border-t border-neutral-5 pt-3 text-sm">
                                        <span className="text-neutral-50">Rent balance after</span>
                                        <span className="font-medium">
                                            {balanceAfter === 0 ? (
                                                <span className="text-success-600">{formatUGX(0)} · cleared</span>
                                            ) : (
                                                <span className="text-neutral-90">{formatUGX(balanceAfter)}</span>
                                            )}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {error && <Alert className="mt-4">{error}</Alert>}
            </form>
        </Dialog>
    )
}
