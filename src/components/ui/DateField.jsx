import {useRef, useState} from "react"
import {Popover} from "radix-ui"
import {Calendar, ChevronLeft, ChevronRight, X} from "lucide-react"
import {CONTROL_BASE, CONTROL_HEIGHT, controlState} from "./controlStyles"
import {cn} from "@/lib/cn"

/**
 * A design-system date field: the shared control recipe on the trigger, and a
 * calendar on the popover recipe instead of the browser's OS panel.
 *
 * Like Select, the registered props go onto a hidden native <input type="date">
 * that the calendar drives with the native value setter, so
 * `<DateField {...register("startDate")} />` keeps working and the value stays
 * an ISO `yyyy-mm-dd` string.
 *
 * Dates are built from local parts, never `toISOString()`, so a picked day
 * can't shift across a timezone boundary.
 */
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

const isoOf = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

const parseIso = (s) => {
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
    const [y, m, d] = s.split("-").map(Number)
    const dt = new Date(y, m - 1, d)
    return Number.isNaN(dt.getTime()) ? null : dt
}

const longLabel = (d) =>
    d.toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric"})

/** Monday-first grid of the weeks covering `month`. */
function buildWeeks(month) {
    const first = new Date(month.getFullYear(), month.getMonth(), 1)
    const start = new Date(first)
    start.setDate(first.getDate() - ((first.getDay() + 6) % 7)) // back to Monday
    const weeks = []
    for (let w = 0; w < 6; w++) {
        const row = []
        for (let i = 0; i < 7; i++) {
            row.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + i))
        }
        weeks.push(row)
    }
    return weeks
}

export default function DateField({
                                      invalid = false,
                                      className,
                                      value,
                                      defaultValue,
                                      onChange,
                                      onBlur,
                                      name,
                                      disabled,
                                      min,
                                      max,
                                      clearable = true,
                                      ref,
                                      "aria-label": ariaLabel,
                                      ...rest
                                  }) {
    const hiddenRef = useRef(null)
    const [internal, setInternal] = useState(defaultValue ?? "")
    const isControlled = value !== undefined
    const current = isControlled ? value : internal

    const selected = parseIso(current)
    const [month, setMonth] = useState(() => selected || new Date())
    const [open, setOpen] = useState(false)

    const commit = (next) => {
        if (!isControlled) setInternal(next)
        const el = hiddenRef.current
        if (el) {
            const setter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype, "value",
            ).set
            setter.call(el, next)
            el.dispatchEvent(new Event("input", {bubbles: true}))
            el.dispatchEvent(new Event("change", {bubbles: true}))
        }
    }

    const today = isoOf(new Date())
    const outOfRange = (iso) => (min && iso < min) || (max && iso > max)

    return (
        <div className={cn("relative", className)}>
            <input
                type="date"
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
                min={min}
                max={max}
                aria-hidden="true"
                tabIndex={-1}
                className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
                {...rest}
            />

            <Popover.Root open={open} onOpenChange={setOpen}>
                <Popover.Trigger
                    type="button"
                    disabled={disabled}
                    aria-label={ariaLabel}
                    aria-invalid={invalid || undefined}
                    className={cn(
                        CONTROL_BASE, CONTROL_HEIGHT, controlState(invalid),
                        "flex items-center gap-2.5 pl-3.5 pr-3 text-left",
                        open && !invalid && "border-primary-500 ring-4 ring-primary-500/20",
                    )}
                >
                    <Calendar size={18} className="shrink-0 text-neutral-40"/>
                    <span className={cn("flex-1 truncate", !selected && "text-neutral-30")}>
                        {selected ? longLabel(selected) : "Select a date"}
                    </span>
                    {clearable && selected && (
                        <span
                            role="button"
                            tabIndex={-1}
                            aria-label="Clear date"
                            onPointerDown={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                commit("")
                            }}
                            className="shrink-0 text-neutral-30 transition-colors hover:text-neutral-70"
                        >
                            <X size={16}/>
                        </span>
                    )}
                </Popover.Trigger>

                <Popover.Portal>
                    <Popover.Content
                        align="start"
                        sideOffset={6}
                        className="z-150 w-72 rounded-2xl border border-neutral-5 bg-white p-3 shadow-dialog animate-scale-in"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <button
                                type="button"
                                aria-label="Previous month"
                                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-50 transition-colors hover:bg-neutral-5 hover:text-neutral-80"
                            >
                                <ChevronLeft size={16}/>
                            </button>
                            <span className="text-sm font-medium text-neutral-90">
                                {month.toLocaleDateString("en-GB", {month: "long", year: "numeric"})}
                            </span>
                            <button
                                type="button"
                                aria-label="Next month"
                                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-50 transition-colors hover:bg-neutral-5 hover:text-neutral-80"
                            >
                                <ChevronRight size={16}/>
                            </button>
                        </div>

                        <div className="mb-1 grid grid-cols-7 gap-0.5">
                            {WEEKDAYS.map((w) => (
                                <span key={w} className="py-1 text-center text-2xs font-medium text-neutral-40">
                                    {w}
                                </span>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-0.5">
                            {buildWeeks(month).flat().map((d) => {
                                const iso = isoOf(d)
                                const inMonth = d.getMonth() === month.getMonth()
                                const isSel = iso === current
                                const disabledDay = outOfRange(iso)
                                return (
                                    <button
                                        key={iso}
                                        type="button"
                                        disabled={disabledDay}
                                        aria-pressed={isSel}
                                        onClick={() => {
                                            commit(iso)
                                            setOpen(false)
                                        }}
                                        className={cn(
                                            "flex h-9 items-center justify-center rounded-lg text-sm tabular-nums transition-colors",
                                            isSel
                                                ? "bg-primary-500 font-medium text-white"
                                                : inMonth
                                                    ? "text-neutral-80 hover:bg-neutral-5"
                                                    : "text-neutral-30 hover:bg-neutral-5",
                                            !isSel && iso === today && "font-semibold text-primary-600",
                                            disabledDay && "pointer-events-none text-neutral-15",
                                        )}
                                    >
                                        {d.getDate()}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="mt-2 flex items-center justify-between border-t border-neutral-5 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    commit(today)
                                    setMonth(new Date())
                                    setOpen(false)
                                }}
                                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50"
                            >
                                Today
                            </button>
                            {clearable && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        commit("")
                                        setOpen(false)
                                    }}
                                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-50 transition-colors hover:bg-neutral-5"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        </div>
    )
}
