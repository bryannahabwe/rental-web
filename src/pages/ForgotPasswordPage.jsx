import {useState} from "react"
import {useForm} from "react-hook-form"
import {Link} from "react-router-dom"
import {authService} from "@/services/authService"
import AuthLayout from "@/components/layout/AuthLayout"
import {Alert, Button, FormField, Input} from "@/components/ui"
import {getErrorMessage} from "@/utils/errorMessage"

export default function ForgotPasswordPage() {
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const {register, handleSubmit, formState: {errors}} = useForm()

    const onSubmit = async (data) => {
        setLoading(true)
        setError("")
        try {
            await authService.requestPasswordReset({email: data.email})
            // Always show the same confirmation — the API deliberately doesn't
            // reveal whether the email is registered.
            setSent(true)
        } catch (err) {
            setError(getErrorMessage(err, "Could not send the reset link"))
        } finally {
            setLoading(false)
        }
    }

    const backToSignIn = (
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Back to sign in
        </Link>
    )

    if (sent) {
        return (
            <AuthLayout title="Check your email" footer={backToSignIn}>
                <Alert variant="success">
                    If that email is registered, we&apos;ve sent a link to reset your password.
                    The link expires in 1 hour.
                </Alert>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout
            title="Forgot password"
            subtitle="Enter your account email and we'll send you a reset link."
            footer={backToSignIn}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <FormField label="Email" error={errors.email?.message}>
                    <Input
                        {...register("email", {required: "Email is required"})}
                        type="email"
                        invalid={!!errors.email}
                        autoComplete="email"
                        placeholder="you@example.com"
                    />
                </FormField>

                {error && <Alert>{error}</Alert>}

                <Button type="submit" block size="lg" loading={loading}>Send reset link</Button>
            </form>
        </AuthLayout>
    )
}
