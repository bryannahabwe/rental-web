import {cn} from "@/lib/cn"

const FILL = {
    primary: "bg-primary-500",
    success: "bg-success-500",
    warning: "bg-warning-500",
    danger: "bg-danger-500",
    info: "bg-info-500",
}

export default function ProgressBar({value = 0, max = 100, tone = "primary", className, label}) {
    const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

    return (
        <div
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={label}
            className={cn("h-2 overflow-hidden rounded-full bg-neutral-5", className)}
        >
            {/* Width is genuinely dynamic, so it stays an inline style. */}
            <div className={cn("h-full rounded-full transition-[width]", FILL[tone])} style={{width: `${pct}%`}}/>
        </div>
    )
}
