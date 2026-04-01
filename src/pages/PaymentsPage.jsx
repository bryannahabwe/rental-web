import { useState, useEffect } from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import { usePayments, useCreatePayment } from "@/hooks/usePayments"
import { useAgreements } from "@/hooks/useAgreements"
import { useForm } from "react-hook-form"
import { Plus, X } from "lucide-react"

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

function RecordPaymentModal({ onClose }) {
    const createPayment = useCreatePayment()
    const { data: agreementsData, isLoading: agreementsLoading } = useAgreements({
        page: 0, size: 100, status: "ACTIVE",
    })
    const [error, setError] = useState("")

    const activeAgreements = agreementsData?.content || []

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            paymentDate: new Date().toISOString().split("T")[0],
            method: "CASH",
        },
    })

    const onSubmit = async (data) => {
        setError("")
        try {
            const payload = {
                agreementId: data.agreementId,
                paymentDate: data.paymentDate,
                amount: parseFloat(data.amount),
                method: "CASH",
                reference: data.reference || null,
                notes: data.notes || null,
            }
            await createPayment.mutateAsync(payload)
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
                width: "100%", maxWidth: "500px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                maxHeight: "90vh", overflowY: "auto",
            }}>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "20px 24px", borderBottom: "1px solid #f3f4f6",
                    position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1,
                }}>
                    <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: 0 }}>
                        Record Payment
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
                            {activeAgreements.length === 0 && !agreementsLoading && (
                                <p style={{ fontSize: "12px", color: "#f59e0b", marginTop: "4px" }}>
                                    No active agreements found. Create an agreement first.
                                </p>
                            )}
                        </div>

                        <div>
                            <label style={labelStyle}>Amount (UGX)</label>
                            <input
                                {...register("amount", {
                                    required: "Amount is required",
                                    min: { value: 1, message: "Must be greater than 0" },
                                })}
                                type="number" style={inputStyle} placeholder="350000"
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                            {errors.amount && (
                                <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                                    {errors.amount.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label style={labelStyle}>Payment date</label>
                            <input
                                {...register("paymentDate", { required: "Payment date is required" })}
                                type="date" style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                            {errors.paymentDate && (
                                <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                                    {errors.paymentDate.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label style={labelStyle}>Payment method</label>
                            <div style={{
                                ...inputStyle,
                                backgroundColor: "#f9fafb", color: "#6b7280",
                                display: "flex", alignItems: "center", gap: "8px",
                            }}>
                <span style={{
                    display: "inline-block", padding: "2px 10px",
                    borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                    backgroundColor: "#E1F5EE", color: "#0F6E56",
                }}>
                  CASH
                </span>
                                <span style={{ fontSize: "13px" }}>Cash payment (MVP)</span>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>
                                Reference number{" "}
                                <span style={{ color: "#9ca3af", fontWeight: "400" }}>(optional)</span>
                            </label>
                            <input
                                {...register("reference")}
                                type="text" style={inputStyle} placeholder="RCP-001"
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                        </div>

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
            </div>
        </div>
    )
}

export default function PaymentsPage() {
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [showModal, setShowModal] = useState(false)

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
        <button
            onClick={() => setShowModal(true)}
            style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "9px 16px", borderRadius: "8px", fontSize: "14px",
                backgroundColor: "#0F6E56", color: "#fff", border: "none",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
            }}
        >
            <Plus size={16} /> Record Payment
        </button>
    )

    return (
        <PageWrapper title="Payments" actions={actions}>

            {/* Search + date filter */}
            <div style={{
                marginBottom: "16px", display: "flex",
                gap: "12px", alignItems: "center", flexWrap: "wrap",
            }}>
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by tenant, unit or reference..."
                    style={{
                        flex: 1, minWidth: "200px", maxWidth: "300px",
                        padding: "10px 14px", fontSize: "14px",
                        borderRadius: "8px", border: "1px solid #e5e7eb",
                        outline: "none", boxSizing: "border-box",
                        fontFamily: "'DM Sans', sans-serif", color: "#111827",
                        backgroundColor: "#fff",
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
                            color: "#6b7280", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
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
                            <button
                                onClick={() => setShowModal(true)}
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: "6px",
                                    padding: "9px 16px", borderRadius: "8px", fontSize: "14px",
                                    backgroundColor: "#0F6E56", color: "#fff", border: "none",
                                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                                }}
                            >
                                <Plus size={16} /> Record Payment
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                            <tr style={{ backgroundColor: "#f9fafb" }}>
                                {["Tenant", "Unit", "Amount", "Date", "Method", "Reference", "Notes"].map((h, i) => (
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
                                    <td style={{ padding: "14px 20px", fontSize: "14px", color: "#111827", fontWeight: "500" }}>
                                        {formatUGX(p.amount)}
                                    </td>
                                    <td style={{ padding: "14px 20px", fontSize: "14px", color: "#6b7280" }}>
                                        {formatDate(p.paymentDate)}
                                    </td>
                                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                          display: "inline-block", padding: "3px 10px",
                          borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                          backgroundColor: "#E1F5EE", color: "#0F6E56",
                      }}>
                        {p.method}
                      </span>
                                    </td>
                                    <td style={{ padding: "14px 20px", fontSize: "14px", color: "#6b7280" }}>
                                        {p.reference || "—"}
                                    </td>
                                    <td style={{ padding: "14px 20px", fontSize: "14px", color: "#6b7280" }}>
                                        {p.notes || "—"}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

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
        </PageWrapper>
    )
}