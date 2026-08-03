/**
 * The single status → Badge tone registry.
 *
 * Previously this mapping was re-implemented in ~8 places with drifting
 * colours (StatusPill, PeriodStatusPill, Pill, roleBadge, statusBadge and
 * several inline ternaries). Tones follow the meaning rule:
 *
 *   success  terminal success        Paid, Active, Confirmed
 *   info     in flight / automatic   Rollover, Upcoming
 *   warning  needs attention         Partial, Invited, Maintenance
 *   danger   failed / negative       Unpaid, Reversed, Expired
 *   neutral  inert                   Vacant, Terminated, Deactivated
 *
 * Two deliberate changes from the current colours:
 *   - DEACTIVATED moves red → neutral. Red means failure, not disabled.
 *   - PROPERTY_MANAGER's indigo maps onto `info`, so it survives intact.
 */

const TONES = {
    /** Billing-cycle payment state on a tenant or agreement period. */
    period: {
        PAID: "success",
        PARTIAL: "warning",
        UNPAID: "danger",
        ROLLOVER: "info",
    },
    /**
     * A payment's `source`. NOT a status enum — verified against the API, the
     * values are payment methods (CASH, MOBILE MONEY, BANK TRANSFER, CHEQUE)
     * plus the synthetic ROLLOVER the backend writes when an overpayment is
     * carried into the next cycle.
     *
     * Only ROLLOVER means anything, so only ROLLOVER is tinted; every method
     * falls through to `neutral`, which is what a method chip should look like.
     */
    payment: {
        ROLLOVER: "info",
    },
    agreement: {
        ACTIVE: "success",
        UPCOMING: "info",
        TERMINATED: "neutral",
        EXPIRED: "danger",
    },
    unit: {
        OCCUPIED: "success",
        AVAILABLE: "neutral",
        MAINTENANCE: "warning",
    },
    user: {
        ACTIVE: "success",
        INVITED: "warning",
        DEACTIVATED: "neutral",
    },
    role: {
        SUPER_ADMIN: "primary",
        ADMIN: "primary",
        // The two scoped roles share `info`; ACCOUNTANT is inert (reads only),
        // so neutral rather than a colour that implies authority.
        PROPERTY_MANAGER: "info",
        CARETAKER: "info",
        ACCOUNTANT: "neutral",
    },
}

const LABELS = {
    role: {
        SUPER_ADMIN: "Owner",
        ADMIN: "Admin",
        PROPERTY_MANAGER: "Property Manager",
        CARETAKER: "Caretaker",
        ACCOUNTANT: "Accountant",
    },
    unit: {
        OCCUPIED: "Occupied",
        AVAILABLE: "Available",
        MAINTENANCE: "Maintenance",
    },
}

/**
 * @param {'period'|'payment'|'agreement'|'unit'|'user'|'role'} domain
 * @param {string|null|undefined} value
 * @returns {'neutral'|'primary'|'success'|'warning'|'danger'|'info'}
 */
export function statusTone(domain, value) {
    return TONES[domain]?.[value] ?? "neutral"
}

/**
 * Human-readable label for a status enum. Falls back to title-casing the
 * raw value (`PROPERTY_MANAGER` → `Property Manager`), so a new server-side
 * enum renders sensibly instead of shouting.
 */
export function statusLabel(domain, value) {
    if (!value) return "—"
    const mapped = LABELS[domain]?.[value]
    if (mapped) return mapped
    return value
        .toLowerCase()
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
}
