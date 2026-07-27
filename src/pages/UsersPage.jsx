import {useState} from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import {useDeactivateUser, useInviteUser, useResendInvite, useUsers} from "@/hooks/useUsers"
import {useProperties} from "@/hooks/useProperties"
import useAuthStore from "@/store/authStore"
import {useForm} from "react-hook-form"
import {Plus, Send, ShieldOff, UserCog, X} from "lucide-react"
import {getErrorMessage} from "@/utils/errorMessage"

const inputStyle = {
    width: "100%", padding: "10px 14px", fontSize: "14px",
    borderRadius: "8px", border: "1px solid #d1d5db",
    outline: "none", boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif", backgroundColor: "#fff", color: "#111827",
}
const labelStyle = {
    display: "block", fontSize: "13px", fontWeight: "500",
    color: "#374151", marginBottom: "6px",
}

const ROLE_LABELS = {
    SUPER_ADMIN: "Owner",
    ADMIN: "Admin",
    PROPERTY_MANAGER: "Property Manager",
}

const roleBadge = (role) => ({
    display: "inline-block", padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: "500",
    backgroundColor: role === "PROPERTY_MANAGER" ? "#eef2ff" : "#E1F5EE",
    color: role === "PROPERTY_MANAGER" ? "#4338ca" : "#0F6E56",
})

const statusBadge = (status) => ({
    display: "inline-block", padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: "500",
    backgroundColor: status === "ACTIVE" ? "#E1F5EE"
        : status === "INVITED" ? "#fef9c3" : "#fef2f2",
    color: status === "ACTIVE" ? "#0F6E56"
        : status === "INVITED" ? "#854d0e" : "#dc2626",
})

