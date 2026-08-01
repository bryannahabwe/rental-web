/**
 * The earliest unpaid cycle — the sensible default period for a new payment.
 *
 * Lives in its own module (not alongside CyclePicker) so that file exports
 * only a component and keeps fast refresh working.
 */
export function autoSelectedCycle(cycles = []) {
    const firstUnpaid = cycles.find((c) => c.status !== "PAID")
    return firstUnpaid
        ? {start: firstUnpaid.periodStartDate, end: firstUnpaid.periodEndDate}
        : null
}
