import {useState} from "react"
import {useForm} from "react-hook-form"
import {Link, useNavigate} from "react-router-dom"
import {useQueryClient} from "@tanstack/react-query"
import {authService} from "@/services/authService"
import {settingsService} from "@/services/settingsService"
import useAuthStore from "@/store/authStore"
import useSettingsStore from "@/store/settingsStore"
import usePropertyStore from "@/store/propertyStore"
import {roleCan} from "@/lib/roles"
import AuthLayout from "@/components/layout/AuthLayout"
import {Alert, Button, FormField, Input} from "@/components/ui"
import {getErrorMessage} from "@/utils/errorMessage"

export default function LoginPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const {setAuth} = useAuthStore()
    const {setSettings} = useSettingsStore()
    const setSelectedProperty = usePropertyStore((s) => s.setSelectedProperty)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const {register, handleSubmit, formState: {errors}} = useForm()

    const onSubmit = async (data) => {
        setLoading(true)
        setError("")
        try {
            const res = await authService.login({
                username: data.username,
                password: data.password,
            })
            // Drop any cached data from a previous session so a different
            // user/account never sees the prior one's cached lists.
            queryClient.clear()
            setAuth(res.data)

            // Activate the property the API nominated. Scoped staff have no
            // "All properties" view, and this is the property whose role the
            // API falls back to — so seeding it keeps our permissions and
            // theirs pointed at the same place from the first request.
            if (res.data.defaultPropertyId) {
                setSelectedProperty(res.data.defaultPropertyId)
            }

            // Fetch and store landlord settings immediately after login so
            // branding (company name, logo) loads everywhere right away.
            try {
                const settingsRes = await settingsService.getSettings()
                setSettings(settingsRes.data)
            } catch {
                // Settings failure must not block login
            }

            // Land where this user can actually go: the Dashboard reads
            // portfolio figures, which property-scoped staff can't see.
            navigate(roleCan(res.data.role, "viewReports") ? "/dashboard" : "/tenants",
                {replace: true})
        } catch (err) {
            setError(getErrorMessage(err, "Invalid credentials"))
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to continue to your account"
            footer={
                <>
                    Don&apos;t have an account?{" "}
                    <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
                        Register
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <FormField label="Phone Number or Email" error={errors.username?.message}>
                    <Input
                        {...register("username", {required: "This field is required"})}
                        invalid={!!errors.username}
                        autoComplete="username"
                        placeholder="0771234567"
                    />
                </FormField>

                <FormField label="Password" error={errors.password?.message}>
                    <Input
                        {...register("password", {required: "Password is required"})}
                        type="password"
                        invalid={!!errors.password}
                        autoComplete="current-password"
                        placeholder="••••••••"
                    />
                </FormField>

                {error && <Alert>{error}</Alert>}

                <Button type="submit" block size="lg" loading={loading}>Sign in</Button>
            </form>
        </AuthLayout>
    )
}
