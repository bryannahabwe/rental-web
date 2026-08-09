import {createPortal} from "react-dom"
import {AlertTriangle, CheckCircle, Info, X, XCircle} from "lucide-react"
import useToastStore from "./toastStore"
import {cn} from "@/lib/cn"

/**
 * Mounted once, at app root. Toasts sit at z-200 — genuinely the top
 * layer, above dialogs (z-100) and any panel opened inside one (z-150).
 *
 * On phones the stack sits above the bottom nav, not under it.
 */
const VARIANT = {
    success: {Icon: CheckCircle, chip: "bg-success-50 text-success-600", border: "border-success-100"},
    error: {Icon: XCircle, chip: "bg-danger-50 text-danger-600", border: "border-danger-100"},
    warning: {Icon: AlertTriangle, chip: "bg-warning-50 text-warning-600", border: "border-warning-100"},
    info: {Icon: Info, chip: "bg-info-50 text-info-600", border: "border-info-100"},
}

export default function ToastHost() {
    const toasts = useToastStore((s) => s.toasts)
    const dismiss = useToastStore((s) => s.dismiss)

    if (toasts.length === 0) return null

    return createPortal(
        <div
            className={cn(
                "pointer-events-none fixed inset-x-4 bottom-20 z-200 flex flex-col gap-3",
                "sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-full sm:max-w-sm",
            )}
        >
            {toasts.map(({id, variant, title, description}) => {
                const {Icon, chip, border} = VARIANT[variant] ?? VARIANT.info
                // Errors/warnings interrupt (assertive); success/info are polite.
                const assertive = variant === "error" || variant === "warning"
                return (
                    <div
                        key={id}
                        role={assertive ? "alert" : "status"}
                        aria-live={assertive ? "assertive" : "polite"}
                        className={cn(
                            "pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white p-4",
                            "shadow-dialog animate-slide-down",
                            border,
                        )}
                    >
                        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", chip)}>
                            <Icon size={18} aria-hidden="true"/>
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-neutral-90">{title}</p>
                            {description && <p className="mt-0.5 text-sm text-neutral-50">{description}</p>}
                        </div>
                        <button
                            type="button"
                            onClick={() => dismiss(id)}
                            aria-label="Dismiss"
                            className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-neutral-30 transition-colors hover:bg-neutral-5 hover:text-neutral-60"
                        >
                            <X size={16}/>
                        </button>
                    </div>
                )
            })}
        </div>,
        document.body,
    )
}
