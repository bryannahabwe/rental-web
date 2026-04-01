import {useForm} from "react-hook-form"
import {Link, useNavigate} from "react-router-dom"
import {authService} from "@/services/authService"
import {useState} from "react"

export default function RegisterPage() {
    const navigate = useNavigate()
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
            await authService.register({
                name: data.name,
                phoneNumber: data.phoneNumber,
                email: data.email || null,
                password: data.password,
            })
            navigate("/login")
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed")
        } finally {
            setLoading(false)
        }
    }

    const inputStyle = {
        width: "100%", padding: "11px 14px", fontSize: "14px",
        borderRadius: "8px", border: "1px solid #d1d5db",
        outline: "none", boxSizing: "border-box",
        fontFamily: "'DM Sans', sans-serif",
        backgroundColor: "#fff", color: "#111827",
        transition: "border-color 0.2s",
    }

    const labelStyle = {
        display: "block", fontSize: "13px", fontWeight: "500",
        color: "#374151", marginBottom: "8px", letterSpacing: "0.01em",
    }

    const fieldStyle = {marginBottom: "20px"}

    const errorStyle = {fontSize: "12px", color: "#ef4444", marginTop: "5px"}

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f8faf9",
            padding: "24px 16px",
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
                            fontSize: "22px", fontWeight: "600",
                            color: "#0a4a38", margin: "0 0 6px", letterSpacing: "-0.3px",
                        }}>
                            Create account
                        </h2>
                        <p style={{fontSize: "14px", color: "#9ca3af", margin: 0, lineHeight: "1.5"}}>
                            Start managing your properties today
                        </p>
                    </div>

                    {/* Divider */}
                    <div style={{height: "1px", backgroundColor: "#f3f4f6", marginBottom: "28px"}}/>

                    <form onSubmit={handleSubmit(onSubmit)}>

                        {/* Full name */}
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Full Name</label>
                            <input
                                {...register("name", {required: "Name is required"})}
                                type="text"
                                placeholder="John Katende"
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                            {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
                        </div>

                        {/* Phone number */}
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Phone Number</label>
                            <input
                                {...register("phoneNumber", {required: "Phone number is required"})}
                                type="tel"
                                placeholder="0771234567"
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                            {errors.phoneNumber && <p style={errorStyle}>{errors.phoneNumber.message}</p>}
                        </div>

                        {/* Email */}
                        <div style={fieldStyle}>
                            <label style={labelStyle}>
                                Email{" "}
                                <span style={{color: "#9ca3af", fontWeight: "400"}}>(optional)</span>
                            </label>
                            <input
                                {...register("email")}
                                type="email"
                                placeholder="john@example.com"
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                        </div>

                        {/* Password */}
                        <div style={{marginBottom: "28px"}}>
                            <label style={labelStyle}>Password</label>
                            <input
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {value: 6, message: "Minimum 6 characters"},
                                })}
                                type="password"
                                placeholder="••••••••"
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                            {errors.password && <p style={errorStyle}>{errors.password.message}</p>}
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
                            {loading ? "Creating account..." : "Create account"}
                        </button>

                    </form>
                </div>

                {/* Footer */}
                <p style={{textAlign: "center", fontSize: "14px", color: "#9ca3af", marginTop: "24px"}}>
                    Already have an account?{" "}
                    <Link to="/login" style={{color: "#0F6E56", fontWeight: "500", textDecoration: "none"}}>
                        Sign in
                    </Link>
                </p>

            </div>
        </div>
    )
}