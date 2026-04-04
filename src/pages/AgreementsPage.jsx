import { useEffect, useState } from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import { useAgreements, useCreateAgreement, useMoveOut, useUpdateAgreement } from "@/hooks/useAgreements"
import { useAllTenants } from "@/hooks/useTenants"
import { useAllUnits } from "@/hooks/useUnits"
import { useForm } from "react-hook-form"
import { LogOut, Plus, X, ChevronRight, Pencil } from "lucide-react"
import AgreementDetailSheet from "@/components/ui/AgreementDetailSheet"

// ── Shared styles ────────────────────────────────────────
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

// ── Helpers ──────────────────────────────────────────────
const formatUGX = (amount) =>
    amount == null ? "—" : `UGX ${Number(amount).toLocaleString()}`

const formatDate = (dateStr) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-UG", {
        day: "numeric", month: "short", year: "numeric",
    })
}

const nullIfEmpty = (val) =>
    val === "" || val === undefined ? null : val

const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"]
    const v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// ── Billing day hint ─────────────────────────────────────
function BillingDayHint({ dateStr, billingModel }) {
    if (!dateStr) return null
    const day = Math.min(new Date(dateStr).getDate(), 28)
    return (
        <div style={{
            marginTop: "8px", padding: "10px 14px",
            backgroundColor: "#E1F5EE", borderRadius: "8px",
            fontSize: "12px", color: "#0F6E56",
        }}>
            Rent will be due on the <strong>{getOrdinal(day)}</strong> of every month.
            {billingModel === "ARREARS"
                ? " Payment collected at end of each cycle."
                : " Payment collected at start of each cycle."}
        </div>
    )
}

