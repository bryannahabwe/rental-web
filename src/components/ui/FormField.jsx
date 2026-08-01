import {AlertCircle} from "lucide-react"
import {cn} from "@/lib/cn"

/**
 * Label / hint / error wrapper. Put any control in its children.
 *
 * The wrapper does NOT propagate state — pass `invalid` to the control AND
 * `error` to the field:
 *
 *   <FormField label="Phone" error={errors.phone?.message} required>
 *     <Input {...register("phone")} invalid={!!errors.phone} />
 *   </FormField>
 *
 * Spacing is per-element margin, not a flex gap, so a field with neither
 * label nor hint collapses to exactly the control's height.
 * `error` suppresses `hint` — they never render together.
 */
export default function FormField({label, hint, error, required = false, htmlFor, className, children}) {
    return (
        <div className={cn("flex flex-col", className)}>
            {label && (
                <label htmlFor={htmlFor} className="mb-1.5 text-sm font-medium text-neutral-70">
                    {label}
                    {required && <span className="text-danger-500"> *</span>}
                </label>
            )}

            {children}

            {error ? (
                <p className="mt-1 flex items-center gap-1 text-xs text-danger-600">
                    <AlertCircle size={12} className="shrink-0" aria-hidden="true"/>
                    {error}
                </p>
            ) : (
                hint && <p className="mt-1 text-xs text-neutral-40">{hint}</p>
            )}
        </div>
    )
}
