import {useState} from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import {useSettings, useUpdateSettings} from "@/hooks/useSettings"
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

export default function ReceiptSettingsPage() {
    const {data: settings, isLoading} = useSettings()
    const updateSettings = useUpdateSettings()
    const [numbering, setNumbering] = useState(
        settings?.receiptNumbering || "AUTO"
    )
    const [receiptStyle, setReceiptStyle] = useState(
        settings?.receiptStyle || "DIGITAL"
    )
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const {register, handleSubmit} = useForm({
        values: {
            receiptPrefix: settings?.receiptPrefix || "RCP",
            nextReceiptNo: settings?.nextReceiptNo || 1,
            receiptFooter: settings?.receiptFooter || "Thank you for your business",
        },
    })

    const onSubmit = async (data) => {
        setError("")
        try {
            await updateSettings.mutateAsync({
                receiptPrefix: data.receiptPrefix || "RCP",
                nextReceiptNo: parseInt(data.nextReceiptNo),
                receiptNumbering: numbering,
                receiptFooter: data.receiptFooter || null,
                receiptStyle: receiptStyle,
            })
            setSuccess("Receipt settings saved")
            setTimeout(() => setSuccess(""), 3000)
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    // Preview receipt number
    const prefix = settings?.receiptPrefix || "RCP"
    const nextNo = settings?.nextReceiptNo || 1
    const previewNo = `${prefix}-${String(nextNo).padStart(3, "0")}`

    return (
        <PageWrapper title="Receipt Settings" showBack>
            {isLoading ? (
                <div style={{textAlign: "center", color: "#9ca3af", padding: "60px 0"}}>
                    Loading...
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{display: "flex", flexDirection: "column", gap: "20px"}}>

                        {/* Numbering */}
                        <div style={{
                            backgroundColor: "#fff", borderRadius: "12px",
                            border: "1px solid #f0f0f0", padding: "24px",
                            display: "flex", flexDirection: "column", gap: "16px",
                        }}>
                            <p style={{fontSize: "13px", fontWeight: "600", color: "#111827", margin: 0}}>
                                Receipt Numbering
                            </p>

                            {/* Mode toggle */}
                            <div>
                                <label style={labelStyle}>Numbering mode</label>
                                <div style={{display: "flex", gap: "8px"}}>
                                    {[
                                        {value: "AUTO", label: "Auto-increment", desc: "RCP-001, RCP-002..."},
                                        {value: "MANUAL", label: "Manual start", desc: "Set starting number"},
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setNumbering(opt.value)}
                                            style={{
                                                flex: 1, padding: "10px 8px", borderRadius: "8px",
                                                fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
                                                cursor: "pointer", fontWeight: "500", border: "1px solid",
                                                borderColor: numbering === opt.value ? "#0F6E56" : "#e5e7eb",
                                                backgroundColor: numbering === opt.value ? "#0F6E56" : "#fff",
                                                color: numbering === opt.value ? "#fff" : "#6b7280",
                                                textAlign: "center",
                                            }}
                                        >
                                            <div>{opt.label}</div>
                                            <div style={{fontSize: "10px", marginTop: "2px", opacity: 0.8}}>
                                                {opt.desc}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Prefix */}
                            <div>
                                <label style={labelStyle}>Receipt prefix</label>
                                <input
                                    {...register("receiptPrefix")}
                                    style={{...inputStyle, maxWidth: "160px"}}
                                    placeholder="RCP"
                                    maxLength={10}
                                    onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                    onBlur={e => e.target.style.borderColor = "#d1d5db"}
                                />
                                <p style={{fontSize: "12px", color: "#9ca3af", marginTop: "6px"}}>
                                    e.g. RCP, INV, RCPT
                                </p>
                            </div>

                            {/* Starting number — always shown */}
                            <div>
                                <label style={labelStyle}>
                                    {numbering === "MANUAL"
                                        ? "Starting number (set manually)"
                                        : "Next receipt number"}
                                </label>
                                <input
                                    {...register("nextReceiptNo")}
                                    type="number"
                                    min={1}
                                    style={{...inputStyle, maxWidth: "160px"}}
                                    placeholder="1"
                                    onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                    onBlur={e => e.target.style.borderColor = "#d1d5db"}
                                />
                                {numbering === "MANUAL" && (
                                    <p style={{fontSize: "12px", color: "#9ca3af", marginTop: "6px"}}>
                                        Match your physical receipt book — e.g. 1954
                                    </p>
                                )}
                            </div>

                            {/* Preview */}
                            <div style={{
                                backgroundColor: "#E1F5EE", borderRadius: "8px",
                                padding: "12px 16px", display: "flex",
                                alignItems: "center", justifyContent: "space-between",
                            }}>
                <span style={{fontSize: "13px", color: "#0F6E56", fontWeight: "500"}}>
                  Next receipt will be:
                </span>
                                <span style={{fontSize: "16px", fontWeight: "700", color: "#0F6E56"}}>
                  {previewNo}
                </span>
                            </div>
                        </div>

                        {/* Style */}
                        <div style={{
                            backgroundColor: "#fff", borderRadius: "12px",
                            border: "1px solid #f0f0f0", padding: "24px",
                            display: "flex", flexDirection: "column", gap: "16px",
                        }}>
                            <p style={{fontSize: "13px", fontWeight: "600", color: "#111827", margin: 0}}>
                                Receipt Style
                            </p>

                            <div style={{display: "flex", gap: "8px"}}>
                                {[
                                    {
                                        value: "DIGITAL",
                                        label: "Digital",
                                        desc: "Clean, branded",
                                        preview: "🟢 Modern layout",
                                    },
                                    {
                                        value: "FORMAL",
                                        label: "Formal",
                                        desc: "Like physical book",
                                        preview: "📄 Traditional",
                                    },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setReceiptStyle(opt.value)}
                                        style={{
                                            flex: 1, padding: "14px 10px", borderRadius: "10px",
                                            fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
                                            cursor: "pointer", fontWeight: "500", border: "2px solid",
                                            borderColor: receiptStyle === opt.value ? "#0F6E56" : "#e5e7eb",
                                            backgroundColor: receiptStyle === opt.value ? "#E1F5EE" : "#fff",
                                            color: receiptStyle === opt.value ? "#0F6E56" : "#6b7280",
                                            textAlign: "center",
                                        }}
                                    >
                                        <div style={{fontSize: "18px", marginBottom: "6px"}}>
                                            {opt.preview}
                                        </div>
                                        <div style={{fontWeight: "600"}}>{opt.label}</div>
                                        <div style={{fontSize: "11px", marginTop: "2px", opacity: 0.8}}>
                                            {opt.desc}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <p style={{fontSize: "12px", color: "#9ca3af"}}>
                                You can also choose the style each time you generate a receipt.
                            </p>
                        </div>

                        {/* Footer */}
                        <div style={{
                            backgroundColor: "#fff", borderRadius: "12px",
                            border: "1px solid #f0f0f0", padding: "24px",
                            display: "flex", flexDirection: "column", gap: "16px",
                        }}>
                            <p style={{fontSize: "13px", fontWeight: "600", color: "#111827", margin: 0}}>
                                Receipt Footer
                            </p>
                            <div>
                                <label style={labelStyle}>Footer message</label>
                                <textarea
                                    {...register("receiptFooter")}
                                    rows={2}
                                    style={{...inputStyle, resize: "vertical"}}
                                    placeholder="Thank you for your business"
                                    onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                    onBlur={e => e.target.style.borderColor = "#d1d5db"}
                                />
                                <p style={{fontSize: "12px", color: "#9ca3af", marginTop: "6px"}}>
                                    Shown at the bottom of every receipt
                                </p>
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
                            {updateSettings.isPending ? "Saving..." : "Save settings"}
                        </button>

                    </div>
                </form>
            )}
        </PageWrapper>
    )
}