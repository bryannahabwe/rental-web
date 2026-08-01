import {useState} from "react"
import {useUpdateUser} from "@/hooks/useUsers"
import {useProperties} from "@/hooks/useProperties"
import useAuthStore from "@/store/authStore"
import {Button, Dialog, FormField, Input, Select, toast} from "@/components/ui"
import PropertyChecklist from "./PropertyChecklist"
import {getErrorMessage} from "@/utils/errorMessage"

export default function EditUserModal({user, onClose}) {
    const updateUser = useUpdateUser()
    const currentRole = useAuthStore((s) => s.role)
    const {data: properties = []} = useProperties()
    const [role, setRole] = useState(user.role)
    const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "")
    const [propertyIds, setPropertyIds] = useState(user.assignedPropertyIds || [])
    const [error, setError] = useState("")

    const toggleProperty = (id) =>
        setPropertyIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))

    const roleOptions = [
        {label: "Property Manager (assigned properties only)", value: "PROPERTY_MANAGER"},
        ...(currentRole === "SUPER_ADMIN" ? [{label: "Admin (full access)", value: "ADMIN"}] : []),
    ]

    const onSubmit = async (e) => {
        e.preventDefault()
        setError("")
        if (!/^\+?[0-9]{10,15}$/.test(phoneNumber.trim())) {
            setError("Enter a valid phone number")
            return
        }
        if (role === "PROPERTY_MANAGER" && propertyIds.length === 0) {
            setError("Assign at least one property to a property manager")
            return
        }
        try {
            await updateUser.mutateAsync({
                id: user.id,
                data: {
                    role,
                    phoneNumber: phoneNumber.trim(),
                    propertyIds: role === "PROPERTY_MANAGER" ? propertyIds : [],
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
                    <Select value={role} onChange={(e) => setRole(e.target.value)} options={roleOptions}/>
                </FormField>

                {role === "PROPERTY_MANAGER" && (
                    <FormField label="Assigned properties">
                        <PropertyChecklist properties={properties} selectedIds={propertyIds}
                                           onToggle={toggleProperty}/>
                    </FormField>
                )}

                {error && <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-600">{error}</p>}
            </form>
        </Dialog>
    )
}
