/**
 * Recharts tooltip wearing the design system's popover recipe, so charts
 * don't grow their own floating-surface style.
 *
 *   <Tooltip content={<ChartTooltip formatter={formatUGX} />} cursor={…} />
 */
export default function ChartTooltip({active, payload, label, formatter}) {
    if (!active || !payload?.length) return null

    return (
        <div className="rounded-2xl border border-neutral-5 bg-white px-3.5 py-2.5 shadow-dialog">
            {label != null && <p className="mb-1 text-xs text-neutral-40">{label}</p>}
            {payload.map((entry) => (
                <p key={entry.dataKey ?? entry.name}
                   className="text-sm font-semibold tabular-nums text-neutral-90">
                    {formatter ? formatter(entry.value) : entry.value}
                </p>
            ))}
        </div>
    )
}
