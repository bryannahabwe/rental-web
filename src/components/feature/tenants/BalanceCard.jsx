import {Check} from "lucide-react"
import {ProgressBar} from "@/components/ui"
import {formatUGX} from "@/lib/format"

/**
 * The tenant balance panel. Rendered by DataTable as a `card:'block'` cell,
 * so it appears identically in the desktop table and the mobile card.
 *
 * Paid/owed totals come from the backend (the same figures the Ledger view
 * shows) rather than a client-side approximation, so the two can't disagree.
 */
export default function BalanceCard({tenant}) {
    if (tenant.currentBalance == null) return null

    const balance = Number(tenant.currentBalance || 0)
    const openingArrears = Number(tenant.openingArrears || 0)
    const remainingHistorical = Math.min(balance, openingArrears)
    const cycleArrears = Math.max(0, balance - openingArrears)

    if (balance <= 0) {
        return (
            <div className="rounded-lg bg-success-50 px-3 py-2.5">
                <span className="flex items-center gap-1.5 text-sm font-medium text-success-700">
                    <Check size={14} strokeWidth={3}/> Fully paid up
                </span>
            </div>
        )
    }

    const totalEverOwed = Number(tenant.totalEverOwed || 0)
    const totalPaid = Number(tenant.totalEverPaid || 0)
    const pct = totalEverOwed > 0 ? Math.round((totalPaid / totalEverOwed) * 100) : 0

    return (
        <div className="rounded-lg bg-danger-50 px-3 py-2.5">
            <div className="mb-1.5 flex items-center justify-between gap-2 whitespace-nowrap">
                <span className="text-xs font-semibold text-danger-600">Outstanding</span>
                <span className="text-sm font-bold tabular-nums text-danger-600">{formatUGX(balance)}</span>
            </div>

            {/* The bar shows the UNPAID share, so a fuller bar means more owed. */}
            <ProgressBar
                className="mb-1.5 h-1 bg-danger-100"
                value={Math.max(0, 100 - pct)}
                tone="danger"
                label="Share still outstanding"
            />

            <div className="flex justify-between gap-2 whitespace-nowrap text-2xs tabular-nums text-neutral-40">
                <span>Paid: {formatUGX(totalPaid)}</span>
                <span>of {formatUGX(totalEverOwed)}</span>
            </div>

            {openingArrears > 0 && (
                <div className="mt-2 flex flex-col gap-0.5 border-t border-danger-100 pt-2">
                    <div className="flex justify-between gap-2 whitespace-nowrap text-2xs">
                        <span className="text-neutral-40">├ Historical arrears</span>
                        <span className="font-semibold tabular-nums text-danger-600">
                            {formatUGX(remainingHistorical)}
                        </span>
                    </div>
                    <div className="flex justify-between gap-2 whitespace-nowrap text-2xs">
                        <span className="text-neutral-40">└ Current cycles</span>
                        <span className="font-semibold tabular-nums text-danger-600">
                            {formatUGX(cycleArrears)}
                        </span>
                    </div>
                    <p className="mt-1 text-2xs italic text-neutral-40">
                        To clear historical: Edit Agreement → Opening Balance
                    </p>
                </div>
            )}
        </div>
    )
}
