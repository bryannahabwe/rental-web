import {useState} from "react"
import {useForm} from "react-hook-form"
import {useInviteUser} from "@/hooks/useUsers"
import {useProperties} from "@/hooks/useProperties"
import useAuthStore from "@/store/authStore"
import {Button, Dialog, FormField, Input, Select, toast} from "@/components/ui"
import PropertyChecklist from "./PropertyChecklist"
import {getErrorMessage} from "@/utils/errorMessage"

const PHONE_PATTERN = {
    value: /^\+?[0-9]{10,15}$/,
    message: "Invalid phone number format",
}

export default function InviteModal({onClose}) {
    const inviteUser = useInviteUser()
    const currentRole = useAuthStore((s) => s.role)
    const {data: properties = []} = useProperties()
    const [role, setRole] = useState("PROPERTY_MANAGER")
    const [propertyIds, setPropertyIds] = useState([])
    const [error, setError] = useState("")

    const {register, handleSubmit, formState: {errors}} = useForm()

    const toggleProperty = (id) =>
        setPropertyIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))

    const roleOptions = [
        {label: "Property Manager (assigned properties only)", value: "PROPERTY_MANAGER"},
        ...(currentRole === "SUPER_ADMIN" ? [{label: "Admin (full access)", value: "ADMIN"}] : []),
    ]

    const onSubmit = async (data) => {
        setError("")
        if (role === "PROPERTY_MANAGER" && propertyIds.length === 0) {
            setError("Assign at least one property to a property manager")
            return
        }
        try {
            await inviteUser.mutateAsync({
                name: data.name,
                phoneNumber: data.phoneNumber,
                email: data.email,
                role,
                propertyIds: role === "PROPERTY_MANAGER" ? propertyIds : [],
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
