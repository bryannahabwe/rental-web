import {useState} from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import {useCreateProperty, useDeleteProperty, useProperties, useUpdateProperty} from "@/hooks/useProperties"
import useAuthStore from "@/store/authStore"
import {useForm} from "react-hook-form"
import {Building2, Home, Pencil, Plus, Trash2, Users, X} from "lucide-react"
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

const nullIfEmpty = (val) => (val === "" || val === undefined) ? null : val

function PropertyModal({property, onClose}) {
    const isEdit = !!property
    const createProperty = useCreateProperty()
    const updateProperty = useUpdateProperty()
    const [error, setError] = useState("")

    const {register, handleSubmit, formState: {errors}} = useForm({
        defaultValues: property ? {
            name: property.name,
            address: property.address,
            description: property.description,
        } : {},
    })

    const onSubmit = async (data) => {
        setError("")
        try {
            const payload = {
                name: data.name,
                address: nullIfEmpty(data.address),
                description: nullIfEmpty(data.description),
            }
            if (isEdit) {
                await updateProperty.mutateAsync({id: property.id, data: payload})
            } else {
                await createProperty.mutateAsync(payload)
            }
            onClose()
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    const loading = createProperty.isPending || updateProperty.isPending

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
                maxHeight: "90vh", overflowY: "auto",
            }}>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "20px 24px", borderBottom: "1px solid #f3f4f6",
                    position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1,
                }}>
                    <h2 style={{fontSize: "16px", fontWeight: "600", color: "#111827", margin: 0}}>
                        {isEdit ? "Edit Property" : "Add New Property"}
                    </h2>
                    <button onClick={onClose} style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#9ca3af", padding: "4px",
                    }}>
                        <X size={20}/>
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{padding: "24px", display: "flex", flexDirection: "column", gap: "16px"}}>
                        <div>
                            <label style={labelStyle}>Property name</label>
                            <input
                                {...register("name", {required: "Property name is required"})}
                                style={inputStyle} placeholder="e.g. Nansana Apartments"
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                            {errors.name && (
                                <p style={{fontSize: "12px", color: "#ef4444", marginTop: "4px"}}>
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label style={labelStyle}>
                                Address{" "}
                                <span style={{color: "#9ca3af", fontWeight: "400"}}>(optional)</span>
                            </label>
                            <input
                                {...register("address")}
                                style={inputStyle} placeholder="e.g. Nansana, Wakiso"
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>
                                Description{" "}
                                <span style={{color: "#9ca3af", fontWeight: "400"}}>(optional)</span>
                            </label>
                            <textarea
                                {...register("description")} rows={3}
                                style={{...inputStyle, resize: "vertical"}}
                                placeholder="A short note about this property..."
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
                            {loading ? "Saving..." : isEdit ? "Save changes" : "Add property"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function DeleteConfirm({property, onClose}) {
    const deleteProperty = useDeleteProperty()
    const [error, setError] = useState("")

    const handleDelete = async () => {
        setError("")
        try {
            await deleteProperty.mutateAsync(property.id)
            onClose()
        } catch (err) {
            setError(getErrorMessage(err, "Could not delete property"))
        }
    }

    return (
        <div style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 200, padding: "16px",
        }}>
            <div style={{
                backgroundColor: "#fff", borderRadius: "16px",
                width: "100%", maxWidth: "400px",
                padding: "28px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}>
                <h2 style={{fontSize: "16px", fontWeight: "600", color: "#111827", margin: "0 0 8px"}}>
                    Delete property?
                </h2>
                <p style={{fontSize: "14px", color: "#6b7280", margin: "0 0 20px", lineHeight: "1.5"}}>
                    Are you sure you want to delete <strong>{property.name}</strong>? A property with
                    units or tenants can't be deleted.
                </p>
                {error && (
                    <div style={{
                        backgroundColor: "#fef2f2", color: "#dc2626", fontSize: "13px",
                        padding: "10px 14px", borderRadius: "8px", marginBottom: "16px",
                        borderLeft: "3px solid #ef4444",
                    }}>
                        {error}
                    </div>
                )}
                <div style={{display: "flex", gap: "10px", justifyContent: "flex-end"}}>
                    <button onClick={onClose} style={{
                        padding: "9px 18px", borderRadius: "8px", fontSize: "14px",
                        border: "1px solid #e5e7eb", backgroundColor: "#fff",
                        color: "#374151", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    }}>
                        Cancel
                    </button>
                    <button onClick={handleDelete} disabled={deleteProperty.isPending} style={{
                        padding: "9px 20px", borderRadius: "8px", fontSize: "14px",
                        backgroundColor: "#dc2626", color: "#fff", border: "none",
                        cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                    }}>
                        {deleteProperty.isPending ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function PropertiesPage() {
    const {data: properties = [], isLoading} = useProperties()
    const [showModal, setShowModal] = useState(false)
    const [editProperty, setEditProperty] = useState(null)
    const [deleteProperty, setDeleteProperty] = useState(null)
    const canDelete = useAuthStore((s) => s.role === "SUPER_ADMIN")

    const actions = (
        <button onClick={() => setShowModal(true)} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "9px 16px", borderRadius: "8px", fontSize: "14px",
            backgroundColor: "#0F6E56", color: "#fff", border: "none",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
        }}>
            <Plus size={16}/> Add Property
        </button>
    )

    const mobileAction = (
        <button onClick={() => setShowModal(true)} style={{
            width: "54px", height: "54px", borderRadius: "50%",
            backgroundColor: "#0F6E56", color: "#fff", border: "none",
            cursor: "pointer", fontSize: "28px", fontWeight: "300",
            boxShadow: "0 4px 16px rgba(15,110,86,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
        }}>
            +
        </button>
    )

    return (
        <PageWrapper title="Properties" actions={actions} mobileAction={mobileAction} showBack>
            {isLoading ? (
                <div style={{padding: "60px", textAlign: "center", color: "#9ca3af", fontSize: "14px"}}>
                    Loading properties...
                </div>
            ) : properties.length === 0 ? (
                <div style={{
                    backgroundColor: "#fff", borderRadius: "12px",
                    border: "1px solid #f0f0f0", padding: "60px", textAlign: "center",
                }}>
                    <p style={{color: "#9ca3af", fontSize: "14px", marginBottom: "16px"}}>
                        No properties yet.
                    </p>
                    <button onClick={() => setShowModal(true)} style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        padding: "9px 16px", borderRadius: "8px", fontSize: "14px",
                        backgroundColor: "#0F6E56", color: "#fff", border: "none",
                        cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    }}>
                        <Plus size={16}/> Add Property
                    </button>
                </div>
            ) : (
                <div style={{
                    display: "grid", gap: "14px",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                }}>
                    {properties.map(p => (
                        <div key={p.id} style={{
                            backgroundColor: "#fff", borderRadius: "12px",
                            border: "1px solid #f0f0f0", padding: "18px",
                            display: "flex", flexDirection: "column", gap: "12px",
                        }}>
                            <div style={{display: "flex", alignItems: "flex-start", gap: "12px"}}>
                                <div style={{
                                    width: "40px", height: "40px", borderRadius: "10px",
                                    backgroundColor: "#E1F5EE", flexShrink: 0,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <Home size={18} color="#0F6E56"/>
                                </div>
                                <div style={{flex: 1, minWidth: 0}}>
                                    <div style={{
                                        fontSize: "15px", fontWeight: "600", color: "#111827",
                                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                    }}>
                                        {p.name}
                                    </div>
                                    <div style={{fontSize: "13px", color: "#9ca3af", marginTop: "2px"}}>
                                        {p.address || "No address set"}
                                    </div>
                                </div>
                            </div>

                            <div style={{display: "flex", gap: "16px"}}>
                                <span style={{
                                    display: "flex", alignItems: "center", gap: "5px",
                                    fontSize: "13px", color: "#6b7280",
                                }}>
                                    <Building2 size={14}/> {p.unitCount} unit{p.unitCount === 1 ? "" : "s"}
                                </span>
                                <span style={{
                                    display: "flex", alignItems: "center", gap: "5px",
                                    fontSize: "13px", color: "#6b7280",
                                }}>
                                    <Users size={14}/> {p.tenantCount} tenant{p.tenantCount === 1 ? "" : "s"}
                                </span>
                            </div>

                            <div style={{
                                display: "flex", gap: "8px", marginTop: "2px",
                                borderTop: "1px solid #f3f4f6", paddingTop: "12px",
                            }}>
                                <button onClick={() => setEditProperty(p)} style={{
                                    flex: 1, padding: "8px", borderRadius: "8px", fontSize: "13px",
                                    border: "1px solid #e5e7eb", backgroundColor: "#fff",
                                    color: "#374151", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                                    fontFamily: "'DM Sans', sans-serif",
                                }}>
                                    <Pencil size={13}/> Edit
                                </button>
                                {canDelete && (
                                    <button onClick={() => setDeleteProperty(p)} style={{
                                        flex: 1, padding: "8px", borderRadius: "8px", fontSize: "13px",
                                        border: "1px solid #fee2e2", backgroundColor: "#fff",
                                        color: "#dc2626", cursor: "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                                        fontFamily: "'DM Sans', sans-serif",
                                    }}>
                                        <Trash2 size={13}/> Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && <PropertyModal onClose={() => setShowModal(false)}/>}
            {editProperty && <PropertyModal property={editProperty} onClose={() => setEditProperty(null)}/>}
            {deleteProperty && <DeleteConfirm property={deleteProperty} onClose={() => setDeleteProperty(null)}/>}
        </PageWrapper>
    )
}
