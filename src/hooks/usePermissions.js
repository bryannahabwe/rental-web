import {useEffect} from "react"
import useAuthStore from "@/store/authStore"
import usePropertyStore from "@/store/propertyStore"
import {effectiveRole, isPropertyScoped, roleCan} from "@/lib/roles"
import {useMe} from "@/hooks/useUsers"
import {useProperties} from "@/hooks/useProperties"

/**
 * The role that applies to the property currently active in the switcher.
 *
 * Subscribes to both stores, so switching properties re-renders every caller —
 * that's the point: a user who manages one property and only caretakes another
 * must lose the write buttons the moment they switch, without a reload.
 */
export function useEffectiveRole() {
    const accountRole = useAuthStore((s) => s.role)
    const propertyRoles = useAuthStore((s) => s.propertyRoles)
    const selectedPropertyId = usePropertyStore((s) => s.selectedPropertyId)
    return effectiveRole(accountRole, propertyRoles, selectedPropertyId)
}

/**
 * `can("writeTenants")` for the active property. Prefer this over comparing
 * roles: capabilities are declared once in `lib/roles.js` against the API's
 * own matrix.
 */
export function useCan() {
    const role = useEffectiveRole()
    return (capability) => roleCan(role, capability)
}

/**
 * The user's **account** role — the same for every property.
 *
 * Only for decisions that are about the account rather than the active property:
 * whether the "All properties" aggregate exists at all, and which roles this user
 * may hand out. Everything else wants {@link useEffectiveRole}.
 */
export function useAccountRole() {
    return useAuthStore((s) => s.role)
}

/** Whether this user is limited to assigned properties, so has no aggregate view. */
export function useIsPropertyScoped() {
    return isPropertyScoped(useAuthStore((s) => s.role))
}

/**
 * Whether the user has more than one selectable property. Drives the property
 * switcher: with a real choice it's an interactive dropdown; with a single
 * property it collapses to a static label (a scoped user sees only their one
 * assignment, and an account-wide user's "All properties" aggregate collapses
 * onto the lone property). Flips automatically once a second property/assignment
 * exists.
 */
export function useHasMultipleProperties() {
    const scoped = useIsPropertyScoped()
    const assignedPropertyIds = useAuthStore((s) => s.assignedPropertyIds)
    const {data: properties = []} = useProperties()
    // Scoped staff can only reach their assignments; account-wide roles reach
    // every property in the account.
    const count = scoped ? (assignedPropertyIds?.length ?? 0) : properties.length
    return count > 1
}

/**
 * Keeps the active property selection valid, independent of whether the
 * switcher is rendered — lifted out of the switcher so hiding it for
 * single-property users can't leave a scoped user without a property to scope
 * by, or leave a stale X-Property-Id after a property is deleted. Mount once
 * inside the authenticated shell.
 */
export function usePropertySelectionSync() {
    const {data: properties = []} = useProperties()
    const selectedPropertyId = usePropertyStore((s) => s.selectedPropertyId)
    const setSelectedProperty = usePropertyStore((s) => s.setSelectedProperty)
    const scoped = useIsPropertyScoped()

    useEffect(() => {
        if (!properties.length) return
        const stillValid = selectedPropertyId && properties.some((p) => p.id === selectedPropertyId)
        if (scoped) {
            // Scoped staff have no aggregate view — always land on an assigned property.
            if (!stillValid) setSelectedProperty(properties[0].id)
        } else if (selectedPropertyId && !stillValid) {
            // Selected property was deleted / account changed → back to "All".
            setSelectedProperty(null)
        } else if (selectedPropertyId === null && properties.length === 1) {
            // A single-property account has no meaningful "All" — pin the one.
            setSelectedProperty(properties[0].id)
        }
    }, [properties, selectedPropertyId, setSelectedProperty, scoped])
}

/**
 * Pulls the current role and per-property roles from the API into the store.
 *
 * The stored copy is written at sign-in and then persisted, so a role change
 * would leave the UI on the old permissions indefinitely. The API applies the
 * change on the very next request, which is the worse half of that mismatch:
 * buttons that 403. `GET /users/me` is React Query-cached, so this is one
 * request per session however many times it's mounted.
 */
export function useSyncPermissions() {
    const {data: me} = useMe()
    const setPermissions = useAuthStore((s) => s.setPermissions)

    useEffect(() => {
        if (me?.role) setPermissions(me)
    }, [me, setPermissions])
}
