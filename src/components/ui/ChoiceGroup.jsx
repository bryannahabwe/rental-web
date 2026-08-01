import {cn} from "@/lib/cn"

/**
 * A full-width segmented choice for forms — distinct from SegmentedFilter,
 * which is the auto-width chip row used to filter a list.
 *
 * Used for binary domain choices that deserve an explanation: billing model
 * (Advance / Arrears), tenant type (New / Existing), balance sign
 * (Paid ahead / Owes arrears).
 *
 * Controlled only — pair with react-hook-form's <Controller> or local state.
 *
 * options: [{ value, label, description?, tone? }]
 * `tone: "danger"` marks a destructive/negative choice (e.g. owes arrears).
 */
export default function ChoiceGroup({options = [], value, onChange, className}) {
    return (
        <div role="radiogroup" className={cn("flex gap-2", className)}>
            {options.map((o) => {
                const active = o.value === value
                const danger = o.tone === "danger"
                return (
                    <button
                        key={String(o.value)}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => onChange?.(o.value)}
                        className={cn(
                            "flex-1 rounded-lg border px-3 py-2.5 text-center text-sm font-medium transition-colors",
                            active
                                ? danger
                                    ? "border-danger-600 bg-danger-600 text-white"
                                    : "border-primary-500 bg-primary-500 text-white"
                                : "border-neutral-15 bg-white text-neutral-60 hover:bg-neutral-0 hover:text-neutral-90",
                        )}
                    >
                        <span className="block">{o.label}</span>
                        {o.description && (
                            <span className={cn("mt-0.5 block text-2xs", active ? "text-white/80" : "text-neutral-40")}>
                                {o.description}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}
