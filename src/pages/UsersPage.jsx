import {useState} from "react"
import {ChevronRight, Plus, UserCog} from "lucide-react"
import AppShell from "@/components/layout/AppShell"
import {useUsers} from "@/hooks/useUsers"
import {useProperties} from "@/hooks/useProperties"
import {Badge, Button, EmptyState, LoadingPanel} from "@/components/ui"
import {statusLabel, statusTone} from "@/lib/statusTone"
import InviteModal from "@/components/feature/users/InviteModal"
import EditUserModal from "@/components/feature/users/EditUserModal"
import UserDetailSheet from "@/components/feature/users/UserDetailSheet"

export default function UsersPage() {
    const {data: users = [], isLoading} = useUsers()
    const {data: properties = []} = useProperties()
    const [showInvite, setShowInvite] = useState(false)
    const [viewUser, setViewUser] = useState(null)
    const [editUser, setEditUser] = useState(null)

    const propertyName = (id) => properties.find((p) => p.id === id)?.name || "—"

    // Keep the open sheet/modal in sync with fresh list data after a mutation.
    const liveUser = (u) => users.find((x) => x.id === u.id) || u

    return (
        <AppShell
            title="Users"
            subtitle="Who can access this portal, and what they can see"
            showBack
            actions={<Button iconLeft={Plus} onClick={() => setShowInvite(true)}>Invite User</Button>}
            mobileAction={
                <button
                    type="button"
                    onClick={() => setShowInvite(true)}
                    aria-label="Invite user"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-fab transition-colors hover:bg-primary-600"
                >
                    <Plus size={26}/>
                </button>
            }
        >
            {/* A card grid rather than a table: the list is short, and each entry
                is a person with a role and a scope rather than a row of figures. */}
            {isLoading ? (
                <LoadingPanel message="Loading users…"/>
            ) : users.length === 0 ? (
                <EmptyState
                    icon={UserCog}
                    title="No users yet"
                    message="Invite a colleague to give them access."
                    action={<Button iconLeft={Plus} onClick={() => setShowInvite(true)}>Invite User</Button>}
                />
            ) : (
                <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                    {users.map((u) => (
                        <button
                            key={u.id}
                            type="button"
                            onClick={() => setViewUser(u)}
                            className="group flex w-full flex-col gap-3 rounded-lg border border-neutral-5 bg-white p-4 text-left shadow-card transition-shadow hover:shadow-card-hover"
                        >
                            <div className="flex items-start gap-3">
                                <span
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                                    <UserCog size={18}/>
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-base font-semibold text-neutral-90">{u.name}</p>
                                    <p className="break-all text-sm text-neutral-40">
                                        {u.email || u.phoneNumber}
                                    </p>
                                </div>
                                <ChevronRight
                                    size={18}
                                    className="mt-0.5 shrink-0 text-neutral-15 transition-colors group-hover:text-primary-500"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Badge tone={statusTone("role", u.role)}>{statusLabel("role", u.role)}</Badge>
                                <Badge tone={statusTone("user", u.status)}>{u.status}</Badge>
                            </div>

                            {u.role === "PROPERTY_MANAGER" && (
                                <p className="text-sm text-neutral-50">
                                    {u.assignedPropertyIds?.length
                                        ? u.assignedPropertyIds.map(propertyName).join(", ")
                                        : "No properties assigned"}
                                </p>
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
                    onClose={() => setViewUser(null)}
                />
            )}

            {editUser && <EditUserModal user={liveUser(editUser)} onClose={() => setEditUser(null)}/>}
        </AppShell>
    )
}
