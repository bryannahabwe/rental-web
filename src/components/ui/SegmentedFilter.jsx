import {cn} from "@/lib/cn"

/**
 * The status chip row (All / Paid / Partial / Unpaid) used above list
 * tables. Scrolls horizontally on narrow phones rather than wrapping.
 *
 * options: [{ label, value, count? }]
 */
export default function SegmentedFilter({options = [], value, onChange, className}) {
    return (
        <div
            role="group"
            className={cn("-mx-1 flex items-center gap-2 overflow-x-auto px-1 py-0.5", className)}
        >
            {options.map((o) => {
                const active = o.value === value
                return (
                    <button
                        key={String(o.value)}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onChange?.(o.value)}
                        className={cn(
                            "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3",
                            "text-sm font-medium transition-colors",
                            active
                                ? "border-primary-500 bg-primary-50 text-primary-700"
                                : "border-neutral-15 bg-white text-neutral-60 hover:bg-neutral-0 hover:text-neutral-90",
                        )}
                    >
                        {o.label}
                        {o.count != null && (
                            <span
                                className={cn(
                                    "tabular-nums text-2xs",
                                    active ? "text-primary-600" : "text-neutral-40",
                                )}
                            >
                                {o.count}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}
