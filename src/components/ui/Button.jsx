import {Slot} from "radix-ui"
import {cva} from "class-variance-authority"
import {cn} from "@/lib/cn"

/**
 * Icon props take a component, not a string:  <Button iconLeft={Download}>
 * (lucide-react named imports already tree-shake, so there is no icon
 * registry to go through.)
 *
 * NOTE on the primary variant: the source design system used dark text on
 * its light teal. Our brand green is dark (6.20:1 against white), so
 * primary takes white text instead. See index.css.
 *
 * There is deliberately no solid `success` variant — success-500 with white
 * text is 2.60:1, and the brand is already green, so `primary` covers it.
 */
const button = cva(
    "inline-flex shrink-0 select-none items-center justify-center gap-2 rounded-lg font-medium tracking-tight " +
    "transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 " +
    "focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed",
    {
        variants: {
            variant: {
                primary: "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 " +
                    "disabled:bg-primary-200 disabled:text-primary-700/60 shadow-xs hover:shadow-sm",
                secondary: "bg-secondary-900 text-white hover:bg-secondary-850 active:bg-secondary-950 " +
                    "disabled:bg-neutral-15 disabled:text-neutral-40",
                outline: "border border-neutral-15 bg-white text-neutral-85 hover:bg-neutral-0 " +
                    "hover:border-neutral-20 active:bg-neutral-5 disabled:text-neutral-30 disabled:bg-white",
                ghost: "bg-transparent text-neutral-70 hover:bg-neutral-5 active:bg-neutral-10 " +
                    "disabled:text-neutral-30",
                // danger-600, not -500: white on danger-500 is only 3.91:1.
                danger: "bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-700 " +
                    "disabled:bg-danger-100 disabled:text-white/70 shadow-xs",
            },
            size: {
                sm: "h-9 px-3 text-sm",
                md: "h-11 px-4 text-sm",
                lg: "h-12 px-6 text-base",
            },
            block: {true: "w-full"},
        },
        defaultVariants: {variant: "primary", size: "md"},
    },
)

const ICON_SIZE = {sm: 16, md: 18, lg: 20}

export default function Button({
                                   variant = "primary",
                                   size = "md",
                                   block = false,
                                   loading = false,
                                   disabled = false,
                                   iconLeft: IconLeft,
                                   iconRight: IconRight,
                                   asChild = false,
                                   type = "button",
                                   className,
                                   children,
                                   ...rest
                               }) {
    const Comp = asChild ? Slot.Root : "button"
    const iconSize = ICON_SIZE[size]

    return (
        <Comp
            type={asChild ? undefined : type}
            disabled={asChild ? undefined : disabled || loading}
            className={cn(button({variant, size, block}), className)}
            {...rest}
        >
            {loading ? (
                <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                />
            ) : (
                IconLeft && <IconLeft size={iconSize} aria-hidden="true"/>
            )}
            {children}
            {IconRight && <IconRight size={iconSize} aria-hidden="true"/>}
        </Comp>
    )
}
