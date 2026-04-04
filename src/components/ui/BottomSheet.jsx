import { useEffect } from "react"
import { X } from "lucide-react"

export default function BottomSheet({ title, onClose, children }) {
    // Prevent body scroll when sheet is open
    useEffect(() => {
        document.body.style.overflow = "hidden"
        return () => { document.body.style.overflow = "" }
    }, [])

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0,
                    backgroundColor: "rgba(0,0,0,0.4)",
                    zIndex: 200,
                }}
            />

            {/* Sheet */}
            <div style={{
                position: "fixed", bottom: 0, left: 0, right: 0,
                backgroundColor: "#fff",
                borderRadius: "20px 20px 0 0",
                zIndex: 201,
                maxHeight: "85vh",
                display: "flex", flexDirection: "column",
                boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
            }}>
                {/* Handle */}
                <div style={{
                    width: "40px", height: "4px", borderRadius: "4px",
                    backgroundColor: "#e5e7eb", margin: "12px auto 0",
                    flexShrink: 0,
                }} />

                {/* Header */}
                <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px 12px",
                    borderBottom: "1px solid #f3f4f6",
                    flexShrink: 0,
                }}>
                    <h2 style={{
                        fontSize: "16px", fontWeight: "600",
                        color: "#111827", margin: 0,
                        fontFamily: "'DM Sans', sans-serif",
                    }}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none", border: "none",
                            cursor: "pointer", color: "#9ca3af", padding: "4px",
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content — scrollable */}
                <div style={{ overflowY: "auto", flex: 1, padding: "20px" }}>
                    {children}
                </div>
            </div>
        </>
    )
}