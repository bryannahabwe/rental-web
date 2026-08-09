import {useState} from "react"
import {useForm} from "react-hook-form"
import {useCreateAgreement} from "@/hooks/useAgreements"
import {useAllTenants} from "@/hooks/useTenants"
import {useAllUnits} from "@/hooks/useUnits"
import {
    Alert, AmountInput, Button, ChoiceGroup, DateField, Dialog, FormField, Select, toast,
} from "@/components/ui"
import {formatUGX, groupDigits, nullIfEmpty} from "@/lib/format"
import {BillingDayHint, BillingModelField, OpeningBalanceField} from "./fields"
import {getErrorMessage} from "@/utils/errorMessage"

const TENANT_TYPE_OPTIONS = [
    {value: "NEW", label: "New Tenant"},
    {value: "EXISTING", label: "Existing Tenant"},
]

export default function CreateAgreementModal({onClose}) {
    const createAgreement = useCreateAgreement()
    const {data: tenants = [], isLoading: tenantsLoading} = useAllTenants()
    const {data: units = [], isLoading: unitsLoading} = useAllUnits()
    const [error, setError] = useState("")
    const [tenantType, setTenantType] = useState("NEW")
    const [billingModel, setBillingModel] = useState("ADVANCE")
    const [balanceSign, setBalanceSign] = useState("positive")

    const availableUnits = units.filter((u) => u.isAvailable)

    const {register, control, handleSubmit, watch, formState: {errors}} = useForm()
    const selectedUnitId = watch("unitId")
    const selectedUnit = units.find((u) => u.id === selectedUnitId)
    const startDate = watch("startDate")

    const onSubmit = async (data) => {
        setError("")
        try {
            const rawBalance = Number(data.openingBalance) || 0
            const openingBalance = tenantType === "EXISTING"
                ? (balanceSign === "negative" ? -Math.abs(rawBalance) : Math.abs(rawBalance))
                : 0

            await createAgreement.mutateAsync({
                tenantId: data.tenantId,
                unitId: data.unitId,
                startDate: nullIfEmpty(data.startDate),
                rentAmount: nullIfEmpty(data.rentAmount),
                depositAmount: nullIfEmpty(data.depositAmount),
                tenantType,
                billingModel,
                openingBalance,
            })
            toast.success("Agreement created")
            onClose()
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    return (
        <Dialog
            title="New Agreement"
            onClose={onClose}
            size="lg"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="create-agreement" loading={createAgreement.isPending}>
                        Create agreement
                    </Button>
                </>
            }
        >
            <form id="create-agreement" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField
                    label="Tenant type"
                    hint={tenantType === "NEW"
                        ? "Moving in fresh — full details required"
                        : "Already living here — being onboarded into the system"}
                >
                    <ChoiceGroup options={TENANT_TYPE_OPTIONS} value={tenantType} onChange={setTenantType}/>
                </FormField>

                <BillingModelField value={billingModel} onChange={setBillingModel}/>

                <FormField label="Tenant" error={errors.tenantId?.message} required>
                    <Select
                        {...register("tenantId", {required: "Please select a tenant"})}
                        invalid={!!errors.tenantId}
                        placeholder={tenantsLoading ? "Loading…" : "Select a tenant"}
                        options={tenants.map((t) => ({label: `${t.name} — ${t.phone}`, value: t.id}))}
                    />
                </FormField>

                <FormField
                    label="Unit"
                    error={errors.unitId?.message}
                    required
                    hint={availableUnits.length === 0 && !unitsLoading
                        ? "No available units. Mark a unit as available first."
                        : undefined}
                >
                    <Select
                        {...register("unitId", {required: "Please select a unit"})}
                        invalid={!!errors.unitId}
                        placeholder={unitsLoading ? "Loading…" : "Select an available unit"}
                        options={availableUnits.map((u) => ({
                            label: `${u.roomNumber} — ${formatUGX(u.rentAmount)}/mo`,
                            value: u.id,
                        }))}
                    />
                </FormField>

                <FormField
                    label="Agreed rent (UGX)"
                    hint={selectedUnit
                        ? `Defaults to ${formatUGX(selectedUnit.rentAmount)} if left blank`
                        : "Optional — defaults to the unit's rent"}
                >
                    <AmountInput
                        name="rentAmount" control={control}
                        placeholder={selectedUnit ? groupDigits(selectedUnit.rentAmount) : "Leave blank to use unit rent"}
                    />
                </FormField>

                <div>
                    <FormField
                        label={tenantType === "NEW" ? "Move-in date" : "First billing cycle start date"}
                        error={errors.startDate?.message}
                        required
                    >
                        <DateField
                            {...register("startDate", {required: "Start date is required"})}
                            invalid={!!errors.startDate}
                        />
                    </FormField>

                    <BillingDayHint dateStr={startDate} billingModel={billingModel}/>

                    {tenantType === "EXISTING" && (
                        <div
                            className="mt-2 rounded-lg border border-warning-100 bg-warning-50 px-3.5 py-2.5 text-xs leading-relaxed text-warning-700">
                            {billingModel === "ARREARS"
                                ? "For ARREARS tenants: enter the start of the NEXT cycle you want to track. Enter any unpaid amount before this date in the opening balance below."
                                : "For ADVANCE tenants: enter the start of the current cycle. Enter any unpaid amount before this date in the opening balance below."}
                        </div>
                    )}
                </div>

                <FormField label="Deposit (UGX)" hint="Optional">
                    <AmountInput name="depositAmount" control={control}
                                 placeholder="Leave blank if not applicable"/>
                </FormField>

                {tenantType === "EXISTING" && (
                    <OpeningBalanceField
                        control={control}
                        balanceSign={balanceSign}
                        setBalanceSign={setBalanceSign}
                        helpText={balanceSign === "negative"
                            ? "Enter the total unpaid amount BEFORE the start date above. For example, if the tenant owes 3 months at 180,000, enter 540,000."
                            : "Enter the amount the tenant has paid ahead before the start date above."}
                    />
                )}

                {error && <Alert>{error}</Alert>}
            </form>
        </Dialog>
    )
}
