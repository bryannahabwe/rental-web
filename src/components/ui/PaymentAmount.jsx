import {formatUGX} from "@/lib/format"
import {periodFigures} from "@/lib/paymentPeriod"

/**
 * A payment row's amount: what it put toward its own period, with the context
 * that figure needs underneath.
 *
 * The Payments table and a tenant's Transaction History are meant to render
 * identical rows in identical order, and used to do it through two copies of
 * this markup that had to be kept in step by hand.
 *
 * `Expected` was folded in here from its own column — it only carries
 * information when the period is short, and dropping the column freed ~135px
 * that stopped the table overflowing at 1440.
 */
export default function PaymentAmount({payment}) {
    const {applied, periodPaid, expected, shortfall, sharedPeriod, carriedInFull} =
        periodFigures(payment)

    return (
        <div>
            {/* A payment into a cycle that owed nothing keeps its own figure as
                the headline — leading with the nil it contributed reads as a
                UGX 0 payment. */}
            <span className="tabular-nums">
                {formatUGX(carriedInFull ? payment.amount : applied)}
            </span>
            {payment.overpayment > 0 ? (
                <p className="mt-0.5 text-2xs font-normal tabular-nums text-info-600">
                    {carriedInFull
                        ? "carried forward in full"
                        : `${formatUGX(payment.amount)} received · ${formatUGX(payment.overpayment)} rolled over`}
                </p>
            ) : shortfall > 0 ? (
                <p className="mt-0.5 text-2xs font-normal tabular-nums text-neutral-40">
                    {/* Naming the period's total is the only honest phrasing once
                        another row has contributed to it — "of X expected" beside
                        a lone figure implies that figure is all the period holds. */}
                    {sharedPeriod
                        ? `${formatUGX(periodPaid)} of ${formatUGX(expected)} this period`
                        : `of ${formatUGX(expected)} expected`}
                </p>
            ) : null}
        </div>
    )
}
