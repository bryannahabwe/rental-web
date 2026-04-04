import {useEffect, useState} from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import {useCreateTenant, useDeleteTenant, useTenants, useUpdateTenant} from "@/hooks/useTenants"
import {useForm} from "react-hook-form"
import {Plus, Pencil, Trash2, X, ChevronRight} from "lucide-react"
import TenantDetailSheet from "@/components/ui/TenantDetailSheet"

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

const formatUGX = (amount) =>
    amount == null ? "—" : `UGX ${Number(amount).toLocaleString()}`

const getMonthName = (month) =>
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1]

const nullIfEmpty = (val) => (val === "" || val === undefined) ? null : val


function StatusPill({status}) {
    if (!status) return (
        <span style={{color: "#9ca3af", fontSize: "13px"}}>No agreement</span>
    )

    const styles = {
        PAID: {bg: "#E1F5EE", color: "#0F6E56"},
        PARTIAL: {bg: "#FAEEDA", color: "#854F0B"},
        UNPAID: {bg: "#FCEBEB", color: "#A32D2D"},
    }

    const s = styles[status] || {bg: "#f3f4f6", color: "#6b7280"}

    return (
        <span style={{
            display: "inline-block", padding: "3px 10px",
            borderRadius: "20px", fontSize: "12px", fontWeight: "500",
            backgroundColor: s.bg, color: s.color,
        }}>
      {status}
    </span>
    )
}

