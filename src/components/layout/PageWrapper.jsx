import Sidebar from "./Sidebar"
import BottomNav from "./BottomNav"

export default function PageWrapper({ title, actions, children }) {
    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8faf9" }}>

            {/* Sidebar — desktop only */}
            <div style={{ display: "none" }} className="sidebar-wrapper">
                <Sidebar />
            </div>
            <Sidebar />

            {/* Main content */}
            <div className="main-content" style={{
                flex: 1,
                marginLeft: "240px",
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
            }}>

                {/* Top bar */}
                <div style={{
                    height: "56px", backgroundColor: "#ffffff",
                    borderBottom: "1px solid #f0f0f0",
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 28px", flexShrink: 0,
                    position: "sticky", top: 0, zIndex: 50,
                }}>
                    <h1 style={{
                        fontSize: "15px", fontWeight: "600",
                        color: "#111827", margin: 0,
                        fontFamily: "'DM Sans', sans-serif",
                    }}>
                        {title}
                    </h1>
                    {actions && (
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            {actions}
                        </div>
                    )}
                </div>

                {/* Page content */}
                <div style={{ flex: 1, padding: "28px", paddingBottom: "80px" }}>
                    {children}
                </div>
            </div>

            {/* Bottom nav — mobile only */}
            <BottomNav />
        </div>
    )
}