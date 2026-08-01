import {cn} from "@/lib/cn"

/**
 * A definition-list pair. Replaces the DetailRow that was re-declared in
 * five files with drifting spacing.
 *
 *   <DetailList>
 *     <DetailRow label="Move-in date" value={formatDate(a.startDate)} />
 *     <DetailRow label="Balance" value={formatUGX(t.balance)} tone="danger" numeric />
 *   </DetailList>
 */
const TONE = {
    default: "text-neutral-90",
    muted: "text-neutral-50",
    success: "text-success-600",
    warning: "text-warning-700",
    danger: "text-danger-600",
}

export function DetailRow({label, value, tone = "default", numeric = false, className}) {
    return (
        <div className={cn("min-w-0", className)}>
            <dt className="text-xs text-neutral-40">{label}</dt>
            <dd className={cn("mt-1 text-sm font-medium", TONE[tone], numeric && "tabular-nums")}>
                {value ?? "—"}
            </dd>
        </div>
    )
}

export function DetailList({columns = 2, className, children}) {
    return (
        <dl
            className={cn(
                "grid grid-cols-1 gap-x-6 gap-y-4",
                columns === 2 && "sm:grid-cols-2",
                columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
                className,
            )}
        >
            {children}
        </dl>
    )
}

export default DetailRow