function InviteModal({onClose}) {
    const inviteUser = useInviteUser()
    const currentRole = useAuthStore(s => s.role)
    const {data: properties = []} = useProperties()
    const [role, setRole] = useState("PROPERTY_MANAGER")
    const [propertyIds, setPropertyIds] = useState([])
    const [error, setError] = useState("")

    const {register, handleSubmit, formState: {errors}} = useForm()

    const toggleProperty = (id) =>
        setPropertyIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])

    const onSubmit = async (data) => {
        setError("")
        if (role === "PROPERTY_MANAGER" && propertyIds.length === 0) {
            setError("Assign at least one property to a property manager")
            return
        }
        try {
            await inviteUser.mutateAsync({
                name: data.name,
                email: data.email,
                role,
                propertyIds: role === "PROPERTY_MANAGER" ? propertyIds : [],
            })
            onClose()
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    return (
        <div style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 200, padding: "16px",
        }}>
            <div style={{
                backgroundColor: "#fff", borderRadius: "16px", width: "100%", maxWidth: "480px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)", maxHeight: "90vh", overflowY: "auto",
            }}>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "20px 24px", borderBottom: "1px solid #f3f4f6",
                    position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1,
                }}>
                    <h2 style={{fontSize: "16px", fontWeight: "600", color: "#111827", margin: 0}}>
                        Invite User
                    </h2>
                    <button onClick={onClose} style={{
                        background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "4px",
                    }}>
                        <X size={20}/>
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{padding: "24px", display: "flex", flexDirection: "column", gap: "16px"}}>
                        <div>
                            <label style={labelStyle}>Full name</label>
                            <input {...register("name", {required: "Name is required"})}
                                   style={inputStyle} placeholder="Moses Okello"
                                   onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                   onBlur={e => e.target.style.borderColor = "#d1d5db"}/>
                            {errors.name && <p style={{fontSize: "12px", color: "#ef4444", marginTop: "4px"}}>{errors.name.message}</p>}
                        </div>

                        <div>
                            <label style={labelStyle}>Email</label>
                            <input {...register("email", {required: "Email is required"})}
                                   type="email" style={inputStyle} placeholder="moses@example.com"
                                   onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                   onBlur={e => e.target.style.borderColor = "#d1d5db"}/>
                            {errors.email && <p style={{fontSize: "12px", color: "#ef4444", marginTop: "4px"}}>{errors.email.message}</p>}
                            <p style={{fontSize: "12px", color: "#9ca3af", marginTop: "5px"}}>
                                We'll email them a link to set a password and join.
                            </p>
                        </div>

                        <div>
                            <label style={labelStyle}>Role</label>
                            <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}>
                                <option value="PROPERTY_MANAGER">Property Manager (assigned properties only)</option>
                                {currentRole === "SUPER_ADMIN" && (
                                    <option value="ADMIN">Admin (full access)</option>
                                )}
                            </select>
                        </div>

                        {role === "PROPERTY_MANAGER" && (
                            <div>
                                <label style={labelStyle}>Assigned properties</label>
                                <div style={{
                                    border: "1px solid #e5e7eb", borderRadius: "8px",
                                    maxHeight: "180px", overflowY: "auto",
                                }}>
                                    {properties.length === 0 ? (
                                        <p style={{padding: "12px 14px", fontSize: "13px", color: "#9ca3af", margin: 0}}>
                                            No properties yet — create one first.
                                        </p>
                                    ) : properties.map(p => (
                                        <label key={p.id} style={{
                                            display: "flex", alignItems: "center", gap: "10px",
                                            padding: "10px 14px", borderBottom: "1px solid #f3f4f6",
                                            cursor: "pointer", fontSize: "14px", color: "#374151",
                                        }}>
                                            <input type="checkbox"
                                                   checked={propertyIds.includes(p.id)}
                                                   onChange={() => toggleProperty(p.id)}/>
                                            {p.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div style={{
                                backgroundColor: "#fef2f2", color: "#dc2626", fontSize: "13px",
                                padding: "10px 14px", borderRadius: "8px", borderLeft: "3px solid #ef4444",
                            }}>{error}</div>
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
                        }}>Cancel</button>
                        <button type="submit" disabled={inviteUser.isPending} style={{
                            padding: "9px 20px", borderRadius: "8px", fontSize: "14px",
                            backgroundColor: inviteUser.isPending ? "#6b9e8f" : "#0F6E56",
                            color: "#fff", border: "none", cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                        }}>{inviteUser.isPending ? "Sending…" : "Send invite"}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function UsersPage() {
    const {data: users = [], isLoading} = useUsers()
    const {data: properties = []} = useProperties()
    const deactivateUser = useDeactivateUser()
    const resendInvite = useResendInvite()
    const currentUserId = useAuthStore(s => s.userId)
    const [showInvite, setShowInvite] = useState(false)
    const [resendMsg, setResendMsg] = useState({})

    const propertyName = (id) => properties.find(p => p.id === id)?.name || "—"

    const handleResend = async (id) => {
        setResendMsg(m => ({...m, [id]: undefined}))
        try {
            await resendInvite.mutateAsync(id)
            setResendMsg(m => ({...m, [id]: {type: "success", text: "Invitation resent"}}))
        } catch (err) {
            setResendMsg(m => ({...m, [id]: {type: "error", text: getErrorMessage(err)}}))
        }
    }

    const actions = (
        <button onClick={() => setShowInvite(true)} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "9px 16px", borderRadius: "8px", fontSize: "14px",
            backgroundColor: "#0F6E56", color: "#fff", border: "none",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
        }}>
            <Plus size={16}/> Invite User
        </button>
    )

    return (
        <PageWrapper title="Users" actions={actions} showBack>
            {isLoading ? (
                <div style={{padding: "60px", textAlign: "center", color: "#9ca3af", fontSize: "14px"}}>
                    Loading users…
                </div>
            ) : (
                <div style={{
                    display: "grid", gap: "14px",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                }}>
                    {users.map(u => {
                        const canDeactivate =
                            u.id !== currentUserId && u.role !== "SUPER_ADMIN" && u.status !== "DEACTIVATED"
                        return (
                            <div key={u.id} style={{
                                backgroundColor: "#fff", borderRadius: "12px",
                                border: "1px solid #f0f0f0", padding: "18px",
                                display: "flex", flexDirection: "column", gap: "12px",
                            }}>
                                <div style={{display: "flex", alignItems: "flex-start", gap: "12px"}}>
                                    <div style={{
                                        width: "40px", height: "40px", borderRadius: "10px",
                                        backgroundColor: "#E1F5EE", flexShrink: 0,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <UserCog size={18} color="#0F6E56"/>
                                    </div>
                                    <div style={{flex: 1, minWidth: 0}}>
                                        <div style={{fontSize: "15px", fontWeight: "600", color: "#111827"}}>
                                            {u.name}
                                        </div>
                                        <div style={{fontSize: "13px", color: "#9ca3af", wordBreak: "break-all"}}>
                                            {u.email || u.phoneNumber}
                                        </div>
                                    </div>
                                </div>

                                <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
                                    <span style={roleBadge(u.role)}>{ROLE_LABELS[u.role]}</span>
                                    <span style={statusBadge(u.status)}>{u.status}</span>
                                </div>

                                {u.role === "PROPERTY_MANAGER" && (
                                    <div style={{fontSize: "13px", color: "#6b7280"}}>
                                        {u.assignedPropertyIds.length === 0
                                            ? "No properties assigned"
                                            : u.assignedPropertyIds.map(propertyName).join(", ")}
                                    </div>
                                )}

                                {(canDeactivate || u.status === "INVITED") && (
                                    <div style={{
                                        borderTop: "1px solid #f3f4f6", paddingTop: "12px",
                                        display: "flex", flexDirection: "column", gap: "8px",
                                    }}>
                                        <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
                                            {u.status === "INVITED" && (() => {
                                                const sending = resendInvite.isPending && resendInvite.variables === u.id
                                                return (
                                                    <button onClick={() => handleResend(u.id)} disabled={sending} style={{
                                                        display: "flex", alignItems: "center", gap: "6px",
                                                        padding: "8px 14px", borderRadius: "8px", fontSize: "13px",
                                                        border: "1px solid #d1e9e1", backgroundColor: "#fff",
                                                        color: "#0F6E56", cursor: sending ? "default" : "pointer",
                                                        opacity: sending ? 0.6 : 1,
                                                        fontFamily: "'DM Sans', sans-serif",
                                                    }}>
                                                        <Send size={13}/> {sending ? "Sending…" : "Resend invite"}
                                                    </button>
                                                )
                                            })()}
                                            {canDeactivate && (
                                                <button onClick={() => deactivateUser.mutate(u.id)} style={{
                                                    display: "flex", alignItems: "center", gap: "6px",
                                                    padding: "8px 14px", borderRadius: "8px", fontSize: "13px",
                                                    border: "1px solid #fee2e2", backgroundColor: "#fff",
                                                    color: "#dc2626", cursor: "pointer",
                                                    fontFamily: "'DM Sans', sans-serif",
                                                }}>
                                                    <ShieldOff size={13}/> Deactivate
                                                </button>
                                            )}
                                        </div>
                                        {resendMsg[u.id] && (
                                            <div style={{
                                                fontSize: "12px",
                                                color: resendMsg[u.id].type === "success" ? "#0F6E56" : "#dc2626",
                                            }}>
                                                {resendMsg[u.id].text}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {showInvite && <InviteModal onClose={() => setShowInvite(false)}/>}
        </PageWrapper>
    )
}
