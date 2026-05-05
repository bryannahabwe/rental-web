import { useEffect } from "react"
import { X } from "lucide-react"

export default function BottomSheet({ title, onClose, children }) {
    useEffect(() => {
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = ""
        }
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

            {/* ── Mobile bottom sheet (< 768px) ── */}
            <div style={{
                display: "none",  // overridden by the style tag below
            }}>
            </div>

            {/* ── Single responsive sheet — changes shape at 768px ── */}
            <style>{`
                .bottom-sheet-mobile {
                    position: fixed;
                    bottom: 64px;
                    left: 0;
                    right: 0;
                    background-color: #fff;
                    border-radius: 20px 20px 0 0;
                    z-index: 201;
                    max-height: calc(85vh - 64px);
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 -4px 24px rgba(0,0,0,0.12);
                }

                .bottom-sheet-desktop {
                    display: none;
                }

                @media (min-width: 768px) {
                    .bottom-sheet-mobile {
                        display: none;
                    }

                    .bottom-sheet-desktop {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background-color: #fff;
                        border-radius: 16px;
                        z-index: 201;
                        width: 100%;
                        max-width: 520px;
                        max-height: 90vh;
                        display: flex;
                        flex-direction: column;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.16);
                        overflow: hidden;
                    }
                }
            `}</style>

            {/* Mobile sheet */}
            <div className="bottom-sheet-mobile">
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
                    <button onClick={onClose} style={{
                        background: "none", border: "none",
                        cursor: "pointer", color: "#9ca3af", padding: "4px",
                    }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    padding: "20px",
                    paddingBottom: "24px",
                }}>
                    {children}
                </div>
            </div>

            {/* Desktop modal */}
            <div className="bottom-sheet-desktop">
                {/* Header */}
                <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 24px",
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
                    <button onClick={onClose} style={{
                        background: "none", border: "none",
                        cursor: "pointer", color: "#9ca3af", padding: "4px",
                    }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content — scrollable */}
                <div style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    padding: "24px",
                }}>
                    {children}
                </div>
            </div>
        </>
    )
}