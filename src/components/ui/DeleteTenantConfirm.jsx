import {useState} from "react"
import {Trash2} from "lucide-react"
import {useDeleteTenant} from "@/hooks/useTenants"
import Dialog from "./Dialog"
import Button from "./Button"
import Alert from "./Alert"
import {toast} from "./toastStore"
import {getErrorMessage} from "@/utils/errorMessage"

/**
 * Confirm-and-delete a tenant. `onClose` closes the dialog (cancel or after
 * success); `onDeleted` (optional) fires only after a successful delete — the
 * detail page uses it to navigate back to the list.
 *
 * Kept as its own component rather than folded into `useConfirm` because it
 * owns the mutation and the post-delete navigation hand-off.
 */
export default function DeleteTenantConfirm({tenant, onClose, onDeleted}) {
    const deleteTenant = useDeleteTenant()
    const [error, setError] = useState("")

    const handleDelete = async () => {
        try {
            await deleteTenant.mutateAsync(tenant.id)
            toast.success("Tenant deleted", tenant.name)
            onClose()
            onDeleted?.()
        } catch (err) {
            setError(getErrorMessage(err, "Could not delete tenant"))
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
                    <Button variant="danger" loading={deleteTenant.isPending} onClick={handleDelete}>
                        Delete
                    </Button>
                </>
            }
        >
            <div className="flex flex-col items-center text-center">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-50 text-danger-500">
                    <Trash2 size={24}/>
                </span>
                <h2 className="font-heading text-lg font-medium text-neutral-90">Delete tenant?</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-50">
                    <strong className="font-medium text-neutral-80">{tenant.name}</strong> will be permanently
                    removed. This cannot be undone.
                </p>
                {error && (
                    <Alert className="mt-4 w-full">{error}</Alert>
                )}
            </div>
        </Dialog>
    )
}
