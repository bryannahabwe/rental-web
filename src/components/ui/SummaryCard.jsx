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
 *
 * `valueShort` is the abbreviated form of a money figure (`UGX 2.9M`). The
 * swap is a CONTAINER query, not a breakpoint: tile width comes from the grid,
 * not the viewport, so at one screen size a half-width tile clips while its
 * full-width neighbour has room to spare. Keying off the card's own width is
 * what lets both render correctly without the page hand-tuning each tile.
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
                                        valueShort,
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
                // Chrome tightens on a genuinely narrow tile (a half-width tile on a
                // phone): 12px of gap and padding either side is a fifth of the card,
                // and the value line needs it more than the icon does.
                "@container flex items-start gap-2.5 rounded-lg border border-neutral-5 bg-white p-2.5 shadow-card @[13rem]:gap-3 @[13rem]:p-3 md:gap-4 md:p-4",
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
                {/* text-2xs on mobile: at two tiles across, the text column is ~99px
                    and a 12px "Active Agreements" overshoots it by a hair. Kept on one
                    truncating line rather than wrapping so values stay on a common
                    baseline across the row. */}
                <p className="truncate text-2xs font-medium text-neutral-40 md:text-sm">{label}</p>
                <p
                    title={typeof value === "string" ? value : undefined}
                    className="mt-1 truncate font-heading text-xl font-medium tabular-nums text-neutral-90 md:text-2xl"
                >
                    {valueShort == null ? value : (
                        <>
                            {/* 15rem is where a full `UGX 2,900,000` clears the icon chip and
                                padding. Below it the abbreviated form also drops a type step —
                                at half a phone's width even `UGX 2.9M` overruns at text-xl. */}
                            <span className="text-lg @[15rem]:hidden">{valueShort}</span>
                            <span className="hidden @[15rem]:inline">{value}</span>
                        </>
                    )}
                </p>
                {(delta != null || hint) && (
                    <div className="mt-1 flex items-center gap-1.5 text-2xs md:text-xs">
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
