import {useEffect, useState} from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import {useAgreements, useCreateAgreement, useMoveOut} from "@/hooks/useAgreements"
import {useAllTenants} from "@/hooks/useTenants"
import {useAllUnits} from "@/hooks/useUnits"
import {useForm} from "react-hook-form"
import {LogOut, Plus, X} from "lucide-react"

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

const formatDate = (dateStr) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-UG", {
        day: "numeric", month: "short", year: "numeric",
    })
}

function CreateAgreementModal({onClose}) {
    const createAgreement = useCreateAgreement()
    const {data: tenants = [], isLoading: tenantsLoading} = useAllTenants()
    const {data: units = [], isLoading: unitsLoading} = useAllUnits()
    const [error, setError] = useState("")
    const [tenantType, setTenantType] = useState("NEW")

    const availableUnits = units.filter(u => u.isAvailable)
    const {register, handleSubmit, watch, formState: {errors}} = useForm()
    const selectedUnitId = watch("unitId")
    const selectedUnit = units.find(u => u.id === selectedUnitId)

    const onSubmit = async (data) => {
        setError("")
        try {
            const payload = {
                tenantId: data.tenantId,
                unitId: data.unitId,
                startDate: data.startDate || null,
                rentAmount: data.rentAmount ? parseFloat(data.rentAmount) : null,
                depositAmount: data.depositAmount ? parseFloat(data.depositAmount) : null,
                tenantType,
                openingBalance: tenantType === "EXISTING" && data.openingBalance
                    ? parseFloat(data.openingBalance) : 0,
            }
            await createAgreement.mutateAsync(payload)
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong")
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
                width: "100%", maxWidth: "520px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                maxHeight: "90vh", overflowY: "auto",
            }}>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "20px 24px", borderBottom: "1px solid #f3f4f6",
                    position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1,
                }}>
                    <h2 style={{fontSize: "16px", fontWeight: "600", color: "#111827", margin: 0}}>
                        New Agreement
                    </h2>
                    <button onClick={onClose} style={{
                        background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "4px",
                    }}>
                        <X size={20}/>
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{padding: "24px", display: "flex", flexDirection: "column", gap: "16px"}}>

                        <div>
                            <label style={labelStyle}>Tenant type</label>
                            <div style={{display: "flex", gap: "8px"}}>
                                {["NEW", "EXISTING"].map(type => (
                                    <button key={type} type="button" onClick={() => setTenantType(type)} style={{
                                        flex: 1, padding: "10px", borderRadius: "8px",
                                        fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
                                        cursor: "pointer", fontWeight: "500", border: "1px solid",
                                        borderColor: tenantType === type ? "#0F6E56" : "#e5e7eb",
                                        backgroundColor: tenantType === type ? "#0F6E56" : "#fff",
                                        color: tenantType === type ? "#fff" : "#6b7280",
                                    }}>
                                        {type === "NEW" ? "New Tenant" : "Existing Tenant"}
                                    </button>
                                ))}
                            </div>
                            <p style={{fontSize: "12px", color: "#9ca3af", marginTop: "6px"}}>
                                {tenantType === "NEW"
                                    ? "Moving in fresh — full details required"
                                    : "Already living here — onboarding into the system"}
                            </p>
                        </div>

                        <div>
                            <label style={labelStyle}>Tenant</label>
                            <select
                                {...register("tenantId", {required: "Please select a tenant"})}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            >
                                <option value="">{tenantsLoading ? "Loading..." : "Select a tenant"}</option>
                                {tenants.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} — {t.phone}</option>
                                ))}
                            </select>
                            {errors.tenantId && (
                                <p style={{fontSize: "12px", color: "#ef4444", marginTop: "4px"}}>
                                    {errors.tenantId.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label style={labelStyle}>Unit</label>
                            <select
                                {...register("unitId", {required: "Please select a unit"})}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            >
                                <option value="">{unitsLoading ? "Loading..." : "Select an available unit"}</option>
                                {availableUnits.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.roomNumber} — {formatUGX(u.rentAmount)}/mo
                                    </option>
                                ))}
                            </select>
                            {errors.unitId && (
                                <p style={{fontSize: "12px", color: "#ef4444", marginTop: "4px"}}>
                                    {errors.unitId.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label style={labelStyle}>
                                Agreed rent (UGX){" "}
                                <span style={{color: "#9ca3af", fontWeight: "400"}}>
                  {selectedUnit ? `— defaults to ${formatUGX(selectedUnit.rentAmount)}` : "(optional)"}
                </span>
                            </label>
                            <input
                                {...register("rentAmount")} type="number" style={inputStyle}
                                placeholder={selectedUnit ? String(selectedUnit.rentAmount) : "Leave blank to use unit rent"}
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>
                                Move-in date{" "}
                                <span style={{color: "#9ca3af", fontWeight: "400"}}>
                  {tenantType === "NEW" ? "(required)" : "(optional)"}
                </span>
                            </label>
                            <input
                                {...register("startDate", {
                                    required: tenantType === "NEW" ? "Move-in date is required for new tenants" : false,
                                })}
                                type="date" style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                            {errors.startDate && (
                                <p style={{fontSize: "12px", color: "#ef4444", marginTop: "4px"}}>
                                    {errors.startDate.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label style={labelStyle}>
                                Deposit (UGX){" "}
                                <span style={{color: "#9ca3af", fontWeight: "400"}}>(optional)</span>
                            </label>
                            <input
                                {...register("depositAmount")} type="number" style={inputStyle}
                                placeholder="Leave blank if not applicable"
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                        </div>

                        {tenantType === "EXISTING" && (
                            <div style={{
                                backgroundColor: "#f8faf9", borderRadius: "10px",
                                border: "1px solid #e5e7eb", padding: "16px",
                            }}>
                                <label style={labelStyle}>Opening balance (UGX)</label>
                                <input
                                    {...register("openingBalance")} type="number" style={inputStyle}
                                    placeholder="0"
                                    onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                    onBlur={e => e.target.style.borderColor = "#d1d5db"}
                                />
                                <p style={{fontSize: "12px", color: "#9ca3af", marginTop: "6px", lineHeight: "1.5"}}>
                                    Positive (+) = tenant paid ahead. Negative (−) = tenant owes arrears.
                                </p>
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
                        <button type="submit" disabled={createAgreement.isPending} style={{
                            padding: "9px 20px", borderRadius: "8px", fontSize: "14px",
                            backgroundColor: createAgreement.isPending ? "#6b9e8f" : "#0F6E56",
                            color: "#fff", border: "none", cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                        }}>
                            {createAgreement.isPending ? "Creating..." : "Create agreement"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function MoveOutModal({agreement, onClose}) {
    const moveOut = useMoveOut()
    const [error, setError] = useState("")
    const {register, handleSubmit, formState: {errors}} = useForm()

    const onSubmit = async (data) => {
        setError("")
        try {
            await moveOut.mutateAsync({id: agreement.id, data: {moveOutDate: data.moveOutDate}})
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong")
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
                width: "100%", maxWidth: "420px",
                padding: "28px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}>
                <div style={{display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px"}}>
                    <div style={{
                        width: "36px", height: "36px", borderRadius: "10px",
                        backgroundColor: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <LogOut size={18} color="#dc2626"/>
                    </div>
                    <h2 style={{fontSize: "16px", fontWeight: "600", color: "#111827", margin: 0}}>
                        Record Move-Out
                    </h2>
                </div>
                <p style={{fontSize: "14px", color: "#6b7280", margin: "0 0 20px", lineHeight: "1.5"}}>
                    Move-out for <strong>{agreement.tenantName}</strong> in unit{" "}
                    <strong>{agreement.roomNumber}</strong>. This will terminate the agreement.
                </p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{marginBottom: "20px"}}>
                        <label style={labelStyle}>Move-out date</label>
                        <input
                            {...register("moveOutDate", {required: "Move-out date is required"})}
                            type="date" style={inputStyle}
                            onFocus={e => e.target.style.borderColor = "#0F6E56"}
                            onBlur={e => e.target.style.borderColor = "#d1d5db"}
                        />
                        {errors.moveOutDate && (
                            <p style={{fontSize: "12px", color: "#ef4444", marginTop: "4px"}}>
                                {errors.moveOutDate.message}
                            </p>
                        )}
                    </div>

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
                        <button type="button" onClick={onClose} style={{
                            padding: "9px 18px", borderRadius: "8px", fontSize: "14px",
                            border: "1px solid #e5e7eb", backgroundColor: "#fff",
                            color: "#374151", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                        }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={moveOut.isPending} style={{
                            padding: "9px 20px", borderRadius: "8px", fontSize: "14px",
                            backgroundColor: moveOut.isPending ? "#9ca3af" : "#dc2626",
                            color: "#fff", border: "none", cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                        }}>
                            {moveOut.isPending ? "Recording..." : "Confirm move-out"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function AgreementsPage() {
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("ACTIVE")
    const [showCreate, setShowCreate] = useState(false)
    const [moveOutAgreement, setMoveOutAgreement] = useState(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(0)
        }, 400)
        return () => clearTimeout(timer)
    }, [search])

    const {data, isLoading} = useAgreements({
        page, size: 10, sortBy: "createdAt", sortDir: "desc",
        status: statusFilter || undefined,
        search: debouncedSearch || undefined,
    })

    const agreements = data?.content || []
    const totalPages = data?.totalPages || 0

    const actions = (
        <button onClick={() => setShowCreate(true)} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "9px 16px", borderRadius: "8px", fontSize: "14px",
            backgroundColor: "#0F6E56", color: "#fff", border: "none",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
        }}>
            <Plus size={16} /> New Agreement
        </button>
    )

    const mobileAction = (
        <button onClick={() => setShowCreate(true)} style={{
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
        <PageWrapper title="Agreements" actions={actions} mobileAction={mobileAction}>

            <div style={{marginBottom: "12px"}}>
                <input
                    type="text" value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by tenant name or unit..."
                    style={{
                        width: "100%", maxWidth: "360px", padding: "10px 14px",
                        fontSize: "14px", borderRadius: "8px", border: "1px solid #e5e7eb",
                        outline: "none", boxSizing: "border-box",
                        fontFamily: "'DM Sans', sans-serif", color: "#111827", backgroundColor: "#fff",
                    }}
                    onFocus={e => e.target.style.borderColor = "#0F6E56"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                />
            </div>

            <div style={{display: "flex", gap: "8px", marginBottom: "20px"}}>
                {[
                    {label: "Active", value: "ACTIVE"},
                    {label: "Terminated", value: "TERMINATED"},
                    {label: "All", value: ""},
                ].map(s => (
                    <button key={s.value} onClick={() => {
                        setStatusFilter(s.value);
                        setPage(0)
                    }} style={{
                        padding: "7px 16px", borderRadius: "8px", fontSize: "13px",
                        fontFamily: "'DM Sans', sans-serif", cursor: "pointer", border: "1px solid",
                        borderColor: statusFilter === s.value ? "#0F6E56" : "#e5e7eb",
                        backgroundColor: statusFilter === s.value ? "#0F6E56" : "#fff",
                        color: statusFilter === s.value ? "#fff" : "#6b7280",
                        fontWeight: statusFilter === s.value ? "500" : "400",
                    }}>
                        {s.label}
                    </button>
                ))}
            </div>

            <div style={{
                backgroundColor: "#fff", borderRadius: "12px",
                border: "1px solid #f0f0f0", overflow: "hidden",
            }}>
                {isLoading ? (
                    <div style={{padding: "60px", textAlign: "center", color: "#9ca3af", fontSize: "14px"}}>
                        Loading agreements...
                    </div>
                ) : agreements.length === 0 ? (
                    <div style={{padding: "60px", textAlign: "center"}}>
                        <p style={{color: "#9ca3af", fontSize: "14px", marginBottom: "16px"}}>
                            {search ? `No agreements found for "${search}"` : "No agreements found."}
                        </p>
                        {!search && statusFilter === "ACTIVE" && (
                            <button onClick={() => setShowCreate(true)} style={{
                                display: "inline-flex", alignItems: "center", gap: "6px",
                                padding: "9px 16px", borderRadius: "8px", fontSize: "14px",
                                backgroundColor: "#0F6E56", color: "#fff", border: "none",
                                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                            }}>
                                <Plus size={16}/> New Agreement
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="desktop-table">
                            <table style={{width: "100%", borderCollapse: "collapse"}}>
                                <thead>
                                <tr style={{backgroundColor: "#f9fafb"}}>
                                    {["Tenant", "Unit", "Type", "Rent / Month", "Move-in", "Move-out", "Status", ""].map((h, i) => (
                                        <th key={i} style={{
                                            padding: "11px 20px", textAlign: "left",
                                            fontSize: "11px", fontWeight: "500", color: "#9ca3af",
                                            textTransform: "uppercase", letterSpacing: "0.05em",
                                        }}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {agreements.map((ag) => (
                                    <tr key={ag.id} style={{borderTop: "1px solid #f9f9f9"}}>
                                        <td style={{
                                            padding: "14px 20px",
                                            fontSize: "14px",
                                            color: "#111827",
                                            fontWeight: "500"
                                        }}>
                                            {ag.tenantName}
                                        </td>
                                        <td style={{padding: "14px 20px", fontSize: "14px", color: "#6b7280"}}>
                                            {ag.roomNumber}
                                        </td>
                                        <td style={{padding: "14px 20px"}}>
                        <span style={{
                            display: "inline-block", padding: "3px 10px",
                            borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                            backgroundColor: ag.tenantType === "NEW" ? "#E6F1FB" : "#FAEEDA",
                            color: ag.tenantType === "NEW" ? "#185FA5" : "#854F0B",
                        }}>
                          {ag.tenantType}
                        </span>
                                        </td>
                                        <td style={{padding: "14px 20px", fontSize: "14px", color: "#111827"}}>
                                            {formatUGX(ag.rentAmount)}
                                        </td>
                                        <td style={{padding: "14px 20px", fontSize: "14px", color: "#6b7280"}}>
                                            {formatDate(ag.startDate)}
                                        </td>
                                        <td style={{padding: "14px 20px", fontSize: "14px", color: "#6b7280"}}>
                                            {formatDate(ag.moveOutDate)}
                                        </td>
                                        <td style={{padding: "14px 20px"}}>
                        <span style={{
                            display: "inline-block", padding: "3px 10px",
                            borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                            backgroundColor: ag.status === "ACTIVE" ? "#E1F5EE" : "#f3f4f6",
                            color: ag.status === "ACTIVE" ? "#0F6E56" : "#6b7280",
                        }}>
                          {ag.status === "ACTIVE" ? "Active" : "Terminated"}
                        </span>
                                        </td>
                                        <td style={{padding: "14px 20px"}}>
                                            {ag.status === "ACTIVE" && (
                                                <button onClick={() => setMoveOutAgreement(ag)} style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                    padding: "6px 12px",
                                                    borderRadius: "6px",
                                                    fontSize: "13px",
                                                    border: "1px solid #fee2e2",
                                                    backgroundColor: "#fff",
                                                    color: "#dc2626",
                                                    cursor: "pointer",
                                                    fontFamily: "'DM Sans', sans-serif",
                                                }}>
                                                    <LogOut size={13}/> Move-out
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="mobile-cards" style={{display: "none", flexDirection: "column"}}>
                            {agreements.map((ag, i) => (
                                <div key={ag.id} style={{
                                    padding: "14px 16px",
                                    borderTop: i === 0 ? "none" : "1px solid #f3f4f6",
                                }}>
                                    {/* Row 1 — tenant name + agreement status */}
                                    <div style={{
                                        display: "flex", alignItems: "center",
                                        justifyContent: "space-between", marginBottom: "4px",
                                    }}>
        <span style={{fontSize: "15px", fontWeight: "600", color: "#111827"}}>
          {ag.tenantName}
        </span>
                                        <span style={{
                                            display: "inline-block", padding: "3px 8px",
                                            borderRadius: "20px", fontSize: "11px", fontWeight: "500",
                                            backgroundColor: ag.status === "ACTIVE" ? "#E1F5EE" : "#f3f4f6",
                                            color: ag.status === "ACTIVE" ? "#0F6E56" : "#6b7280",
                                        }}>
          {ag.status === "ACTIVE" ? "Active" : "Terminated"}
        </span>
                                    </div>

                                    {/* Row 2 — unit · type · rent */}
                                    <div style={{fontSize: "13px", color: "#6b7280", marginBottom: "4px"}}>
                                        Unit {ag.roomNumber} ·{" "}
                                        <span style={{
                                            fontSize: "11px", fontWeight: "500", padding: "1px 6px",
                                            borderRadius: "10px",
                                            backgroundColor: ag.tenantType === "NEW" ? "#E6F1FB" : "#FAEEDA",
                                            color: ag.tenantType === "NEW" ? "#185FA5" : "#854F0B",
                                        }}>
          {ag.tenantType}
        </span>
                                        {" "}· {formatUGX(ag.rentAmount)}/mo
                                    </div>

                                    {/* Row 3 — move-in date */}
                                    <div style={{fontSize: "13px", color: "#9ca3af", marginBottom: "10px"}}>
                                        Move-in: {ag.startDate
                                        ? new Date(ag.startDate).toLocaleDateString("en-UG", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        })
                                        : "Not recorded"}
                                        {ag.moveOutDate && ` · Move-out: ${new Date(ag.moveOutDate).toLocaleDateString("en-UG", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        })}`}
                                    </div>

                                    {/* Row 4 — move-out button */}
                                    {ag.status === "ACTIVE" && (
                                        <button onClick={() => setMoveOutAgreement(ag)} style={{
                                            width: "100%", padding: "9px", borderRadius: "8px", fontSize: "13px",
                                            border: "1px solid #fee2e2", backgroundColor: "#fff",
                                            color: "#dc2626", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                                            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                                        }}>
                                            <LogOut size={14}/> Record Move-Out
                                        </button>
                                    )}
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
                                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                                            style={{
                                                padding: "6px 14px", borderRadius: "6px", fontSize: "13px",
                                                border: "1px solid #e5e7eb", backgroundColor: "#fff",
                                                color: page === 0 ? "#d1d5db" : "#374151",
                                                cursor: page === 0 ? "not-allowed" : "pointer",
                                            }}>
                                        Previous
                                    </button>
                                    <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                                            style={{
                                                padding: "6px 14px", borderRadius: "6px", fontSize: "13px",
                                                border: "1px solid #e5e7eb", backgroundColor: "#fff",
                                                color: page >= totalPages - 1 ? "#d1d5db" : "#374151",
                                                cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                                            }}>
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {showCreate && <CreateAgreementModal onClose={() => setShowCreate(false)}/>}
            {moveOutAgreement && (
                <MoveOutModal agreement={moveOutAgreement} onClose={() => setMoveOutAgreement(null)}/>
            )}
        </PageWrapper>
    )
}