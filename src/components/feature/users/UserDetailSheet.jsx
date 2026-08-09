import {Crown, Pencil, Send, ShieldOff, UserCog} from "lucide-react"
import {useDeactivateUser, useResendInvite, useTransferOwnership} from "@/hooks/useUsers"
import useAuthStore from "@/store/authStore"
import {Badge, Button, DetailList, DetailRow, Dialog, toast, useConfirm} from "@/components/ui"
import {formatDate} from "@/lib/format"
import {statusLabel, statusTone} from "@/lib/statusTone"
import {ROLE, isPropertyScoped, roleLabel} from "@/lib/roles"
import {canManage} from "./permissions"
import {getErrorMessage} from "@/utils/errorMessage"

export default function UserDetailSheet({user, propertyName, onEdit, onClose}) {
    const currentRole = useAuthStore((s) => s.role)
    const currentUserId = useAuthStore((s) => s.userId)
    const deactivateUser = useDeactivateUser()
    const resendInvite = useResendInvite()
    const transferOwnership = useTransferOwnership()
    const confirm = useConfirm()

    const editable = canManage(user, currentRole)
    const canDeactivate =
        user.id !== currentUserId && user.role !== ROLE.SUPER_ADMIN && user.status !== "DEACTIVATED"

    // Only the current owner can hand ownership over, and only to another active
    // admin — the same rule the API enforces.
    const canTransferOwnership =
        currentRole === ROLE.SUPER_ADMIN &&
        user.id !== currentUserId &&
        user.role === ROLE.ADMIN &&
        user.status === "ACTIVE"

    const handleResend = async () => {
        try {
            await resendInvite.mutateAsync(user.id)
            toast.success("Invitation resent", user.email || user.name)
        } catch (err) {
            toast.error("Couldn't resend the invite", getErrorMessage(err))
        }
    }

    // Deactivation is a state change that locks someone out — it goes through
    // a confirm like every other destructive mutation.
    const handleDeactivate = async () => {
        const ok = await confirm.ask({
            title: "Deactivate user?",
            message: `${user.name} will immediately lose access to the portal. You can invite them again later.`,
            confirmLabel: "Deactivate",
            tone: "danger",
            icon: ShieldOff,
        })
        if (!ok) return
        try {
            await deactivateUser.mutateAsync(user.id)
            toast.success("User deactivated", user.name)
            onClose()
        } catch (err) {
            toast.error("Couldn't deactivate the user", getErrorMessage(err))
        }
    }

    // Handing over ownership demotes the current owner, so it's gated behind a
    // type-to-confirm — the API applies the demotion on the caller's next login.
    const handleTransferOwnership = async () => {
        const ok = await confirm.ask({
            title: "Transfer ownership?",
            message: `${user.name} will become the account owner (Super Admin) and you'll be changed to Admin. This takes effect the next time you sign in.`,
            confirmLabel: "Transfer ownership",
            icon: Crown,
            requireText: user.name,
        })
        if (!ok) return
        try {
            await transferOwnership.mutateAsync(user.id)
            toast.success("Ownership transferred", `${user.name} is now the account owner`)
            onClose()
        } catch (err) {
            toast.error("Couldn't transfer ownership", getErrorMessage(err))
        }
    }

    // Roles are per property, so name the role alongside each one — the
    // property alone doesn't say what they can do there.
    const assignmentEntries = Object.entries(user.propertyRoles || {})
    const assigned = assignmentEntries.length === 0
        ? "None assigned"
        : assignmentEntries
            .map(([id, role]) => `${propertyName(id)} (${roleLabel(role)})`)
            .join(", ")

    return (
        <Dialog title="User Details" onClose={onClose}>
            <div className="mb-6 flex items-center gap-3.5">
                <span
                    className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                    <UserCog size={24}/>
                </span>
                <div className="min-w-0">
                    <p className="font-heading text-xl font-medium text-neutral-90">{user.name}</p>
                    <p className="break-all text-sm text-neutral-40">
                        {user.email || user.phoneNumber || "—"}
                    </p>
                </div>
            </div>

            <div className="mb-5 rounded-lg bg-neutral-0 p-4">
                <DetailList columns={2}>
                    <DetailRow label="Role" value={statusLabel("role", user.role)}/>
                    <DetailRow
                        label="Status"
                        value={<Badge tone={statusTone("user", user.status)}>{user.status}</Badge>}
                    />
                    <DetailRow label="Email" value={user.email || "—"}/>
                    <DetailRow label="Phone" value={user.phoneNumber || "—"}/>
                    {isPropertyScoped(user.role) && (
                        <DetailRow label="Assigned properties" value={assigned}/>
                    )}
                    <DetailRow label="Joined" value={formatDate(user.createdAt)}/>
                </DetailList>
            </div>

            <div className="flex flex-wrap gap-2.5">
                {editable && (
                    <Button className="min-w-30 flex-1" variant="outline" iconLeft={Pencil}
                            onClick={() => onEdit(user)}>
                        Edit
                    </Button>
                )}
                {user.status === "INVITED" && (
                    <Button className="min-w-30 flex-1 text-primary-600" variant="outline" iconLeft={Send}
                            loading={resendInvite.isPending} onClick={handleResend}>
                        Resend invite
                    </Button>
                )}
                {canDeactivate && (
                    <Button className="min-w-30 flex-1 text-danger-600 hover:bg-danger-50" variant="outline"
                            iconLeft={ShieldOff} loading={deactivateUser.isPending} onClick={handleDeactivate}>
                        Deactivate
                    </Button>
                )}
            </div>

            {canTransferOwnership && (
                <div className="mt-3 border-t border-neutral-5 pt-4">
                    <Button className="w-full text-primary-700" variant="outline"
                            iconLeft={Crown} loading={transferOwnership.isPending}
                            onClick={handleTransferOwnership}>
                        Make account owner
                    </Button>
                    <p className="mt-2 text-center text-xs text-neutral-40">
                        Hands full ownership to {user.name}. You'll become an Admin.
                    </p>
                </div>
            )}
        </Dialog>
    )
}
