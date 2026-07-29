import {useState} from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import {useUpdateMe} from "@/hooks/useUsers"
import useAuthStore from "@/store/authStore"
import {useForm} from "react-hook-form"
import {getErrorMessage} from "@/utils/errorMessage"

const inputStyle = {
    width: "100%", padding: "10px 14px", fontSize: "14px",
    borderRadius: "8px", border: "1px solid #d1d5db",
    outline: "none", boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
    backgroundColor: "#fff", color: "#111827",
}

const labelStyle = {
    display: "block", fontSize: "13px", fontWeight: "500",
    color: "#374151", marginBottom: "6px",
}

const errorStyle = {fontSize: "12px", color: "#ef4444", marginTop: "4px"}

export default function ProfilePage() {
    const landlord = useAuthStore(s => s.landlord)
    const updateLandlord = useAuthStore(s => s.updateLandlord)
    const updateMe = useUpdateMe()
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

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
            setSuccess("Profile updated successfully")
            setTimeout(() => setSuccess(""), 3000)
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    return (
        <PageWrapper title="My Profile" showBack>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{display: "flex", flexDirection: "column", gap: "20px"}}>

                    <div style={{
                        backgroundColor: "#fff", borderRadius: "12px",
                        border: "1px solid #f0f0f0", padding: "24px",
                        display: "flex", flexDirection: "column", gap: "16px",
                    }}>
                        <p style={{fontSize: "13px", fontWeight: "600", color: "#111827", margin: 0}}>
                            Your Details
                        </p>

                        <div>
                            <label style={labelStyle}>Full name</label>
                            <input
                                {...register("name", {required: "Name is required"})}
                                style={inputStyle}
                                placeholder="John Katende"
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                            {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
                        </div>

                        <div>
                            <label style={labelStyle}>Phone number</label>
                            <input
                                {...register("phoneNumber", {
                                    required: "Phone number is required",
                                    pattern: {
                                        value: /^\+?[0-9]{10,15}$/,
                                        message: "Invalid phone number format",
                                    },
                                })}
                                type="tel"
                                style={inputStyle}
                                placeholder="0771234567"
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                            {errors.phoneNumber && <p style={errorStyle}>{errors.phoneNumber.message}</p>}
                        </div>

                        <div>
                            <label style={labelStyle}>Email</label>
                            <input value={landlord?.email || "—"} readOnly disabled
                                   style={{...inputStyle, backgroundColor: "#f9fafb", color: "#6b7280"}}/>
                            <p style={{fontSize: "12px", color: "#9ca3af", marginTop: "5px"}}>
                                Your email is used to sign in and can't be changed here.
                            </p>
                        </div>
                    </div>

                    {success && (
                        <div style={{
                            backgroundColor: "#E1F5EE", color: "#0F6E56", fontSize: "13px",
                            padding: "10px 14px", borderRadius: "8px", borderLeft: "3px solid #0F6E56",
                        }}>
                            {success}
                        </div>
                    )}
                    {error && (
                        <div style={{
                            backgroundColor: "#fef2f2", color: "#dc2626", fontSize: "13px",
                            padding: "10px 14px", borderRadius: "8px", borderLeft: "3px solid #ef4444",
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={updateMe.isPending}
                        style={{
                            padding: "12px", borderRadius: "10px", fontSize: "14px",
                            backgroundColor: updateMe.isPending ? "#6b9e8f" : "#0F6E56",
                            color: "#fff", border: "none", cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                        }}
                    >
                        {updateMe.isPending ? "Saving..." : "Save changes"}
                    </button>

                </div>
            </form>
        </PageWrapper>
    )
}