function TenantModal({tenant, onClose}) {
    const isEdit = !!tenant
    const createTenant = useCreateTenant()
    const updateTenant = useUpdateTenant()
    const [error, setError] = useState("")

    const {register, handleSubmit, formState: {errors}} = useForm({
        defaultValues: tenant || {},
    })

    const onSubmit = async (data) => {
        setError("")
        try {
            if (isEdit) {
                await updateTenant.mutateAsync({
                    id: tenant.id, data: {
                        name: data.name,
                        phone: data.phone,
                        email: nullIfEmpty(data.email),
                        address: nullIfEmpty(data.address),
                    }
                })
            } else {
                await createTenant.mutateAsync({
                    name: data.name,
                    phone: data.phone,
                    email: nullIfEmpty(data.email),
                    address: nullIfEmpty(data.address),
                })
            }
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong")
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
                    <h2 style={{fontSize: "16px", fontWeight: "600", color: "#111827", margin: 0}}>
                        {isEdit ? "Edit Tenant" : "Add New Tenant"}
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
                            <label style={labelStyle}>Full name</label>
                            <input
                                {...register("name", {required: "Name is required"})}
                                style={inputStyle} placeholder="Jane Namukasa"
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
                            <label style={labelStyle}>Phone number</label>
                            <input
                                {...register("phone", {required: "Phone is required"})}
                                style={inputStyle} placeholder="0771234567"
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                            {errors.phone && (
                                <p style={{fontSize: "12px", color: "#ef4444", marginTop: "4px"}}>
                                    {errors.phone.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label style={labelStyle}>
                                Email{" "}
                                <span style={{color: "#9ca3af", fontWeight: "400"}}>(optional)</span>
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
                                <span style={{color: "#9ca3af", fontWeight: "400"}}>(optional)</span>
                            </label>
                            <textarea
                                {...register("address")} rows={2}
                                style={{...inputStyle, resize: "vertical"}}
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

function DeleteConfirm({tenant, onClose}) {
    const deleteTenant = useDeleteTenant()
    const [error, setError] = useState("")

    const handleDelete = async () => {
        try {
            await deleteTenant.mutateAsync(tenant.id)
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || "Could not delete tenant")
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
                    Delete tenant?
                </h2>
                <p style={{fontSize: "14px", color: "#6b7280", margin: "0 0 20px", lineHeight: "1.5"}}>
                    Are you sure you want to delete <strong>{tenant.name}</strong>? This cannot be undone.
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
                    <button onClick={handleDelete} disabled={deleteTenant.isPending} style={{
                        padding: "9px 20px", borderRadius: "8px", fontSize: "14px",
                        backgroundColor: "#dc2626", color: "#fff", border: "none",
                        cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                    }}>
                        {deleteTenant.isPending ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function TenantsPage() {
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [showModal, setShowModal] = useState(false)
    const [editTenant, setEditTenant] = useState(null)
    const [deleteTenant, setDeleteTenant] = useState(null)
    const [selectedTenantId, setSelectedTenantId] = useState(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(0)
        }, 400)
        return () => clearTimeout(timer)
    }, [search])

    const {data, isLoading} = useTenants({
        page, size: 10, sortBy: "createdAt", sortDir: "desc",
        search: debouncedSearch || undefined,
    })

    // Client-side filter by payment status
    const allTenants = data?.content || []
    const tenants = statusFilter === "ALL"
        ? allTenants
        : allTenants.filter(t => t.periodStatus === statusFilter ||
            (statusFilter === "NO_AGREEMENT" && !t.periodStatus))

    const totalPages = data?.totalPages || 0

// TenantsPage.jsx — inside the component
    const actions = (
        <button
            onClick={() => setShowModal(true)}
            style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "9px 16px", borderRadius: "8px", fontSize: "14px",
                backgroundColor: "#0F6E56", color: "#fff", border: "none",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
            }}
        >
            <Plus size={16}/> Add Tenant
        </button>
    )

    const mobileAction = (
        <button
            onClick={() => setShowModal(true)}
            style={{
                width: "54px", height: "54px", borderRadius: "50%",
                backgroundColor: "#0F6E56", color: "#fff", border: "none",
                cursor: "pointer", fontSize: "28px", fontWeight: "300",
                boxShadow: "0 4px 16px rgba(15,110,86,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}
        >
            +
        </button>
    )

    return (
        <PageWrapper title="Tenants" actions={actions} mobileAction={mobileAction}>

            {/* Search + status filter */}
            <div style={{
                marginBottom: "16px", display: "flex",
                gap: "12px", alignItems: "center", flexWrap: "wrap",
            }}>
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, phone or email..."
                    style={{
                        flex: 1, minWidth: "200px", maxWidth: "360px",
                        padding: "10px 14px", fontSize: "14px",
                        borderRadius: "8px", border: "1px solid #e5e7eb",
                        outline: "none", boxSizing: "border-box",
                        fontFamily: "'DM Sans', sans-serif", color: "#111827",
                        backgroundColor: "#fff",
                    }}
                    onFocus={e => e.target.style.borderColor = "#0F6E56"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                />

                {/* Payment status filter */}
                {["ALL", "PAID", "PARTIAL", "UNPAID"].map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        style={{
                            padding: "9px 14px", borderRadius: "8px", fontSize: "13px",
                            fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                            border: "1px solid",
                            borderColor: statusFilter === s ? "#0F6E56" : "#e5e7eb",
                            backgroundColor: statusFilter === s ? "#0F6E56" : "#fff",
                            color: statusFilter === s ? "#fff" : "#6b7280",
                            fontWeight: statusFilter === s ? "500" : "400",
                        }}
                    >
                        {s === "ALL" ? "All" : s}
                    </button>
                ))}

                {search && (
                    <button
                        onClick={() => setSearch("")}
                        style={{
                            padding: "10px 14px", borderRadius: "8px", fontSize: "13px",
                            border: "1px solid #e5e7eb", backgroundColor: "#fff",
                            color: "#6b7280", cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>

            <div style={{
                backgroundColor: "#fff", borderRadius: "12px",
                border: "1px solid #f0f0f0", overflow: "hidden",
            }}>
                {isLoading ? (
                    <div style={{padding: "60px", textAlign: "center", color: "#9ca3af", fontSize: "14px"}}>
                        Loading tenants...
                    </div>
                ) : tenants.length === 0 ? (
                    <div style={{padding: "60px", textAlign: "center"}}>
                        <p style={{color: "#9ca3af", fontSize: "14px", marginBottom: "16px"}}>
                            {search
                                ? `No tenants found for "${search}"`
                                : "No tenants yet. Add your first tenant to get started."}
                        </p>
                        {!search && (
                            <button
                                onClick={() => setShowModal(true)}
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: "6px",
                                    padding: "9px 16px", borderRadius: "8px", fontSize: "14px",
                                    backgroundColor: "#0F6E56", color: "#fff", border: "none",
                                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                                }}
                            >
                                <Plus size={16}/> Add Tenant
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                    {/* Desktop table */}
                    <div className="desktop-table" style={{overflow: "hidden"}}>
                        <table style={{width: "100%", borderCollapse: "collapse"}}>
                            <thead>
                            <tr style={{backgroundColor: "#f9fafb"}}>
                                {["Name", "Phone", "Unit", "Period", "Expected", "Balance", "Status", ""].map((h, i) => (
                                    <th key={i} style={{
                                        padding: "11px 20px", textAlign: "left",
                                        fontSize: "11px", fontWeight: "500", color: "#9ca3af",
                                        textTransform: "uppercase", letterSpacing: "0.05em",
                                    }}>{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {tenants.map((tenant) => (
                                <tr key={tenant.id} style={{borderTop: "1px solid #f9f9f9"}}>
                                    <td style={{
                                        padding: "14px 20px",
                                        fontSize: "14px",
                                        color: "#111827",
                                        fontWeight: "500"
                                    }}>
                                        {tenant.name}
                                    </td>
                                    <td style={{padding: "14px 20px", fontSize: "14px", color: "#6b7280"}}>
                                        {tenant.phone}
                                    </td>
                                    <td style={{padding: "14px 20px", fontSize: "14px", color: "#6b7280"}}>
                                        {tenant.currentUnit || "—"}
                                    </td>
                                    <td style={{padding: "14px 20px", fontSize: "14px", color: "#6b7280"}}>
                                        {tenant.currentPeriodMonth
                                            ? `${getMonthName(tenant.currentPeriodMonth)} ${tenant.currentPeriodYear}`
                                            : "—"}
                                    </td>
                                    <td style={{padding: "14px 20px", fontSize: "14px", color: "#6b7280"}}>
                                        {formatUGX(tenant.monthlyRent)}
                                    </td>
                                    <td style={{
                                        padding: "14px 20px", fontSize: "14px", fontWeight: "500",
                                        color: tenant.currentBalance > 0 ? "#dc2626" : "#0F6E56",
                                    }}>
                                        {tenant.currentBalance != null && (
                                            <div style={{
                                                backgroundColor: tenant.currentBalance > 0 ? "#fef2f2" : "#E1F5EE",
                                                borderRadius: "8px", padding: "10px 12px",
                                            }}>
                                                {tenant.currentBalance > 0 ? (
                                                    <>
                                                        {/* Top row — outstanding label + amount */}
                                                        <div style={{
                                                            display: "flex", alignItems: "center",
                                                            justifyContent: "space-between", marginBottom: "6px",
                                                        }}>
          <span style={{fontSize: "13px", fontWeight: "600", color: "#dc2626"}}>
            Outstanding
          </span>
                                                            <span style={{
                                                                fontSize: "13px",
                                                                fontWeight: "700",
                                                                color: "#dc2626"
                                                            }}>
            {formatUGX(tenant.currentBalance)}
          </span>
                                                        </div>

                                                        {/* Progress bar — how much has been paid */}
                                                        {(() => {
                                                            const totalOwed = Number(tenant.currentBalance) +
                                                                (Number(tenant.monthlyRent) - Number(tenant.currentBalance) > 0
                                                                    ? Number(tenant.monthlyRent) - Number(tenant.currentBalance)
                                                                    : 0)

                                                            // Calculate total ever owed from months
                                                            const monthsOwed = Math.ceil(
                                                                Number(tenant.currentBalance) / Number(tenant.monthlyRent)
                                                            )
                                                            const totalEverOwed = monthsOwed * Number(tenant.monthlyRent)
                                                            const totalPaid = totalEverOwed - Number(tenant.currentBalance)
                                                            const pct = Math.round((totalPaid / totalEverOwed) * 100)

                                                            return (
                                                                <>
                                                                    <div style={{
                                                                        height: "4px",
                                                                        borderRadius: "4px",
                                                                        backgroundColor: "#fca5a5",
                                                                        overflow: "hidden",
                                                                        marginBottom: "6px",
                                                                    }}>
                                                                        <div style={{
                                                                            height: "100%", borderRadius: "4px",
                                                                            backgroundColor: "#dc2626",
                                                                            width: `${Math.max(0, 100 - pct)}%`,
                                                                        }}/>
                                                                    </div>

                                                                    {/* Bottom row — paid vs total */}
                                                                    <div style={{
                                                                        display: "flex",
                                                                        justifyContent: "space-between",
                                                                        fontSize: "11px",
                                                                        color: "#9ca3af",
                                                                    }}>
                                                                        <span>Paid: {formatUGX(Math.max(0, totalPaid))}</span>
                                                                        <span>of {formatUGX(totalEverOwed)}</span>
                                                                    </div>
                                                                </>
                                                            )
                                                        })()}
                                                    </>
                                                ) : (
                                                    <span style={{
                                                        fontSize: "13px",
                                                        fontWeight: "500",
                                                        color: "#0F6E56"
                                                    }}>
        ✓ Fully paid up
      </span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{padding: "14px 20px"}}>
                                        <StatusPill status={tenant.periodStatus}/>
                                    </td>
                                    <td style={{padding: "14px 20px"}}>
                                        <div style={{display: "flex", gap: "8px", justifyContent: "flex-end"}}>
                                            <button
                                                onClick={() => setEditTenant(tenant)}
                                                style={{
                                                    padding: "6px 12px", borderRadius: "6px", fontSize: "13px",
                                                    border: "1px solid #e5e7eb", backgroundColor: "#fff",
                                                    color: "#374151", cursor: "pointer",
                                                    display: "flex", alignItems: "center", gap: "4px",
                                                }}
                                            >
                                                <Pencil size={13}/> Edit
                                            </button>
                                            <button
                                                onClick={() => setDeleteTenant(tenant)}
                                                style={{
                                                    padding: "6px 12px", borderRadius: "6px", fontSize: "13px",
                                                    border: "1px solid #fee2e2", backgroundColor: "#fff",
                                                    color: "#dc2626", cursor: "pointer",
                                                    display: "flex", alignItems: "center", gap: "4px",
                                                }}
                                            >
                                                <Trash2 size={13}/> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="mobile-cards" style={{display: "none", flexDirection: "column"}}>
                        {tenants.map((tenant, i) => (
                            <div
                                key={tenant.id}
                                onClick={() => setSelectedTenantId(tenant.id)}
                                style={{
                                    padding: "14px 16px",
                                    borderTop: i === 0 ? "none" : "1px solid #f3f4f6",
                                    cursor: "pointer",
                                }}
                            >
                                {/* Row 1 — name + status + chevron */}
                                <div style={{
                                    display: "flex", alignItems: "center",
                                    justifyContent: "space-between", marginBottom: "4px",
                                }}>
        <span style={{fontSize: "15px", fontWeight: "600", color: "#111827"}}>
          {tenant.name}
        </span>
                                    <div style={{display: "flex", alignItems: "center", gap: "6px"}}>
                                        <StatusPill status={tenant.periodStatus}/>
                                        <ChevronRight size={16} color="#9ca3af"/>
                                    </div>
                                </div>

                                {/* Row 2 — unit + period */}
                                <div style={{fontSize: "13px", color: "#6b7280", marginBottom: "8px"}}>
                                    {tenant.currentUnit
                                        ? `Unit ${tenant.currentUnit} · ${tenant.currentPeriodMonth
                                            ? `${getMonthName(tenant.currentPeriodMonth)} ${tenant.currentPeriodYear}`
                                            : ""}`
                                        : "No active agreement"}
                                </div>

                                {/* Row 3 — balance */}
                                {/* Row 3 — balance */}
                                {tenant.currentBalance != null && (
                                    <div style={{
                                        backgroundColor: tenant.currentBalance > 0 ? "#fef2f2" : "#E1F5EE",
                                        borderRadius: "8px", padding: "10px 12px",
                                    }}>
                                        {tenant.currentBalance > 0 ? (
                                            <>
                                                {/* Outstanding label + amount */}
                                                <div style={{
                                                    display: "flex", alignItems: "center",
                                                    justifyContent: "space-between", marginBottom: "6px",
                                                }}>
          <span style={{fontSize: "13px", fontWeight: "600", color: "#dc2626"}}>
            Outstanding
          </span>
                                                    <span
                                                        style={{fontSize: "13px", fontWeight: "700", color: "#dc2626"}}>
            {formatUGX(tenant.currentBalance)}
          </span>
                                                </div>

                                                {/* Progress bar */}
                                                {(() => {
                                                    const monthsOwed = Math.ceil(
                                                        Number(tenant.currentBalance) / Number(tenant.monthlyRent)
                                                    )
                                                    const totalEverOwed = monthsOwed * Number(tenant.monthlyRent)
                                                    const totalPaid = totalEverOwed - Number(tenant.currentBalance)
                                                    const pct = Math.round((totalPaid / totalEverOwed) * 100)

                                                    return (
                                                        <>
                                                            <div style={{
                                                                height: "4px", borderRadius: "4px",
                                                                backgroundColor: "#fca5a5", overflow: "hidden",
                                                                marginBottom: "6px",
                                                            }}>
                                                                <div style={{
                                                                    height: "100%", borderRadius: "4px",
                                                                    backgroundColor: "#dc2626",
                                                                    width: `${Math.max(0, 100 - pct)}%`,
                                                                }}/>
                                                            </div>
                                                            <div style={{
                                                                display: "flex", justifyContent: "space-between",
                                                                fontSize: "11px", color: "#9ca3af",
                                                            }}>
                                                                <span>Paid: {formatUGX(Math.max(0, totalPaid))}</span>
                                                                <span>of {formatUGX(totalEverOwed)}</span>
                                                            </div>
                                                        </>
                                                    )
                                                })()}
                                            </>
                                        ) : (
                                            <span style={{fontSize: "13px", fontWeight: "500", color: "#0F6E56"}}>
        ✓ Fully paid up
      </span>
                                        )}
                                    </div>
                                )}
                                <span style={{
                                    fontSize: "13px", fontWeight: "500",
                                    color: tenant.currentBalance > 0 ? "#dc2626" : "#0F6E56",
                                }}>
            {tenant.currentBalance > 0
                ? `Outstanding: ${formatUGX(tenant.currentBalance)}`
                : "Fully paid up"}
          </span>
                                {tenant.monthlyRent && (
                                    <span style={{fontSize: "12px", color: "#9ca3af"}}>
              of {formatUGX(tenant.monthlyRent)}
            </span>
                                )}
                            </div>
                        )}
                        {/* No Edit/Delete buttons here — they are in the detail sheet */}
                    </div>
                    ))}
                    </div>
                {totalPages > 1 && (
                    <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 20px", borderTop: "1px solid #f3f4f6",
                }}>
                <span style={{fontSize: "13px", color: "#9ca3af"}}>
                  Page {page + 1} of {totalPages}
                </span>
                <div style={{display: "flex", gap: "8px"}}>
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        style={{
                            padding: "6px 14px", borderRadius: "6px", fontSize: "13px",
                            border: "1px solid #e5e7eb", backgroundColor: "#fff",
                            color: page === 0 ? "#d1d5db" : "#374151",
                            cursor: page === 0 ? "not-allowed" : "pointer",
                        }}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= totalPages - 1}
                        style={{
                            padding: "6px 14px", borderRadius: "6px", fontSize: "13px",
                            border: "1px solid #e5e7eb", backgroundColor: "#fff",
                            color: page >= totalPages - 1 ? "#d1d5db" : "#374151",
                            cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                        }}
                    >
                        Next
                    </button>
                </div>
            </div>
            )}
        </>
    )
}
</div>

{
    showModal && <TenantModal onClose={() => setShowModal(false)}/>
}
{
    editTenant && <TenantModal tenant={editTenant} onClose={() => setEditTenant(null)}/>
}
{
    deleteTenant && <DeleteConfirm tenant={deleteTenant} onClose={() => setDeleteTenant(null)}/>
}
{
    selectedTenantId && (
        <TenantDetailSheet
            tenantId={selectedTenantId}
            onClose={() => setSelectedTenantId(null)}
            onEdit={(tenant) => setEditTenant(tenant)}
            onDelete={(tenant) => setDeleteTenant(tenant)}
        />
    )
}
</PageWrapper>
)
}