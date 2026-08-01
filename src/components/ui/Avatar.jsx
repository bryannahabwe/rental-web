import {initials as toInitials} from "@/lib/format"
import {cn} from "@/lib/cn"

/**
 * Uses the neutral ramp rather than a brand tint: with a green brand, a
 * secondary-tinted avatar is indistinguishable from a primary one.
 */
export default function Avatar({src, name = "", size = 40, className, ...rest}) {
    const textSize = size <= 28 ? "text-xs" : size >= 56 ? "text-lg" : "text-sm"

    return (
        <span
            className={cn(
                "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
                "bg-neutral-5 font-medium text-neutral-70",
                textSize,
                className,
            )}
            style={{width: size, height: size}}
            {...rest}
        >
            {src
                ? <img src={src} alt={name} className="h-full w-full object-cover"/>
                : toInitials(name)}
        </span>
    )
}
