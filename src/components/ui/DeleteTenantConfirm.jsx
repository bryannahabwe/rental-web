import { useState } from "react"
import { useDeleteTenant } from "@/hooks/useTenants"
import { getErrorMessage } from "@/utils/errorMessage"

/**
 * Confirm-and-delete a tenant. `onClose` closes the dialog (cancel or after
 * success); `onDeleted` (optional) fires only after a successful delete — the
 * detail page uses it to navigate back to the list.
 */
export default function DeleteTenantConfirm({ tenant, onClose, onDeleted }) {
    const deleteTenant = useDeleteTenant()
    const [error, setError] = useState("")

    const handleDelete = async () => {
        try {
            await deleteTenant.mutateAsync(tenant.id)
            onClose()
            onDeleted?.()
        } catch (err) {
            setError(getErrorMessage(err, "Could not delete tenant"))
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
                <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: "0 0 8px" }}>
                    Delete tenant?
                </h2>
                <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 20px", lineHeight: "1.5" }}>
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
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
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
