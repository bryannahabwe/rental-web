import {AlertTriangle, CheckCircle, Info, XCircle} from "lucide-react"
import {cn} from "@/lib/cn"

/**
 * Inline status banner — the shared replacement for the copy-pasted
 * `<p className="rounded-lg bg-danger-50 …">{error}</p>` that used to live in
 * every form. Error/warning variants announce assertively (role="alert") so a
 * screen reader interrupts on a failed submit; success/info are polite.
 *
 *   {error && <Alert>{error}</Alert>}                 // defaults to error
 *   <Alert variant="warning">Heads up…</Alert>
 */
const VARIANT = {
    error: {Icon: XCircle, box: "bg-danger-50 text-danger-600", role: "alert"},
    warning: {Icon: AlertTriangle, box: "bg-warning-50 text-warning-600", role: "alert"},
    success: {Icon: CheckCircle, box: "bg-success-50 text-success-600", role: "status"},
    info: {Icon: Info, box: "bg-info-50 text-info-600", role: "status"},
}

export default function Alert({variant = "error", icon = true, className, children}) {
    const {Icon, box, role} = VARIANT[variant] ?? VARIANT.error
    return (
        <p
            role={role}
            className={cn("flex items-start gap-2 rounded-lg px-3 py-2 text-sm", box, className)}
        >
            {icon && <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true"/>}
            <span className="min-w-0">{children}</span>
        </p>
    )
}
