import {ROLE} from "@/lib/roles"

/**
 * Whether the current user may change another user's role/assignments.
 * The owner (SUPER_ADMIN) is never editable, and an admin may not manage
 * another admin — mirrors the backend's `assertCanAssignRole`.
 */
export const canManage = (target, currentRole) => {
    if (target.role === ROLE.SUPER_ADMIN) return false
    if (currentRole === ROLE.ADMIN
        && (target.role === ROLE.ADMIN || target.role === ROLE.SUPER_ADMIN)) return false
    return true
}
