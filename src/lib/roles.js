/**
 * Roles and what each one may do.
 *
 * Two kinds of role: **account-wide** ones reach every property, **property
 * scoped** ones reach only the properties assigned to them — and are held *per
 * property*, so the same person can manage one and only caretake another.
 *
 * The capability table below mirrors the API's `@PreAuthorize` matrix. Gating
 * lives in ~15 places across routes, both navs and the page action buttons, and
 * every one of them has to recompute when the property switcher changes; naming
 * a capability keeps that in one table instead of fifteen conditionals. When the
 * API's matrix moves, move it here in the same commit — a UI that offers a
 * button the API refuses is worse than one that hides it.
 */

export const ROLE = {
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
    ACCOUNTANT: "ACCOUNTANT",
    PROPERTY_MANAGER: "PROPERTY_MANAGER",
    CARETAKER: "CARETAKER",
}

/** Mirrors `UserRole.isPropertyScoped()` on the API. */
export const isPropertyScoped = (role) =>
    role === ROLE.ADMIN || role === ROLE.PROPERTY_MANAGER || role === ROLE.CARETAKER

/** Roles a scoped user can hold at an individual property. */
export const SCOPED_ROLES = [ROLE.ADMIN, ROLE.PROPERTY_MANAGER, ROLE.CARETAKER]

const CAPABILITIES = {
    [ROLE.SUPER_ADMIN]: [
        "viewReports", "viewActivity", "manageProperties", "createProperties", "manageUsers",
        "manageBranding", "viewOperations", "writeTenants", "writeUnits", "writeAgreements",
        "recordPayments", "recordExpenses", "deleteRecords",
    ],
    [ROLE.ADMIN]: [
        "viewReports", "viewActivity", "manageProperties", "manageUsers", "manageBranding",
        "viewOperations", "writeTenants", "writeUnits", "writeAgreements", "recordPayments",
        "recordExpenses", "deleteRecords",
    ],
    // Read-only finance across the whole account: figures, no edits.
    [ROLE.ACCOUNTANT]: ["viewReports", "viewActivity", "viewOperations"],
    [ROLE.PROPERTY_MANAGER]: [
        "viewOperations", "writeTenants", "writeUnits", "writeAgreements", "recordPayments",
        "recordExpenses",
    ],
    // Collects rent at the property, issues receipts, and logs property costs.
    [ROLE.CARETAKER]: ["viewOperations", "recordPayments", "recordExpenses"],
}

/**
 * Whether {@code role} carries {@code capability}. An unknown role grants
 * nothing — a role the API adds before the UI knows about it should lock down,
 * not fall through to the admin branch (which is exactly the bug the old
 * `role === "PROPERTY_MANAGER"` checks had).
 */
export const roleCan = (role, capability) =>
    (CAPABILITIES[role] ?? []).includes(capability)

/**
 * The role that applies right now, mirroring `PropertyAccessGuard
 * .effectiveRoleFor` on the API.
 *
 * Account-wide roles resolve to themselves. For scoped staff the role comes from
 * the selected property; with nothing selected — or a selection that isn't
 * theirs — it falls back to the role at their first assigned property, which is
 * the same property the API defaults to. Keep the two in step: if they disagree,
 * the UI shows controls the API then refuses.
 */
export const effectiveRole = (accountRole, propertyRoles, selectedPropertyId) => {
    if (!isPropertyScoped(accountRole)) return accountRole
    if (!propertyRoles) return accountRole

    if (selectedPropertyId && propertyRoles[selectedPropertyId]) {
        return propertyRoles[selectedPropertyId]
    }
    const [firstAssigned] = Object.values(propertyRoles)
    return firstAssigned ?? accountRole
}

export const ROLE_LABELS = {
    [ROLE.SUPER_ADMIN]: "Owner",
    [ROLE.ADMIN]: "Admin",
    [ROLE.ACCOUNTANT]: "Accountant",
    [ROLE.PROPERTY_MANAGER]: "Property Manager",
    [ROLE.CARETAKER]: "Caretaker",
}

export const roleLabel = (role) => ROLE_LABELS[role] ?? role

/** What each role means, for the pickers where someone is choosing one. */
const ROLE_HINTS = {
    [ROLE.ADMIN]: "full access",
    [ROLE.ACCOUNTANT]: "read-only finance, all properties",
    [ROLE.PROPERTY_MANAGER]: "runs assigned properties",
    [ROLE.CARETAKER]: "collects rent on assigned properties",
}

/**
 * Roles the current user may hand out, mirroring the API's
 * `assertCanAssignRole`: the owner role is never assignable, and an admin may
 * not create another admin.
 */
export const assignableRoles = (currentRole) => {
    if (currentRole === ROLE.SUPER_ADMIN) {
        return [ROLE.ADMIN, ROLE.ACCOUNTANT, ROLE.PROPERTY_MANAGER, ROLE.CARETAKER]
    }
    // A scoped admin may only hand out property-scoped staff roles.
    return [ROLE.PROPERTY_MANAGER, ROLE.CARETAKER]
}

export const roleOption = (role) => ({
    value: role,
    label: ROLE_HINTS[role] ? `${roleLabel(role)} (${ROLE_HINTS[role]})` : roleLabel(role),
})
