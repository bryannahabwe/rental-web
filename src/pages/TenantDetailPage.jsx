import {useState} from "react"
import {useNavigate, useParams} from "react-router-dom"
import {Pencil, Trash2} from "lucide-react"
import AppShell from "@/components/layout/AppShell"
import {useTenant} from "@/hooks/useTenants"
import useAuthStore from "@/store/authStore"
import {Avatar, Badge, Button, Card, EmptyState, LoadingPanel} from "@/components/ui"
import {formatCycle, formatUGX} from "@/lib/format"
import {statusTone} from "@/lib/statusTone"
import TenantLedgerView from "@/components/ui/TenantLedgerView"
import TenantFormModal from "@/components/ui/TenantFormModal"
import DeleteTenantConfirm from "@/components/ui/DeleteTenantConfirm"
import {cn} from "@/lib/cn"

/** A label/value pair stacked in the sidebar cards. */
function Row({label, value, tone = "default"}) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-neutral-5 pb-3.5 last:border-0 last:pb-0">
            <span className="shrink-0 text-sm text-neutral-40">{label}</span>
            <span
                className={cn(
                    "text-right text-sm font-medium",
                    tone === "danger" ? "text-danger-600"
                        : tone === "success" ? "text-success-600"
                            : "text-neutral-90",
                )}
            >
                {value}
            </span>
        </div>
    )
}

const SECTION = "mb-3.5 text-2xs font-medium uppercase tracking-wide text-neutral-40"

export default function TenantDetailPage() {
    const {id} = useParams()
    const navigate = useNavigate()
    const {data: tenant, isLoading} = useTenant(id)
    const canDelete = useAuthStore((s) => s.role === "SUPER_ADMIN")
    const [editing, setEditing] = useState(false)
    const [deleting, setDeleting] = useState(false)

    return (
        <AppShell title={tenant?.name || "Tenant"} subtitle={tenant?.phone} showBack>
            {isLoading ? (
                <LoadingPanel/>
            ) : !tenant ? (
                <EmptyState title="Tenant not found" message="This tenant may have been removed."/>
            ) : (
                /* The old layout used a hand-written <style> block with a custom
                   960px breakpoint. It now snaps to `lg:` (1024px) — a deliberate
                   64px shift so this page shares the app's breakpoint ladder. */
                <div className="mx-auto max-w-[1180px]">
                    <Card className="mb-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <Avatar name={tenant.name} size={52} className="bg-secondary-900 text-white"/>
                                <div className="min-w-0">
                                    <p className="font-heading text-xl font-medium text-neutral-90">{tenant.name}</p>
                                    <p className="mt-0.5 text-sm tabular-nums text-neutral-40">{tenant.phone}</p>
                                </div>
                            </div>
                            <div className="flex gap-2.5">
                                <Button variant="outline" iconLeft={Pencil} onClick={() => setEditing(true)}>
                                    Edit
                                </Button>
                                {canDelete && (
                                    <Button variant="outline" iconLeft={Trash2}
                                            className="text-danger-600 hover:bg-danger-50"
                                            onClick={() => setDeleting(true)}>
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Info on the left, ledger on the right, from lg up. */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                        <div className="flex flex-col gap-4 lg:w-90 lg:shrink-0">
                            <Card>
                                <p className={SECTION}>Contact</p>
                                <div className="flex flex-col gap-3.5">
                                    <Row label="Phone" value={tenant.phone}/>
                                    <Row label="Email" value={tenant.email || "—"}/>
                                    <Row label="Address" value={tenant.address || "—"}/>
                                </div>
                            </Card>

                            {tenant.currentUnit ? (
                                <Card>
                                    <p className={SECTION}>Current Tenancy</p>
                                    <div className="flex flex-col gap-3.5">
                                        <Row label="Unit" value={tenant.currentUnit}/>
                                        <Row label="Monthly Rent" value={formatUGX(tenant.monthlyRent)}/>
                                        <Row label="Period"
                                             value={formatCycle(tenant.currentCycleStart, tenant.currentCycleEnd)}/>
                                        <Row
                                            label="Outstanding"
                                            value={tenant.currentBalance > 0 ? formatUGX(tenant.currentBalance) : "Paid up"}
                                            tone={tenant.currentBalance > 0 ? "danger" : "success"}
                                        />
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-sm text-neutral-40">Account status</span>
                                            {tenant.periodStatus ? (
                                                <Badge tone={statusTone("period", tenant.periodStatus)}>
                                                    {tenant.periodStatus}
                                                </Badge>
                                            ) : (
                                                <span className="text-sm text-neutral-30">No agreement</span>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ) : (
                                <Card>
                                    <p className="text-sm text-neutral-40">
                                        No active agreement for this tenant.
                                    </p>
                                </Card>
                            )}
                        </div>

                        {tenant.currentUnit && (
                            <div className="min-w-0 lg:flex-1">
                                <Card>
                                    <p className={SECTION}>Ledger &amp; Arrears</p>
                                    <TenantLedgerView tenantId={id}/>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {editing && <TenantFormModal tenant={tenant} onClose={() => setEditing(false)}/>}
            {deleting && (
                <DeleteTenantConfirm
                    tenant={tenant}
                    onClose={() => setDeleting(false)}
                    onDeleted={() => navigate("/tenants")}
                />
            )}
        </AppShell>
    )
}
