import {useEffect, useState} from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import {useCreatePayment, usePayments} from "@/hooks/usePayments"
import {useAgreements} from "@/hooks/useAgreements"
import {useForm} from "react-hook-form"
import {Plus, X, ChevronRight} from "lucide-react"
import PaymentDetailSheet from "@/components/ui/PaymentDetailSheet"

// Format cycle date: 2026-04-15 → "Apr 15"
const formatCycleDate = (dateStr) => {
    if (!dateStr) return "—"
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-UG", { day: "numeric", month: "short" })
}

// Format full cycle: "Apr 15 – May 14"
const formatCycle = (start, end) => {
    if (!start || !end) return "—"
    return `${formatCycleDate(start)} – ${formatCycleDate(end)}`
}

// Generate last 6 billing cycles for an agreement
const generateCycles = (agreement) => {
    if (!agreement?.startDate && !agreement?.billingDay) return []

    const billingDay = agreement.billingDay || 1
    const today = new Date()
    const cycles = []

    // Start from current cycle and go back 5
    let cycleStart = new Date(today)
    cycleStart.setDate(Math.min(billingDay, 28))

    // If billing day hasn't occurred yet this month, go back one month
    if (cycleStart > today) {
        cycleStart.setMonth(cycleStart.getMonth() - 1)
        cycleStart.setDate(Math.min(billingDay, 28))
    }

    for (let i = 0; i < 6; i++) {
        const start = new Date(cycleStart)
        start.setMonth(start.getMonth() - i)
        start.setDate(Math.min(billingDay, 28))

        const end = new Date(start)
        end.setMonth(end.getMonth() + 1)
        end.setDate(Math.min(billingDay, 28))
        end.setDate(end.getDate() - 1)

        const isCurrent = i === 0

        cycles.push({
            start: start.toISOString().split("T")[0],
            end: end.toISOString().split("T")[0],
            isCurrent,
        })
    }

    return cycles
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

const nullIfEmpty = (val) => (val === "" || val === undefined) ? null : val

const getMonthName = (month) =>
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1]

const months = [
    {value: 1, label: "January"}, {value: 2, label: "February"},
    {value: 3, label: "March"}, {value: 4, label: "April"},
    {value: 5, label: "May"}, {value: 6, label: "June"},
    {value: 7, label: "July"}, {value: 8, label: "August"},
    {value: 9, label: "September"}, {value: 10, label: "October"},
    {value: 11, label: "November"}, {value: 12, label: "December"},
]

