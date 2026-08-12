import {useState} from "react"
import {Building2, Home, Pencil, Plus, Trash2, Users} from "lucide-react"
import AppShell from "@/components/layout/AppShell"
import {useDeleteProperty, useProperties} from "@/hooks/useProperties"
import {useCan} from "@/hooks/usePermissions"
import {Button, EmptyState, LoadingPanel, toast, useConfirm} from "@/components/ui"
import PropertyModal from "@/components/feature/properties/PropertyModal"
import {getErrorMessage} from "@/utils/errorMessage"

export default function PropertiesPage() {
    const {data: properties = [], isLoading} = useProperties()
    const [showModal, setShowModal] = useState(false)
    const [editProperty, setEditProperty] = useState(null)
    const can = useCan()
    // Creating a property is account-wide, so it's owner-only — a scoped admin
    // manages (edits) their properties but can't spin up new ones. Mirrors the
    // API's `hasRole('SUPER_ADMIN')` on POST /properties.
    const canCreate = can("createProperties")
    const canDelete = can("deleteRecords")
    const confirm = useConfirm()
    const deleteProperty = useDeleteProperty()

    const handleDelete = async (property) => {
        const ok = await confirm.ask({
            title: "Delete property?",
            message: `"${property.name}" will be permanently removed. A property with units or tenants can't be deleted.`,
            confirmLabel: "Delete",
            tone: "danger",
            icon: Trash2,
        })
        if (!ok) return
        try {
            await deleteProperty.mutateAsync(property.id)
            toast.success("Property deleted", property.name)
        } catch (err) {
            toast.error("Couldn't delete property", getErrorMessage(err, "Please try again."))
        }
    }

    return (
        <AppShell
            title="Properties"
            subtitle="The buildings you manage"
            showBack
            actions={canCreate
                ? <Button iconLeft={Plus} onClick={() => setShowModal(true)}>Add Property</Button>
                : undefined}
            mobileAction={canCreate
                ? (
                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        aria-label="Add property"
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-fab transition-colors hover:bg-primary-600"
                    >
                        <Plus size={26}/>
                    </button>
                )
                : undefined}
        >
            {isLoading ? (
                <LoadingPanel message="Loading properties…"/>
            ) : properties.length === 0 ? (
                <EmptyState
                    icon={Home}
                    title="No properties yet"
                    message={canCreate
                        ? "Add your first property to start tracking units and tenants."
                        : "No properties have been assigned to you yet."}
                    action={canCreate
                        ? <Button iconLeft={Plus} onClick={() => setShowModal(true)}>Add Property</Button>
                        : undefined}
                />
            ) : (
                <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                    {properties.map((p) => (
                        <div key={p.id}
                             className="flex flex-col gap-3 rounded-lg border border-neutral-5 bg-white p-4 shadow-card">
                            <div className="flex items-start gap-3">
                                <span
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                                    <Home size={18}/>
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-base font-semibold text-neutral-90">{p.name}</p>
                                    <p className="mt-0.5 truncate text-sm text-neutral-40">
                                        {p.address || "No address set"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 text-sm text-neutral-50">
                                <span className="flex items-center gap-1.5">
                                    <Building2 size={14}/>
                                    <span className="tabular-nums">{p.unitCount}</span>
                                    unit{p.unitCount === 1 ? "" : "s"}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Users size={14}/>
                                    <span className="tabular-nums">{p.tenantCount}</span>
                                    tenant{p.tenantCount === 1 ? "" : "s"}
                                </span>
                            </div>

                            <div className="mt-0.5 flex gap-2 border-t border-neutral-5 pt-3">
                                <Button className="flex-1" size="sm" variant="outline" iconLeft={Pencil}
                                        onClick={() => setEditProperty(p)}>
                                    Edit
                                </Button>
                                {canDelete && (
                                    <Button className="flex-1 text-danger-600 hover:bg-danger-50" size="sm"
                                            variant="outline" iconLeft={Trash2}
                                            onClick={() => handleDelete(p)}>
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && <PropertyModal onClose={() => setShowModal(false)}/>}
            {editProperty && <PropertyModal property={editProperty} onClose={() => setEditProperty(null)}/>}
        </AppShell>
    )
}
