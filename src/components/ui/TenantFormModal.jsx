import { useState } from "react"
import { useCreateTenant, useUpdateTenant } from "@/hooks/useTenants"
import { useProperties } from "@/hooks/useProperties"
import usePropertyStore from "@/store/propertyStore"
import { useForm } from "react-hook-form"
import { X } from "lucide-react"
import { getErrorMessage } from "@/utils/errorMessage"

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

const nullIfEmpty = (val) => (val === "" || val === undefined) ? null : val

/** Create/edit tenant modal. Pass a `tenant` to edit; omit it to create. */
export default function TenantFormModal({ tenant, onClose }) {
    const isEdit = !!tenant
    const createTenant = useCreateTenant()
    const updateTenant = useUpdateTenant()
    const selectedPropertyId = usePropertyStore(s => s.selectedPropertyId)
    const { data: properties = [] } = useProperties()
    const [error, setError] = useState("")

    // Property the tenant belongs to — fixed on edit; the active property on
    // create, or a required choice when "All properties" is selected.
    const needsPropertyChoice = !isEdit && !selectedPropertyId

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: tenant || {},
    })

    const onSubmit = async (data) => {
        setError("")
        try {
            if (isEdit) {
                await updateTenant.mutateAsync({
                    id: tenant.id, data: {
                        propertyId: tenant.propertyId,
                        name: data.name,
                        phone: data.phone,
                        email: nullIfEmpty(data.email),
                        address: nullIfEmpty(data.address),
                    }
                })
            } else {
                await createTenant.mutateAsync({
                    propertyId: selectedPropertyId || data.propertyId,
                    name: data.name,
                    phone: data.phone,
                    email: nullIfEmpty(data.email),
                    address: nullIfEmpty(data.address),
                })
            }
            onClose()
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    const loading = createTenant.isPending || updateTenant.isPending

    return (
        <div style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 200, padding: "16px",
        }}>
            <div style={{
                backgroundColor: "#fff", borderRadius: "16px",
                width: "100%", maxWidth: "480px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "20px 24px", borderBottom: "1px solid #f3f4f6",
                }}>
                    <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: 0 }}>
                        {isEdit ? "Edit Tenant" : "Add New Tenant"}
                    </h2>
                    <button onClick={onClose} style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#9ca3af", padding: "4px",
                    }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>

                        {needsPropertyChoice && (
                            <div>
                                <label style={labelStyle}>Property</label>
                                <select
                                    {...register("propertyId", { required: "Please choose a property" })}
                                    defaultValue=""
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                    onBlur={e => e.target.style.borderColor = "#d1d5db"}
                                >
                                    <option value="" disabled>Select a property…</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                {errors.propertyId && (
                                    <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                                        {errors.propertyId.message}
                                    </p>
                                )}
                            </div>
                        )}

                        <div>
                            <label style={labelStyle}>Full name</label>
                            <input
                                {...register("name", { required: "Name is required" })}
                                style={inputStyle} placeholder="Jane Namukasa"
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                            {errors.name && (
                                <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label style={labelStyle}>Phone number</label>
                            <input
                                {...register("phone", { required: "Phone is required" })}
                                style={inputStyle} placeholder="0771234567"
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                            {errors.phone && (
                                <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                                    {errors.phone.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label style={labelStyle}>
                                Email{" "}
                                <span style={{ color: "#9ca3af", fontWeight: "400" }}>(optional)</span>
                            </label>
                            <input
                                {...register("email")} type="email"
                                style={inputStyle} placeholder="jane@example.com"
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>
                                Address{" "}
                                <span style={{ color: "#9ca3af", fontWeight: "400" }}>(optional)</span>
                            </label>
                            <textarea
                                {...register("address")} rows={2}
                                style={{ ...inputStyle, resize: "vertical" }}
                                placeholder="Previous address..."
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                        </div>

                        {error && (
                            <div style={{
                                backgroundColor: "#fef2f2", color: "#dc2626", fontSize: "13px",
                                padding: "10px 14px", borderRadius: "8px", borderLeft: "3px solid #ef4444",
                            }}>
                                {error}
                            </div>
                        )}
                    </div>

                    <div style={{
                        display: "flex", gap: "10px", justifyContent: "flex-end",
                        padding: "16px 24px", borderTop: "1px solid #f3f4f6",
                    }}>
                        <button type="button" onClick={onClose} style={{
                            padding: "9px 18px", borderRadius: "8px", fontSize: "14px",
                            border: "1px solid #e5e7eb", backgroundColor: "#fff",
                            color: "#374151", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                        }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} style={{
                            padding: "9px 20px", borderRadius: "8px", fontSize: "14px",
                            backgroundColor: loading ? "#6b9e8f" : "#0F6E56",
                            color: "#fff", border: "none", cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                        }}>
                            {loading ? "Saving..." : isEdit ? "Save changes" : "Add tenant"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
