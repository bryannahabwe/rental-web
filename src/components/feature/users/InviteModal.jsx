import {useState} from "react"
import {useForm} from "react-hook-form"
import {useInviteUser} from "@/hooks/useUsers"
import {useProperties} from "@/hooks/useProperties"
import {useAccountRole} from "@/hooks/usePermissions"
import {ROLE, assignableRoles, isPropertyScoped, roleLabel, roleOption} from "@/lib/roles"
import {Button, Dialog, FormField, Input, Select, toast} from "@/components/ui"
import PropertyRoleList from "./PropertyRoleList"
import {getErrorMessage} from "@/utils/errorMessage"

const PHONE_PATTERN = {
    value: /^\+?[0-9]{10,15}$/,
    message: "Invalid phone number format",
}

export default function InviteModal({onClose}) {
    const inviteUser = useInviteUser()
    // Managing users is an account-wide act, so this is the account role rather
    // than whatever applies to the property currently in the switcher.
    const currentRole = useAccountRole()
    const {data: properties = []} = useProperties()
    const [role, setRole] = useState(ROLE.PROPERTY_MANAGER)
    const [assignments, setAssignments] = useState([])
    const [error, setError] = useState("")

    const {register, handleSubmit, formState: {errors}} = useForm()

    const roleOptions = assignableRoles(currentRole).map(roleOption)
    const scoped = isPropertyScoped(role)

    // Switching between the two scoped roles re-points every property already
    // ticked, so the top-level choice stays the answer to "what are they here
    // to do" and the per-property selects remain the exception.
    const changeRole = (next) => {
        setRole(next)
        if (isPropertyScoped(next)) {
            setAssignments((prev) => prev.map((a) => ({...a, role: next})))
        }
    }

    const onSubmit = async (data) => {
        setError("")
        if (scoped && assignments.length === 0) {
            setError(`Assign at least one property to a ${roleLabel(role).toLowerCase()}`)
            return
        }
        try {
            await inviteUser.mutateAsync({
                name: data.name,
                phoneNumber: data.phoneNumber,
                email: data.email,
                role,
                assignments: scoped ? assignments : [],
            })
            toast.success("Invitation sent", `${data.name} will receive an email.`)
            onClose()
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    return (
        <Dialog
            title="Invite User"
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="invite-user" loading={inviteUser.isPending}>Send invite</Button>
                </>
            }
        >
            <form id="invite-user" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField label="Full name" error={errors.name?.message} required>
                    <Input {...register("name", {required: "Name is required"})}
                           invalid={!!errors.name} placeholder="Moses Okello"/>
                </FormField>

                <FormField label="Phone number" error={errors.phoneNumber?.message} required>
                    <Input {...register("phoneNumber", {required: "Phone number is required", pattern: PHONE_PATTERN})}
                           type="tel" invalid={!!errors.phoneNumber} placeholder="0771234567"/>
                </FormField>

                <FormField
                    label="Email"
                    error={errors.email?.message}
                    hint="We'll email them a link to set a password and join."
                    required
                >
                    <Input {...register("email", {required: "Email is required"})}
                           type="email" invalid={!!errors.email} placeholder="moses@example.com"/>
                </FormField>

                <FormField label="Role">
                    <Select value={role} onChange={(e) => changeRole(e.target.value)} options={roleOptions}/>
                </FormField>

                {scoped && (
                    <FormField
                        label="Assigned properties"
                        hint="Set the role per property — someone can run one and only collect rent at another."
                    >
                        <PropertyRoleList properties={properties} assignments={assignments}
                                          defaultRole={role} onChange={setAssignments}/>
                    </FormField>
                )}

                {error && <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-600">{error}</p>}
            </form>
        </Dialog>
    )
}
