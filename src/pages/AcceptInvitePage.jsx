import {useEffect, useState} from "react"
import {useNavigate, useSearchParams} from "react-router-dom"
import {useQueryClient} from "@tanstack/react-query"
import {authService} from "@/services/authService"
import useAuthStore from "@/store/authStore"
import usePropertyStore from "@/store/propertyStore"
import {roleCan} from "@/lib/roles"
import AuthLayout from "@/components/layout/AuthLayout"
import {Alert, Button, FormField, Input, LoadingPanel} from "@/components/ui"
import {getErrorMessage} from "@/utils/errorMessage"

export default function AcceptInvitePage() {
    const [params] = useSearchParams()
    const token = params.get("token")
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const setAuth = useAuthStore((s) => s.setAuth)
    const setSelectedProperty = usePropertyStore((s) => s.setSelectedProperty)

    const [invite, setInvite] = useState(null)
    const [loadError, setLoadError] = useState("")
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!token) {
            setLoadError("This invite link is missing its token.")
            return
        }
        authService.getInvite(token)
            .then((res) => setInvite(res.data))
            .catch((err) => setLoadError(getErrorMessage(err, "This invite link is invalid or has expired.")))
    }, [token])

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
            const res = await authService.acceptInvite({token, password})
            queryClient.clear()
            setAuth(res.data)
            // Activate the property the API nominated — scoped staff have no
            // "All properties" view to fall back on.
            if (res.data.defaultPropertyId) {
                setSelectedProperty(res.data.defaultPropertyId)
            }
            navigate(roleCan(res.data.role, "viewReports") ? "/dashboard" : "/tenants",
                {replace: true})
        } catch (err) {
            setError(getErrorMessage(err, "Could not accept the invitation"))
        } finally {
            setLoading(false)
        }
    }

    if (loadError) {
        return (
            <AuthLayout title="Invitation problem">
                <p className="rounded-lg bg-danger-50 px-3 py-2.5 text-sm text-danger-600">{loadError}</p>
            </AuthLayout>
        )
    }

    if (!invite) {
        return (
            <AuthLayout title="Checking your invitation">
                <LoadingPanel message="One moment…"/>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout
            title={`Welcome, ${invite.name}`}
            subtitle={
                <>
                    You&apos;ve been invited to join{" "}
                    <strong className="font-medium text-neutral-70">{invite.accountName}</strong>. Set a password
                    to activate your account ({invite.email}).
                </>
            }
        >
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <FormField label="Password" hint="At least 6 characters">
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

                <Button type="submit" block size="lg" loading={loading}>Activate account</Button>
            </form>
        </AuthLayout>
    )
}