function RecordPaymentModal({ onClose }) {
    const createPayment = useCreatePayment()
    const { data: agreementsData, isLoading: agreementsLoading } = useAgreements({
        page: 0, size: 100, status: "ACTIVE",
    })
    const [error, setError] = useState("")
    const [selectedCycle, setSelectedCycle] = useState(null)

    const activeAgreements = agreementsData?.content || []

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            paymentDate: new Date().toISOString().split("T")[0],
        },
    })

    const selectedAgreementId = watch("agreementId")
    const enteredAmount = watch("amount")
    const selectedAgreement = activeAgreements.find(
        ag => ag.id === selectedAgreementId
    )

    // Generate last 6 cycles for selected agreement
    const cycles = generateCycles(selectedAgreement)

    const expectedAmount = selectedAgreement?.rentAmount || 0
    const overpayment = enteredAmount && parseFloat(enteredAmount) > expectedAmount
        ? parseFloat(enteredAmount) - expectedAmount : 0

    const onSubmit = async (data) => {
        setError("")
        if (!selectedCycle) {
            setError("Please select a payment period")
            return
        }
        try {
            await createPayment.mutateAsync({
                agreementId: data.agreementId,
                paymentDate: data.paymentDate,
                amount: parseFloat(data.amount),
                method: "CASH",
                periodStartDate: selectedCycle.start,
                periodEndDate: selectedCycle.end,
                reference: data.reference || null,
                notes: data.notes || null,
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

                        {/* Tenant / Agreement */}
                        <div>
                            <label style={labelStyle}>Tenant / Agreement</label>
                            <select
                                {...register("agreementId", { required: "Please select an agreement" })}
                                style={inputStyle}
                                onChange={() => setSelectedCycle(null)}
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

                        {/* Billing cycle selector */}
                        {selectedAgreement && (
                            <div>
                                <label style={labelStyle}>Payment period</label>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    {cycles.map((cycle, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setSelectedCycle(cycle)}
                                            style={{
                                                padding: "10px 14px", borderRadius: "8px",
                                                border: "1px solid",
                                                borderColor: selectedCycle?.start === cycle.start
                                                    ? "#0F6E56" : "#e5e7eb",
                                                backgroundColor: selectedCycle?.start === cycle.start
                                                    ? "#E1F5EE" : "#fff",
                                                cursor: "pointer", textAlign: "left",
                                                fontFamily: "'DM Sans', sans-serif",
                                                display: "flex", alignItems: "center",
                                                justifyContent: "space-between",
                                            }}
                                        >
                      <span style={{
                          fontSize: "14px", fontWeight: "500",
                          color: selectedCycle?.start === cycle.start
                              ? "#0F6E56" : "#111827",
                      }}>
                        {formatCycleDate(cycle.start)} – {formatCycleDate(cycle.end)}
                      </span>
                                            {cycle.isCurrent && (
                                                <span style={{
                                                    fontSize: "11px", padding: "2px 8px",
                                                    borderRadius: "10px", backgroundColor: "#0F6E56",
                                                    color: "#fff", fontWeight: "500",
                                                }}>
                          Current
                        </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {!selectedCycle && (
                                    <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "6px" }}>
                                        Select the period this payment covers
                                    </p>
                                )}
                            </div>
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
                                type="number" style={inputStyle} placeholder="350000"
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
                                    borderLeft: "3px solid #EF9F27", fontSize: "13px", color: "#854F0B",
                                }}>
                                    Overpayment of {formatUGX(overpayment)} — will roll over to next cycle
                                </div>
                            )}
                            {enteredAmount && parseFloat(enteredAmount) > 0 &&
                                parseFloat(enteredAmount) < expectedAmount && selectedAgreement && (
                                    <div style={{
                                        marginTop: "8px", padding: "10px 14px",
                                        backgroundColor: "#fef2f2", borderRadius: "8px",
                                        borderLeft: "3px solid #ef4444", fontSize: "13px", color: "#dc2626",
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
                                ...inputStyle, backgroundColor: "#f9fafb", color: "#6b7280",
                                display: "flex", alignItems: "center", gap: "8px",
                            }}>
                <span style={{
                    display: "inline-block", padding: "2px 10px",
                    borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                    backgroundColor: "#E1F5EE", color: "#0F6E56",
                }}>CASH</span>
                                <span style={{ fontSize: "13px" }}>Cash payment (MVP)</span>
                            </div>
                        </div>

                        {/* Reference */}
                        <div>
                            <label style={labelStyle}>
                                Reference <span style={{ color: "#9ca3af", fontWeight: "400" }}>(optional)</span>
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
                                Notes <span style={{ color: "#9ca3af", fontWeight: "400" }}>(optional)</span>
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
    const [selectedPaymentId, setSelectedPaymentId] = useState(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(0)
        }, 400)
        return () => clearTimeout(timer)
    }, [search])

    const {data, isLoading} = usePayments({
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
            <Plus size={16}/> Record Payment
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
                        fontFamily: "'DM Sans', sans-serif", color: "#111827", backgroundColor: "#fff",
                    }}
                    onFocus={e => e.target.style.borderColor = "#0F6E56"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                />
                <input
                    type="date" value={fromDate}
                    onChange={e => {
                        setFromDate(e.target.value);
                        setPage(0)
                    }}
                    style={{
                        padding: "10px 12px", fontSize: "13px",
                        borderRadius: "8px", border: "1px solid #e5e7eb",
                        outline: "none", fontFamily: "'DM Sans', sans-serif",
                        color: "#111827", backgroundColor: "#fff",
                    }}
                    onFocus={e => e.target.style.borderColor = "#0F6E56"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                />
                <span style={{fontSize: "13px", color: "#9ca3af"}}>→</span>
                <input
                    type="date" value={toDate}
                    onChange={e => {
                        setToDate(e.target.value);
                        setPage(0)
                    }}
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
                        onClick={() => {
                            setSearch("");
                            setFromDate("");
                            setToDate("");
                            setPage(0)
                        }}
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
                    <div style={{padding: "60px", textAlign: "center", color: "#9ca3af", fontSize: "14px"}}>
                        Loading payments...
                    </div>
                ) : payments.length === 0 ? (
                    <div style={{padding: "60px", textAlign: "center"}}>
                        <p style={{color: "#9ca3af", fontSize: "14px", marginBottom: "16px"}}>
                            {search || fromDate || toDate ? "No payments found for the selected filters." : "No payments recorded yet."}
                        </p>
                        {!search && !fromDate && !toDate && (
                            <button onClick={() => setShowModal(true)} style={{
                                display: "inline-flex", alignItems: "center", gap: "6px",
                                padding: "9px 16px", borderRadius: "8px", fontSize: "14px",
                                backgroundColor: "#0F6E56", color: "#fff", border: "none",
                                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                            }}>
                                <Plus size={16}/> Record Payment
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
                                    {["Tenant", "Unit", "Period", "Amount", "Expected", "Status", "Date", "Reference"].map((h, i) => (
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
                                    <tr key={p.id} style={{borderTop: "1px solid #f9f9f9"}}>
                                        <td style={{
                                            padding: "14px 20px",
                                            fontSize: "14px",
                                            color: "#111827",
                                            fontWeight: "500"
                                        }}>
                                            {p.tenantName}
                                        </td>
                                        <td style={{padding: "14px 20px", fontSize: "14px", color: "#6b7280"}}>
                                            {p.roomNumber}
                                        </td>
                                        <td style={{padding: "14px 20px", fontSize: "14px", color: "#6b7280"}}>
                                            {formatCycle(p.periodStartDate, p.periodEndDate)}
                                        </td>
                                        <td style={{
                                            padding: "14px 20px",
                                            fontSize: "14px",
                                            color: "#111827",
                                            fontWeight: "500"
                                        }}>
                                            {formatUGX(p.amount)}
                                        </td>
                                        <td style={{padding: "14px 20px", fontSize: "14px", color: "#6b7280"}}>
                                            {formatUGX(p.expectedAmount)}
                                        </td>
                                        <td style={{padding: "14px 20px"}}>
                        <span style={{
                            display: "inline-block", padding: "3px 10px",
                            borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                            backgroundColor:
                                p.periodStatus === "PAID" ? "#E1F5EE" :
                                    p.periodStatus === "PARTIAL" ? "#FAEEDA" :
                                        p.periodStatus === "ROLLOVER" ? "#E6F1FB" : "#f3f4f6",
                            color:
                                p.periodStatus === "PAID" ? "#0F6E56" :
                                    p.periodStatus === "PARTIAL" ? "#854F0B" :
                                        p.periodStatus === "ROLLOVER" ? "#185FA5" : "#6b7280",
                        }}>
                          {p.periodStatus || "—"}
                        </span>
                                        </td>
                                        <td style={{padding: "14px 20px", fontSize: "14px", color: "#6b7280"}}>
                                            {formatDate(p.paymentDate)}
                                        </td>
                                        <td style={{padding: "14px 20px", fontSize: "14px", color: "#6b7280"}}>
                                            {p.reference || "—"}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="mobile-cards" style={{display: "none", flexDirection: "column"}}>
                            {payments.map((p, i) => (
                                <div key={p.id}
                                     onClick={() => setSelectedPaymentId(p.id)}
                                     style={{
                                         padding: "14px 16px",
                                         borderTop: i === 0 ? "none" : "1px solid #f3f4f6",
                                         cursor: "pointer"
                                     }}
                                >
                                    {/* Row 1 — tenant + status */}
                                    <div style={{
                                        display: "flex", alignItems: "center",
                                        justifyContent: "space-between", marginBottom: "4px",
                                    }}>
        <span style={{fontSize: "15px", fontWeight: "600", color: "#111827"}}>
          {p.tenantName}
        </span>
                                        <span style={{
                                            display: "inline-block", padding: "3px 10px",
                                            borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                                            backgroundColor:
                                                p.periodStatus === "PAID" ? "#E1F5EE" :
                                                    p.periodStatus === "PARTIAL" ? "#FAEEDA" :
                                                        p.periodStatus === "ROLLOVER" ? "#E6F1FB" : "#f3f4f6",
                                            color:
                                                p.periodStatus === "PAID" ? "#0F6E56" :
                                                    p.periodStatus === "PARTIAL" ? "#854F0B" :
                                                        p.periodStatus === "ROLLOVER" ? "#185FA5" : "#6b7280",
                                        }}>
          {p.periodStatus || "—"}
        </span>
                                        <ChevronRight size={16} color="#9ca3af"/>
                                    </div>

                                    {/* Row 2 — unit · period */}
                                    <div style={{fontSize: "13px", color: "#6b7280", marginBottom: "8px"}}>
                                        Unit {p.roomNumber} · {formatCycle(p.periodStartDate, p.periodEndDate)}

                                    </div>

                                    {/* Row 3 — amount bar */}
                                    <div style={{
                                        backgroundColor: "#f9fafb", borderRadius: "8px",
                                        padding: "10px 12px", marginBottom: "8px",
                                    }}>
                                        <div style={{
                                            display: "flex", justifyContent: "space-between",
                                            alignItems: "baseline", marginBottom: "6px",
                                        }}>
          <span style={{fontSize: "18px", fontWeight: "700", color: "#111827"}}>
            {formatUGX(p.amount)}
          </span>
                                            <span style={{fontSize: "12px", color: "#9ca3af"}}>
            of {formatUGX(p.expectedAmount)}
          </span>
                                        </div>

                                        {/* Progress bar */}
                                        {p.expectedAmount > 0 && (
                                            <div style={{
                                                height: "4px", borderRadius: "4px",
                                                backgroundColor: "#e5e7eb", overflow: "hidden",
                                            }}>
                                                <div style={{
                                                    height: "100%", borderRadius: "4px",
                                                    backgroundColor:
                                                        p.periodStatus === "PAID" ? "#0F6E56" :
                                                            p.periodStatus === "ROLLOVER" ? "#185FA5" : "#EF9F27",
                                                    width: `${Math.min(100, (p.amount / p.expectedAmount) * 100)}%`,
                                                }}/>
                                            </div>
                                        )}
                                    </div>

                                    {/* Row 4 — date + reference */}
                                    <div style={{fontSize: "12px", color: "#9ca3af"}}>
                                        {new Date(p.paymentDate).toLocaleDateString("en-UG", {
                                            day: "numeric", month: "short", year: "numeric"
                                        })}
                                        {p.reference && ` · ${p.reference}`}
                                        {p.source === "ROLLOVER" && " · Auto-rollover"}
                                    </div>
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

            {showModal && <RecordPaymentModal onClose={() => setShowModal(false)}/>}
            {selectedPaymentId && (
                <PaymentDetailSheet
                    paymentId={selectedPaymentId}
                    onClose={() => setSelectedPaymentId(null)}
                />
            )}
        </PageWrapper>
    )
}