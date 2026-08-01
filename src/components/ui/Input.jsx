import {useState} from "react"
import {Eye, EyeOff} from "lucide-react"
import {CONTROL_BASE, CONTROL_HEIGHT, controlState} from "./controlStyles"
import {cn} from "@/lib/cn"

/**
 * register()-compatible: `...rest` goes straight onto the <input>, so
 * `<Input {...register("phone")} invalid={!!errors.phone} />` needs no glue.
 *
 * `type="password"` gets a built-in reveal toggle (this absorbs the old
 * standalone PasswordInput). Number inputs never show spinner arrows —
 * suppressed globally in the base layer.
 */
export default function Input({
                                  type = "text",
                                  iconLeft: IconLeft,
                                  iconRight: IconRight,
                                  invalid = false,
                                  className,
                                  ...rest
                              }) {
    const [revealed, setRevealed] = useState(false)
    const isPassword = type === "password"
    const resolvedType = isPassword && revealed ? "text" : type
    const hasRightSlot = isPassword || IconRight

    return (
        <div className="relative flex items-center">
            {IconLeft && (
                <IconLeft
                    size={18}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 text-neutral-40"
                />
            )}

            <input
                type={resolvedType}
                className={cn(
                    CONTROL_BASE,
                    CONTROL_HEIGHT,
                    controlState(invalid),
                    IconLeft ? "pl-10" : "pl-3.5",
                    hasRightSlot ? "pr-10" : "pr-3.5",
                    className,
                )}
                aria-invalid={invalid || undefined}
                {...rest}
            />

            {isPassword ? (
                <button
                    type="button"
                    onClick={() => setRevealed((v) => !v)}
                    aria-label={revealed ? "Hide password" : "Show password"}
                    className="absolute right-3 text-neutral-40 transition-colors hover:text-neutral-70"
                >
                    {revealed ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
            ) : (
                IconRight && (
                    <IconRight size={18} aria-hidden="true"
                               className="pointer-events-none absolute right-3 text-neutral-40"/>
                )
            )}
        </div>
    )
}
