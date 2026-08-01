import {AlertTriangle, Inbox, RefreshCw} from "lucide-react"
import Button from "./Button"
import {cn} from "@/lib/cn"

/**
 * Empty and error states share one skeleton and differ only in the chip.
 * DataTable renders these automatically — don't add your own alongside it.
 */
export function EmptyState({icon: Icon = Inbox, title = "Nothing here yet", message = "No records match your criteria.", action, className}) {
    return (
        <div className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-5 text-neutral-40">
                <Icon size={26} aria-hidden="true"/>
            </span>
            <h3 className="font-heading text-base font-medium text-neutral-80">{title}</h3>
            {message && <p className="mt-1 max-w-sm text-sm text-neutral-40">{message}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    )
}

export function ErrorState({title = "Something went wrong", message = "We couldn't load this. Please try again.", onRetry, className}) {
    return (
        <div className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-50 text-danger-500">
                <AlertTriangle size={26} aria-hidden="true"/>
            </span>
            <h3 className="font-heading text-base font-medium text-neutral-80">{title}</h3>
            {message && <p className="mt-1 max-w-sm text-sm text-neutral-40">{message}</p>}
            {onRetry && (
                <div className="mt-5">
                    <Button variant="outline" iconLeft={RefreshCw} onClick={onRetry}>Try again</Button>
                </div>
            )}
        </div>
    )
}
