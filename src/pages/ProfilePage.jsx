import {useState} from "react"
import {useForm} from "react-hook-form"
import AppShell from "@/components/layout/AppShell"
import {useUpdateMe} from "@/hooks/useUsers"
import useAuthStore from "@/store/authStore"
import {Alert, Button, Card, FormField, Input, toast} from "@/components/ui"
import {getErrorMessage} from "@/utils/errorMessage"

const PHONE_PATTERN = {
    value: /^\+?[0-9]{10,15}$/,
    message: "Invalid phone number format",
}

export default function ProfilePage() {
    const landlord = useAuthStore((s) => s.landlord)
    const updateLandlord = useAuthStore((s) => s.updateLandlord)
    const updateMe = useUpdateMe()
    const [error, setError] = useState("")

    const {register, handleSubmit, formState: {errors}} = useForm({
        values: {
            name: landlord?.name || "",
            phoneNumber: landlord?.phoneNumber || "",
        },
    })

    const onSubmit = async (data) => {
        setError("")
        try {
            const res = await updateMe.mutateAsync({
                name: data.name.trim(),
                phoneNumber: data.phoneNumber.trim(),
            })
            updateLandlord({name: res.data.name, phoneNumber: res.data.phoneNumber})
            // Replaces the self-clearing success banner the page used to
            // manage with a setTimeout.
            toast.success("Profile updated")
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    return (
        <AppShell title="My Profile" subtitle="Your name and contact details" showBack>
            <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex max-w-2xl flex-col gap-5">
                <Card title="Your Details">
                    <div className="flex flex-col gap-4">
                        <FormField label="Full name" error={errors.name?.message} required>
                            <Input {...register("name", {required: "Name is required"})}
                                   invalid={!!errors.name} placeholder="John Katende"/>
                        </FormField>

                        <FormField label="Phone number" error={errors.phoneNumber?.message} required>
                            <Input {...register("phoneNumber", {
                                required: "Phone number is required",
                                pattern: PHONE_PATTERN,
                            })}
                                   type="tel" invalid={!!errors.phoneNumber} placeholder="0771234567"/>
                        </FormField>

                        <FormField label="Email" hint="Your email is used to sign in and can't be changed here.">
                            <Input value={landlord?.email || "—"} readOnly disabled/>
                        </FormField>
                    </div>
                </Card>

                {error && <Alert>{error}</Alert>}

                <Button type="submit" size="lg" loading={updateMe.isPending}>Save changes</Button>
            </form>
        </AppShell>
    )
}
