import {useForm} from "react-hook-form"
import {Link, useNavigate} from "react-router-dom"
import {authService} from "@/services/authService"
import useAuthStore from "@/store/authStore"
import {useState} from "react"

export default function LoginPage() {
    const navigate = useNavigate()
    const {setTokens, setLandlord} = useAuthStore()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm()

    const onSubmit = async (data) => {
        setLoading(true)
        setError("")
        try {
            const res = await authService.login({
                username: data.username,
                password: data.password,
            })
            const {accessToken, refreshToken, name, phoneNumber, email} = res.data
            setTokens(accessToken, refreshToken)
            setLandlord({name, phoneNumber, email})
            navigate("/dashboard", {replace: true})
        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f8faf9",
            padding: "16px",
        }}>
            <div style={{width: "100%", maxWidth: "440px"}}>

                {/* Logo */}
                <div style={{textAlign: "center", marginBottom: "32px"}}>
                    <h1 style={{
                        fontFamily: "'DM Serif Display', serif",
                        fontSize: "32px",
                        color: "#0a4a38",
                        margin: 0,
                    }}>RentFlow</h1>
                    <p style={{fontSize: "13px", color: "#9ca3af", marginTop: "4px"}}>
                        Property Management
                    </p>
                </div>

                {/* Card */}
                {/* Card */}
                <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #e5e7eb",
                    padding: "40px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}>
                    {/* Header */}
                    <div style={{marginBottom: "32px"}}>
                        <h2 style={{
                            fontSize: "22px",
                            fontWeight: "600",
                            color: "#0a4a38",
                            margin: "0 0 6px",
                            letterSpacing: "-0.3px",
                        }}>
                            Welcome back
                        </h2>
                        <p style={{fontSize: "14px", color: "#9ca3af", margin: 0, lineHeight: "1.5"}}>
                            Sign in to continue to your account
                        </p>
                    </div>

                    {/* Divider */}
                    <div style={{height: "1px", backgroundColor: "#f3f4f6", marginBottom: "28px"}}/>

                    <form onSubmit={handleSubmit(onSubmit)}>

                        {/* Username */}
                        <div style={{marginBottom: "20px"}}>
                            <label style={{
                                display: "block",
                                fontSize: "13px",
                                fontWeight: "500",
                                color: "#374151",
                                marginBottom: "8px",
                                letterSpacing: "0.01em",
                            }}>
                                Phone Number or Email
                            </label>
                            <input
                                {...register("username", {required: "This field is required"})}
                                type="text"
                                placeholder="0771234567"
                                style={{
                                    width: "100%", padding: "11px 14px", fontSize: "14px",
                                    borderRadius: "8px", border: "1px solid #d1d5db",
                                    outline: "none", boxSizing: "border-box",
                                    fontFamily: "'DM Sans', sans-serif",
                                    backgroundColor: "#fff", color: "#111827",
                                    transition: "border-color 0.2s",
                                }}
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                            {errors.username && (
                                <p style={{fontSize: "12px", color: "#ef4444", marginTop: "5px"}}>
                                    {errors.username.message}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div style={{marginBottom: "28px"}}>
                            <label style={{
                                display: "block",
                                fontSize: "13px",
                                fontWeight: "500",
                                color: "#374151",
                                marginBottom: "8px",
                                letterSpacing: "0.01em",
                            }}>
                                Password
                            </label>
                            <input
                                {...register("password", {required: "Password is required"})}
                                type="password"
                                placeholder="••••••••"
                                style={{
                                    width: "100%", padding: "11px 14px", fontSize: "14px",
                                    borderRadius: "8px", border: "1px solid #d1d5db",
                                    outline: "none", boxSizing: "border-box",
                                    fontFamily: "'DM Sans', sans-serif",
                                    backgroundColor: "#fff", color: "#111827",
                                    transition: "border-color 0.2s",
                                }}
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                            {errors.password && (
                                <p style={{fontSize: "12px", color: "#ef4444", marginTop: "5px"}}>
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{
                                backgroundColor: "#fef2f2", color: "#dc2626", fontSize: "13px",
                                padding: "10px 14px", borderRadius: "8px", marginBottom: "20px",
                                borderLeft: "3px solid #ef4444",
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%", padding: "12px", fontSize: "14px", fontWeight: "500",
                                backgroundColor: loading ? "#6b9e8f" : "#0F6E56",
                                color: "#fff", border: "none", borderRadius: "8px",
                                cursor: loading ? "not-allowed" : "pointer",
                                fontFamily: "'DM Sans', sans-serif",
                                letterSpacing: "0.01em",
                                transition: "background-color 0.2s",
                            }}
                            onMouseEnter={e => {
                                if (!loading) e.target.style.backgroundColor = "#0a4a38"
                            }}
                            onMouseLeave={e => {
                                if (!loading) e.target.style.backgroundColor = "#0F6E56"
                            }}
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>

                    </form>
                </div>

                {/* Footer */}
                <p style={{textAlign: "center", fontSize: "14px", color: "#9ca3af", marginTop: "24px"}}>
                    Don't have an account?{" "}
                    <Link to="/register" style={{color: "#0F6E56", fontWeight: "500", textDecoration: "none"}}>
                        Register
                    </Link>
                </p>

            </div>
        </div>
    )
}