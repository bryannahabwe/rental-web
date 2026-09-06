import {useState} from "react"
import {Download, Pencil, Trash2} from "lucide-react"
import {useQueryClient} from "@tanstack/react-query"
import {usePayment, useDeletePayment} from "@/hooks/usePayments"
import {useCan} from "@/hooks/usePermissions"
import {useConfirm} from "./confirmContext"
import useSettingsStore from "@/store/settingsStore"
import {paymentsService} from "@/services/paymentsService"
import {generateReceipt} from "@/utils/receiptGenerator"
import Dialog from "./Dialog"
import Button from "./Button"
import Alert from "./Alert"
import Badge from "./Badge"
import ProgressBar from "./ProgressBar"
import {DetailList, DetailRow} from "./DetailRow"
import {EmptyState, ErrorState} from "./States"
import {LoadingPanel} from "./Loader"
import {formatCycle, formatDate, formatUGX} from "@/lib/format"
import {statusTone} from "@/lib/statusTone"
import {periodFigures} from "@/lib/paymentPeriod"
import {toast} from "./toastStore"
import {getErrorMessage} from "@/utils/errorMessage"

const SECTION = "mb-3.5 text-2xs font-medium uppercase tracking-wide text-neutral-40"

// The share-paid bar takes the period's own tone, so a rollover doesn't read
// as a shortfall.
const BAR_TONE = {PAID: "success", ROLLOVER: "info", PARTIAL: "warning"}

