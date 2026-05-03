import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import PageWrapper from "@/components/layout/PageWrapper"
import { useSettings, useUpdateSettings, useUploadLogo } from "@/hooks/useSettings"
import { useForm } from "react-hook-form"
import { Camera, X } from "lucide-react"

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

export default function BusinessProfilePage() {
    const { data: settings, isLoading } = useSettings()
    const updateSettings = useUpdateSettings()
    const uploadLogo = useUploadLogo()
    const fileInputRef = useRef(null)
    const [preview, setPreview] = useState(null)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { register, handleSubmit } = useForm({
        values: {
            companyName: settings?.companyName || "",
            address: settings?.address || "",
        },
    })

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file")
            return
        }

        // Validate file size — max 5MB
        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be under 5MB")
            return
        }

        // Show preview immediately
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target.result)
        reader.readAsDataURL(file)

        // Upload to Cloudinary via backend
        try {
            setError("")
            const formData = new FormData()
            formData.append("file", file)
            await uploadLogo.mutateAsync(formData)
            setSuccess("Logo uploaded successfully")
            setTimeout(() => setSuccess(""), 3000)
        } catch (err) {
            setError(err.response?.data?.message || "Logo upload failed")
            setPreview(null)
        }
    }

    const onSubmit = async (data) => {
        setError("")
        try {
            await updateSettings.mutateAsync({
                companyName: data.companyName || null,
                address: data.address || null,
            })
            setSuccess("Profile updated successfully")
            setTimeout(() => setSuccess(""), 3000)
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong")
        }
    }

    const currentLogo = preview || settings?.logoUrl

    return (
        <PageWrapper title="Business Profile" showBack>
            {isLoading ? (
                <div style={{ textAlign: "center", color: "#9ca3af", padding: "60px 0" }}>
                    Loading...
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                        {/* Logo upload */}
                        <div style={{
                            backgroundColor: "#fff", borderRadius: "12px",
                            border: "1px solid #f0f0f0", padding: "24px",
                            display: "flex", flexDirection: "column",
                            alignItems: "center", gap: "16px",
                        }}>
                            <p style={{
                                fontSize: "13px", fontWeight: "600", color: "#111827",
                                alignSelf: "flex-start",
                            }}>
                                Company Logo
                            </p>

                            {/* Logo preview */}
                            <div style={{ position: "relative" }}>
                                {currentLogo ? (
                                    <div style={{ position: "relative" }}>
                                        <img
                                            src={currentLogo}
                                            alt="Logo"
                                            style={{
                                                width: "120px", height: "120px",
                                                borderRadius: "16px", objectFit: "contain",
                                                border: "1px solid #f0f0f0",
                                                backgroundColor: "#f9fafb",
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPreview(null)
                                                fileInputRef.current.value = ""
                                            }}
                                            style={{
                                                position: "absolute", top: "-8px", right: "-8px",
                                                width: "24px", height: "24px", borderRadius: "50%",
                                                backgroundColor: "#dc2626", border: "none",
                                                cursor: "pointer", display: "flex",
                                                alignItems: "center", justifyContent: "center",
                                            }}
                                        >
                                            <X size={12} color="#fff" />
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{
                                        width: "120px", height: "120px", borderRadius: "16px",
                                        backgroundColor: "#f9fafb", border: "2px dashed #e5e7eb",
                                        display: "flex", flexDirection: "column",
                                        alignItems: "center", justifyContent: "center", gap: "8px",
                                    }}>
                                        <Camera size={28} color="#9ca3af" />
                                        <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                      No logo
                    </span>
                                    </div>
                                )}
                            </div>

                            {/* Upload button */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadLogo.isPending}
                                style={{
                                    padding: "9px 20px", borderRadius: "8px", fontSize: "13px",
                                    border: "1px solid #e5e7eb", backgroundColor: "#fff",
                                    color: "#374151", cursor: "pointer",
                                    fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                                }}
                            >
                                {uploadLogo.isPending ? "Uploading..." : currentLogo ? "Change Logo" : "Upload Logo"}
                            </button>
                            <p style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center" }}>
                                PNG, JPG or SVG · Max 5MB
                                <br />
                                Cloudinary will resize to fit automatically
                            </p>
                        </div>

                        {/* Company details */}
                        <div style={{
                            backgroundColor: "#fff", borderRadius: "12px",
                            border: "1px solid #f0f0f0", padding: "24px",
                            display: "flex", flexDirection: "column", gap: "16px",
                        }}>
                            <p style={{ fontSize: "13px", fontWeight: "600", color: "#111827", margin: 0 }}>
                                Company Details
                            </p>

                            <div>
                                <label style={labelStyle}>Company / Property name</label>
                                <input
                                    {...register("companyName")}
                                    style={inputStyle}
                                    placeholder="e.g. Nahabwe Properties"
                                    onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                    onBlur={e => e.target.style.borderColor = "#d1d5db"}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Address</label>
                                <textarea
                                    {...register("address")}
                                    rows={3}
                                    style={{ ...inputStyle, resize: "vertical" }}
                                    placeholder="e.g. Kamwokya, Kampala, Uganda"
                                    onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                    onBlur={e => e.target.style.borderColor = "#d1d5db"}
                                />
                            </div>
                        </div>

                        {/* Success / Error */}
                        {success && (
                            <div style={{
                                backgroundColor: "#E1F5EE", color: "#0F6E56", fontSize: "13px",
                                padding: "10px 14px", borderRadius: "8px",
                                borderLeft: "3px solid #0F6E56",
                            }}>
                                {success}
                            </div>
                        )}
                        {error && (
                            <div style={{
                                backgroundColor: "#fef2f2", color: "#dc2626", fontSize: "13px",
                                padding: "10px 14px", borderRadius: "8px",
                                borderLeft: "3px solid #ef4444",
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Save */}
                        <button
                            type="submit"
                            disabled={updateSettings.isPending}
                            style={{
                                padding: "12px", borderRadius: "10px", fontSize: "14px",
                                backgroundColor: updateSettings.isPending ? "#6b9e8f" : "#0F6E56",
                                color: "#fff", border: "none", cursor: "pointer",
                                fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                            }}
                        >
                            {updateSettings.isPending ? "Saving..." : "Save changes"}
                        </button>

                    </div>
                </form>
            )}
        </PageWrapper>
    )
}