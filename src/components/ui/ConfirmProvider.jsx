import {useCallback, useRef, useState} from "react"
import {AlertTriangle, Trash2} from "lucide-react"
import Dialog from "./Dialog"
import Button from "./Button"
import Input from "./Input"
import {cn} from "@/lib/cn"
import {ConfirmContext} from "./confirmContext"

/**
 * The one imperative dialog API, because confirmations are called mid-flow
 * from event handlers where a promise is genuinely the natural shape:
 *
 *   if (!(await confirm.ask({ title: "Reverse payment", … }))) return
 *   if (!(await confirm.askDelete("tenant", tenant.name))) return
 *
 * Every destructive or irreversible mutation should go through this.
 * `requireText` forces the user to type an exact string first.
 */
export default function ConfirmProvider({children}) {
    const [state, setState] = useState(null)
    const [typed, setTyped] = useState("")
    const resolver = useRef(null)

    const settle = useCallback((result) => {
        resolver.current?.(result)
        resolver.current = null
        setState(null)
        setTyped("")
    }, [])

    const ask = useCallback((options) => {
        setTyped("")
        setState(options)
        return new Promise((resolve) => {
            resolver.current = resolve
        })
    }, [])

    const askDelete = useCallback(
        (entity, name) =>
            ask({
                title: `Delete ${entity}?`,
                message: name
                    ? `"${name}" will be permanently removed. This cannot be undone.`
                    : `This ${entity} will be permanently removed. This cannot be undone.`,
                confirmLabel: "Delete",
                tone: "danger",
                icon: Trash2,
            }),
        [ask],
    )

    const value = {ask, askDelete}
    const danger = state?.tone === "danger"
    const Icon = state?.icon ?? (danger ? Trash2 : AlertTriangle)
    const canConfirm = !state?.requireText || typed === state.requireText

    return (
        <ConfirmContext.Provider value={value}>
            {children}

            {state && (
                <Dialog
                    position="responsive"
                    size="sm"
                    onClose={() => settle(false)}
                    hideHeader
                    footer={
                        <>
                            <Button variant="outline" onClick={() => settle(false)}>
                                {state.cancelLabel ?? "Cancel"}
                            </Button>
                            <Button
                                variant={danger ? "danger" : "primary"}
                                disabled={!canConfirm}
                                onClick={() => settle(true)}
                            >
                                {state.confirmLabel ?? "Confirm"}
                            </Button>
                        </>
                    }
                >
                    <div className="flex flex-col items-center text-center">
                        <span
                            className={cn(
                                "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl",
                                danger ? "bg-danger-50 text-danger-500" : "bg-primary-50 text-primary-700",
                            )}
                        >
                            <Icon size={24} aria-hidden="true"/>
                        </span>
                        <h2 className="font-heading text-lg font-medium text-neutral-90">{state.title}</h2>
                        {state.message && <p className="mt-1.5 text-sm text-neutral-50">{state.message}</p>}

                        {state.requireText && (
                            <div className="mt-5 w-full text-left">
                                <label className="mb-1.5 block text-sm font-medium text-neutral-70">
                                    Type <span className="font-mono text-neutral-90">{state.requireText}</span> to confirm
                                </label>
                                <Input
                                    value={typed}
                                    onChange={(e) => setTyped(e.target.value)}
                                    autoFocus
                                    autoComplete="off"
                                />
                            </div>
                        )}
                    </div>
                </Dialog>
            )}
        </ConfirmContext.Provider>
    )
}
