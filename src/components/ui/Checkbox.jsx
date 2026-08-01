import {Check} from "lucide-react"
import {cn} from "@/lib/cn"

/**
 * A visually-hidden native input inside a label, so it stays
 * register()-compatible and keyboard-native.
 *
 * The tick is always rendered and toggled via `text-transparent` — no
 * layout shift. It is white, not dark: our primary is a dark green.
 */
export default function Checkbox({label, checked, disabled, className, ...rest}) {
    return (
        <label
            className={cn(
                "inline-flex cursor-pointer select-none items-center gap-2.5",
                disabled && "cursor-not-allowed opacity-50",
                className,
            )}
        >
            <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} {...rest} />
            <span
                aria-hidden="true"
                className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                    "border-neutral-20 bg-white text-transparent",
                    "peer-checked:border-primary-500 peer-checked:bg-primary-500 peer-checked:text-white",
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2",
                )}
            >
                <Check size={14} strokeWidth={3}/>
            </span>
            {label && <span className="text-sm text-neutral-80">{label}</span>}
        </label>
    )
}
