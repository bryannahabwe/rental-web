import {useState} from "react"
import {useForm} from "react-hook-form"
import {useUpdateAgreement} from "@/hooks/useAgreements"
import {AmountInput, Button, DateField, Dialog, FormField, toast} from "@/components/ui"
import {nullIfEmpty} from "@/lib/format"
import {BillingDayHint, BillingModelField, OpeningBalanceField} from "./fields"
import {getErrorMessage} from "@/utils/errorMessage"

export default function EditAgreementModal({agreement, onClose}) {
    const updateAgreement = useUpdateAgreement()
    const [billingModel, setBillingModel] = useState(agreement.billingModel || "ADVANCE")
    const [balanceSign, setBalanceSign] = useState(agreement.openingBalance < 0 ? "negative" : "positive")
    const [error, setError] = useState("")

    const {register, control, handleSubmit, watch} = useForm({
        defaultValues: {
            rentAmount: agreement.rentAmount,
            depositAmount: agreement.depositAmount || "",
            startDate: agreement.startDate || "",
            openingBalance: agreement.openingBalance ? Math.abs(agreement.openingBalance) : "",
        },
    })

    const watchedStartDate = watch("startDate")

    const onSubmit = async (data) => {
        setError("")
        try {
            const rawBalance = Number(data.openingBalance) || 0
            const openingBalance = balanceSign === "negative" ? -Math.abs(rawBalance) : Math.abs(rawBalance)

            await updateAgreement.mutateAsync({
                id: agreement.id,
                data: {
                    tenantId: agreement.tenantId,
                    unitId: agreement.unitId,
                    rentAmount: nullIfEmpty(data.rentAmount),
                    depositAmount: nullIfEmpty(data.depositAmount),
                    startDate: nullIfEmpty(data.startDate),
                    billingModel,
                    openingBalance,
                },
            })
            toast.success("Agreement updated")
            onClose()
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    return (
        <Dialog
            title="Edit Agreement"
            subtitle={`${agreement.tenantName} — Unit ${agreement.roomNumber}`}
            onClose={onClose}
            size="lg"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="edit-agreement" loading={updateAgreement.isPending}>
                        Save changes
                    </Button>
                </>
            }
        >
            <form id="edit-agreement" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <BillingModelField value={billingModel} onChange={setBillingModel}/>

                <div>
                    <FormField label="Billing cycle start date"
                               hint="Billing day is derived from this date automatically.">
                        <DateField {...register("startDate")} />
                    </FormField>
                    <BillingDayHint dateStr={watchedStartDate || agreement.startDate} billingModel={billingModel}/>
                </div>

                <FormField label="Monthly rent (UGX)">
                    <AmountInput name="rentAmount" control={control}/>
                </FormField>

                <FormField label="Deposit (UGX)" hint="Optional">
                    <AmountInput name="depositAmount" control={control}/>
                </FormField>

                <OpeningBalanceField
                    control={control}
                    balanceSign={balanceSign}
                    setBalanceSign={setBalanceSign}
                />

                {error && <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-600">{error}</p>}
            </form>
        </Dialog>
    )
}
