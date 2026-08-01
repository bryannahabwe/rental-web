import {useState} from "react"
import {useForm} from "react-hook-form"
import {Link, useNavigate} from "react-router-dom"
import {authService} from "@/services/authService"
import AuthLayout from "@/components/layout/AuthLayout"
import {Button, FormField, Input, toast} from "@/components/ui"
import {getErrorMessage} from "@/utils/errorMessage"

export default function RegisterPage() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const {register, handleSubmit, formState: {errors}} = useForm()

    const onSubmit = async (data) => {
        setLoading(true)
        setError("")
        try {
            await authService.register({
                name: data.name,
                phoneNumber: data.phoneNumber,
                email: data.email || null,
                password: data.password,
                propertyName: data.propertyName?.trim() || null,
            })
            toast.success("Account created", "Sign in to get started.")
            navigate("/login")
        } catch (err) {
            setError(getErrorMessage(err, "Registration failed"))
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Create account"
            subtitle="Set up your property management workspace"
            footer={
                <>
                    Already have an account?{" "}
                    <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
                        Sign in
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <FormField label="Full Name" error={errors.name?.message} required>
                    <Input {...register("name", {required: "Name is required"})}
                           invalid={!!errors.name} autoComplete="name" placeholder="John Katende"/>
                </FormField>

                <FormField label="Property Name" hint="Optional — you can add properties later.">
                    <Input {...register("propertyName")} placeholder="e.g. Nansana Apartments"/>
                </FormField>

                <FormField label="Phone Number" error={errors.phoneNumber?.message} required>
                    <Input {...register("phoneNumber", {required: "Phone number is required"})}
                           type="tel" invalid={!!errors.phoneNumber} autoComplete="tel"
                           placeholder="0771234567"/>
                </FormField>

                <FormField label="Email" hint="Optional">
                    <Input {...register("email")} type="email" autoComplete="email"
                           placeholder="john@example.com"/>
                </FormField>

                <FormField label="Password" error={errors.password?.message} required>
                    <Input
                        {...register("password", {
                            required: "Password is required",
                            minLength: {value: 6, message: "Minimum 6 characters"},
                        })}
                        type="password"
                        invalid={!!errors.password}
                        autoComplete="new-password"
                        placeholder="••••••••"
                    />
                </FormField>

                {error && <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-600">{error}</p>}

                <Button type="submit" block size="lg" loading={loading}>Create account</Button>
            </form>
        </AuthLayout>
    )
}
