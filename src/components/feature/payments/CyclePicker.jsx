import {Badge} from "@/components/ui"
import {formatCycleDate, formatUGX} from "@/lib/format"
import {statusTone} from "@/lib/statusTone"
import {cn} from "@/lib/cn"

/**
 * Purely presentational. The parent owns the cycles query and derives the
 * effective selection (see ./cycles.js), so there is no setState-inside-an-
 * effect here — the earliest unpaid cycle is computed during render.
 *
 * Deliberately not turned into a generic primitive: the arrears banners and
 * partial-payment sublines are specific to rent collection.
 */
export default function CyclePicker({cycles = [], isLoading, selected, onSelect, openingArrears = 0}) {
    if (isLoading) {
        return <p className="py-2 text-sm text-neutral-40">Loading cycles…</p>
    }

    if (cycles.length === 0) {
        return (
            <div className="rounded-lg bg-warning-50 px-3.5 py-3 text-sm text-warning-700">
                No billing cycles available — check the agreement start date.
            </div>
        )
    }

    const unpaidCycles = cycles.filter((c) => c.status !== "PAID")
    const totalUnpaid = unpaidCycles.reduce(
        (sum, c) => sum + Number(c.expectedAmount) - Number(c.paidAmount), 0,
    )

    return (
        <div>
            {openingArrears > 0 && (
                <div className="mb-2 rounded-lg border-l-[3px] border-danger-500 bg-danger-50 px-3.5 py-2.5 text-xs text-danger-600">
                    <div className="mb-0.5 flex items-center justify-between gap-3">
                        <strong>Historical arrears</strong>
                        <strong className="tabular-nums">{formatUGX(openingArrears)}</strong>
                    </div>
                    <p className="text-2xs text-neutral-40">
                        Debt before system start date — go to{" "}
                        <strong className="text-danger-600">Edit Agreement → Opening Balance</strong> to clear
                    </p>
                </div>
            )}

            {unpaidCycles.length > 0 && (
                <div
                    className={cn(
                        "mb-2.5 flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-xs",
                        unpaidCycles.length > 1
                            ? "bg-danger-50 text-danger-600"
                            : "bg-warning-50 text-warning-700",
                    )}
                >
                    <span>
                        <strong>{unpaidCycles.length} month{unpaidCycles.length > 1 ? "s" : ""} unpaid</strong>
                        {" — earliest is auto-selected"}
                    </span>
                    <span className="font-bold tabular-nums">{formatUGX(totalUnpaid)} total</span>
                </div>
            )}

            <p className="mb-1.5 text-sm font-medium text-neutral-70">Payment period</p>
            <div role="radiogroup" className="flex flex-col gap-1.5">
                {cycles.map((cycle) => {
                    const isSelected = selected?.start === cycle.periodStartDate
                    return (
                        <button
                            key={cycle.periodStartDate}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => onSelect({start: cycle.periodStartDate, end: cycle.periodEndDate})}
                            className={cn(
                                "flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-colors",
                                isSelected
                                    ? "border-primary-500 bg-primary-50"
                                    : "border-neutral-15 bg-white hover:bg-neutral-0",
                            )}
                        >
                            <span className="min-w-0">
                                <span
                                    className={cn(
                                        "block text-sm font-medium",
                                        isSelected ? "text-primary-700" : "text-neutral-90",
                                    )}
                                >
                                    {formatCycleDate(cycle.periodStartDate)} – {formatCycleDate(cycle.periodEndDate)}
                                </span>
                                {cycle.status === "PARTIAL" && (
                                    <span className="mt-0.5 block text-2xs tabular-nums text-warning-700">
                                        {formatUGX(cycle.paidAmount)} paid of {formatUGX(cycle.expectedAmount)}
                                    </span>
                                )}
                            </span>
                            <Badge size="sm" tone={statusTone("period", cycle.status)}>{cycle.status}</Badge>
                        </button>
                    )
                })}
            </div>

            {!selected && (
                <p className="mt-1.5 text-xs text-neutral-40">Select the period this payment covers</p>
            )}
        </div>
    )
}
