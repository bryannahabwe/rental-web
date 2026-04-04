import BottomSheet from "./BottomSheet"
import { useUnit } from "@/hooks/useUnits"
import { Pencil, Trash2 } from "lucide-react"

const formatUGX = (amount) =>
    amount == null ? "—" : `UGX ${Number(amount).toLocaleString()}`

function DetailRow({ label, value, valueColor }) {
    return (
        <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", gap: "16px",
            paddingBottom: "14px", marginBottom: "14px",
            borderBottom: "1px solid #f3f4f6",
        }}>
      <span style={{ fontSize: "13px", color: "#9ca3af", flexShrink: 0 }}>
        {label}
      </span>
            <span style={{
                fontSize: "13px", fontWeight: "500",
                color: valueColor || "#111827", textAlign: "right",
            }}>
        {value}
      </span>
        </div>
    )
}

export default function UnitDetailSheet({ unitId, onClose, onEdit, onDelete }) {
    const { data: unit, isLoading } = useUnit(unitId)

    return (
        <BottomSheet title="Unit Details" onClose={onClose}>
            {isLoading ? (
                <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px 0" }}>
                    Loading...
                </div>
            ) : unit ? (
                <>
                    {/* Room number header */}
                    <div style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between", marginBottom: "24px",
                    }}>
                        <div>
                            <div style={{ fontSize: "28px", fontWeight: "800", color: "#111827" }}>
                                {unit.roomNumber}
                            </div>
                            <div style={{ fontSize: "14px", color: "#0F6E56", fontWeight: "500", marginTop: "2px" }}>
                                {formatUGX(unit.rentAmount)} / month
                            </div>
                        </div>
                        <span style={{
                            display: "inline-block", padding: "6px 14px",
                            borderRadius: "20px", fontSize: "13px", fontWeight: "500",
                            backgroundColor: unit.isAvailable ? "#E1F5EE" : "#fef2f2",
                            color: unit.isAvailable ? "#0F6E56" : "#dc2626",
                        }}>
              {unit.isAvailable ? "Available" : "Occupied"}
            </span>
                    </div>

                    {/* Details */}
                    <div style={{
                        backgroundColor: "#f9fafb", borderRadius: "12px",
                        padding: "16px", marginBottom: "20px",
                    }}>
                        <p style={{
                            fontSize: "11px", fontWeight: "500", color: "#9ca3af",
                            textTransform: "uppercase", letterSpacing: "0.06em",
                            marginBottom: "14px",
                        }}>
                            Details
                        </p>
                        <DetailRow label="Room Number" value={unit.roomNumber} />
                        <DetailRow label="Monthly Rent" value={formatUGX(unit.rentAmount)} />
                        <DetailRow
                            label="Status"
                            value={unit.isAvailable ? "Available" : "Occupied"}
                            valueColor={unit.isAvailable ? "#0F6E56" : "#dc2626"}
                        />
                        <div style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "flex-start", gap: "16px",
                        }}>
                            <span style={{ fontSize: "13px", color: "#9ca3af" }}>Description</span>
                            <span style={{
                                fontSize: "13px", fontWeight: "500", color: "#111827",
                                textAlign: "right", maxWidth: "60%",
                            }}>
                {unit.description || "—"}
              </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            onClick={() => { onEdit(unit); onClose() }}
                            style={{
                                flex: 1, padding: "12px", borderRadius: "10px",
                                border: "1px solid #e5e7eb", backgroundColor: "#fff",
                                color: "#374151", cursor: "pointer", fontSize: "14px",
                                fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                            }}
                        >
                            <Pencil size={15} /> Edit
                        </button>
                        <button
                            onClick={() => { onDelete(unit); onClose() }}
                            style={{
                                flex: 1, padding: "12px", borderRadius: "10px",
                                border: "1px solid #fee2e2", backgroundColor: "#fff",
                                color: "#dc2626", cursor: "pointer", fontSize: "14px",
                                fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                            }}
                        >
                            <Trash2 size={15} /> Delete
                        </button>
                    </div>
                </>
            ) : (
                <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px 0" }}>
                    Unit not found
                </div>
            )}
        </BottomSheet>
    )
}