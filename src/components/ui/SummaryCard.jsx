import {ArrowDown, ArrowUp} from "lucide-react"
import {cn} from "@/lib/cn"

/**
 * The KPI tile. Four or five form the strip below a list-page header.
 *
 * Responsive by design rather than by a `size` prop — that is what lets one
 * component replace the separate desktop and mobile stat cards the app
 * currently renders side by side.
 *
 * `delta` takes a signed number, not a preformatted string.
 */
const CHIP = {
    neutral: "bg-neutral-5 text-neutral-60",
    primary: "bg-primary-50 text-primary-700",
    success: "bg-success-50 text-success-700",
    warning: "bg-warning-50 text-warning-700",
    danger: "bg-danger-50 text-danger-700",
    info: "bg-info-50 text-info-700",
}

export default function SummaryCard({
                                        label,
                                        value,
                                        icon: Icon,
                                        tone = "neutral",
                                        hint,
                                        delta = null,
                                        className,
                                        ...rest
                                    }) {
    return (
        <div
            className={cn(
                "flex items-start gap-3 rounded-lg border border-neutral-5 bg-white p-3 shadow-card md:gap-4 md:p-4",
                className,
            )}
            {...rest}
        >
            {Icon && (
                <span
                    className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg md:h-11 md:w-11",
                        CHIP[tone],
                    )}
                >
                    <Icon size={20} className="md:hidden" aria-hidden="true"/>
                    <Icon size={22} className="hidden md:block" aria-hidden="true"/>
                </span>
            )}

            <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-neutral-40 md:text-sm">{label}</p>
                <p className="mt-1 truncate font-heading text-xl font-medium tabular-nums text-neutral-90 md:text-2xl">
                    {value}
                </p>
                {(delta != null || hint) && (
                    <div className="mt-1 flex items-center gap-1.5 text-xs">
                        {delta != null && (
                            <span
                                className={cn(
                                    "inline-flex items-center gap-0.5 font-medium",
                                    delta >= 0 ? "text-success-600" : "text-danger-600",
                                )}
                            >
                                {delta >= 0
                                    ? <ArrowUp size={12} aria-hidden="true"/>
                                    : <ArrowDown size={12} aria-hidden="true"/>}
                                {Math.abs(delta)}%
                            </span>
                        )}
                        {hint && <span className="truncate text-neutral-40">{hint}</span>}
                    </div>
                )}
            </div>
        </div>
    )
}
