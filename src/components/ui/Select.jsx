import {useRef, useState} from "react"
import {Select as RSelect} from "radix-ui"
import {Check, ChevronDown} from "lucide-react"
import {CONTROL_BASE, CONTROL_HEIGHT, controlState} from "./controlStyles"
import {cn} from "@/lib/cn"

/**
 * A design-system dropdown. The trigger shares the form-control recipe with
 * Input/Textarea/DateField; the panel is the popover recipe (rounded-xl,
 * border-neutral-5, shadow-dialog, scale-in) with primary-50 selection.
 *
 * ── Why the hidden native <select> ──────────────────────────────────────
 * Radix gives us a fully stylable listbox, but its `onValueChange` emits a
 * bare string while react-hook-form's `register()` returns {name, onChange,
 * onBlur, ref} and expects a DOM change event. Rather than rewrite every call
 * site, the registered props go onto a visually-hidden native <select> that
 * the panel drives with the native value setter — so `<Select {...register(
 * "unitId")} />` keeps working exactly as before, and native form semantics
 * and validation stay intact.
 *
 * options: [{ label, value, disabled? }]
 */

/**
 * Radix reserves the empty string to mean "no selection" and throws if an
 * Item uses it. Several call sites legitimately have an empty-valued option
 * that means "all" (Activity's "All activity", Agreements' "All"), so empty
 * values are encoded to a sentinel for the Radix layer only and decoded on
 * the way out. The hidden native <select> keeps the real "" value.
 */
const EMPTY = "__rf_empty__"
const encode = (v) => (v === "" || v === null || v === undefined ? EMPTY : String(v))
const decode = (v) => (v === EMPTY ? "" : v)

export default function Select({
                                   options = [],
                                   placeholder,
                                   invalid = false,
                                   className,
                                   value,
                                   defaultValue,
                                   onChange,
                                   disabled,
                                   name,
                                   onBlur,
                                   ref,
                                   "aria-label": ariaLabel,
                                   ...rest
                               }) {
    const hiddenRef = useRef(null)
    // Uncontrolled by default (register() doesn't pass `value`), so mirror the
    // hidden select's value locally to drive the trigger label.
    const [internal, setInternal] = useState(defaultValue ?? "")
    const isControlled = value !== undefined
    const current = isControlled ? value : internal

    const commit = (next) => {
        if (!isControlled) setInternal(next)
        const el = hiddenRef.current
        if (el) {
            const setter = Object.getOwnPropertyDescriptor(
                window.HTMLSelectElement.prototype, "value",
            ).set
            setter.call(el, next)
            el.dispatchEvent(new Event("change", {bubbles: true}))
        }
    }

    const selected = options.find((o) => String(o.value) === String(current))

    // An empty `current` means the placeholder — unless an option genuinely
    // owns the empty value, in which case that option is the selection.
    const hasEmptyOption = options.some(
        (o) => o.value === "" || o.value === null || o.value === undefined,
    )
    const rootValue = current === "" || current === null || current === undefined
        ? (hasEmptyOption ? EMPTY : "")
        : String(current)

    return (
        <div className={cn("relative", className)}>
            {/* The registered element. Kept in the layout (not display:none) so
                react-hook-form can focus it when validation fails. */}
            <select
                ref={(node) => {
                    hiddenRef.current = node
                    if (typeof ref === "function") ref(node)
                    else if (ref) ref.current = node
                }}
                name={name}
                defaultValue={defaultValue}
                value={isControlled ? value : undefined}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
                aria-hidden="true"
                tabIndex={-1}
                className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
                {...rest}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>

            <RSelect.Root
                value={rootValue}
                onValueChange={(v) => commit(decode(v))}
                disabled={disabled}
            >
                <RSelect.Trigger
                    aria-label={ariaLabel}
                    aria-invalid={invalid || undefined}
                    className={cn(
                        CONTROL_BASE, CONTROL_HEIGHT, controlState(invalid),
                        "flex items-center justify-between gap-2 pl-3.5 pr-3 text-left",
                        "data-[placeholder]:text-neutral-30",
                    )}
                >
                    <span className="truncate">
                        {selected ? selected.label : (placeholder || "Select…")}
                    </span>
                    <RSelect.Icon asChild>
                        <ChevronDown size={18} className="shrink-0 text-neutral-40 transition-transform"/>
                    </RSelect.Icon>
                </RSelect.Trigger>

                <RSelect.Portal>
                    <RSelect.Content
                        position="popper"
                        sideOffset={6}
                        // z-150: above a dialog (z-100) but below toasts (z-200).
                        className={cn(
                            "z-150 max-h-64 w-[var(--radix-select-trigger-width)] overflow-hidden",
                            "rounded-xl border border-neutral-5 bg-white shadow-dialog animate-scale-in",
                        )}
                    >
                        <RSelect.Viewport className="max-h-64 overflow-y-auto p-1.5">
                            {options.length === 0 && (
                                <p className="px-3 py-6 text-center text-sm text-neutral-40">No options</p>
                            )}
                            {options.map((o) => (
                                <RSelect.Item
                                    key={String(o.value)}
                                    value={encode(o.value)}
                                    disabled={o.disabled}
                                    className={cn(
                                        "flex cursor-pointer select-none items-center justify-between gap-2",
                                        "rounded-lg px-3 py-2.5 text-sm text-neutral-70 outline-none transition-colors",
                                        "data-[highlighted]:bg-neutral-5 data-[highlighted]:text-neutral-90",
                                        "data-[state=checked]:bg-primary-50 data-[state=checked]:text-primary-800",
                                        "data-[disabled]:pointer-events-none data-[disabled]:text-neutral-30",
                                    )}
                                >
                                    <RSelect.ItemText>{o.label}</RSelect.ItemText>
                                    <RSelect.ItemIndicator asChild>
                                        <Check size={16} className="shrink-0 text-primary-600"/>
                                    </RSelect.ItemIndicator>
                                </RSelect.Item>
                            ))}
                        </RSelect.Viewport>
                    </RSelect.Content>
                </RSelect.Portal>
            </RSelect.Root>
        </div>
    )
}
