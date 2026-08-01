import {useTenantLedger} from "@/hooks/useTenants"
import Dialog from "./Dialog"
import TenantLedgerView from "./TenantLedgerView"
import {formatUGX} from "@/lib/format"

export default function TenantLedgerModal({tenantId, onClose}) {
    const {data: ledger} = useTenantLedger(tenantId)

    return (
        <Dialog
            size="xl"
            onClose={onClose}
            title={ledger ? `${ledger.tenantName} — Transactions & Arrears` : "Transactions & Arrears"}
            subtitle={ledger
                ? `Unit ${ledger.unit} · ${formatUGX(ledger.rentAmount)}/cycle · ${ledger.billingModel}`
                : undefined}
        >
            <TenantLedgerView tenantId={tenantId}/>
        </Dialog>
    )
}
