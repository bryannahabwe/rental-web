import {cva} from "class-variance-authority"
import {cn} from "@/lib/cn"

/**
 * The canonical way to render any status value. Pair with `statusTone()`
 * from @/lib/statusTone rather than passing a tone literal at the call site.
 *
 *   <Badge tone={statusTone("period", t.periodStatus)}>{t.periodStatus}</Badge>
 *
 * Every tone follows one formula: -50 fill, -700 text, -100 border, -500 dot.
 *
 * NOTE: there is no `secondary` tone. In this palette secondary is a
 * surface-only family (deep green-black); as a tint it is indistinguishable
 * from primary. Use `neutral` or `info`.
 */
const badge = cva(
    "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
    {
        variants: {
            tone: {
                neutral: "bg-neutral-5 text-neutral-60 border-neutral-10",
                primary: "bg-primary-50 text-primary-700 border-primary-100",
                success: "bg-success-50 text-success-700 border-success-100",
                warning: "bg-warning-50 text-warning-700 border-warning-100",
                danger: "bg-danger-50 text-danger-700 border-danger-100",
                info: "bg-info-50 text-info-700 border-info-100",
            },
            size: {
                sm: "px-2 py-0.5 text-2xs",
                md: "px-2.5 py-1 text-xs",
            },
        },
        defaultVariants: {tone: "neutral", size: "md"},
    },
)

// Literal strings, not interpolation — Tailwind v4 scans source text.
const DOT = {
    neutral: "bg-neutral-40",
    primary: "bg-primary-500",
    success: "bg-success-500",
    warning: "bg-warning-500",
    danger: "bg-danger-500",
    info: "bg-info-500",
}

export default function Badge({tone = "neutral", size = "md", dot = false, className, children, ...rest}) {
    return (
        <span className={cn(badge({tone, size}), className)} {...rest}>
            {dot && <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT[tone])}/>}
            {children}
        </span>
    )
}
