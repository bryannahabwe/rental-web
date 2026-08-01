/**
 * Whether the current user may change another user's role/assignments.
 * The owner (SUPER_ADMIN) is never editable, and an admin may only manage
 * property managers — mirrors the backend's PUT /users/{id} guard.
 */
export const canManage = (target, currentRole) => {
    if (target.role === "SUPER_ADMIN") return false
    if (currentRole === "ADMIN" && target.role !== "PROPERTY_MANAGER") return false
    return true
}
