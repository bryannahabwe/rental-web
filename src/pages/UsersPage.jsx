import {useState} from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import BottomSheet from "@/components/ui/BottomSheet"
import {
    useDeactivateUser,
    useInviteUser,
    useResendInvite,
    useUpdateUser,
    useUsers,
} from "@/hooks/useUsers"
import {useProperties} from "@/hooks/useProperties"
import useAuthStore from "@/store/authStore"
import {useForm} from "react-hook-form"
import {ChevronRight, Pencil, Plus, Send, ShieldOff, UserCog, X} from "lucide-react"
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

const formatDate = (value) => {
    if (!value) return "—"
    const d = new Date(value)
    return Number.isNaN(d.getTime())
        ? "—"
        : d.toLocaleDateString(undefined, {year: "numeric", month: "short", day: "numeric"})
}

// Whether the current user may change another user's role/assignments. The
// owner (SUPER_ADMIN) is never editable, and an admin may only manage property
// managers — mirrors the backend's PUT /users/{id} guard.
const canManage = (target, currentRole) => {
    if (target.role === "SUPER_ADMIN") return false
    if (currentRole === "ADMIN" && target.role !== "PROPERTY_MANAGER") return false
    return true
}

/** Scrollable checkbox list of properties, shared by invite/edit. */
function PropertyChecklist({properties, selectedIds, onToggle}) {
    return (
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
                           checked={selectedIds.includes(p.id)}
                           onChange={() => onToggle(p.id)}/>
                    {p.name}
                </label>
            ))}
        </div>
    )
}

function DetailRow({label, value, valueColor}) {
    return (
        <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", gap: "16px",
            paddingBottom: "14px", marginBottom: "14px",
            borderBottom: "1px solid #f3f4f6",
        }}>
            <span style={{fontSize: "13px", color: "#9ca3af", flexShrink: 0}}>{label}</span>
            <span style={{
                fontSize: "13px", fontWeight: "500",
                color: valueColor || "#111827", textAlign: "right", maxWidth: "60%",
            }}>{value}</span>
        </div>
    )
}

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
                phoneNumber: data.phoneNumber,
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
                            <label style={labelStyle}>Phone number</label>
                            <input {...register("phoneNumber", {
                                       required: "Phone number is required",
                                       pattern: {
                                           value: /^\+?[0-9]{10,15}$/,
                                           message: "Invalid phone number format",
                                       },
                                   })}
                                   type="tel" style={inputStyle} placeholder="0771234567"
                                   onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                   onBlur={e => e.target.style.borderColor = "#d1d5db"}/>
                            {errors.phoneNumber && <p style={{fontSize: "12px", color: "#ef4444", marginTop: "4px"}}>{errors.phoneNumber.message}</p>}
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
                                <PropertyChecklist
                                    properties={properties}
                                    selectedIds={propertyIds}
                                    onToggle={toggleProperty}/>
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

