/**
 * The earliest unpaid cycle — the sensible default period for a new payment.
 *
 * Lives in its own module (not alongside CyclePicker) so that file exports
 * only a component and keeps fast refresh working.
 */
export function autoSelectedCycle(cycles = []) {
    // Prefer the earliest cycle that is actually owed. Only fall back to an
    // upcoming (not-yet-due) cycle when the tenant is paid up on everything due
    // — i.e. they're deliberately paying ahead.
    const pick = cycles.find((c) => c.due && c.status !== "PAID")
        ?? cycles.find((c) => c.status !== "PAID")
    return pick
        ? {start: pick.periodStartDate, end: pick.periodEndDate}
        : null
}
