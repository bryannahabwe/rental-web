import {useState} from "react"
import {useUpdateUser} from "@/hooks/useUsers"
import {useProperties} from "@/hooks/useProperties"
import {useAccountRole} from "@/hooks/usePermissions"
import {assignableRoles, isPropertyScoped, roleLabel, roleOption} from "@/lib/roles"
import {Alert, Button, Dialog, FormField, Input, Select, toast} from "@/components/ui"
import PropertyRoleList from "./PropertyRoleList"
import {getErrorMessage} from "@/utils/errorMessage"

export default function EditUserModal({user, onClose}) {
    const updateUser = useUpdateUser()
    // Managing users is account-wide, so this is the account role rather than
    // whatever applies to the property currently in the switcher.
    const currentRole = useAccountRole()
    const {data: properties = []} = useProperties()
    const [role, setRole] = useState(user.role)
    const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "")
    // Seeded from the role held at each property, not the flat id list — that's
    // what we're editing.
    const [assignments, setAssignments] = useState(() =>
        Object.entries(user.propertyRoles || {}).map(([propertyId, r]) => ({propertyId, role: r})))
    const [error, setError] = useState("")

    const roleOptions = assignableRoles(currentRole).map(roleOption)
    const scoped = isPropertyScoped(role)

    const changeRole = (next) => {
        setRole(next)
        if (isPropertyScoped(next)) {
            setAssignments((prev) => prev.map((a) => ({...a, role: next})))
        }
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        setError("")
        if (!/^\+?[0-9]{10,15}$/.test(phoneNumber.trim())) {
            setError("Enter a valid phone number")
            return
        }
        if (scoped && assignments.length === 0) {
            setError(`Assign at least one property to a ${roleLabel(role).toLowerCase()}`)
            return
        }
        try {
            await updateUser.mutateAsync({
                id: user.id,
                data: {
                    role,
                    phoneNumber: phoneNumber.trim(),
                    assignments: scoped ? assignments : [],
                },
            })
            toast.success("User updated", user.name)
            onClose()
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    return (
        <Dialog
            title="Edit User"
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="edit-user" loading={updateUser.isPending}>Save changes</Button>
                </>
            }
        >
            <form id="edit-user" onSubmit={onSubmit} className="flex flex-col gap-4">
                <FormField label="Full name">
                    <Input value={user.name} readOnly disabled/>
                </FormField>

                <FormField label="Email" hint="Name and email can't be changed here.">
                    <Input value={user.email || "—"} readOnly disabled/>
                </FormField>

                <FormField label="Phone number">
                    <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                           type="tel" placeholder="0771234567"/>
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

                {error && <Alert>{error}</Alert>}
            </form>
        </Dialog>
    )
}
