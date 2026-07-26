import {useEffect, useState} from "react"
import {useNavigate, useSearchParams} from "react-router-dom"
import {useQueryClient} from "@tanstack/react-query"
import {authService} from "@/services/authService"
import useAuthStore from "@/store/authStore"
import {getErrorMessage} from "@/utils/errorMessage"

const inputStyle = {
    width: "100%", padding: "11px 14px", fontSize: "14px",
    borderRadius: "8px", border: "1px solid #d1d5db",
    outline: "none", boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif", backgroundColor: "#fff", color: "#111827",
}
const labelStyle = {
    display: "block", fontSize: "13px", fontWeight: "500",
    color: "#374151", marginBottom: "8px",
}

export default function AcceptInvitePage() {
    const [params] = useSearchParams()
    const token = params.get("token")
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const setAuth = useAuthStore(s => s.setAuth)

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
            .then(res => setInvite(res.data))
            .catch(err => setLoadError(getErrorMessage(err, "This invite link is invalid or has expired.")))
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
            navigate(res.data.role === "PROPERTY_MANAGER" ? "/tenants" : "/dashboard", {replace: true})
        } catch (err) {
            setError(getErrorMessage(err, "Could not accept the invitation"))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: "#f8faf9", padding: "24px 16px",
        }}>
            <div style={{width: "100%", maxWidth: "440px"}}>
                <div style={{textAlign: "center", marginBottom: "32px"}}>
                    <h1 style={{fontFamily: "'DM Serif Display', serif", fontSize: "32px", color: "#0a4a38", margin: 0}}>
                        RentFlow
                    </h1>
                    <p style={{fontSize: "13px", color: "#9ca3af", marginTop: "4px"}}>Property Management</p>
                </div>

                <div style={{
                    backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e5e7eb",
                    padding: "40px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}>
                    {loadError ? (
                        <div style={{
                            backgroundColor: "#fef2f2", color: "#dc2626", fontSize: "14px",
                            padding: "14px 16px", borderRadius: "8px", borderLeft: "3px solid #ef4444",
                        }}>
                            {loadError}
                        </div>
                    ) : !invite ? (
                        <p style={{color: "#9ca3af", fontSize: "14px", textAlign: "center", margin: 0}}>
                            Loading invitation…
                        </p>
                    ) : (
                        <>
                            <div style={{marginBottom: "28px"}}>
                                <h2 style={{fontSize: "22px", fontWeight: "600", color: "#0a4a38", margin: "0 0 6px"}}>
                                    Welcome, {invite.name}
                                </h2>
                                <p style={{fontSize: "14px", color: "#9ca3af", margin: 0, lineHeight: "1.5"}}>
                                    You've been invited to join <strong>{invite.accountName}</strong>. Set a
                                    password to activate your account ({invite.email}).
                                </p>
                            </div>

                            <form onSubmit={onSubmit}>
                                <div style={{marginBottom: "20px"}}>
                                    <label style={labelStyle}>Password</label>
                                    <input type="password" value={password}
                                           onChange={e => setPassword(e.target.value)}
                                           placeholder="••••••••" style={inputStyle}
                                           onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                           onBlur={e => e.target.style.borderColor = "#d1d5db"}/>
                                </div>
                                <div style={{marginBottom: "28px"}}>
                                    <label style={labelStyle}>Confirm password</label>
                                    <input type="password" value={confirm}
                                           onChange={e => setConfirm(e.target.value)}
                                           placeholder="••••••••" style={inputStyle}
                                           onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                           onBlur={e => e.target.style.borderColor = "#d1d5db"}/>
                                </div>

                                {error && (
                                    <div style={{
                                        backgroundColor: "#fef2f2", color: "#dc2626", fontSize: "13px",
                                        padding: "10px 14px", borderRadius: "8px", marginBottom: "20px",
                                        borderLeft: "3px solid #ef4444",
                                    }}>{error}</div>
                                )}

                                <button type="submit" disabled={loading} style={{
                                    width: "100%", padding: "12px", fontSize: "14px", fontWeight: "500",
                                    backgroundColor: loading ? "#6b9e8f" : "#0F6E56",
                                    color: "#fff", border: "none", borderRadius: "8px",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    fontFamily: "'DM Sans', sans-serif",
                                }}>
                                    {loading ? "Activating…" : "Activate account"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
