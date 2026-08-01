import {cn} from "@/lib/cn"

/**
 * Controlled only — pair with react-hook-form's <Controller>, not register().
 *
 * When `label` is set it renders beside the track, is itself clickable, and
 * labels the switch. Prefer that over wrapping a Toggle in a FormField.
 *
 * When the visible label already lives elsewhere (e.g. a settings row with its
 * own title and description), pass `ariaLabel` instead of `label` so the
 * switch is still named for screen readers without duplicating the text.
 */
export default function Toggle({
                                   checked = false,
                                   onChange,
                                   label,
                                   ariaLabel,
                                   disabled = false,
                                   className,
                                   ...rest
                               }) {
    return (
        <div className={cn("inline-flex items-center gap-2.5", className)}>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={ariaLabel ?? label}
                disabled={disabled}
                onClick={() => onChange?.(!checked)}
                className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                    "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500",
                    "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    checked ? "bg-primary-500" : "bg-neutral-15",
                )}
                {...rest}
            >
                <span
                    aria-hidden="true"
                    className={cn(
                        "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
                        checked ? "translate-x-[22px]" : "translate-x-0.5",
                    )}
                />
            </button>
            {label && (
                <span
                    onClick={() => !disabled && onChange?.(!checked)}
                    className={cn(
                        "cursor-pointer select-none text-sm font-medium text-neutral-70",
                        disabled && "cursor-not-allowed opacity-50",
                    )}
                >
                    {label}
                </span>
            )}
        </div>
    )
}
