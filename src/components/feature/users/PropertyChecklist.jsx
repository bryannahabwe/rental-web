import {Checkbox} from "@/components/ui"

/** Scrollable checkbox list of properties, shared by invite/edit. */
export default function PropertyChecklist({properties, selectedIds, onToggle}) {
    return (
        <div className="max-h-45 overflow-y-auto rounded-lg border border-neutral-15">
            {properties.length === 0 ? (
                <p className="px-3.5 py-3 text-sm text-neutral-40">
                    No properties yet — create one first.
                </p>
            ) : (
                <ul className="divide-y divide-neutral-5">
                    {properties.map((p) => (
                        <li key={p.id}>
                            <Checkbox
                                className="w-full px-3.5 py-2.5"
                                label={p.name}
                                checked={selectedIds.includes(p.id)}
                                onChange={() => onToggle(p.id)}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
