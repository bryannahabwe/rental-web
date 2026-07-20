import { useEffect, useState } from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import { useCreatePayment, usePayments } from "@/hooks/usePayments"
import { useAgreements, useAgreementCycles } from "@/hooks/useAgreements"
import { useForm } from "react-hook-form"
import { ChevronRight, Plus, X } from "lucide-react"
import PaymentDetailSheet from "@/components/ui/PaymentDetailSheet"
import { generateReceipt } from "@/utils/receiptGenerator"
import { settingsService } from "@/services/settingsService"
import useSettingsStore from "@/store/settingsStore"
import { getErrorMessage } from "@/utils/errorMessage"
import { useAllTenants } from "@/hooks/useTenants"

// ── Helpers ──────────────────────────────────────────────
const formatCycleDate = (dateStr) => {
    if (!dateStr) return "—"
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-UG", { day: "numeric", month: "short" })
}

const formatCycle = (start, end) => {
    if (!start || !end) return "—"
    return `${formatCycleDate(start)} – ${formatCycleDate(end)}`
}

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

const nullIfEmpty = (val) =>
    (val === "" || val === undefined) ? null : val
// ── Cycle Picker ─────────────────────────────────────────
function CyclePicker({ agreementId, selectedCycle, onSelectCycle, openingArrears }) {
    const { data: cycles = [], isLoading } = useAgreementCycles(agreementId)

    useEffect(() => {
        if (cycles.length === 0) return
        const firstUnpaid = cycles.find(c => c.status !== "PAID")
        if (firstUnpaid && !selectedCycle) {
            onSelectCycle({
                start: firstUnpaid.periodStartDate,
                end: firstUnpaid.periodEndDate,
            })
        }
    }, [cycles])

    if (isLoading) return (
        <div style={{ fontSize: "13px", color: "#9ca3af", padding: "8px 0" }}>
            Loading cycles...
        </div>
    )

    if (cycles.length === 0) return (
        <div style={{
            padding: "12px 14px", backgroundColor: "#FAEEDA",
            borderRadius: "8px", fontSize: "13px", color: "#854F0B",
        }}>
            No billing cycles available — check the agreement start date.
        </div>
    )

    const unpaidCycles = cycles.filter(c => c.status !== "PAID")
    const totalUnpaid = unpaidCycles.reduce(
        (sum, c) => sum + Number(c.expectedAmount) - Number(c.paidAmount), 0
    )

    return (
        <div>
            {/* Opening arrears banner */}
            {openingArrears > 0 && (
                <div style={{
                    padding: "10px 14px", marginBottom: "8px",
                    backgroundColor: "#fef2f2", borderRadius: "8px",
                    fontSize: "12px", color: "#dc2626",
                    borderLeft: "3px solid #ef4444",
                }}>
                    <div style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center", marginBottom: "2px",
                    }}>
                        <strong>Historical arrears</strong>
                        <strong>{formatUGX(openingArrears)}</strong>
                    </div>
                    <div style={{ color: "#9ca3af", fontSize: "11px" }}>
                        Debt before system start date — go to{" "}
                        <strong style={{ color: "#dc2626" }}>
                            Edit Agreement → Opening Balance
                        </strong>{" "}
                        to clear
                    </div>
                </div>
            )}

            {/* Unpaid summary banner */}
            {unpaidCycles.length > 0 && (
                <div style={{
                    padding: "10px 14px", marginBottom: "10px",
                    backgroundColor: unpaidCycles.length > 1 ? "#fef2f2" : "#FAEEDA",
                    borderRadius: "8px", fontSize: "12px",
                    color: unpaidCycles.length > 1 ? "#dc2626" : "#854F0B",
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <span>
                        <strong>
                            {unpaidCycles.length} month{unpaidCycles.length > 1 ? "s" : ""} unpaid
                        </strong>
                        {" — earliest is auto-selected"}
                    </span>
                    <span style={{ fontWeight: "700" }}>
                        {formatUGX(totalUnpaid)} total
                    </span>
                </div>
            )}

            <label style={labelStyle}>Payment period</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {cycles.map((cycle, i) => {
                    const isSelected = selectedCycle?.start === cycle.periodStartDate
                    const statusColor = {
                        PAID:    { bg: "#E1F5EE", color: "#0F6E56" },
                        PARTIAL: { bg: "#FAEEDA", color: "#854F0B" },
                        UNPAID:  { bg: "#FCEBEB", color: "#A32D2D" },
                    }[cycle.status] || { bg: "#f3f4f6", color: "#6b7280" }

                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onSelectCycle({
                                start: cycle.periodStartDate,
                                end: cycle.periodEndDate,
                            })}
                            style={{
                                padding: "10px 14px", borderRadius: "8px",
                                border: "1px solid",
                                borderColor: isSelected ? "#0F6E56" : "#e5e7eb",
                                backgroundColor: isSelected ? "#E1F5EE" : "#fff",
                                cursor: "pointer", textAlign: "left",
                                fontFamily: "'DM Sans', sans-serif",
                                display: "flex", alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <div>
                                <div style={{
                                    fontSize: "14px", fontWeight: "500",
                                    color: isSelected ? "#0F6E56" : "#111827",
                                }}>
                                    {formatCycleDate(cycle.periodStartDate)} – {formatCycleDate(cycle.periodEndDate)}
                                </div>
                                {cycle.status === "PARTIAL" && (
                                    <div style={{ fontSize: "11px", color: "#854F0B", marginTop: "2px" }}>
                                        {formatUGX(cycle.paidAmount)} paid of {formatUGX(cycle.expectedAmount)}
                                    </div>
                                )}
                            </div>
                            <span style={{
                                padding: "2px 8px", borderRadius: "10px",
                                fontSize: "11px", fontWeight: "500",
                                backgroundColor: statusColor.bg,
                                color: statusColor.color,
                                flexShrink: 0,
                            }}>
                                {cycle.status}
                            </span>
                        </button>
                    )
                })}
            </div>

            {!selectedCycle && (
                <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "6px" }}>
                    Select the period this payment covers
                </p>
            )}
        </div>
    )
}

