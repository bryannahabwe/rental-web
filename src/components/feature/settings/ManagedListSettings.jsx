import {useState} from "react"
import {Check, Pencil, Plus, RotateCcw, Trash2, X} from "lucide-react"
import {Badge, Button, Card, EmptyState, Input, LoadingPanel, toast, useConfirm} from "@/components/ui"
import {getErrorMessage} from "@/utils/errorMessage"

/**
 * A small CRUD manager for an account-wide named list (expense categories,
 * payment methods). Active items sort first; "delete" is a soft-retire that can
 * be restored. Callbacks return promises so the buttons can show pending state.
 */
export default function ManagedListSettings({
                                                items = [],
                                                isLoading,
                                                singular,
                                                onCreate,
                                                onRename,
                                                onRemove,
                                                onRestore,
                                                addPlaceholder,
                                            }) {
    const confirm = useConfirm()
    const [newName, setNewName] = useState("")
    const [busy, setBusy] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [editName, setEditName] = useState("")

    const sorted = [...items].sort((a, b) =>
        a.active === b.active ? a.name.localeCompare(b.name) : (a.active ? -1 : 1))

    const handleAdd = async (e) => {
        e.preventDefault()
        const name = newName.trim()
        if (!name) return
        setBusy(true)
        try {
            await onCreate(name)
            setNewName("")
            toast.success(`${singular} added`)
        } catch (err) {
            toast.error(`Couldn't add the ${singular.toLowerCase()}`, getErrorMessage(err))
        } finally {
            setBusy(false)
        }
    }

    const startEdit = (item) => {
        setEditingId(item.id)
        setEditName(item.name)
    }

    const saveEdit = async (item) => {
        const name = editName.trim()
        if (!name || name === item.name) {
            setEditingId(null)
            return
        }
        try {
            await onRename(item.id, name)
            setEditingId(null)
            toast.success(`${singular} renamed`)
        } catch (err) {
            toast.error("Couldn't rename", getErrorMessage(err))
        }
    }

    const remove = async (item) => {
        if (!(await confirm.askDelete(singular.toLowerCase(), item.name))) return
        try {
            await onRemove(item.id)
            toast.success(`${singular} removed`)
        } catch (err) {
            toast.error("Couldn't remove", getErrorMessage(err))
        }
    }

    const restore = async (item) => {
        try {
            await onRestore(item)
            toast.success(`${singular} restored`)
        } catch (err) {
            toast.error("Couldn't restore", getErrorMessage(err))
        }
    }

    return (
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
            <Card>
                <form onSubmit={handleAdd} className="flex items-end gap-2">
                    <div className="flex-1">
                        <label className="mb-1.5 block text-sm font-medium text-neutral-70">
                            Add {singular.toLowerCase()}
                        </label>
                        <Input value={newName} onChange={(e) => setNewName(e.target.value)}
                               placeholder={addPlaceholder}/>
                    </div>
                    <Button type="submit" iconLeft={Plus} loading={busy} disabled={!newName.trim()}>Add</Button>
                </form>
            </Card>

            <Card bodyClass="p-0">
                {isLoading ? (
                    <LoadingPanel/>
                ) : sorted.length === 0 ? (
                    <EmptyState title={`No ${singular.toLowerCase()}s yet`}
                                message={`Add your first ${singular.toLowerCase()} above.`}/>
                ) : (
                    <ul className="divide-y divide-neutral-5">
                        {sorted.map((item) => (
                            <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                                {editingId === item.id ? (
                                    <>
                                        <Input className="flex-1" value={editName} autoFocus
                                               onChange={(e) => setEditName(e.target.value)}
                                               onKeyDown={(e) => {
                                                   if (e.key === "Enter") { e.preventDefault(); saveEdit(item) }
                                                   if (e.key === "Escape") setEditingId(null)
                                               }}/>
                                        <Button size="sm" iconLeft={Check} onClick={() => saveEdit(item)}>Save</Button>
                                        <Button size="sm" variant="ghost" iconLeft={X}
                                                onClick={() => setEditingId(null)}/>
                                    </>
                                ) : (
                                    <>
                                        <span className={`flex-1 text-sm ${item.active ? "text-neutral-90" : "text-neutral-40"}`}>
                                            {item.name}
                                            {!item.active && <Badge tone="neutral" size="sm" className="ml-2">Inactive</Badge>}
                                        </span>
                                        {item.active ? (
                                            <>
                                                <Button size="sm" variant="outline" iconLeft={Pencil}
                                                        aria-label="Rename" onClick={() => startEdit(item)}>Edit</Button>
                                                <Button size="sm" variant="ghost" iconLeft={Trash2}
                                                        className="text-danger-600 hover:bg-danger-50"
                                                        aria-label="Remove" onClick={() => remove(item)}/>
                                            </>
                                        ) : (
                                            <Button size="sm" variant="outline" iconLeft={RotateCcw}
                                                    onClick={() => restore(item)}>Restore</Button>
                                        )}
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    )
}
