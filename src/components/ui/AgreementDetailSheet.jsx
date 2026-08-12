import {LogOut, Pencil} from "lucide-react"
import {useAgreement} from "@/hooks/useAgreements"
import Dialog from "./Dialog"
import Button from "./Button"
import Badge from "./Badge"
import {DetailList, DetailRow} from "./DetailRow"
import {EmptyState} from "./States"
import {LoadingPanel} from "./Loader"
import {formatDate, formatUGX} from "@/lib/format"
import {statusLabel, statusTone} from "@/lib/statusTone"

const SECTION = "mb-3.5 text-2xs font-medium uppercase tracking-wide text-neutral-40"

export default function AgreementDetailSheet({agreementId, onClose, onMoveOut, onEdit}) {
    const {data: ag, isLoading} = useAgreement(agreementId)

    // Opening balance is signed: positive is credit, negative is arrears.
    const openingTone = ag?.openingBalance < 0 ? "danger" : ag?.openingBalance > 0 ? "success" : "default"
    const openingValue = ag && ag.openingBalance !== 0
        ? `${ag.openingBalance > 0 ? "+" : ""}${formatUGX(Math.abs(ag.openingBalance))}`
        : "—"

    return (
        <Dialog title="Agreement Details" onClose={onClose}>
            {isLoading ? (
                <LoadingPanel/>
            ) : !ag ? (
                <EmptyState title="Agreement not found" message="It may have been removed."/>
            ) : (
                <>
                    <div className="mb-6 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="font-heading text-xl font-medium text-neutral-90">{ag.tenantName}</p>
                            <p className="mt-0.5 text-sm text-neutral-40">Unit {ag.roomNumber}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                            <Badge tone={statusTone("agreement", ag.status)}>
                                {statusLabel("agreement", ag.status)}
                            </Badge>
                            <Badge size="sm" tone={ag.tenantType === "NEW" ? "info" : "warning"}>
                                {ag.tenantType}
                            </Badge>
                        </div>
                    </div>

                    <div className="mb-4 rounded-lg bg-neutral-0 p-4">
                        <p className={SECTION}>Tenancy</p>
                        <DetailList columns={2}>
                            <DetailRow label="Tenant" value={ag.tenantName}/>
                            <DetailRow label="Unit" value={ag.roomNumber}/>
                            <DetailRow label="Move-in Date" value={formatDate(ag.startDate)}/>
                            {ag.moveOutDate && (
                                <DetailRow label="Move-out Date" value={formatDate(ag.moveOutDate)}/>
                            )}
                        </DetailList>
                    </div>

                    <div className="mb-5 rounded-lg bg-neutral-0 p-4">
                        <p className={SECTION}>Financials</p>
                        <DetailList columns={2}>
                            <DetailRow label="Monthly Rent" value={formatUGX(ag.rentAmount)} numeric/>
                            <DetailRow label="Security Deposit"
                                       value={ag.depositAmount ? formatUGX(ag.depositAmount) : "—"} numeric/>
                            <DetailRow label="Billing Model" value={ag.billingModel || "ADVANCE"}/>
                            <DetailRow label="Opening Balance" value={openingValue} tone={openingTone} numeric/>
                        </DetailList>
                    </div>

                    {ag.status === "TERMINATED" &&
                        (ag.depositApplied != null || ag.depositRefunded != null || ag.depositForfeited != null) && (
                            <div className="mb-5 rounded-lg bg-neutral-0 p-4">
                                <p className={SECTION}>Deposit Settlement</p>
                                <DetailList columns={3}>
                                    <DetailRow label="Used toward rent" value={formatUGX(ag.depositApplied || 0)} numeric/>
                                    <DetailRow label="Kept (damages / penalties)" value={formatUGX(ag.depositForfeited || 0)} numeric/>
                                    <DetailRow label="Refunded" value={formatUGX(ag.depositRefunded || 0)} numeric/>
                                </DetailList>
                            </div>
                        )}

                    <div className="flex flex-col gap-2">
                        <Button
                            block
                            variant="outline"
                            iconLeft={Pencil}
                            onClick={() => {
                                onEdit(ag)
                                onClose()
                            }}
                        >
                            Edit Agreement
                        </Button>

                        {ag.status === "ACTIVE" && (
                            <Button
                                block
                                variant="outline"
                                iconLeft={LogOut}
                                className="text-danger-600 hover:bg-danger-50"
                                onClick={() => {
                                    onMoveOut(ag)
                                    onClose()
                                }}
                            >
                                Record Move-Out
                            </Button>
                        )}
                    </div>
                </>
            )}
        </Dialog>
    )
}
