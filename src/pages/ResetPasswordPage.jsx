import {useState} from "react"
import {Link, useNavigate, useSearchParams} from "react-router-dom"
import {useQueryClient} from "@tanstack/react-query"
import {authService} from "@/services/authService"
import useAuthStore from "@/store/authStore"
import usePropertyStore from "@/store/propertyStore"
import {roleCan} from "@/lib/roles"
import AuthLayout from "@/components/layout/AuthLayout"
import {Alert, Button, FormField, Input} from "@/components/ui"
import {getErrorMessage} from "@/utils/errorMessage"

export default function ResetPasswordPage() {
    const [params] = useSearchParams()
    const token = params.get("token")
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const setAuth = useAuthStore((s) => s.setAuth)
    const setSelectedProperty = usePropertyStore((s) => s.setSelectedProperty)

    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const onSubmit = async (e) => {
        e.preventDefault()
        setError("")
        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }
        if (password !== confirm) {
            setError("Passwords do not match")
            return
        }
        setLoading(true)
        try {
            const res = await authService.resetPassword({token, password})
            // The reset logs the user straight in.
            queryClient.clear()
            setAuth(res.data)
            if (res.data.defaultPropertyId) {
                setSelectedProperty(res.data.defaultPropertyId)
            }
            navigate(roleCan(res.data.role, "viewReports") ? "/dashboard" : "/tenants",
                {replace: true})
        } catch (err) {
            setError(getErrorMessage(err, "Could not reset your password"))
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <AuthLayout
                title="Reset link problem"
                footer={
                    <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-700">
                        Request a new link
                    </Link>
                }
            >
                <p className="rounded-lg bg-danger-50 px-3 py-2.5 text-sm text-danger-600">
                    This reset link is missing its token.
                </p>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout
            title="Set a new password"
            subtitle="Choose a new password for your account."
            footer={
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
                    Back to sign in
                </Link>
            }
        >
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <FormField label="New password" hint="At least 6 characters">
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        placeholder="••••••••"
                    />
                </FormField>

                <FormField label="Confirm password">
                    <Input
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        autoComplete="new-password"
                        placeholder="••••••••"
                    />
                </FormField>

                {error && <Alert>{error}</Alert>}

                <Button type="submit" block size="lg" loading={loading}>Reset password</Button>
            </form>
        </AuthLayout>
    )
}