export default function PaymentDetailSheet({paymentId, onClose, onEdit}) {
    const {data: payment, isLoading, isError, refetch} = usePayment(paymentId)
    const {settings} = useSettingsStore()
    const [downloading, setDownloading] = useState(false)
    const [error, setError] = useState("")

    // Recording rent and unwinding it are different privileges: a caretaker
    // collects, an admin corrects. Mirrors the API's PUT/DELETE matrix.
    const canAmend = useCan()("deleteRecords")
    const confirm = useConfirm()
    const queryClient = useQueryClient()
    const deletePayment = useDeletePayment()

    // A rollover row re-labels cash recorded elsewhere. Correcting it means
    // correcting the payment that funded it, which the API enforces too.
    const isDerived = payment?.source === "ROLLOVER"

    const handleDelete = async () => {
        const ok = await confirm.ask({
            title: "Delete this payment?",
            message: `${formatUGX(payment.amount)} from ${payment.tenantName} will be permanently removed, `
                + "and this tenant's cycle balances and carried-forward credit recalculated without it. "
                + "Any receipt already issued stays issued. This cannot be undone.",
            confirmLabel: "Delete payment",
            tone: "danger",
        })
        if (!ok) return
        try {
            await deletePayment.mutateAsync(payment.id)
            toast.success("Payment deleted", "Cycle balances have been recalculated.")
            onClose()
        } catch (err) {
            setError(getErrorMessage(err, "Couldn't delete the payment. Please try again."))
        }
    }

    // The badge, the bar and the caption all report the PERIOD, not this row.
    // A row that completes a part-paid cycle would otherwise sit under a
    // half-empty bar reading PAID.
    const period = payment ? periodFigures(payment) : null

    const handleDownload = async () => {
        setDownloading(true)
        setError("")
        try {
            // Scoped to the payment, so a second download reprints the same
            // number rather than issuing the tenant a different one.
            const receiptRes = await paymentsService.issueReceipt(payment.id)
            await generateReceipt(payment, settings, receiptRes.data)
            // The first issue writes the number onto the row; refresh so this
            // sheet shows it and the button stops offering to issue one.
            void queryClient.invalidateQueries({queryKey: ["payments"]})
        } catch (err) {
            console.error("Receipt generation failed", err)
            setError("Failed to generate receipt. Please try again.")
        } finally {
            setDownloading(false)
        }
    }

    return (
        <Dialog title="Payment Details" onClose={onClose}>
            {isLoading ? (
                <LoadingPanel/>
            ) : isError ? (
                <ErrorState onRetry={refetch}/>
            ) : !payment ? (
                <EmptyState title="Payment not found" message="It may have been removed."/>
            ) : (
                <>
                    <div className="mb-6 rounded-lg bg-neutral-0 p-5 text-center">
                        <p className="mb-1.5 text-2xs uppercase tracking-wide text-neutral-40">Amount Paid</p>
                        <p className="font-heading text-3xl font-medium tabular-nums text-neutral-90">
                            {formatUGX(payment.amount)}
                        </p>
                        <p className="mt-1 text-sm tabular-nums text-neutral-40">
                            {period.sharedPeriod
                                ? `${formatUGX(period.periodPaid)} of ${formatUGX(payment.expectedAmount)} paid this period`
                                : `of ${formatUGX(payment.expectedAmount)} expected`}
                        </p>

                        {payment.expectedAmount > 0 && (
                            <ProgressBar
                                className="my-3 h-1.5"
                                value={period.periodPaid}
                                max={payment.expectedAmount}
                                tone={BAR_TONE[payment.periodStatus] || "warning"}
                                label="Share of the period's rent paid"
                            />
                        )}

                        {payment.periodStatus && (
                            <Badge tone={statusTone("period", payment.periodStatus)}>
                                {payment.periodStatus}
                            </Badge>
                        )}
                    </div>

                    <div className="mb-4 rounded-lg bg-neutral-0 p-4">
                        <p className={SECTION}>Tenant</p>
                        <DetailList columns={2}>
                            <DetailRow label="Name" value={payment.tenantName}/>
                            <DetailRow label="Unit" value={payment.roomNumber}/>
                        </DetailList>
                    </div>

                    <div className="mb-4 rounded-lg bg-neutral-0 p-4">
                        <p className={SECTION}>Payment Info</p>
                        <DetailList columns={2}>
                            <DetailRow label="Period"
                                       value={formatCycle(payment.periodStartDate, payment.periodEndDate)}/>
                            <DetailRow label="Payment Date" value={formatDate(payment.paymentDate)}/>
                            <DetailRow label="Method" value={payment.method}/>
                            <DetailRow label="Source" value={payment.source}
                                       tone={payment.source === "ROLLOVER" ? "muted" : "default"}/>
                            {payment.overpayment > 0 && (
                                <DetailRow label="Rolled Over" value={formatUGX(payment.overpayment)}
                                           tone="warning" numeric/>
                            )}
                        </DetailList>
                    </div>

                    {(payment.reference || payment.notes || payment.receiptNo) && (
                        <div className="mb-4 rounded-lg bg-neutral-0 p-4">
                            <p className={SECTION}>Additional Info</p>
                            <DetailList columns={1}>
                                {payment.receiptNo && (
                                    <DetailRow label="Receipt No." value={payment.receiptNo}/>
                                )}
                                {payment.reference && (
                                    <DetailRow label="Reference" value={payment.reference}/>
                                )}
                                {payment.notes && (
                                    <DetailRow label="Notes" value={payment.notes}/>
                                )}
                            </DetailList>
                        </div>
                    )}

                    {error && (
                        <Alert className="mb-3">{error}</Alert>
                    )}

                    {isDerived ? (
                        // Not money received: it re-labels cash already receipted
                        // on the row that funded it. Receipting it again would be
                        // a second receipt for the same money.
                        <p className="text-center text-2xs text-neutral-40">
                            Carried-forward credit — the payment it came from carries the receipt,
                            and is what there is to correct.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Button block iconLeft={Download} loading={downloading} onClick={handleDownload}>
                                {payment.receiptNo ? "Download Receipt" : "Issue Receipt"}
                            </Button>

                            {canAmend && (
                                <div className="flex gap-2">
                                    <Button block variant="outline" iconLeft={Pencil}
                                            onClick={() => onEdit(payment)}>
                                        Edit
                                    </Button>
                                    <Button block variant="danger" iconLeft={Trash2}
                                            loading={deletePayment.isPending} onClick={handleDelete}>
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </Dialog>
    )
}
