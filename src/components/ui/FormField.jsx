import {cloneElement, isValidElement, useId} from "react"
import {AlertCircle} from "lucide-react"
import {cn} from "@/lib/cn"

/**
 * Label / hint / error wrapper. Put any control in its children.
 *
 *   <FormField label="Phone" error={errors.phone?.message} required>
 *     <Input {...register("phone")} invalid={!!errors.phone} />
 *   </FormField>
 *
 * Accessibility is wired automatically: a generated id links the <label> to the
 * control (so clicking the label focuses it), and the error/hint node is
 * associated via `aria-describedby` and announced with `role="alert"`. The
 * child control still needs `invalid` for the visual state and aria-invalid.
 *
 * Spacing is per-element margin, not a flex gap, so a field with neither
 * label nor hint collapses to exactly the control's height.
 * `error` suppresses `hint` — they never render together.
 */
export default function FormField({label, hint, error, required = false, htmlFor, className, children}) {
    const generatedId = useId()
    const controlId = htmlFor ?? `${generatedId}-control`
    const errorId = `${generatedId}-error`
    const hintId = `${generatedId}-hint`
    const describedBy = error ? errorId : hint ? hintId : undefined

    // Inject id + aria-describedby onto the control without every call site
    // wiring it by hand. Caller-set values win.
    const control = isValidElement(children)
        ? cloneElement(children, {
            id: children.props.id ?? controlId,
            "aria-describedby": children.props["aria-describedby"] ?? describedBy,
        })
        : children

    return (
        <div className={cn("flex flex-col", className)}>
            {label && (
                <label htmlFor={controlId} className="mb-1.5 text-sm font-medium text-neutral-70">
                    {label}
                    {required && <span className="text-danger-500"> *</span>}
                </label>
            )}

            {control}

            {error ? (
                <p id={errorId} role="alert"
                   className="mt-1 flex items-center gap-1 text-xs text-danger-600">
                    <AlertCircle size={12} className="shrink-0" aria-hidden="true"/>
                    {error}
                </p>
            ) : (
                hint && <p id={hintId} className="mt-1 text-xs text-neutral-40">{hint}</p>
            )}
        </div>
    )
}
