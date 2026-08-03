import {Checkbox, Select} from "@/components/ui"
import {SCOPED_ROLES, roleLabel} from "@/lib/roles"

const roleOptions = SCOPED_ROLES.map((role) => ({value: role, label: roleLabel(role)}))

/**
 * Picks the properties a scoped user may work on, and the role they hold at
 * each — checking a property reveals its role select.
 *
 * Roles are per property, so the same person can run one property and only
 * collect rent at another. `assignments` is the API's own shape,
 * `[{propertyId, role}]`, so it goes to the server unchanged.
 */
export default function PropertyRoleList({properties, assignments, defaultRole, onChange}) {
    const assignmentFor = (id) => assignments.find((a) => a.propertyId === id)

    const toggle = (id) =>
        onChange(
            assignmentFor(id)
                ? assignments.filter((a) => a.propertyId !== id)
                : [...assignments, {propertyId: id, role: defaultRole}],
        )

    const setRole = (id, role) =>
        onChange(assignments.map((a) => (a.propertyId === id ? {...a, role} : a)))

    if (properties.length === 0) {
        return (
            <div className="rounded-lg border border-neutral-15">
                <p className="px-3.5 py-3 text-sm text-neutral-40">
                    No properties yet — create one first.
                </p>
            </div>
        )
    }

    return (
        <div className="max-h-60 overflow-y-auto rounded-lg border border-neutral-15">
            <ul className="divide-y divide-neutral-5">
                {properties.map((p) => {
                    const assignment = assignmentFor(p.id)
                    return (
                        <li key={p.id} className="px-3.5 py-2.5">
                            <Checkbox
                                label={p.name}
                                checked={!!assignment}
                                onChange={() => toggle(p.id)}
                            />
                            {assignment && (
                                <div className="mt-2 pl-7">
                                    <Select
                                        aria-label={`Role at ${p.name}`}
                                        value={assignment.role}
                                        onChange={(e) => setRole(p.id, e.target.value)}
                                        options={roleOptions}
                                    />
                                </div>
                            )}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