// ── Billing model toggle ─────────────────────────────────
function BillingModelToggle({ value, onChange }) {
    return (
        <div>
            <label style={labelStyle}>Billing model</label>
            <div style={{ display: "flex", gap: "8px" }}>
                {[
                    { value: "ADVANCE", label: "Advance", desc: "Pays at start of cycle" },
                    { value: "ARREARS", label: "Arrears", desc: "Pays at end of cycle" },
                ].map(opt => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        style={{
                            flex: 1, padding: "10px 8px", borderRadius: "8px",
                            fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
                            cursor: "pointer", fontWeight: "500", border: "1px solid",
                            borderColor: value === opt.value ? "#0F6E56" : "#e5e7eb",
                            backgroundColor: value === opt.value ? "#0F6E56" : "#fff",
                            color: value === opt.value ? "#fff" : "#6b7280",
                            textAlign: "center",
                        }}
                    >
                        <div>{opt.label}</div>
                        <div style={{ fontSize: "10px", marginTop: "2px", opacity: 0.8 }}>
                            {opt.desc}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}

// ── Opening balance field ────────────────────────────────
function OpeningBalanceField({ register, balanceSign, setBalanceSign, helpText }) {
    return (
        <div style={{
            backgroundColor: "#f8faf9", borderRadius: "10px",
            border: "1px solid #e5e7eb", padding: "16px",
        }}>
            <label style={labelStyle}>Opening balance (UGX)</label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                {[
                    { label: "Paid ahead (+)", value: "positive" },
                    { label: "Owes arrears (−)", value: "negative" },
                ].map(opt => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => setBalanceSign(opt.value)}
                        style={{
                            flex: 1, padding: "8px", borderRadius: "8px",
                            fontSize: "12px", fontFamily: "'DM Sans', sans-serif",
                            cursor: "pointer", fontWeight: "500", border: "1px solid",
                            borderColor: balanceSign === opt.value ? "#0F6E56" : "#e5e7eb",
                            backgroundColor: balanceSign === opt.value
                                ? (opt.value === "positive" ? "#0F6E56" : "#dc2626")
                                : "#fff",
                            color: balanceSign === opt.value ? "#fff" : "#6b7280",
                        }}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
            <input
                {...register("openingBalance")}
                type="number" min="0"
                style={inputStyle} placeholder="0"
                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                onBlur={e => e.target.style.borderColor = "#d1d5db"}
            />
            {helpText && (
                <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "8px", lineHeight: "1.6" }}>
                    {helpText}
                </p>
            )}
        </div>
    )
}

// ── Create Agreement Modal ───────────────────────────────
function CreateAgreementModal({ onClose }) {
    const createAgreement = useCreateAgreement()
    const { data: tenants = [], isLoading: tenantsLoading } = useAllTenants()
    const { data: units = [], isLoading: unitsLoading } = useAllUnits()
    const [error, setError] = useState("")
    const [tenantType, setTenantType] = useState("NEW")
    const [billingModel, setBillingModel] = useState("ADVANCE")
    const [balanceSign, setBalanceSign] = useState("positive")

    const availableUnits = units.filter(u => u.isAvailable)

    const { register, handleSubmit, watch, formState: { errors } } = useForm()
    const selectedUnitId = watch("unitId")
    const selectedUnit = units.find(u => u.id === selectedUnitId)
    const startDate = watch("startDate")

    const onSubmit = async (data) => {
        setError("")
        try {
            const rawBalance = data.openingBalance ? parseFloat(data.openingBalance) : 0
            const openingBalance = tenantType === "EXISTING"
                ? (balanceSign === "negative" ? -Math.abs(rawBalance) : Math.abs(rawBalance))
                : 0

            await createAgreement.mutateAsync({
                tenantId: data.tenantId,
                unitId: data.unitId,
                startDate: nullIfEmpty(data.startDate),
                rentAmount: data.rentAmount ? parseFloat(data.rentAmount) : null,
                depositAmount: data.depositAmount ? parseFloat(data.depositAmount) : null,
                tenantType,
                billingModel,
                openingBalance,
            })
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
                {/* Header */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "20px 24px", borderBottom: "1px solid #f3f4f6",
                    position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1,
                }}>
                    <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: 0 }}>
                        New Agreement
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

                        {/* Tenant type */}
                        <div>
                            <label style={labelStyle}>Tenant type</label>
                            <div style={{ display: "flex", gap: "8px" }}>
                                {["NEW", "EXISTING"].map(type => (
                                    <button key={type} type="button"
                                            onClick={() => setTenantType(type)}
                                            style={{
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
                            <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "6px" }}>
                                {tenantType === "NEW"
                                    ? "Moving in fresh — full details required"
                                    : "Already living here — being onboarded into the system"}
                            </p>
                        </div>

                        {/* Billing model */}
                        <BillingModelToggle value={billingModel} onChange={setBillingModel} />

                        {/* Tenant */}
                        <div>
                            <label style={labelStyle}>Tenant</label>
                            <select
                                {...register("tenantId", { required: "Please select a tenant" })}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            >
                                <option value="">
                                    {tenantsLoading ? "Loading..." : "Select a tenant"}
                                </option>
                                {tenants.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.name} — {t.phone}
                                    </option>
                                ))}
                            </select>
                            {errors.tenantId && (
                                <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                                    {errors.tenantId.message}
                                </p>
                            )}
                        </div>

                        {/* Unit */}
                        <div>
                            <label style={labelStyle}>Unit</label>
                            <select
                                {...register("unitId", { required: "Please select a unit" })}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            >
                                <option value="">
                                    {unitsLoading ? "Loading..." : "Select an available unit"}
                                </option>
                                {availableUnits.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.roomNumber} — {formatUGX(u.rentAmount)}/mo
                                    </option>
                                ))}
                            </select>
                            {errors.unitId && (
                                <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                                    {errors.unitId.message}
                                </p>
                            )}
                            {availableUnits.length === 0 && !unitsLoading && (
                                <p style={{ fontSize: "12px", color: "#f59e0b", marginTop: "4px" }}>
                                    No available units. Mark a unit as available first.
                                </p>
                            )}
                        </div>

                        {/* Rent amount */}
                        <div>
                            <label style={labelStyle}>
                                Agreed rent (UGX){" "}
                                <span style={{ color: "#9ca3af", fontWeight: "400" }}>
                  {selectedUnit
                      ? `— defaults to ${formatUGX(selectedUnit.rentAmount)}`
                      : "(optional)"}
                </span>
                            </label>
                            <input
                                {...register("rentAmount")} type="number" style={inputStyle}
                                placeholder={selectedUnit
                                    ? String(selectedUnit.rentAmount)
                                    : "Leave blank to use unit rent"}
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                        </div>

                        {/* Start date */}
                        <div>
                            <label style={labelStyle}>
                                {tenantType === "NEW" ? "Move-in date" : "First billing cycle start date"}
                                {" "}
                                <span style={{ color: "#9ca3af", fontWeight: "400" }}>(required)</span>
                            </label>
                            <input
                                {...register("startDate", { required: "Start date is required" })}
                                type="date" style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                            {errors.startDate && (
                                <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                                    {errors.startDate.message}
                                </p>
                            )}
                            <BillingDayHint dateStr={startDate} billingModel={billingModel} />
                            {tenantType === "EXISTING" && (
                                <div style={{
                                    marginTop: "8px", padding: "10px 14px",
                                    backgroundColor: "#FAEEDA", borderRadius: "8px",
                                    fontSize: "12px", color: "#854F0B", lineHeight: "1.5",
                                }}>
                                    {billingModel === "ARREARS"
                                        ? "For ARREARS tenants: enter the start of the NEXT cycle you want to track. Enter any unpaid amount before this date in the opening balance below."
                                        : "For ADVANCE tenants: enter the start of the current cycle. Enter any unpaid amount before this date in the opening balance below."}
                                </div>
                            )}
                        </div>

                        {/* Deposit */}
                        <div>
                            <label style={labelStyle}>
                                Deposit (UGX){" "}
                                <span style={{ color: "#9ca3af", fontWeight: "400" }}>(optional)</span>
                            </label>
                            <input
                                {...register("depositAmount")} type="number" style={inputStyle}
                                placeholder="Leave blank if not applicable"
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                        </div>

                        {/* Opening balance — EXISTING only */}
                        {tenantType === "EXISTING" && (
                            <OpeningBalanceField
                                register={register}
                                balanceSign={balanceSign}
                                setBalanceSign={setBalanceSign}
                                helpText={balanceSign === "negative"
                                    ? "Enter the total unpaid amount BEFORE the start date above. For example, if the tenant owes 3 months at 180,000, enter 540,000."
                                    : "Enter the amount the tenant has paid ahead before the start date above."}
                            />
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

                    {/* Footer */}
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

// ── Edit Agreement Modal ─────────────────────────────────
function EditAgreementModal({ agreement, onClose }) {
    const updateAgreement = useUpdateAgreement()
    const [billingModel, setBillingModel] = useState(agreement.billingModel || "ADVANCE")
    const [balanceSign, setBalanceSign] = useState(
        agreement.openingBalance < 0 ? "negative" : "positive"
    )
    const [error, setError] = useState("")

    const { register, handleSubmit, watch } = useForm({
        defaultValues: {
            rentAmount: agreement.rentAmount,
            depositAmount: agreement.depositAmount || "",
            startDate: agreement.startDate || "",
            openingBalance: agreement.openingBalance
                ? Math.abs(agreement.openingBalance) : "",
        },
    })

    const watchedStartDate = watch("startDate")

    const onSubmit = async (data) => {
        setError("")
        try {
            const rawBalance = data.openingBalance ? parseFloat(data.openingBalance) : 0
            const openingBalance = balanceSign === "negative"
                ? -Math.abs(rawBalance) : Math.abs(rawBalance)

            await updateAgreement.mutateAsync({
                id: agreement.id,
                data: {
                    tenantId: agreement.tenantId,
                    unitId: agreement.unitId,
                    rentAmount: data.rentAmount ? parseFloat(data.rentAmount) : null,
                    depositAmount: data.depositAmount ? parseFloat(data.depositAmount) : null,
                    startDate: nullIfEmpty(data.startDate),
                    billingModel,
                    openingBalance,
                },
            })
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
                {/* Header */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "20px 24px", borderBottom: "1px solid #f3f4f6",
                    position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1,
                }}>
                    <div>
                        <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: 0 }}>
                            Edit Agreement
                        </h2>
                        <p style={{ fontSize: "12px", color: "#9ca3af", margin: "2px 0 0" }}>
                            {agreement.tenantName} — Unit {agreement.roomNumber}
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        background: "none", border: "none",
                        cursor: "pointer", color: "#9ca3af", padding: "4px",
                    }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>

                        {/* Billing model */}
                        <BillingModelToggle value={billingModel} onChange={setBillingModel} />

                        {/* Start date */}
                        <div>
                            <label style={labelStyle}>Billing cycle start date</label>
                            <input
                                {...register("startDate")}
                                type="date" style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                            <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "6px" }}>
                                Billing day is derived from this date automatically.
                            </p>
                            <BillingDayHint
                                dateStr={watchedStartDate || agreement.startDate}
                                billingModel={billingModel}
                            />
                        </div>

                        {/* Rent amount */}
                        <div>
                            <label style={labelStyle}>Monthly rent (UGX)</label>
                            <input
                                {...register("rentAmount")} type="number" style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                        </div>

                        {/* Deposit */}
                        <div>
                            <label style={labelStyle}>
                                Deposit (UGX){" "}
                                <span style={{ color: "#9ca3af", fontWeight: "400" }}>(optional)</span>
                            </label>
                            <input
                                {...register("depositAmount")} type="number" style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                        </div>

                        {/* Opening balance */}
                        <OpeningBalanceField
                            register={register}
                            balanceSign={balanceSign}
                            setBalanceSign={setBalanceSign}
                        />

                        {error && (
                            <div style={{
                                backgroundColor: "#fef2f2", color: "#dc2626",
                                fontSize: "13px", padding: "10px 14px",
                                borderRadius: "8px", borderLeft: "3px solid #ef4444",
                            }}>
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
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
                        <button type="submit" disabled={updateAgreement.isPending} style={{
                            padding: "9px 20px", borderRadius: "8px", fontSize: "14px",
                            backgroundColor: updateAgreement.isPending ? "#6b9e8f" : "#0F6E56",
                            color: "#fff", border: "none", cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                        }}>
                            {updateAgreement.isPending ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ── Move Out Modal ───────────────────────────────────────
function MoveOutModal({ agreement, onClose }) {
    const moveOut = useMoveOut()
    const [error, setError] = useState("")
    const { register, handleSubmit, formState: { errors } } = useForm()

    const onSubmit = async (data) => {
        setError("")
        try {
            await moveOut.mutateAsync({ id: agreement.id, data: { moveOutDate: data.moveOutDate } })
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
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <div style={{
                        width: "36px", height: "36px", borderRadius: "10px",
                        backgroundColor: "#fef2f2",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <LogOut size={18} color="#dc2626" />
                    </div>
                    <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: 0 }}>
                        Record Move-Out
                    </h2>
                </div>
                <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 20px", lineHeight: "1.5" }}>
                    Move-out for <strong>{agreement.tenantName}</strong> in unit{" "}
                    <strong>{agreement.roomNumber}</strong>. This will terminate the agreement.
                </p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={labelStyle}>Move-out date</label>
                        <input
                            {...register("moveOutDate", { required: "Move-out date is required" })}
                            type="date" style={inputStyle}
                            onFocus={e => e.target.style.borderColor = "#0F6E56"}
                            onBlur={e => e.target.style.borderColor = "#d1d5db"}
                        />
                        {errors.moveOutDate && (
                            <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
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

                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
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

// ── Agreements Page ──────────────────────────────────────
export default function AgreementsPage() {
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("ACTIVE")
    const [showCreate, setShowCreate] = useState(false)
    const [moveOutAgreement, setMoveOutAgreement] = useState(null)
    const [editAgreement, setEditAgreement] = useState(null)
    const [selectedAgreementId, setSelectedAgreementId] = useState(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(0)
        }, 400)
        return () => clearTimeout(timer)
    }, [search])

    const { data, isLoading } = useAgreements({
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

            {/* Search */}
            <div style={{ marginBottom: "12px" }}>
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

            {/* Status filter tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                {[
                    { label: "Active", value: "ACTIVE" },
                    { label: "Terminated", value: "TERMINATED" },
                    { label: "All", value: "" },
                ].map(s => (
                    <button key={s.value}
                            onClick={() => { setStatusFilter(s.value); setPage(0) }}
                            style={{
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
                    <div style={{ padding: "60px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
                        Loading agreements...
                    </div>
                ) : agreements.length === 0 ? (
                    <div style={{ padding: "60px", textAlign: "center" }}>
                        <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "16px" }}>
                            {search ? `No agreements found for "${search}"` : "No agreements found."}
                        </p>
                        {!search && statusFilter === "ACTIVE" && (
                            <button onClick={() => setShowCreate(true)} style={{
                                display: "inline-flex", alignItems: "center", gap: "6px",
                                padding: "9px 16px", borderRadius: "8px", fontSize: "14px",
                                backgroundColor: "#0F6E56", color: "#fff", border: "none",
                                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                            }}>
                                <Plus size={16} /> New Agreement
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* ── Desktop table ── */}
                        <div className="desktop-table">
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                <tr style={{ backgroundColor: "#f9fafb" }}>
                                    {["Tenant", "Unit", "Billing", "Rent / Month", "Move-in", "Move-out", "Status", ""].map((h, i) => (
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
                                    <tr key={ag.id} style={{ borderTop: "1px solid #f9f9f9" }}>
                                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#111827", fontWeight: "500" }}>
                                            {ag.tenantName}
                                        </td>
                                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#6b7280" }}>
                                            {ag.roomNumber}
                                        </td>
                                        <td style={{ padding: "14px 20px" }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{
                              display: "inline-block", padding: "2px 8px",
                              borderRadius: "20px", fontSize: "11px", fontWeight: "500",
                              backgroundColor: ag.tenantType === "NEW" ? "#E6F1FB" : "#FAEEDA",
                              color: ag.tenantType === "NEW" ? "#185FA5" : "#854F0B",
                          }}>
                            {ag.tenantType}
                          </span>
                                                <span style={{
                                                    display: "inline-block", padding: "2px 8px",
                                                    borderRadius: "20px", fontSize: "11px", fontWeight: "500",
                                                    backgroundColor: "#f3f4f6", color: "#6b7280",
                                                }}>
                            {ag.billingModel || "ADVANCE"}
                          </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#111827" }}>
                                            {formatUGX(ag.rentAmount)}
                                        </td>
                                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#6b7280" }}>
                                            {formatDate(ag.startDate)}
                                        </td>
                                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#6b7280" }}>
                                            {formatDate(ag.moveOutDate)}
                                        </td>
                                        <td style={{ padding: "14px 20px" }}>
                        <span style={{
                            display: "inline-block", padding: "3px 10px",
                            borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                            backgroundColor: ag.status === "ACTIVE" ? "#E1F5EE" : "#f3f4f6",
                            color: ag.status === "ACTIVE" ? "#0F6E56" : "#6b7280",
                        }}>
                          {ag.status === "ACTIVE" ? "Active" : "Terminated"}
                        </span>
                                        </td>
                                        <td style={{ padding: "14px 20px" }}>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <button
                                                    onClick={() => setEditAgreement(ag)}
                                                    style={{
                                                        display: "flex", alignItems: "center", gap: "4px",
                                                        padding: "6px 12px", borderRadius: "6px", fontSize: "13px",
                                                        border: "1px solid #e5e7eb", backgroundColor: "#fff",
                                                        color: "#374151", cursor: "pointer",
                                                        fontFamily: "'DM Sans', sans-serif",
                                                    }}
                                                >
                                                    <Pencil size={13} /> Edit
                                                </button>
                                                {ag.status === "ACTIVE" && (
                                                    <button
                                                        onClick={() => setMoveOutAgreement(ag)}
                                                        style={{
                                                            display: "flex", alignItems: "center", gap: "4px",
                                                            padding: "6px 12px", borderRadius: "6px", fontSize: "13px",
                                                            border: "1px solid #fee2e2", backgroundColor: "#fff",
                                                            color: "#dc2626", cursor: "pointer",
                                                            fontFamily: "'DM Sans', sans-serif",
                                                        }}
                                                    >
                                                        <LogOut size={13} /> Move-out
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Mobile cards ── */}
                        <div className="mobile-cards" style={{ display: "none", flexDirection: "column" }}>
                            {agreements.map((ag, i) => (
                                <div
                                    key={ag.id}
                                    onClick={() => setSelectedAgreementId(ag.id)}
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
                    <span style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>
                      {ag.tenantName}
                    </span>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{
                          display: "inline-block", padding: "3px 8px",
                          borderRadius: "20px", fontSize: "11px", fontWeight: "500",
                          backgroundColor: ag.status === "ACTIVE" ? "#E1F5EE" : "#f3f4f6",
                          color: ag.status === "ACTIVE" ? "#0F6E56" : "#6b7280",
                      }}>
                        {ag.status === "ACTIVE" ? "Active" : "Terminated"}
                      </span>
                                            <ChevronRight size={16} color="#9ca3af" />
                                        </div>
                                    </div>

                                    {/* Row 2 — unit · type · billing · rent */}
                                    <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
                                        Unit {ag.roomNumber} ·{" "}
                                        <span style={{
                                            fontSize: "11px", fontWeight: "500", padding: "1px 6px",
                                            borderRadius: "10px",
                                            backgroundColor: ag.tenantType === "NEW" ? "#E6F1FB" : "#FAEEDA",
                                            color: ag.tenantType === "NEW" ? "#185FA5" : "#854F0B",
                                        }}>
                      {ag.tenantType}
                    </span>
                                        {" "}·{" "}
                                        <span style={{
                                            fontSize: "11px", fontWeight: "500", padding: "1px 6px",
                                            borderRadius: "10px", backgroundColor: "#f3f4f6", color: "#6b7280",
                                        }}>
                      {ag.billingModel || "ADVANCE"}
                    </span>
                                        {" "}· {formatUGX(ag.rentAmount)}/mo
                                    </div>

                                    {/* Row 3 — move-in */}
                                    <div style={{ fontSize: "13px", color: "#9ca3af" }}>
                                        Move-in: {ag.startDate
                                        ? new Date(ag.startDate).toLocaleDateString("en-UG", {
                                            day: "numeric", month: "short", year: "numeric",
                                        })
                                        : "Not recorded"}
                                        {ag.moveOutDate && (
                                            ` · Move-out: ${new Date(ag.moveOutDate).toLocaleDateString("en-UG", {
                                                day: "numeric", month: "short", year: "numeric",
                                            })}`
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "14px 20px", borderTop: "1px solid #f3f4f6",
                            }}>
                <span style={{ fontSize: "13px", color: "#9ca3af" }}>
                  Page {page + 1} of {totalPages}
                </span>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                        style={{
                                            padding: "6px 14px", borderRadius: "6px", fontSize: "13px",
                                            border: "1px solid #e5e7eb", backgroundColor: "#fff",
                                            color: page === 0 ? "#d1d5db" : "#374151",
                                            cursor: page === 0 ? "not-allowed" : "pointer",
                                        }}>
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
                                        }}>
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            {showCreate && <CreateAgreementModal onClose={() => setShowCreate(false)} />}
            {moveOutAgreement && (
                <MoveOutModal
                    agreement={moveOutAgreement}
                    onClose={() => setMoveOutAgreement(null)}
                />
            )}
            {editAgreement && (
                <EditAgreementModal
                    agreement={editAgreement}
                    onClose={() => setEditAgreement(null)}
                />
            )}
            {selectedAgreementId && (
                <AgreementDetailSheet
                    agreementId={selectedAgreementId}
                    onClose={() => setSelectedAgreementId(null)}
                    onMoveOut={(ag) => { setMoveOutAgreement(ag); setSelectedAgreementId(null) }}
                    onEdit={(ag) => { setEditAgreement(ag); setSelectedAgreementId(null) }}
                />
            )}

        </PageWrapper>
    )
}