// ── Record Payment Modal ─────────────────────────────────
function RecordPaymentModal({ onClose }) {
    const { settings } = useSettingsStore()
    const createPayment = useCreatePayment()
    const { data: agreementsData, isLoading: agreementsLoading } = useAgreements({
        page: 0, size: 100, status: "ACTIVE",
    })
    const { data: tenantsData, isLoading: tenantsLoading } = useAllTenants()

    const [activeTab, setActiveTab] = useState("record")
    const [error, setError] = useState("")
    const [selectedCycle, setSelectedCycle] = useState(null)
    const [completedPayment, setCompletedPayment] = useState(null)
    const [receiptNumber, setReceiptNumber] = useState(null)
    const [receiptDownloading, setReceiptDownloading] = useState(false)
    const [manualError, setManualError] = useState("")
    const [manualGenerating, setManualGenerating] = useState(false)
    const [manualStyle, setManualStyle] = useState(settings?.receiptStyle || "DIGITAL")

    const activeAgreements = agreementsData?.content || []
    const allTenants = tenantsData || []

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            paymentDate: new Date().toISOString().split("T")[0],
            agreementId: "",
        },
    })

    const {
        register: registerManual,
        handleSubmit: handleSubmitManual,
        watch: watchManual,
        formState: { errors: manualErrors },
    } = useForm({
        defaultValues: {
            paymentDate: new Date().toISOString().split("T")[0],
            method: "CASH",
        },
    })

    const selectedAgreementId = watch("agreementId")
    const enteredAmount = watch("amount")
    const selectedTenantId = watchManual("tenantId")

    useEffect(() => {
        setSelectedCycle(null)
    }, [selectedAgreementId])

    const selectedAgreement = activeAgreements.find(ag => ag.id === selectedAgreementId)
    const selectedTenant = allTenants.find(t => t.id === selectedTenantId)
    const expectedAmount = selectedAgreement?.rentAmount || 0
    const overpayment = enteredAmount && parseFloat(enteredAmount) > expectedAmount
        ? parseFloat(enteredAmount) - expectedAmount : 0
    const openingArrears = selectedAgreement
        ? Math.max(0, -(Number(selectedAgreement.openingBalance || 0)))
        : 0

    const onSubmit = async (data) => {
        setError("")
        if (!selectedCycle) {
            setError("Please select a payment period")
            return
        }
        try {
            const result = await createPayment.mutateAsync({
                agreementId: data.agreementId,
                paymentDate: data.paymentDate,
                amount: parseFloat(data.amount),
                method: "CASH",
                periodStartDate: selectedCycle.start,
                periodEndDate: selectedCycle.end,
                reference: nullIfEmpty(data.reference),
                notes: nullIfEmpty(data.notes),
            })
            const receiptRes = await settingsService.getNextReceiptNumber()
            setReceiptNumber(receiptRes.data)
            setCompletedPayment(result.data)
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    const onManualSubmit = async (data) => {
        setManualError("")
        setManualGenerating(true)
        try {
            const receiptRes = await settingsService.getNextReceiptNumber()
            const rNumber = receiptRes.data
            const manualPayment = {
                tenantName: selectedTenant?.name || "—",
                roomNumber: selectedTenant?.currentUnit || "—",
                amount: parseFloat(data.amount),
                expectedAmount: parseFloat(data.amount),
                paymentDate: data.paymentDate,
                periodStartDate: null,
                periodEndDate: null,
                manualPeriod: data.period || "—",
                method: data.method || "CASH",
                reference: data.reference || null,
                notes: data.notes || null,
                balance: data.balance ? parseFloat(data.balance) : 0,
                isManual: true,
            }
            const settingsWithStyle = { ...settings, receiptStyle: manualStyle }
            await generateReceipt(manualPayment, settingsWithStyle, rNumber)
        } catch (err) {
            console.error("Manual receipt generation failed", err)
            setManualError("Failed to generate receipt. Please try again.")
        } finally {
            setManualGenerating(false)
        }
    }

    const handleDownloadReceipt = async () => {
        setReceiptDownloading(true)
        try {
            await generateReceipt(completedPayment, settings, receiptNumber)
        } catch (err) {
            console.error("Receipt generation failed", err)
        } finally {
            setReceiptDownloading(false)
        }
    }

    const TabToggle = () => (
        <div style={{
            display: "flex", gap: "4px",
            backgroundColor: "#f3f4f6", borderRadius: "10px",
            padding: "4px", margin: "16px 24px 0",
        }}>
            {[
                { id: "record", label: "Record Payment" },
                { id: "manual", label: "Manual Receipt" },
            ].map(tab => (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                        setActiveTab(tab.id)
                        setError("")
                        setManualError("")
                    }}
                    style={{
                        flex: 1, padding: "8px 12px", borderRadius: "8px",
                        fontSize: "13px", fontWeight: "500", border: "none",
                        cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                        backgroundColor: activeTab === tab.id ? "#fff" : "transparent",
                        color: activeTab === tab.id ? "#111827" : "#6b7280",
                        boxShadow: activeTab === tab.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                        transition: "all 0.15s",
                    }}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    )

    return (
        <div style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 200, padding: "16px",
        }}>
            <div style={{
                backgroundColor: "#fff", borderRadius: "16px",
                width: "100%", maxWidth: "500px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                maxHeight: "90vh", overflowY: "auto",
            }}>

                {/* ── Success state ── */}
                {completedPayment ? (
                    <div style={{
                        padding: "48px 32px",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", gap: "16px", textAlign: "center",
                    }}>
                        <div style={{
                            width: "72px", height: "72px", borderRadius: "50%",
                            backgroundColor: "#E1F5EE",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "32px",
                        }}>
                            ✓
                        </div>
                        <div>
                            <h3 style={{
                                fontSize: "20px", fontWeight: "700",
                                color: "#111827", margin: "0 0 6px",
                            }}>
                                Payment Recorded
                            </h3>
                            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                                {formatUGX(completedPayment.amount)} from{" "}
                                <strong>{completedPayment.tenantName}</strong>
                            </p>
                            <p style={{ fontSize: "13px", color: "#9ca3af", margin: "4px 0 0" }}>
                                {formatCycle(completedPayment.periodStartDate, completedPayment.periodEndDate)}
                            </p>
                        </div>
                        <button
                            onClick={handleDownloadReceipt}
                            disabled={receiptDownloading}
                            style={{
                                width: "100%", padding: "13px", borderRadius: "10px",
                                backgroundColor: receiptDownloading ? "#6b9e8f" : "#0F6E56",
                                color: "#fff", border: "none",
                                cursor: receiptDownloading ? "not-allowed" : "pointer",
                                fontSize: "14px", fontWeight: "500",
                                fontFamily: "'DM Sans', sans-serif",
                                display: "flex", alignItems: "center",
                                justifyContent: "center", gap: "8px",
                            }}
                        >
                            {receiptDownloading
                                ? "Generating..."
                                : `↓ Download Receipt (${receiptNumber})`}
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                width: "100%", padding: "12px", borderRadius: "10px",
                                backgroundColor: "#fff", color: "#374151",
                                border: "1px solid #e5e7eb", cursor: "pointer",
                                fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
                            }}
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div style={{
                            display: "flex", alignItems: "center",
                            justifyContent: "space-between",
                            padding: "20px 24px 0", flexShrink: 0,
                        }}>
                            <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: 0 }}>
                                {activeTab === "record" ? "Record Payment" : "Manual Receipt"}
                            </h2>
                            <button onClick={onClose} style={{
                                background: "none", border: "none",
                                cursor: "pointer", color: "#9ca3af", padding: "4px",
                            }}>
                                <X size={20} />
                            </button>
                        </div>

                        <TabToggle />

                        <div style={{ height: "1px", backgroundColor: "#f3f4f6", margin: "16px 0 0" }} />

                        {/* ══ RECORD PAYMENT TAB ══ */}
                        {activeTab === "record" && (
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div style={{
                                    padding: "20px 24px",
                                    display: "flex", flexDirection: "column", gap: "16px",
                                }}>

                                    {/* Tenant / Agreement */}
                                    <div>
                                        <label style={labelStyle}>Tenant / Agreement</label>
                                        <select
                                            {...register("agreementId", { required: "Please select an agreement" })}
                                            style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                            onBlur={e => e.target.style.borderColor = "#d1d5db"}
                                        >
                                            <option value="">
                                                {agreementsLoading ? "Loading..." : "Select tenant"}
                                            </option>
                                            {activeAgreements.map(ag => (
                                                <option key={ag.id} value={ag.id}>
                                                    {ag.tenantName} — Unit {ag.roomNumber} ({formatUGX(ag.rentAmount)}/mo)
                                                </option>
                                            ))}
                                        </select>
                                        {errors.agreementId && (
                                            <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                                                {errors.agreementId.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Cycle picker — backend-aware */}
                                    {selectedAgreementId && selectedAgreement && (
                                        <CyclePicker
                                            agreementId={selectedAgreementId}
                                            selectedCycle={selectedCycle}
                                            onSelectCycle={setSelectedCycle}
                                            openingArrears={openingArrears}
                                        />
                                    )}

                                    {/* Amount */}
                                    <div>
                                        <label style={labelStyle}>
                                            Amount (UGX)
                                            {selectedAgreement && (
                                                <span style={{ color: "#9ca3af", fontWeight: "400", marginLeft: "6px" }}>
                                                    — expected {formatUGX(selectedAgreement.rentAmount)}
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            {...register("amount", {
                                                required: "Amount is required",
                                                min: { value: 1, message: "Must be greater than 0" },
                                            })}
                                            type="number" style={inputStyle} placeholder="180000"
                                            onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                            onBlur={e => e.target.style.borderColor = "#d1d5db"}
                                        />
                                        {errors.amount && (
                                            <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                                                {errors.amount.message}
                                            </p>
                                        )}
                                        {overpayment > 0 && (
                                            <div style={{
                                                marginTop: "8px", padding: "10px 14px",
                                                backgroundColor: "#FAEEDA", borderRadius: "8px",
                                                borderLeft: "3px solid #EF9F27",
                                                fontSize: "13px", color: "#854F0B",
                                            }}>
                                                Overpayment of {formatUGX(overpayment)} — will roll over to next cycle
                                            </div>
                                        )}
                                        {enteredAmount && parseFloat(enteredAmount) > 0 &&
                                            parseFloat(enteredAmount) < expectedAmount && selectedAgreement && (
                                                <div style={{
                                                    marginTop: "8px", padding: "10px 14px",
                                                    backgroundColor: "#fef2f2", borderRadius: "8px",
                                                    borderLeft: "3px solid #ef4444",
                                                    fontSize: "13px", color: "#dc2626",
                                                }}>
                                                    Partial — {formatUGX(expectedAmount - parseFloat(enteredAmount))} still outstanding
                                                </div>
                                            )}
                                    </div>

                                    {/* Payment date */}
                                    <div>
                                        <label style={labelStyle}>Payment date</label>
                                        <input
                                            {...register("paymentDate", { required: "Payment date is required" })}
                                            type="date" style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                            onBlur={e => e.target.style.borderColor = "#d1d5db"}
                                        />
                                    </div>

                                    {/* Method */}
                                    <div>
                                        <label style={labelStyle}>Payment method</label>
                                        <div style={{
                                            ...inputStyle, backgroundColor: "#f9fafb",
                                            color: "#6b7280", display: "flex",
                                            alignItems: "center", gap: "8px",
                                        }}>
                                            <span style={{
                                                display: "inline-block", padding: "2px 10px",
                                                borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                                                backgroundColor: "#E1F5EE", color: "#0F6E56",
                                            }}>CASH</span>
                                            <span style={{ fontSize: "13px" }}>Cash payment</span>
                                        </div>
                                    </div>

                                    {/* Reference */}
                                    <div>
                                        <label style={labelStyle}>
                                            Reference{" "}
                                            <span style={{ color: "#9ca3af", fontWeight: "400" }}>(optional)</span>
                                        </label>
                                        <input
                                            {...register("reference")} type="text"
                                            style={inputStyle} placeholder="RCP-001"
                                            onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                            onBlur={e => e.target.style.borderColor = "#d1d5db"}
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label style={labelStyle}>
                                            Notes{" "}
                                            <span style={{ color: "#9ca3af", fontWeight: "400" }}>(optional)</span>
                                        </label>
                                        <textarea
                                            {...register("notes")} rows={2}
                                            style={{ ...inputStyle, resize: "vertical" }}
                                            placeholder="April rent payment..."
                                            onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                            onBlur={e => e.target.style.borderColor = "#d1d5db"}
                                        />
                                    </div>

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

                                <div style={{
                                    display: "flex", gap: "10px", justifyContent: "flex-end",
                                    padding: "16px 24px", borderTop: "1px solid #f3f4f6",
                                }}>
                                    <button type="button" onClick={onClose} style={{
                                        padding: "9px 18px", borderRadius: "8px", fontSize: "14px",
                                        border: "1px solid #e5e7eb", backgroundColor: "#fff",
                                        color: "#374151", cursor: "pointer",
                                        fontFamily: "'DM Sans', sans-serif",
                                    }}>
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={createPayment.isPending} style={{
                                        padding: "9px 20px", borderRadius: "8px", fontSize: "14px",
                                        backgroundColor: createPayment.isPending ? "#6b9e8f" : "#0F6E56",
                                        color: "#fff", border: "none", cursor: "pointer",
                                        fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                                    }}>
                                        {createPayment.isPending ? "Recording..." : "Record payment"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ══ MANUAL RECEIPT TAB ══ */}
                        {activeTab === "manual" && (
                            <form onSubmit={handleSubmitManual(onManualSubmit)}>
                                <div style={{
                                    padding: "20px 24px",
                                    display: "flex", flexDirection: "column", gap: "16px",
                                }}>

                                    {/* Tenant picker */}
                                    <div>
                                        <label style={labelStyle}>Tenant</label>
                                        <select
                                            {...registerManual("tenantId", { required: "Please select a tenant" })}
                                            style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                            onBlur={e => e.target.style.borderColor = "#d1d5db"}
                                        >
                                            <option value="">
                                                {tenantsLoading ? "Loading..." : "Select tenant"}
                                            </option>
                                            {allTenants.map(t => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name} — Unit {t.currentUnit || "—"}
                                                </option>
                                            ))}
                                        </select>
                                        {manualErrors.tenantId && (
                                            <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                                                {manualErrors.tenantId.message}
                                            </p>
                                        )}
                                        {selectedTenant && (
                                            <div style={{
                                                marginTop: "8px", padding: "10px 14px",
                                                backgroundColor: "#E1F5EE", borderRadius: "8px",
                                                fontSize: "12px", color: "#0F6E56",
                                                display: "flex", gap: "16px",
                                            }}>
                                                <span><strong>Name:</strong> {selectedTenant.name}</span>
                                                <span><strong>Unit:</strong> {selectedTenant.currentUnit || "—"}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Amount */}
                                    <div>
                                        <label style={labelStyle}>Amount (UGX)</label>
                                        <input
                                            {...registerManual("amount", {
                                                required: "Amount is required",
                                                min: { value: 1, message: "Must be greater than 0" },
                                            })}
                                            type="number" style={inputStyle} placeholder="180000"
                                            onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                            onBlur={e => e.target.style.borderColor = "#d1d5db"}
                                        />
                                        {manualErrors.amount && (
                                            <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                                                {manualErrors.amount.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Period */}
                                    <div>
                                        <label style={labelStyle}>
                                            Period{" "}
                                            <span style={{ color: "#9ca3af", fontWeight: "400" }}>(optional)</span>
                                        </label>
                                        <input
                                            {...registerManual("period")}
                                            type="text" style={inputStyle}
                                            placeholder="e.g. 1 Apr – 30 Apr or January 2026"
                                            onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                            onBlur={e => e.target.style.borderColor = "#d1d5db"}
                                        />
                                    </div>

                                    {/* Payment date */}
                                    <div>
                                        <label style={labelStyle}>Payment date</label>
                                        <input
                                            {...registerManual("paymentDate", { required: "Payment date is required" })}
                                            type="date" style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                            onBlur={e => e.target.style.borderColor = "#d1d5db"}
                                        />
                                        {manualErrors.paymentDate && (
                                            <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                                                {manualErrors.paymentDate.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Payment by */}
                                    <div>
                                        <label style={labelStyle}>Payment by</label>
                                        <select
                                            {...registerManual("method")}
                                            style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                            onBlur={e => e.target.style.borderColor = "#d1d5db"}
                                        >
                                            <option value="CASH">Cash</option>
                                            <option value="MOBILE MONEY">Mobile Money</option>
                                            <option value="BANK TRANSFER">Bank Transfer</option>
                                            <option value="CHEQUE">Cheque</option>
                                        </select>
                                    </div>

                                    {/* Balance */}
                                    <div>
                                        <label style={labelStyle}>
                                            Balance remaining (UGX){" "}
                                            <span style={{ color: "#9ca3af", fontWeight: "400" }}>(optional)</span>
                                        </label>
                                        <input
                                            {...registerManual("balance")}
                                            type="number" min="0" style={inputStyle} placeholder="0"
                                            onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                            onBlur={e => e.target.style.borderColor = "#d1d5db"}
                                        />
                                        <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "6px" }}>
                                            Amount still owed after this payment
                                        </p>
                                    </div>

                                    {/* Reference */}
                                    <div>
                                        <label style={labelStyle}>
                                            Reference{" "}
                                            <span style={{ color: "#9ca3af", fontWeight: "400" }}>(optional)</span>
                                        </label>
                                        <input
                                            {...registerManual("reference")}
                                            type="text" style={inputStyle} placeholder="RCP-001"
                                            onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                            onBlur={e => e.target.style.borderColor = "#d1d5db"}
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label style={labelStyle}>
                                            Notes{" "}
                                            <span style={{ color: "#9ca3af", fontWeight: "400" }}>(optional)</span>
                                        </label>
                                        <textarea
                                            {...registerManual("notes")} rows={2}
                                            style={{ ...inputStyle, resize: "vertical" }}
                                            placeholder="e.g. January rent payment"
                                            onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                            onBlur={e => e.target.style.borderColor = "#d1d5db"}
                                        />
                                    </div>

                                    {/* Style toggle */}
                                    <div>
                                        <label style={labelStyle}>Receipt style</label>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            {[
                                                { value: "DIGITAL", label: "Digital", desc: "Clean branded" },
                                                { value: "FORMAL",  label: "Formal",  desc: "Like receipt book" },
                                            ].map(opt => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => setManualStyle(opt.value)}
                                                    style={{
                                                        flex: 1, padding: "10px 8px", borderRadius: "8px",
                                                        fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
                                                        cursor: "pointer", fontWeight: "500", border: "1px solid",
                                                        borderColor: manualStyle === opt.value ? "#0F6E56" : "#e5e7eb",
                                                        backgroundColor: manualStyle === opt.value ? "#0F6E56" : "#fff",
                                                        color: manualStyle === opt.value ? "#fff" : "#6b7280",
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

                                    {manualError && (
                                        <div style={{
                                            backgroundColor: "#fef2f2", color: "#dc2626",
                                            fontSize: "13px", padding: "10px 14px",
                                            borderRadius: "8px", borderLeft: "3px solid #ef4444",
                                        }}>
                                            {manualError}
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
                                        color: "#374151", cursor: "pointer",
                                        fontFamily: "'DM Sans', sans-serif",
                                    }}>
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={manualGenerating}
                                        style={{
                                            padding: "9px 20px", borderRadius: "8px", fontSize: "14px",
                                            backgroundColor: manualGenerating ? "#6b9e8f" : "#0F6E56",
                                            color: "#fff", border: "none", cursor: "pointer",
                                            fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                                            display: "flex", alignItems: "center", gap: "6px",
                                        }}
                                    >
                                        {manualGenerating ? "Generating..." : "↓ Generate Receipt"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

// ── Payments Page ────────────────────────────────────────
export default function PaymentsPage() {
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [selectedPaymentId, setSelectedPaymentId] = useState(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(0)
        }, 400)
        return () => clearTimeout(timer)
    }, [search])

    const { data, isLoading } = usePayments({
        page, size: 10, sortBy: "paymentDate", sortDir: "desc",
        search: debouncedSearch || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
    })

    const payments = data?.content || []
    const totalPages = data?.totalPages || 0

    const actions = (
        <button onClick={() => setShowModal(true)} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "9px 16px", borderRadius: "8px", fontSize: "14px",
            backgroundColor: "#0F6E56", color: "#fff", border: "none",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
        }}>
            <Plus size={16} /> Record Payment
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
        <PageWrapper title="Payments" actions={actions} mobileAction={mobileAction}>

            {/* Filters */}
            <div style={{
                marginBottom: "16px", display: "flex",
                gap: "10px", alignItems: "center", flexWrap: "wrap",
            }}>
                <input
                    type="text" value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by tenant, unit or reference..."
                    style={{
                        flex: 1, minWidth: "160px", maxWidth: "280px",
                        padding: "10px 14px", fontSize: "14px",
                        borderRadius: "8px", border: "1px solid #e5e7eb",
                        outline: "none", boxSizing: "border-box",
                        fontFamily: "'DM Sans', sans-serif",
                        color: "#111827", backgroundColor: "#fff",
                    }}
                    onFocus={e => e.target.style.borderColor = "#0F6E56"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                />
                <input
                    type="date" value={fromDate}
                    onChange={e => { setFromDate(e.target.value); setPage(0) }}
                    style={{
                        padding: "10px 12px", fontSize: "13px",
                        borderRadius: "8px", border: "1px solid #e5e7eb",
                        outline: "none", fontFamily: "'DM Sans', sans-serif",
                        color: "#111827", backgroundColor: "#fff",
                    }}
                    onFocus={e => e.target.style.borderColor = "#0F6E56"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                />
                <span style={{ fontSize: "13px", color: "#9ca3af" }}>→</span>
                <input
                    type="date" value={toDate}
                    onChange={e => { setToDate(e.target.value); setPage(0) }}
                    style={{
                        padding: "10px 12px", fontSize: "13px",
                        borderRadius: "8px", border: "1px solid #e5e7eb",
                        outline: "none", fontFamily: "'DM Sans', sans-serif",
                        color: "#111827", backgroundColor: "#fff",
                    }}
                    onFocus={e => e.target.style.borderColor = "#0F6E56"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                />
                {(search || fromDate || toDate) && (
                    <button
                        onClick={() => { setSearch(""); setFromDate(""); setToDate(""); setPage(0) }}
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
                    <div style={{ padding: "60px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
                        Loading payments...
                    </div>
                ) : payments.length === 0 ? (
                    <div style={{ padding: "60px", textAlign: "center" }}>
                        <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "16px" }}>
                            {search || fromDate || toDate
                                ? "No payments found for the selected filters."
                                : "No payments recorded yet."}
                        </p>
                        {!search && !fromDate && !toDate && (
                            <button onClick={() => setShowModal(true)} style={{
                                display: "inline-flex", alignItems: "center", gap: "6px",
                                padding: "9px 16px", borderRadius: "8px", fontSize: "14px",
                                backgroundColor: "#0F6E56", color: "#fff", border: "none",
                                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                            }}>
                                <Plus size={16} /> Record Payment
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="desktop-table">
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                <tr style={{ backgroundColor: "#f9fafb" }}>
                                    {["Tenant", "Unit", "Period", "Amount", "Expected", "Status", "Date", "Reference", ""].map((h, i) => (
                                        <th key={i} style={{
                                            padding: "11px 20px", textAlign: "left",
                                            fontSize: "11px", fontWeight: "500", color: "#9ca3af",
                                            textTransform: "uppercase", letterSpacing: "0.05em",
                                        }}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {payments.map((p) => (
                                    <tr key={p.id} style={{ borderTop: "1px solid #f9f9f9" }}>
                                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#111827", fontWeight: "500" }}>
                                            {p.tenantName}
                                        </td>
                                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#6b7280" }}>
                                            {p.roomNumber}
                                        </td>
                                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#6b7280" }}>
                                            {formatCycle(p.periodStartDate, p.periodEndDate)}
                                        </td>
                                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#111827", fontWeight: "500" }}>
                                            {formatUGX(p.amount)}
                                        </td>
                                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#6b7280" }}>
                                            {formatUGX(p.expectedAmount)}
                                        </td>
                                        <td style={{ padding: "14px 20px" }}>
                                                <span style={{
                                                    display: "inline-block", padding: "3px 10px",
                                                    borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                                                    backgroundColor:
                                                        p.periodStatus === "PAID"     ? "#E1F5EE" :
                                                            p.periodStatus === "PARTIAL"  ? "#FAEEDA" :
                                                                p.periodStatus === "ROLLOVER" ? "#E6F1FB" : "#f3f4f6",
                                                    color:
                                                        p.periodStatus === "PAID"     ? "#0F6E56" :
                                                            p.periodStatus === "PARTIAL"  ? "#854F0B" :
                                                                p.periodStatus === "ROLLOVER" ? "#185FA5" : "#6b7280",
                                                }}>
                                                    {p.periodStatus || "—"}
                                                </span>
                                        </td>
                                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#6b7280" }}>
                                            {formatDate(p.paymentDate)}
                                        </td>
                                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#6b7280" }}>
                                            {p.reference || "—"}
                                        </td>
                                        <td style={{ padding: "14px 20px" }}>
                                            <button
                                                onClick={() => setSelectedPaymentId(p.id)}
                                                style={{
                                                    padding: "6px 12px", borderRadius: "6px", fontSize: "12px",
                                                    border: "1px solid #e5e7eb", backgroundColor: "#fff",
                                                    color: "#374151", cursor: "pointer",
                                                    fontFamily: "'DM Sans', sans-serif",
                                                    display: "flex", alignItems: "center", gap: "4px",
                                                }}
                                            >
                                                ↓ Receipt
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="mobile-cards" style={{ display: "none", flexDirection: "column" }}>
                            {payments.map((p, i) => (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedPaymentId(p.id)}
                                    style={{
                                        padding: "14px 16px",
                                        borderTop: i === 0 ? "none" : "1px solid #f3f4f6",
                                        cursor: "pointer",
                                    }}
                                >
                                    <div style={{
                                        display: "flex", alignItems: "center",
                                        justifyContent: "space-between", marginBottom: "4px",
                                    }}>
                                        <span style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>
                                            {p.tenantName}
                                        </span>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <span style={{
                                                display: "inline-block", padding: "3px 10px",
                                                borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                                                backgroundColor:
                                                    p.periodStatus === "PAID"     ? "#E1F5EE" :
                                                        p.periodStatus === "PARTIAL"  ? "#FAEEDA" :
                                                            p.periodStatus === "ROLLOVER" ? "#E6F1FB" : "#f3f4f6",
                                                color:
                                                    p.periodStatus === "PAID"     ? "#0F6E56" :
                                                        p.periodStatus === "PARTIAL"  ? "#854F0B" :
                                                            p.periodStatus === "ROLLOVER" ? "#185FA5" : "#6b7280",
                                            }}>
                                                {p.periodStatus || "—"}
                                            </span>
                                            <ChevronRight size={16} color="#9ca3af" />
                                        </div>
                                    </div>

                                    <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
                                        Unit {p.roomNumber} · {formatCycle(p.periodStartDate, p.periodEndDate)}
                                    </div>

                                    <div style={{
                                        backgroundColor: "#f9fafb", borderRadius: "8px",
                                        padding: "10px 12px", marginBottom: "8px",
                                    }}>
                                        <div style={{
                                            display: "flex", justifyContent: "space-between",
                                            alignItems: "baseline", marginBottom: "6px",
                                        }}>
                                            <span style={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>
                                                {formatUGX(p.amount)}
                                            </span>
                                            <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                                                of {formatUGX(p.expectedAmount)}
                                            </span>
                                        </div>
                                        {p.expectedAmount > 0 && (
                                            <div style={{
                                                height: "4px", borderRadius: "4px",
                                                backgroundColor: "#e5e7eb", overflow: "hidden",
                                            }}>
                                                <div style={{
                                                    height: "100%", borderRadius: "4px",
                                                    backgroundColor:
                                                        p.periodStatus === "PAID"     ? "#0F6E56" :
                                                            p.periodStatus === "ROLLOVER" ? "#185FA5" : "#EF9F27",
                                                    width: `${Math.min(100, (p.amount / p.expectedAmount) * 100)}%`,
                                                }} />
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                                        {new Date(p.paymentDate).toLocaleDateString("en-UG", {
                                            day: "numeric", month: "short", year: "numeric",
                                        })}
                                        {p.reference && ` · ${p.reference}`}
                                        {p.source === "ROLLOVER" && " · Auto-rollover"}
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
                )}
            </div>

            {showModal && <RecordPaymentModal onClose={() => setShowModal(false)} />}
            {selectedPaymentId && (
                <PaymentDetailSheet
                    paymentId={selectedPaymentId}
                    onClose={() => setSelectedPaymentId(null)}
                />
            )}
        </PageWrapper>
    )
}