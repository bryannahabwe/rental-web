import { useEffect } from "react"
import { X } from "lucide-react"
import { useTenantLedger } from "@/hooks/useTenants"
import TenantLedgerView from "./TenantLedgerView"

const formatUGX = (amount) =>
    amount == null ? "—" : `UGX ${Number(amount).toLocaleString()}`

export default function TenantLedgerModal({ tenantId, onClose }) {
    const { data: ledger } = useTenantLedger(tenantId)

    useEffect(() => {
        document.body.style.overflow = "hidden"
        return () => { document.body.style.overflow = "" }
    }, [])

    return (
        <>
            <div onClick={onClose} style={{
                position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 200,
            }} />

            <div style={{
                position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                backgroundColor: "#fff", borderRadius: "16px", zIndex: 201,
                width: "calc(100% - 32px)", maxWidth: "820px", maxHeight: "90vh",
                display: "flex", flexDirection: "column",
                boxShadow: "0 8px 32px rgba(0,0,0,0.16)", overflow: "hidden",
                fontFamily: "'DM Sans', sans-serif",
            }}>
                {/* Header */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "18px 24px", borderBottom: "1px solid #f3f4f6", flexShrink: 0,
                }}>
                    <div>
                        <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: 0 }}>
                            {ledger ? `${ledger.tenantName} — Transactions & Arrears` : "Transactions & Arrears"}
                        </h2>
                        {ledger && (
                            <p style={{ fontSize: "12px", color: "#9ca3af", margin: "4px 0 0" }}>
                                Unit {ledger.unit} · {formatUGX(ledger.rentAmount)}/cycle · {ledger.billingModel}
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} style={{
                        background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "4px",
                    }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "24px" }}>
                    <TenantLedgerView tenantId={tenantId} />
                </div>
            </div>
        </>
    )
}
