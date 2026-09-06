import {useState} from "react"
import {useForm} from "react-hook-form"
import {Check, Download} from "lucide-react"
import {useCreatePayment} from "@/hooks/usePayments"
import {paymentsService} from "@/services/paymentsService"
import {useAgreements, useAgreementCycles} from "@/hooks/useAgreements"
import {useAllTenants} from "@/hooks/useTenants"
import {usePaymentMethods} from "@/hooks/usePaymentMethods"
import useSettingsStore from "@/store/settingsStore"
import {settingsService} from "@/services/settingsService"
import {generateReceipt} from "@/utils/receiptGenerator"
import {
    Alert, AmountInput, Badge, Button, ChoiceGroup, DateField, Dialog, FormField, Input, Select, Tabs, Textarea, toast,
} from "@/components/ui"
import {formatCycle, formatUGX, nullIfEmpty, todayStr} from "@/lib/format"
import CyclePicker from "./CyclePicker"
import {autoSelectedCycle, cycleRemainingNeed} from "./cycles"
import {getErrorMessage} from "@/utils/errorMessage"

const TABS = [
    {id: "record", label: "Record Payment"},
    {id: "manual", label: "Manual Receipt"},
]

const STYLE_OPTIONS = [
    {value: "DIGITAL", label: "Digital", description: "Clean branded"},
    {value: "FORMAL", label: "Formal", description: "Like receipt book"},
]

