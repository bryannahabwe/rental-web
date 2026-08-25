/**
 * Reading a payment row against its billing period.
 *
 * A payment row cannot describe its own period. A cycle is routinely covered
 * by several rows — the partial tail of a rollover chain plus a cash top-up is
 * the ordinary shape — so judging a row against the full rent reports every one
 * of them short however much the period actually holds. The API sends
 * `periodPaidAmount`: the total the period retains across all its rows.
 */

/**
 * @param {object} payment a PaymentResponse row
 * @returns {{applied: number, periodPaid: number, expected: number|null,
 *            shortfall: number, sharedPeriod: boolean, carriedInFull: boolean}}
 *   `applied` is what this row put toward its own period (received less what
 *   rolled out of it); `sharedPeriod` is true when other rows contribute too;
 *   `carriedInFull` marks a payment into an already-settled cycle, where none
 *   of it stuck and the whole sum travelled on.
 */
export function periodFigures(payment) {
    const amount = Number(payment.amount || 0)
    const overpayment = Number(payment.overpayment || 0)
    const applied = overpayment > 0 ? amount - overpayment : amount

    // Older responses — and any page cached from before the field existed —
    // carry no periodPaidAmount. This row's own contribution is the safe
    // floor: it can understate a shared period, never overstate one.
    const periodPaid = payment.periodPaidAmount != null
        ? Number(payment.periodPaidAmount)
        : applied

    const expected = payment.expectedAmount != null ? Number(payment.expectedAmount) : null

    return {
        applied,
        periodPaid,
        expected,
        shortfall: expected != null ? Math.max(expected - periodPaid, 0) : 0,
        sharedPeriod: periodPaid > applied,
        carriedInFull: overpayment > 0 && applied === 0,
    }
}
