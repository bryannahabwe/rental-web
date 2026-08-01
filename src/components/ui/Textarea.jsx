import {CONTROL_BASE, controlState} from "./controlStyles"
import {cn} from "@/lib/cn"

export default function Textarea({rows = 4, invalid = false, className, ...rest}) {
    return (
        <textarea
            rows={rows}
            className={cn(CONTROL_BASE, controlState(invalid), "resize-y px-3.5 py-2.5", className)}
            aria-invalid={invalid || undefined}
            {...rest}
        />
    )
}