export default function RecordPaymentModal({onClose}) {
    const {settings} = useSettingsStore()
    const createPayment = useCreatePayment()
    const {data: agreementsData, isLoading: agreementsLoading} = useAgreements({
        page: 0, size: 100, status: "ACTIVE",
    })
    const {data: tenantsData, isLoading: tenantsLoading} = useAllTenants()
    // Manual receipts are printed client-side, but the tender types they
    // offer come from the same managed list as expenses and income.
    const {data: methods = []} = usePaymentMethods()
    const methodOptions = methods.filter((m) => m.active)

    const [activeTab, setActiveTab] = useState("record")
    const [error, setError] = useState("")
    const [pickedCycle, setPickedCycle] = useState(null)
    const [completedPayment, setCompletedPayment] = useState(null)
    const [receiptNumber, setReceiptNumber] = useState(null)
    const [receiptDownloading, setReceiptDownloading] = useState(false)
    // Spans BOTH awaits below (payment + receipt-number). createPayment.isPending
    // clears after the first await, so on its own it would re-enable the button
    // during the receipt fetch and allow a double-submit.
    const [submitting, setSubmitting] = useState(false)
    const [manualError, setManualError] = useState("")
    const [manualGenerating, setManualGenerating] = useState(false)
    const [manualStyle, setManualStyle] = useState(settings?.receiptStyle || "DIGITAL")

    const activeAgreements = agreementsData?.content || []
    const allTenants = tenantsData || []
    // The picker shows one wide page; if there are more active agreements than
    // that, the overflow isn't selectable — say so instead of hiding it.
    const agreementsTruncated = (agreementsData?.totalElements ?? 0) > activeAgreements.length

    const {register, control, handleSubmit, watch, formState: {errors}} = useForm({
        defaultValues: {paymentDate: todayStr(), agreementId: ""},
    })

    const {
        register: registerManual,
        control: controlManual,
        handleSubmit: handleSubmitManual,
        watch: watchManual,
        formState: {errors: manualErrors},
    } = useForm({
        defaultValues: {paymentDate: todayStr(), method: "Cash"},
    })

    const selectedAgreementId = watch("agreementId")
    const enteredAmount = watch("amount")
    const selectedTenantId = watchManual("tenantId")

    const {data: cycles = [], isLoading: cyclesLoading} = useAgreementCycles(selectedAgreementId)

    // Derived during render rather than pushed through an effect: the earliest
    // unpaid cycle is the default, and an explicit pick overrides it. Keyed by
    // agreement so switching tenants drops a stale manual pick.
    const [pickedForAgreement, setPickedForAgreement] = useState(null)
    const activePick = pickedForAgreement === selectedAgreementId ? pickedCycle : null
    const selectedCycle = activePick ?? autoSelectedCycle(cycles)

    const onPickCycle = (cycle) => {
        setPickedCycle(cycle)
        setPickedForAgreement(selectedAgreementId)
    }

    const selectedAgreement = activeAgreements.find((ag) => ag.id === selectedAgreementId)
    const selectedTenant = allTenants.find((t) => t.id === selectedTenantId)
    const expectedAmount = Number(selectedAgreement?.rentAmount) || 0
    const amountNum = Number(enteredAmount) || 0
    // Sized off what the selected cycle STILL needs, exactly as the API sizes
    // the real thing. Against the bare rent, a cycle already part-paid reads
    // back a spill that is short by whatever it already held.
    const cycleNeed = cycleRemainingNeed(cycles, selectedCycle) ?? expectedAmount
    const overpayment = Math.max(0, amountNum - cycleNeed)
    const shortfall = Math.max(0, cycleNeed - amountNum)
    const openingArrears = selectedAgreement
        ? Math.max(0, -(Number(selectedAgreement.openingBalance || 0)))
        : 0

    const onSubmit = async (data) => {
        setError("")
        if (!selectedCycle) {
            setError("Please select a payment period")
            return
        }
        setSubmitting(true)
        try {
            const result = await createPayment.mutateAsync({
                agreementId: data.agreementId,
                paymentDate: data.paymentDate,
                amount: data.amount,
                method: "CASH",
                periodStartDate: selectedCycle.start,
                periodEndDate: selectedCycle.end,
                reference: nullIfEmpty(data.reference),
                notes: nullIfEmpty(data.notes),
            })
            const receiptRes = await paymentsService.issueReceipt(result.data.id)
            setReceiptNumber(receiptRes.data)
            setCompletedPayment(result.data)
        } catch (err) {
            setError(getErrorMessage(err))
        } finally {
            setSubmitting(false)
        }
    }

    const onManualSubmit = async (data) => {
        setManualError("")
        setManualGenerating(true)
        try {
            const receiptRes = await settingsService.getNextReceiptNumber()
            const rNumber = receiptRes.data
            const manualPayment = {
                tenantName: selectedTenant?.name || "—",
                roomNumber: selectedTenant?.currentUnit || "—",
                amount: data.amount,
                expectedAmount: data.amount,
                paymentDate: data.paymentDate,
                periodStartDate: null,
                periodEndDate: null,
                manualPeriod: data.period || "—",
                method: data.method || "CASH",
                reference: data.reference || null,
                notes: data.notes || null,
                balance: data.balance || 0,
                isManual: true,
            }
            await generateReceipt(manualPayment, {...settings, receiptStyle: manualStyle}, rNumber)
            toast.success("Receipt generated")
        } catch (err) {
            console.error("Manual receipt generation failed", err)
            setManualError("Failed to generate receipt. Please try again.")
        } finally {
            setManualGenerating(false)
        }
    }

    const handleDownloadReceipt = async () => {
        setReceiptDownloading(true)
        try {
            await generateReceipt(completedPayment, settings, receiptNumber)
        } catch (err) {
            console.error("Receipt generation failed", err)
            toast.error("Couldn't generate the receipt", "Please try again.")
        } finally {
            setReceiptDownloading(false)
        }
    }

    // ── Success state ────────────────────────────────────────────────
    if (completedPayment) {
        return (
            <Dialog onClose={onClose} size="sm" hideHeader dismissible={false}>
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                    <span
                        className="flex h-18 w-18 items-center justify-center rounded-full bg-success-50 text-success-600">
                        <Check size={32} strokeWidth={2.5}/>
                    </span>
                    <div>
                        <h3 className="font-heading text-xl font-medium text-neutral-90">Payment Recorded</h3>
                        <p className="mt-1.5 text-sm text-neutral-50">
                            <span className="tabular-nums">{formatUGX(completedPayment.amount)}</span> from{" "}
                            <strong className="font-medium text-neutral-80">{completedPayment.tenantName}</strong>
                        </p>
                        <p className="mt-1 text-sm text-neutral-40">
                            {formatCycle(completedPayment.periodStartDate, completedPayment.periodEndDate)}
                        </p>
                    </div>
                    <Button block iconLeft={Download} loading={receiptDownloading} onClick={handleDownloadReceipt}>
                        Download Receipt ({receiptNumber})
                    </Button>
                    <Button block variant="outline" onClick={onClose}>Done</Button>
                </div>
            </Dialog>
        )
    }

    const isRecord = activeTab === "record"

    return (
        <Dialog
            title={isRecord ? "Record Payment" : "Manual Receipt"}
            onClose={onClose}
            bodyClass="px-5 pb-5 pt-0 md:px-6"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    {isRecord ? (
                        <Button type="submit" form="record-payment"
                                loading={createPayment.isPending || submitting}>
                            Record payment
                        </Button>
                    ) : (
                        <Button type="submit" form="manual-receipt" iconLeft={Download} loading={manualGenerating}>
                            Generate Receipt
                        </Button>
                    )}
                </>
            }
        >
            <Tabs
                className="-mx-5 mb-5 px-5 md:-mx-6 md:px-6"
                items={TABS}
                active={activeTab}
                onSelect={(id) => {
                    setActiveTab(id)
                    setError("")
                    setManualError("")
                }}
            />

            {isRecord ? (
                <form id="record-payment" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <FormField label="Tenant / Agreement" error={errors.agreementId?.message} required
                               hint={agreementsTruncated
                                   ? `Showing the first ${activeAgreements.length} active agreements`
                                   : undefined}>
                        <Select
                            {...register("agreementId", {required: "Please select an agreement"})}
                            invalid={!!errors.agreementId}
                            placeholder={agreementsLoading ? "Loading…" : "Select tenant"}
                            options={activeAgreements.map((ag) => ({
                                label: `${ag.tenantName} — Unit ${ag.roomNumber} (${formatUGX(ag.rentAmount)}/mo)`,
                                value: ag.id,
                            }))}
                        />
                    </FormField>

                    {selectedAgreementId && selectedAgreement && (
                        <CyclePicker
                            cycles={cycles}
                            isLoading={cyclesLoading}
                            selected={selectedCycle}
                            onSelect={onPickCycle}
                            openingArrears={openingArrears}
                        />
                    )}

                    <div>
                        <FormField
                            label="Amount (UGX)"
                            error={errors.amount?.message}
                            required
                            hint={selectedAgreement
                                ? cycleNeed < expectedAmount
                                    ? `${formatUGX(cycleNeed)} still owed this period of ${formatUGX(expectedAmount)}`
                                    : `Expected ${formatUGX(expectedAmount)}`
                                : undefined}
                        >
                            <AmountInput
                                name="amount"
                                control={control}
                                rules={{
                                    required: "Amount is required",
                                    min: {value: 1, message: "Must be greater than 0"},
                                }}
                                invalid={!!errors.amount} placeholder="180,000"
                            />
                        </FormField>

                        {overpayment > 0 && (
                            <div
                                className="mt-2 rounded-lg border-l-[3px] border-warning-500 bg-warning-50 px-3.5 py-2.5 text-sm text-warning-700">
                                Overpayment of <span className="tabular-nums">{formatUGX(overpayment)}</span> — will roll
                                over to next cycle
                            </div>
                        )}
                        {amountNum > 0 && shortfall > 0 && selectedAgreement && (
                            <div
                                className="mt-2 rounded-lg border-l-[3px] border-danger-500 bg-danger-50 px-3.5 py-2.5 text-sm text-danger-600">
                                Partial — <span className="tabular-nums">{formatUGX(shortfall)}</span>{" "}
                                still outstanding
                            </div>
                        )}
                    </div>

                    <FormField label="Payment date" error={errors.paymentDate?.message} required>
                        <DateField
                            {...register("paymentDate", {required: "Payment date is required"})}
                            invalid={!!errors.paymentDate}
                        />
                    </FormField>

                    {/* Informational, not an input — recorded payments are cash
                        only today (the API's PaymentMethod has no other value).
                        Use the Manual Receipt tab for other tender types. */}
                    <FormField label="Payment method">
                        <p className="flex items-center gap-2 text-sm text-neutral-50">
                            <Badge size="sm" tone="primary">CASH</Badge>
                            Recorded as a cash payment
                        </p>
                    </FormField>

                    <FormField label="Reference" hint="Optional">
                        <Input {...register("reference")} placeholder="RCP-001"/>
                    </FormField>

                    <FormField label="Notes" hint="Optional">
                        <Textarea {...register("notes")} rows={2} placeholder="April rent payment…"/>
                    </FormField>

                    {error && <Alert>{error}</Alert>}
                </form>
            ) : (
                <form id="manual-receipt" onSubmit={handleSubmitManual(onManualSubmit)} className="flex flex-col gap-4">
                    <div>
                        <FormField label="Tenant" error={manualErrors.tenantId?.message} required>
                            <Select
                                {...registerManual("tenantId", {required: "Please select a tenant"})}
                                invalid={!!manualErrors.tenantId}
                                placeholder={tenantsLoading ? "Loading…" : "Select tenant"}
                                options={allTenants.map((t) => ({
                                    label: `${t.name} — Unit ${t.currentUnit || "—"}`,
                                    value: t.id,
                                }))}
                            />
                        </FormField>
                        {selectedTenant && (
                            <div className="mt-2 flex gap-4 rounded-lg bg-primary-50 px-3.5 py-2.5 text-xs text-primary-700">
                                <span><strong>Name:</strong> {selectedTenant.name}</span>
                                <span><strong>Unit:</strong> {selectedTenant.currentUnit || "—"}</span>
                            </div>
                        )}
                    </div>

                    <FormField label="Amount (UGX)" error={manualErrors.amount?.message} required>
                        <AmountInput
                            name="amount"
                            control={controlManual}
                            rules={{
                                required: "Amount is required",
                                min: {value: 1, message: "Must be greater than 0"},
                            }}
                            invalid={!!manualErrors.amount} placeholder="180,000"
                        />
                    </FormField>

                    <FormField label="Period" hint="Optional">
                        <Input {...registerManual("period")} placeholder="e.g. 1 Apr – 30 Apr or January 2026"/>
                    </FormField>

                    <FormField label="Payment date" error={manualErrors.paymentDate?.message} required>
                        <DateField
                            {...registerManual("paymentDate", {required: "Payment date is required"})}
                            invalid={!!manualErrors.paymentDate}
                        />
                    </FormField>

                    <FormField label="Payment method"
                               hint="Manage the list in Settings → Payment Methods">
                        <Select
                            {...registerManual("method")}
                            options={methodOptions.map((m) => ({label: m.name, value: m.name}))}
                        />
                    </FormField>

                    <FormField label="Balance remaining (UGX)" hint="Amount still owed after this payment">
                        <AmountInput name="balance" control={controlManual} placeholder="0"/>
                    </FormField>

                    <FormField label="Reference" hint="Optional">
                        <Input {...registerManual("reference")} placeholder="RCP-001"/>
                    </FormField>

                    <FormField label="Notes" hint="Optional">
                        <Textarea {...registerManual("notes")} rows={2} placeholder="e.g. January rent payment"/>
                    </FormField>

                    <FormField label="Receipt style">
                        <ChoiceGroup options={STYLE_OPTIONS} value={manualStyle} onChange={setManualStyle}/>
                    </FormField>

                    {manualError && (
                        <Alert>{manualError}</Alert>
                    )}
                </form>
            )}
        </Dialog>
    )
}