function EditUserModal({user, onClose}) {
    const updateUser = useUpdateUser()
    const currentRole = useAuthStore(s => s.role)
    const {data: properties = []} = useProperties()
    const [role, setRole] = useState(user.role)
    const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "")
    const [propertyIds, setPropertyIds] = useState(user.assignedPropertyIds || [])
    const [error, setError] = useState("")

    const toggleProperty = (id) =>
        setPropertyIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])

    const onSubmit = async (e) => {
        e.preventDefault()
        setError("")
        if (!/^\+?[0-9]{10,15}$/.test(phoneNumber.trim())) {
            setError("Enter a valid phone number")
            return
        }
        if (role === "PROPERTY_MANAGER" && propertyIds.length === 0) {
            setError("Assign at least one property to a property manager")
            return
        }
        try {
            await updateUser.mutateAsync({
                id: user.id,
                data: {
                    role,
                    phoneNumber: phoneNumber.trim(),
                    propertyIds: role === "PROPERTY_MANAGER" ? propertyIds : [],
                },
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
            zIndex: 210, padding: "16px",
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
                        Edit User
                    </h2>
                    <button onClick={onClose} style={{
                        background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "4px",
                    }}>
                        <X size={20}/>
                    </button>
                </div>

                <form onSubmit={onSubmit}>
                    <div style={{padding: "24px", display: "flex", flexDirection: "column", gap: "16px"}}>
                        <div>
                            <label style={labelStyle}>Full name</label>
                            <input value={user.name} readOnly disabled
                                   style={{...inputStyle, backgroundColor: "#f9fafb", color: "#6b7280"}}/>
                        </div>

                        <div>
                            <label style={labelStyle}>Email</label>
                            <input value={user.email || "—"} readOnly disabled
                                   style={{...inputStyle, backgroundColor: "#f9fafb", color: "#6b7280"}}/>
                            <p style={{fontSize: "12px", color: "#9ca3af", marginTop: "5px"}}>
                                Name and email can't be changed here.
                            </p>
                        </div>

                        <div>
                            <label style={labelStyle}>Phone number</label>
                            <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                                   type="tel" style={inputStyle} placeholder="0771234567"
                                   onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                   onBlur={e => e.target.style.borderColor = "#d1d5db"}/>
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
                                <PropertyChecklist
                                    properties={properties}
                                    selectedIds={propertyIds}
                                    onToggle={toggleProperty}/>
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
                        <button type="submit" disabled={updateUser.isPending} style={{
                            padding: "9px 20px", borderRadius: "8px", fontSize: "14px",
                            backgroundColor: updateUser.isPending ? "#6b9e8f" : "#0F6E56",
                            color: "#fff", border: "none", cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                        }}>{updateUser.isPending ? "Saving…" : "Save changes"}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function UserDetailSheet({user, propertyName, onEdit, onClose}) {
    const currentRole = useAuthStore(s => s.role)
    const currentUserId = useAuthStore(s => s.userId)
    const deactivateUser = useDeactivateUser()
    const resendInvite = useResendInvite()
    const [msg, setMsg] = useState(null)

    const editable = canManage(user, currentRole)
    const canDeactivate =
        user.id !== currentUserId && user.role !== "SUPER_ADMIN" && user.status !== "DEACTIVATED"

    const handleResend = async () => {
        setMsg(null)
        try {
            await resendInvite.mutateAsync(user.id)
            setMsg({type: "success", text: "Invitation resent"})
        } catch (err) {
            setMsg({type: "error", text: getErrorMessage(err)})
        }
    }

    const handleDeactivate = async () => {
        setMsg(null)
        try {
            await deactivateUser.mutateAsync(user.id)
            onClose()
        } catch (err) {
            setMsg({type: "error", text: getErrorMessage(err)})
        }
    }

    return (
        <BottomSheet title="User Details" onClose={onClose}>
            {/* Header */}
            <div style={{display: "flex", alignItems: "center", gap: "14px", marginBottom: "22px"}}>
                <div style={{
                    width: "52px", height: "52px", borderRadius: "14px",
                    backgroundColor: "#E1F5EE", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <UserCog size={24} color="#0F6E56"/>
                </div>
                <div style={{minWidth: 0}}>
                    <div style={{fontSize: "20px", fontWeight: "700", color: "#111827"}}>{user.name}</div>
                    <div style={{fontSize: "13px", color: "#9ca3af", wordBreak: "break-all"}}>
                        {user.email || user.phoneNumber || "—"}
                    </div>
                </div>
            </div>

            {/* Details */}
            <div style={{
                backgroundColor: "#f9fafb", borderRadius: "12px",
                padding: "16px", marginBottom: "20px",
            }}>
                <DetailRow label="Role" value={ROLE_LABELS[user.role] || user.role}/>
                <DetailRow
                    label="Status"
                    value={user.status}
                    valueColor={user.status === "ACTIVE" ? "#0F6E56"
                        : user.status === "INVITED" ? "#854d0e" : "#dc2626"}/>
                <DetailRow label="Email" value={user.email || "—"}/>
                <DetailRow label="Phone" value={user.phoneNumber || "—"}/>
                {user.role === "PROPERTY_MANAGER" && (
                    <DetailRow
                        label="Assigned properties"
                        value={!user.assignedPropertyIds || user.assignedPropertyIds.length === 0
                            ? "None assigned"
                            : user.assignedPropertyIds.map(propertyName).join(", ")}/>
                )}
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px",
                }}>
                    <span style={{fontSize: "13px", color: "#9ca3af"}}>Joined</span>
                    <span style={{fontSize: "13px", fontWeight: "500", color: "#111827"}}>
                        {formatDate(user.createdAt)}
                    </span>
                </div>
            </div>

            {msg && (
                <div style={{
                    fontSize: "13px", marginBottom: "14px",
                    color: msg.type === "success" ? "#0F6E56" : "#dc2626",
                }}>{msg.text}</div>
            )}

            {/* Actions */}
            <div style={{display: "flex", gap: "10px", flexWrap: "wrap"}}>
                {editable && (
                    <button onClick={() => onEdit(user)} style={{
                        flex: 1, minWidth: "120px", padding: "12px", borderRadius: "10px",
                        border: "1px solid #e5e7eb", backgroundColor: "#fff", color: "#374151",
                        cursor: "pointer", fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
                        fontWeight: "500", display: "flex", alignItems: "center",
                        justifyContent: "center", gap: "6px",
                    }}>
                        <Pencil size={15}/> Edit
                    </button>
                )}
                {user.status === "INVITED" && (
                    <button onClick={handleResend} disabled={resendInvite.isPending} style={{
                        flex: 1, minWidth: "120px", padding: "12px", borderRadius: "10px",
                        border: "1px solid #d1e9e1", backgroundColor: "#fff", color: "#0F6E56",
                        cursor: resendInvite.isPending ? "default" : "pointer",
                        opacity: resendInvite.isPending ? 0.6 : 1,
                        fontSize: "14px", fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    }}>
                        <Send size={15}/> {resendInvite.isPending ? "Sending…" : "Resend invite"}
                    </button>
                )}
                {canDeactivate && (
                    <button onClick={handleDeactivate} disabled={deactivateUser.isPending} style={{
                        flex: 1, minWidth: "120px", padding: "12px", borderRadius: "10px",
                        border: "1px solid #fee2e2", backgroundColor: "#fff", color: "#dc2626",
                        cursor: deactivateUser.isPending ? "default" : "pointer",
                        opacity: deactivateUser.isPending ? 0.6 : 1,
                        fontSize: "14px", fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    }}>
                        <ShieldOff size={15}/> Deactivate
                    </button>
                )}
            </div>
        </BottomSheet>
    )
}

export default function UsersPage() {
    const {data: users = [], isLoading} = useUsers()
    const {data: properties = []} = useProperties()
    const [showInvite, setShowInvite] = useState(false)
    const [viewUser, setViewUser] = useState(null)
    const [editUser, setEditUser] = useState(null)

    const propertyName = (id) => properties.find(p => p.id === id)?.name || "—"

    // Keep the open sheet/modal in sync with fresh list data after a mutation.
    const liveUser = (u) => users.find(x => x.id === u.id) || u

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

    const mobileAction = (
        <button onClick={() => setShowInvite(true)} style={{
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
        <PageWrapper title="Users" actions={actions} mobileAction={mobileAction} showBack>
            {isLoading ? (
                <div style={{padding: "60px", textAlign: "center", color: "#9ca3af", fontSize: "14px"}}>
                    Loading users…
                </div>
            ) : (
                <div style={{
                    display: "grid", gap: "14px",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                }}>
                    {users.map(u => (
                        <button key={u.id} onClick={() => setViewUser(u)} style={{
                            textAlign: "left", font: "inherit", width: "100%",
                            backgroundColor: "#fff", borderRadius: "12px",
                            border: "1px solid #f0f0f0", padding: "18px",
                            display: "flex", flexDirection: "column", gap: "12px",
                            cursor: "pointer",
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
                                <ChevronRight size={18} color="#c4c9d0" style={{flexShrink: 0, marginTop: "2px"}}/>
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
                        </button>
                    ))}
                </div>
            )}

            {showInvite && <InviteModal onClose={() => setShowInvite(false)}/>}

            {viewUser && (
                <UserDetailSheet
                    user={liveUser(viewUser)}
                    propertyName={propertyName}
                    onEdit={(u) => {
                        setViewUser(null)
                        setEditUser(u)
                    }}
                    onClose={() => setViewUser(null)}/>
            )}

            {editUser && (
                <EditUserModal
                    user={liveUser(editUser)}
                    onClose={() => setEditUser(null)}/>
            )}
        </PageWrapper>
    )
}
