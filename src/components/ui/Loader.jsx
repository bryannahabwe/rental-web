import {cn} from "@/lib/cn"

/** Inherits the brand teal from its own host class. */
export function Spinner({size = 24, thickness = 3, className, ...rest}) {
    return (
        <span
            role="status"
            aria-label="Loading"
            className={cn("inline-block shrink-0 animate-spin rounded-full text-primary-500", className)}
            style={{
                width: size,
                height: size,
                borderWidth: thickness,
                borderStyle: "solid",
                borderColor: "currentColor",
                borderTopColor: "transparent",
            }}
            {...rest}
        />
    )
}

const ROUNDED = {
    sm: "rounded-sm",
    md: "rounded-lg",
    lg: "rounded-xl",
    full: "rounded-full",
}

export function Skeleton({width = "100%", height = "1rem", rounded = "md", className, ...rest}) {
    return (
        <span
            aria-hidden="true"
            className={cn("block shimmer", ROUNDED[rounded], className)}
            style={{width, height}}
            {...rest}
        />
    )
}

export function LoadingPanel({message = "Loading…", className}) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-3 py-24", className)}>
            <Spinner size={32}/>
            <p className="text-sm text-neutral-40">{message}</p>
        </div>
    )
}
