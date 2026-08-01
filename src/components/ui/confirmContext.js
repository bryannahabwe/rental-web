import {createContext, useContext} from "react"

/**
 * Split from ConfirmProvider.jsx so that file exports only a component
 * (fast refresh keeps working when the provider's markup changes).
 */
export const ConfirmContext = createContext(null)

/**
 * The one imperative dialog API — confirmations are called mid-flow from
 * event handlers, where a promise is the natural shape:
 *
 *   if (!(await confirm.askDelete("tenant", tenant.name))) return
 */
export function useConfirm() {
    const ctx = useContext(ConfirmContext)
    if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider>")
    return ctx
}
