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

/**
 * What a billing cycle still needs: its rent less what it already holds.
 *
 * Mirrors `remainingNeed` in the API's allocation kernel. Sizing a preview off
 * the bare rent instead tells the user a 610k payment against an April already
 * holding 110k will roll 430k forward, when the server correctly rolls 540k —
 * the same double-charge the rollover rebuild had to repair, showing up in the
 * one place someone checks the figure before committing to it.
 *
 * `heldByThisPayment` is what the payment being edited already contributes to
 * that cycle, so an edit is measured against the cycle *without* it rather than
 * against its own money twice. Returns null when the cycle isn't in the list,
 * leaving the caller to fall back to the rent.
 */
export function cycleRemainingNeed(cycles = [], selected, heldByThisPayment = 0) {
    if (!selected) return null
    const cycle = cycles.find(
        (c) => c.periodStartDate === selected.start && c.periodEndDate === selected.end,
    )
    if (!cycle) return null
    const held = Math.max(0, Number(cycle.paidAmount || 0) - heldByThisPayment)
    return Math.max(0, Number(cycle.expectedAmount || 0) - held)
}
